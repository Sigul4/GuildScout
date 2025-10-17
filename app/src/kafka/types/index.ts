import { kafkaConfig } from '../config';
import { Presence } from 'discord.js';

export interface KafkaMessage {
  id: string;
  content: string;
  authorId: string;
  guildId: string;
  channelId: string;
  createdAt: string;
}

export interface KafkaReaction {
  messageId: string;
  guildId: string;
  channelId: string;
  userId: string;
  emojiName: string;
  emojiId?: string | undefined;
  type: 'add' | 'remove';
}

export interface KafkaMember {
  id: string;
  username: string;
  guildId: string;
  joinedAt: Date;
}

export interface KafkaPresence {
  userId: string;
  guildId: string;
  timestamp: Date;
  oldPresence: Presence | null;
  newPresence: Presence;
}

export type TopicMessageMap = {
  [kafkaConfig.topics.messages]: KafkaMessage;
  [kafkaConfig.topics.reactions]: KafkaReaction;
  [kafkaConfig.topics.members]: KafkaMember;
  [kafkaConfig.topics.presences]: KafkaPresence;
};

export type MessageGroups = {
  [K in keyof TopicMessageMap]?: TopicMessageMap[K][];
};
