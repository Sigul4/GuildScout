import { Presence } from 'discord.js';

export interface KafkaMessage {
  id: string;
  content: string;
  authorId: string;
  guildId: string;
  channelId: string;
  createdAt: Date;
}

export interface KafkaReaction {
  messageId: string;
  guildId: string;
  channelId: string;
  userId: string;
  emojiName: string;
  emojiId?: string;
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

export interface KafkaStream {
  userId: string;
  guildId: string;
  channelId: string | null;
  timestamp: Date;
  action: 'START' | 'STOP';
  memberTag: string | null;
  channelName: string | null;
}
