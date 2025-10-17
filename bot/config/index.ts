import dotenv from 'dotenv';

dotenv.config();

export const config = {
  discord: {
    token: process.env.DISCORD_BOT_TOKEN,
  },
  kafka: {
    clientId: 'discord-bot',
    brokers: ['kafka:9092'] as string[],
    topics: {
      messages: 'discord.messages',
      reactions: 'discord.reactions',
      members: 'discord.members',
      presences: 'discord.presences',
      streams: 'discord.streams',
    },
  },
} as const;
