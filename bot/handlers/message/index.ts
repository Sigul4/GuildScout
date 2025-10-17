import { Message } from 'discord.js';
import { KafkaClient } from '../../utils/kafka';
import { config } from '../../config';
import { KafkaMessage } from '../../types';

export class MessageHandler {
  private kafkaClient: KafkaClient;

  constructor() {
    this.kafkaClient = KafkaClient.getInstance();
  }

  public async handleMessage(message: Message): Promise<void> {
    if (message.author.bot) return;
    if (!message.guild) return;
    if (!message.content || message.content.length < 3) return;

    try {
      const kafkaMessage: KafkaMessage = {
        id: message.id,
        content: message.content,
        authorId: message.author.id,
        guildId: message.guild.id,
        channelId: message.channel.id,
        createdAt: message.createdAt,
      };

      await this.kafkaClient.sendMessage(
        config.kafka.topics.messages,
        message.id,
        kafkaMessage,
      );
    } catch (error) {
      console.error('Failed to produce message:', error);
    }
  }
}
