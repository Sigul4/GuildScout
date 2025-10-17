import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import {
  Client,
  Events,
  GatewayIntentBits,
  MessageReaction,
  PartialMessageReaction,
  OmitPartialGroupDMChannel,
  Message,
  Partials,
  User as DiscordUser,
  PartialUser as PartialDiscordUser,
  GuildMember,
} from 'discord.js';
import { envConfig } from '../config/env.config';
import { ReactionsService } from '../reactions/reactions.service';
import { MessageMatchesService } from '../messages-match/message-matches.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class DiscordService implements OnModuleInit {
  private client: Client;
  private readonly logger = new Logger(DiscordService.name);

  constructor(
    @Inject(envConfig.KEY)
    private config: ConfigType<typeof envConfig>,
    private readonly usersService: UsersService,
  ) {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
      ],
      partials: [Partials.Message, Partials.Channel, Partials.Reaction],
    });
  }

  async onModuleInit() {
    await this.client.login(this.config.discord_bot.token);
    //TODO: hardcoded guild id for now
    await this._syncGuildUsers(this.config.discord_bot.guildId);
  }

  private async _syncGuildUsers(guildId: string): Promise<void> {
    try {
      const guild = await this.client.guilds.fetch(guildId);
      if (!guild) {
        this.logger.error(`Guild with ID ${guildId} not found`);
        return;
      }

      const members = await guild.members.fetch();

      this.logger.log(
        `Fetched ${members.size} members from guild ${guild.name}`,
      );

      const now = new Date();

      const batchSize = 100;
      const membersArray = Array.from(members.values());

      for (let i = 0; i < membersArray.length; i += batchSize) {
        const batch = membersArray.slice(i, i + batchSize);
        const userCreatePromises = batch.map(async (member) => {
          try {
            await this.usersService.create({
              id: BigInt(member.id),
              username: member.user.username,
              firstSeenAt: now,
              lastActiveAt: now,
            });
          } catch (error) {
            if (error.code === 'P2002') {
              await this.usersService.update(BigInt(member.id), {
                username: member.user.username,
                lastActiveAt: now,
              });
            } else {
              this.logger.error(`Error processing member ${member.id}:`, error);
            }
          }
        });
        await Promise.all(userCreatePromises);
        this.logger.log(`Processed batch of ${batch.length} members`);
      }
      this.logger.log(
        `Successfully synchronized users for guild ${guild.name}`,
      );
    } catch (error) {
      this.logger.error('Error syncing guild users:', error);
      throw error;
    }
  }
}
