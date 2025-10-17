import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { KeywordsService } from './keywords.service';

@Module({
  imports: [PrismaModule],
  providers: [KeywordsService],
  exports: [KeywordsService],
})
export class KeywordsModule {}
