import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ReactionsService } from './reactions.service';

@Module({
  imports: [PrismaModule],
  providers: [ReactionsService],
  exports: [ReactionsService],
})
export class ReactionsModule {}
