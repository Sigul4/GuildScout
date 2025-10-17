import {
  Injectable,
  OnModuleInit,
  OnApplicationShutdown,
  Logger,
} from '@nestjs/common';
import { Consumer, Kafka, logLevel } from 'kafkajs';
import { ReactionsService } from '../reactions/reactions.service';
import { MessageMatchesService } from '../messages-match/message-matches.service';
import { UsersService } from '../users/users.service';
import { kafkaConfig } from './config';
import {
  KafkaMember,
  KafkaMessage,
  KafkaPresence,
  KafkaReaction,
  MessageGroups,
  TopicMessageMap,
} from './types';
import { PresenceService } from '../presences/presence.service';

@Injectable()
export class KafkaConsumerService
  implements OnModuleInit, OnApplicationShutdown
{
  private readonly kafka: Kafka;
  private consumer: Consumer;
  private readonly logger = new Logger(KafkaConsumerService.name);

  constructor(
    private readonly reactionsService: ReactionsService,
    private readonly messageMatchesService: MessageMatchesService,
    private readonly usersService: UsersService,
    private readonly presencesService: PresenceService,
  ) {
    this.kafka = new Kafka({
      clientId: kafkaConfig.clientId,
      brokers: kafkaConfig.brokers,
      logLevel: logLevel.INFO,
      retry: {
        initialRetryTime: 1000,
        retries: 10,
      },
    });
  }

  async onModuleInit() {
    try {
      await this.setupKafka();
    } catch (error) {
      this.logger.error('Failed to initialize Kafka consumer:', error);
      throw error;
    }
  }

  async onApplicationShutdown() {
    try {
      await this.consumer.disconnect();
    } catch (error) {
      this.logger.error('Error during Kafka consumer shutdown:', error);
    }
  }

  private async setupKafka() {
    try {
      const admin = this.kafka.admin();
      await admin.connect();

      let retries = 0;
      const maxRetries = 5;

      while (retries < maxRetries) {
        try {
          await admin.fetchTopicMetadata();
          this.logger.log('Kafka broker is ready');
          break;
        } catch (error) {
          retries++;
          this.logger.log(
            `Waiting for Kafka broker... (${retries}/${maxRetries})`,
          );
          await new Promise((resolve) => setTimeout(resolve, 5000));

          if (retries === maxRetries) {
            throw new Error('Failed to connect to Kafka broker');
          }
        }
      }

      const topics = await admin.listTopics();
      const requiredTopics = Object.values(kafkaConfig.topics);
      const topicsToCreate = requiredTopics.filter(
        (topic) => !topics.includes(topic),
      );

      if (topicsToCreate.length > 0) {
        await admin.createTopics({
          topics: topicsToCreate.map((topic) => ({
            topic,
            numPartitions: 1,
            replicationFactor: 1,
          })),
          timeout: 30000,
        });
        this.logger.log('Created Kafka topics:', topicsToCreate);
      }

      await admin.disconnect();

      this.consumer = this.kafka.consumer({
        groupId: kafkaConfig.groupId,
        sessionTimeout: 30000,
        rebalanceTimeout: 60000,
        heartbeatInterval: 3000,
        maxWaitTimeInMs: 5000,
        maxBytesPerPartition: 1048576, // 1MB
        retry: {
          initialRetryTime: 1000,
          maxRetryTime: 30000,
          retries: 10,
        },
      });

      await this.connectWithRetry();

      await this.consumer.subscribe({
        topics: requiredTopics,
        fromBeginning: true,
      });

      await this.startConsuming();
    } catch (error) {
      this.logger.error('Failed to setup Kafka:', error);
      throw error;
    }
  }

  private async connectWithRetry(attempts = 5): Promise<void> {
    for (let i = 0; i < attempts; i++) {
      try {
        await this.consumer.connect();
        this.logger.log('Successfully connected to Kafka');
        return;
      } catch (error) {
        this.logger.error(
          `Failed to connect to Kafka (attempt ${i + 1}/${attempts}):`,
          error,
        );
        if (i === attempts - 1) throw error;
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    }
  }

  private async startConsuming() {
    await this.consumer.run({
      autoCommit: true,
      eachBatch: async ({
        batch,
        resolveOffset,
        heartbeat,
        isRunning,
        isStale,
      }) => {
        try {
          const messages = batch.messages;
          const topic = batch.topic as keyof TopicMessageMap;

          const messageGroups: MessageGroups = {};

          for (const message of messages) {
            if (!message.value) continue;

            try {
              const value = JSON.parse(message.value.toString());
              if (!messageGroups[topic]) {
                messageGroups[topic] = [];
              }
              messageGroups[topic].push(value);

              resolveOffset(message.offset);
              await heartbeat();
            } catch (error) {
              this.logger.error('Error parsing message:', {
                topic,
                partition: batch.partition,
                offset: message.offset,
                error,
              });
            }
          }

          for (const [topic, events] of Object.entries(messageGroups)) {
            if (!isRunning() || isStale()) break;

            try {
              switch (topic) {
                case kafkaConfig.topics.messages:
                  await Promise.all(
                    (events as KafkaMessage[]).map((message) =>
                      this.handleMessage(message),
                    ),
                  );
                  break;
                case kafkaConfig.topics.reactions:
                  await Promise.all(
                    (events as KafkaReaction[]).map((reaction) =>
                      this.handleReaction(reaction),
                    ),
                  );
                  break;
                case kafkaConfig.topics.members:
                  await Promise.all(
                    (events as KafkaMember[]).map((member) =>
                      this.handleMember(member),
                    ),
                  );
                  break;
                case kafkaConfig.topics.presences:
                  await Promise.all(
                    (events as KafkaPresence[]).map((presence) =>
                      this.handlePresence(presence),
                    ),
                  );
                  break;
              }
            } catch (error) {
              this.logger.error('Error processing batch:', {
                topic,
                partition: batch.partition,
                error,
              });
            }
          }
        } catch (error) {
          this.logger.error('Error processing batch:', {
            topic: batch.topic,
            partition: batch.partition,
            error,
          });
        }
      },
    });
  }

  private async handleMessage(message: KafkaMessage) {
    try {
      console.log({ message });
      await this.messageMatchesService.processMessage(message);
    } catch (error) {
      console.error('Error handling message:', error);
      throw error;
    }
  }

  private async handleReaction(reaction: KafkaReaction) {
    try {
      if (reaction.type === 'add') {
        await this.reactionsService.createReaction({
          messageId: BigInt(reaction.messageId),
          guildId: BigInt(reaction.guildId),
          channelId: BigInt(reaction.channelId),
          userId: BigInt(reaction.userId),
          emojiName: reaction.emojiName,
          emojiId: reaction.emojiId ? BigInt(reaction.emojiId) : undefined,
        });
      } else {
        await this.reactionsService.removeReaction({
          messageId: BigInt(reaction.messageId),
          userId: BigInt(reaction.userId),
          emojiName: reaction.emojiName,
        });
      }
    } catch (error) {
      console.error('Error handling reaction:', error);
      throw error;
    }
  }

  private async handleMember(member: KafkaMember) {
    try {
      const now = new Date();
      await this.usersService.create({
        id: BigInt(member.id),
        username: member.username,
        firstSeenAt: now,
        lastActiveAt: now,
      });
    } catch (error) {
      console.error('Error handling member:', error);
      throw error;
    }
  }

  private async handlePresence(presence: KafkaPresence) {
    try {
      await this.presencesService.handlePresenceUpdate(presence);
    } catch (error) {
      console.error('Error handling member:', error);
      throw error;
    }
  }
}
