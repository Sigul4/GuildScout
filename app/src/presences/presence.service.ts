import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ActivitySegregationService } from './activity-segregation.service';
import { KafkaPresence } from '../kafka/types';

@Injectable()
export class PresenceService {
  constructor(
    private prisma: PrismaService,
    private readonly activitySegregation: ActivitySegregationService,
  ) {}

  async handlePresenceUpdate(data: KafkaPresence) {
    console.log(data);
    const activities = await this.activitySegregation.handleActivitySegregation(
      data.oldPresence,
      data.newPresence,
    );
    console.log(activities);
    // Process each activity
    await Promise.all(
      activities.map(async (activityData) => {
        const isActivityEnded = activityData.sessionEnd;

        if (!isActivityEnded) {
          const presence = await this.prisma.presence.create({
            data: {
              userId: data.userId,
              guildId: data.guildId,
              timestamp: data.timestamp,
              status: data.newPresence.status,
            },
          });

          const activity = await this.prisma.activity.create({
            data: {
              presenceId: presence.id,
              type: activityData.type,
              sessionStart: new Date(activityData.sessionStart),
              sessionEnd: activityData.sessionEnd
                ? new Date(activityData.sessionEnd)
                : null,
              duration: activityData.duration,
              name: 'name' in activityData ? activityData.name : null,
              state: 'state' in activityData ? activityData.state : null,
              details: 'details' in activityData ? activityData.details : null,
            },
          });
          console.log({ activityData });
          // Create specific activity record based on type
          switch (activityData.type) {
            case 'spotify':
              await this.prisma.spotifyActivity.create({
                data: {
                  activityId: activity.id,
                  songName: activityData.songName,
                  artist: activityData.artist,
                  genres: activityData.genres || [],
                  album: activityData.album || null,
                  trackId: activityData.trackId || null,
                  albumCoverUrl: activityData.albumCoverUrl || null,
                },
              });
              break;

            case 'gaming':
              await this.prisma.gamingActivity.create({
                data: {
                  activityId: activity.id,
                  gameName: activityData.gameName,
                  isCompetitive: activityData.isCompetitive,
                  partySize: activityData.partySize || null,
                  partyMaxSize: activityData.partyMaxSize || null,
                  platformId: activityData.platformId || null,
                },
              });
              break;

            case 'other':
              await this.prisma.otherActivity.create({
                data: {
                  activityId: activity.id,
                  activityType: activityData.activityType,
                  url: activityData.url || null,
                  applicationId: activityData.applicationId || null,
                  emoji: activityData.emoji || null,
                },
              });
              break;
          }
        } else {
          const matchingActivity = await this.prisma.activity.findFirst({
            where: {
              sessionStart: activityData.sessionStart,
              presence: {
                userId: activityData.userId,
                guildId: activityData.guildId,
              },
            },
          });

          await this.prisma.activity.update({
            where: { id: matchingActivity.id },
            data: {
              sessionEnd: activityData.sessionEnd,
            },
          });
        }
      }),
    );
  }
}
