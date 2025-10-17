import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { config } from './config';
import { UsersModule } from './users/users.module';
import { KafkaConsumerService } from './kafka/kafka-consumer.service';
import { ReactionsService } from './reactions/reactions.service';
import { MessageMatchesService } from './messages-match/message-matches.service';
import { UsersService } from './users/users.service';
import { PrismaService } from './prisma/prisma.service';
import { KeywordsService } from './keywords/keywords.service';
import { DiscordModule } from './discord/discord.module';
import { PresenceService } from './presences/presence.service';
import { SpotifyModule } from './spotify/spotify.module';
import { PresenceModule } from './presences/presence.module';

@Module({
  imports: [
    ConfigModule.forRoot(config),
    UsersModule,
    DiscordModule,
    SpotifyModule,
    PresenceModule,
  ],
  // controllers: [AppController],
  providers: [
    KafkaConsumerService,
    ReactionsService,
    MessageMatchesService,
    UsersService,
    PrismaService,
    KeywordsService,
    PresenceService,
    SpotifyModule,
  ],
})
export class AppModule {}
