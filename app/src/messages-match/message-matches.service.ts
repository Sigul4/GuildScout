import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Message, OmitPartialGroupDMChannel } from 'discord.js';
import { TextMatcher } from '../utils/text-matcher';
import { KeywordsService } from '../keywords/keywords.service';
import { KafkaMessage } from '../kafka/types';

@Injectable()
export class MessageMatchesService {
  private readonly logger = new Logger(MessageMatchesService.name);
  private readonly textMatcher = new TextMatcher();

  constructor(
    private prisma: PrismaService,
    private readonly keywordsService: KeywordsService,
  ) {}

  async processMessage(data: KafkaMessage): Promise<void> {
    const { guildId, content, authorId, id: messageId, channelId } = data;

    try {
      const keywords =
        await this.keywordsService.getGuildSpecificKeywords(guildId);
      console.log({ keywords });
      const allMatches = keywords.flatMap((keyword) =>
        this.textMatcher.findKeywordMatches(content, keyword),
      );
      console.log({ allMatches });
      if (allMatches.length === 0) {
        return;
      }

      await this.prisma.messageMatch.createMany({
        data: allMatches.map((match) => ({
          messageId: BigInt(messageId),
          channelId: BigInt(channelId),
          guildId: BigInt(guildId),
          authorId: BigInt(authorId),
          keywordId: match.keywordId,
          preContext: match.preContext,
          postContext: match.postContext,
          matchedAt: new Date(),
        })),
      });

      this.logger.debug(
        `Created ${allMatches.length} matches for message ${messageId} in guild ${data.guildId}`,
      );
    } catch (error) {
      this.logger.error(
        `Error processing message matches for message ${messageId} in guild ${data.guildId}:`,
        error,
      );
      throw error;
    }
  }
}
