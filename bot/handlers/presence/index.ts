import { KafkaClient } from '../../utils/kafka';
import { Presence } from 'discord.js';
import { config } from '../../config';
import { KafkaPresence } from '../../types';

export class PresenceHandler {
  private kafkaClient: KafkaClient;

  constructor() {
    this.kafkaClient = KafkaClient.getInstance();
  }

  public async handlePresenceUpdate(
    oldPresence: Presence | null,
    newPresence: Presence,
  ): Promise<void> {
    if (!newPresence.guild || !newPresence.userId) return;

    const presence: KafkaPresence = {
      userId: newPresence.userId,
      guildId: newPresence.guild.id,
      timestamp: new Date(),
      oldPresence,
      newPresence,
    };

    await this.kafkaClient.sendMessage(
      config.kafka.topics.presences,
      `${newPresence.userId}-${Date.now()}`,
      presence,
    );
  }
}
