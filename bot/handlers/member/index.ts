import { GuildMember } from 'discord.js';
import { KafkaClient } from '../../utils/kafka';
import { config } from '../../config';
import { KafkaMember } from '../../types';

export class MemberHandler {
  private kafkaClient: KafkaClient;

  constructor() {
    this.kafkaClient = KafkaClient.getInstance();
  }

  public async handleMemberAdd(member: GuildMember): Promise<void> {
    try {
      const kafkaMember: KafkaMember = {
        id: member.id,
        username: member.user.username,
        guildId: member.guild.id,
        joinedAt: member.joinedAt!,
      };

      await this.kafkaClient.sendMessage(
        config.kafka.topics.members,
        member.id,
        kafkaMember,
      );
    } catch (error) {
      console.error('Error handling new member:', error);
    }
  }
}
