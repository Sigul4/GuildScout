import { Client, GatewayIntentBits, Partials } from 'discord.js';
import { config } from './config';
import { KafkaClient } from './utils/kafka';
import { Handlers } from './handlers';

class Bot {
  private client: Client;
  private messageHandler: InstanceType<typeof Handlers.MessageHandler>;
  private reactionHandler: InstanceType<typeof Handlers.ReactionHandler>;
  private memberHandler: InstanceType<typeof Handlers.MemberHandler>;
  private presenceHandler: InstanceType<typeof Handlers.PresenceHandler>;
  private streamHandler: InstanceType<typeof Handlers.StreamHandler>;

  constructor() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildVoiceStates,
      ],
      partials: [Partials.Message, Partials.Channel, Partials.Reaction],
    });

    this.messageHandler = new Handlers.MessageHandler();
    this.reactionHandler = new Handlers.ReactionHandler();
    this.memberHandler = new Handlers.MemberHandler();
    this.presenceHandler = new Handlers.PresenceHandler();
    this.streamHandler = new Handlers.StreamHandler();
  }

  private setupEventListeners(): void {
    this.client.on('ready', () => {
      console.log(`Logged in as ${this.client.user?.tag}!`);
    });

    this.client.on('messageCreate', async (message) => {
      await this.messageHandler.handleMessage(message);
    });

    this.client.on('messageReactionAdd', async (reaction, user) => {
      await this.reactionHandler.handleReactionAdd(reaction, user);
    });

    this.client.on('messageReactionRemove', async (reaction, user) => {
      await this.reactionHandler.handleReactionRemove(reaction, user);
    });

    this.client.on('guildMemberAdd', async (member) => {
      await this.memberHandler.handleMemberAdd(member);
    });

    this.client.on('presenceUpdate', async (oldPresence, newPresence) => {
      console.log(JSON.stringify(oldPresence, null , 2));
      console.log(JSON.stringify(newPresence, null , 2));
      await this.presenceHandler.handlePresenceUpdate(oldPresence, newPresence);
    });

    this.client.on('voiceStateUpdate', async (oldState, newState) => {
      console.log(JSON.stringify(oldState, null , 2));
      console.log(JSON.stringify(newState, null , 2));
      await this.streamHandler.handleStreamUpdate(oldState, newState);
    });

    this.client.on('error', (error) => {
      console.error('Discord client error:', error);
    });
  }

  private setupShutdown(): void {
    process.on('SIGTERM', async () => {
      console.log('Received SIGTERM. Cleaning up...');
      await KafkaClient.getInstance().disconnect();
      this.client.destroy();
      process.exit(0);
    });
  }

  public async start(): Promise<void> {
    try {
      await KafkaClient.getInstance().connect();
      this.setupEventListeners();
      this.setupShutdown();
      await this.client.login(config.discord.token);
    } catch (error) {
      console.error('Failed to start the bot:', error);
      process.exit(1);
    }
  }
}

const bot = new Bot();
bot.start();
