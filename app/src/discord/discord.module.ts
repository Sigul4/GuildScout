import { Module } from '@nestjs/common';
import { DiscordService } from './discord.service';
import { ReactionsModule } from '../reactions/reactions.module';
import { MessageMatchesModule } from '../messages-match/message-matches.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  providers: [DiscordService],
  exports: [DiscordService],
})
export class DiscordModule {}
