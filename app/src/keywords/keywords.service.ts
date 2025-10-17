import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Keyword } from '@prisma/client';
import { CreateKeywordDto } from './dto/create-keyword.dto';
import { envConfig } from '../config/env.config';
import { ConfigType } from '@nestjs/config';

@Injectable()
export class KeywordsService implements OnModuleInit {
  private readonly logger = new Logger(KeywordsService.name);

  constructor(
    private prisma: PrismaService,
    @Inject(envConfig.KEY)
    private config: ConfigType<typeof envConfig>,
  ) {}

  async onModuleInit() {
    //TODO: hardcoded guild id
    const defaultGuildId = BigInt(this.config.discord_bot.guildId);
    const defaultKeywords = [
      'hello',
      'thanks',
      'help',
      'weather',
      'joke',
      'cool',
      'awesome',
      'nice',
    ];

    try {
      const existingKeywords = await this.prisma.keyword.findMany();

      if (existingKeywords.length === 0) {
        this.logger.log('Creating default keywords...');

        await Promise.all(
          defaultKeywords.map((keyword) =>
            this.create({
              keyword,
              guildId: defaultGuildId,
              active: true,
            }),
          ),
        );

        this.logger.log('Default keywords created successfully');
      } else {
        this.logger.log('Keywords already exist, skipping creation');
      }
    } catch (error) {
      this.logger.error('Error initializing default keywords:', error);
    }
  }

  async create(data: CreateKeywordDto): Promise<Keyword> {
    try {
      return await this.prisma.keyword.create({
        data: {
          ...data,
          createdAt: new Date(),
          active: data.active ?? true,
        },
      });
    } catch (error) {
      this.logger.error('Error creating keyword:', error);
      throw error;
    }
  }

  async getGuildSpecificKeywords(guildId: string) {
    return this.prisma.keyword.findMany({
      where: {
        active: true,
        guildId: BigInt(guildId),
      },
      select: {
        id: true,
        keyword: true,
      },
    });
  }

  async delete(id: bigint): Promise<Keyword> {
    try {
      return await this.prisma.keyword.delete({
        where: { id },
      });
    } catch (error) {
      this.logger.error('Error deleting keyword:', error);
      throw error;
    }
  }
}
