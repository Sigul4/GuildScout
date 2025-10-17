import {
  MessageReaction,
  PartialMessageReaction,
  PartialUser,
  User,
} from 'discord.js';
import { KafkaClient } from '../../utils/kafka';
import { config } from '../../config';
import { KafkaReaction } from '../../types';

export class ReactionHandler {
  private kafkaClient: KafkaClient;

  constructor() {
    this.kafkaClient = KafkaClient.getInstance();
  }

  private async handleReaction(
    reaction: MessageReaction | PartialMessageReaction,
    user: User | PartialUser,
    type: 'add' | 'remove',
  ): Promise<void> {
    try {
      const fetchedReaction = reaction.partial
        ? await reaction.fetch()
        : reaction;

      const kafkaReaction: KafkaReaction = {
        messageId: fetchedReaction.message.id,
        guildId: fetchedReaction.message.guild!.id,
        channelId: fetchedReaction.message.channel.id,
        userId: user.id,
        emojiName: fetchedReaction.emoji.name!,
        emojiId: fetchedReaction.emoji.id ?? undefined,
        type,
      };

      await this.kafkaClient.sendMessage(
        config.kafka.topics.reactions,
        `${fetchedReaction.message.id}-${user.id}`,
        kafkaReaction,
      );
    } catch (error) {
      console.error('Error handling reaction:', error);
    }
  }

  public async handleReactionAdd(
    reaction: MessageReaction | PartialMessageReaction,
    user: User | PartialUser,
  ): Promise<void> {
    await this.handleReaction(reaction, user, 'add');
  }

  public async handleReactionRemove(
    reaction: MessageReaction | PartialMessageReaction,
    user: User | PartialUser,
  ): Promise<void> {
    await this.handleReaction(reaction, user, 'remove');
  }
}
