import { Module } from '@nestjs/common';
import { PresenceService } from './presence.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ActivitySegregationService } from './activity-segregation.service';
import { SpotifyModule } from '../spotify/spotify.module';

@Module({
  imports: [PrismaModule, SpotifyModule],
  providers: [PresenceService, ActivitySegregationService],
  exports: [PresenceService, ActivitySegregationService],
})
export class PresenceModule {}
