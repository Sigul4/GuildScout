import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { MessageMatchesService } from './message-matches.service';
import { KeywordsModule } from '../keywords/keywords.module';

@Module({
  imports: [PrismaModule, KeywordsModule],
  providers: [MessageMatchesService],
  exports: [MessageMatchesService],
})
export class MessageMatchesModule {}
