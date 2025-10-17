export const kafkaConfig = {
  clientId: 'discord-bot',
  brokers: ['kafka:9092'] as string[],
  groupId: 'discord-consumer-group',
  topics: {
    messages: 'discord.messages',
    reactions: 'discord.reactions',
    members: 'discord.members',
    presences: 'discord.presences',
  },
} as const;
