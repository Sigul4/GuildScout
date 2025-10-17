import { Presence, Activity } from 'discord.js';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Artist } from '@prisma/client';
import { ProcessedDBArtist } from './types';
import { SpotifyService } from '../spotify/spotify.service';
import { SpotifyTrack } from '../spotify/types';

// Base interface for all activities
interface BaseActivityData {
  userId: string;
  guildId: string;
  timestamp: Date;
  type: 'spotify' | 'gaming' | 'other';
  sessionStart?: Date;
  sessionEnd?: Date;
  duration?: number;
}

// Spotify-specific activity data
interface SpotifyData extends BaseActivityData {
  type: 'spotify';
  songName: string;
  artist: string;
  album: string;
  trackId?: string;
  genres: string[];
  albumCoverUrl?: string;
  startTimestamp?: Date;
  endTimestamp?: Date;
}

// Gaming-specific activity data
interface GamingData extends BaseActivityData {
  type: 'gaming';
  gameName: string;
  gameState?: string;
  gameDetails?: string;
  isCompetitive: boolean;
  partySize?: number;
  partyMaxSize?: number;
  platformId?: string;
}

// Generic activity data for all other activities
interface OtherActivityData extends BaseActivityData {
  type: 'other';
  name: string;
  activityType: number;
  state?: string;
  details?: string;
  url?: string;
  applicationId?: string;
  emoji?: string;
}

type ActivityData = SpotifyData | GamingData | OtherActivityData;

@Injectable()
export class ActivitySegregationService {
  constructor(
    private prisma: PrismaService,
    private readonly spotifyService: SpotifyService,
  ) {}

  public async handleActivitySegregation(
    oldPresence: Presence | null,
    newPresence: Presence,
  ): Promise<ActivityData[]> {
    if (!newPresence.guild || !newPresence.userId) return;
    try {
      return this.trackActivities(oldPresence, newPresence);
    } catch (error) {
      console.error('Failed to track activities:', error);
    }
  }

  private async trackActivities(
    oldPresence: Presence | null,
    newPresence: Presence,
  ): Promise<ActivityData[]> {
    const updates: ActivityData[] = [];

    // Track ended sessions
    oldPresence?.activities.forEach(async (oldActivity) => {
      const stillActive = newPresence.activities.some(
        (a) => a.name === oldActivity.name,
      );
      if (!stillActive) {
        updates.push(
          await this.createActivityData(oldActivity, newPresence, true),
        );
      }
    });

    // Track new or updated sessions
    newPresence.activities.forEach(async (newActivity) => {
      const oldActivity = oldPresence?.activities.find(
        (a) => a.name === newActivity.name,
      );

      if (!oldActivity) {
        updates.push(
          await this.createActivityData(newActivity, newPresence, false),
        );
      } else if (this.hasActivityChanged(oldActivity, newActivity)) {
        updates.push(
          await this.createActivityData(newActivity, newPresence, false),
        );
      }
    });

    return updates;
  }

  private hasActivityChanged(
    oldActivity: Activity,
    newActivity: Activity,
  ): boolean {
    return (
      oldActivity.state !== newActivity.state ||
      oldActivity.details !== newActivity.details ||
      oldActivity.type !== newActivity.type
    );
  }

  private async createActivityData(
    activity: Activity,
    presence: Presence,
    isEnding: boolean,
  ): Promise<ActivityData> {
    // Handle Spotify activities
    if (activity.type === 2 && activity.name === 'Spotify') {
      return this.createSpotifyData(activity, presence, isEnding);
    }

    // Handle gaming activities
    if (activity.type === 0) {
      return this.createGamingData(activity, presence, isEnding);
    }

    // Handle all other activities
    return this.createOtherActivityData(activity, presence, isEnding);
  }

  private async createSpotifyData(
    activity: Activity,
    presence: Presence,
    isEnding: boolean,
  ): Promise<SpotifyData> {
    const spotifyActivity = activity as Activity & {
      syncId?: string;
      assets?: {
        largeImageURL?: string;
      };
    };

    const artists = await this.extractAndProcessDBArtists(
      activity.state,
      spotifyActivity.syncId,
    );

    return {
      type: 'spotify',
      userId: presence.userId,
      guildId: presence.guild!.id,
      timestamp: new Date(),
      songName: activity.details || '',
      artist: activity.state || '',
      album: spotifyActivity.assets?.largeText || '',
      trackId: spotifyActivity.syncId,
      genres: [...new Set(artists.flatMap((artist) => artist.data.genres))],
      albumCoverUrl: spotifyActivity.assets?.largeImageURL,
      startTimestamp: activity.timestamps?.start,
      endTimestamp: activity.timestamps?.end,
      sessionStart: activity.timestamps?.start,
      sessionEnd: isEnding ? new Date() : undefined,
      duration:
        isEnding && activity.timestamps?.start
          ? Date.now() - new Date(activity.timestamps.start).getTime()
          : undefined,
    };
  }

  private createGamingData(
    activity: Activity,
    presence: Presence,
    isEnding: boolean,
  ): GamingData {
    return {
      type: 'gaming',
      userId: presence.userId,
      guildId: presence.guild!.id,
      timestamp: new Date(),
      gameName: activity.name,
      gameState: activity.state,
      gameDetails: activity.details,
      isCompetitive: this.isCompetitiveGame(activity),
      partySize: activity.party?.size?.[0],
      partyMaxSize: activity.party?.size?.[1],
      platformId: this.extractPlatformId(activity),
      sessionStart: activity.timestamps?.start,
      sessionEnd: isEnding ? new Date() : undefined,
      duration:
        isEnding && activity.timestamps?.start
          ? Date.now() - new Date(activity.timestamps.start).getTime()
          : undefined,
    };
  }

  private createOtherActivityData(
    activity: Activity,
    presence: Presence,
    isEnding: boolean,
  ): OtherActivityData {
    return {
      type: 'other',
      userId: presence.userId,
      guildId: presence.guild!.id,
      timestamp: new Date(),
      name: activity.name,
      activityType: activity.type,
      state: activity.state,
      details: activity.details,
      url: activity.url,
      applicationId: activity.applicationId,
      emoji: activity.emoji?.name,
      sessionStart: activity.timestamps?.start,
      sessionEnd: isEnding ? new Date() : undefined,
      duration:
        isEnding && activity.timestamps?.start
          ? Date.now() - activity.timestamps.start.getTime()
          : undefined,
    };
  }

  private isCompetitiveGame(activity: Activity): boolean {
    const competitiveKeywords = [
      'ranked',
      'competitive',
      'comp',
      'rating',
      'rank',
      'matchmaking',
      'tournament',
    ];

    return competitiveKeywords.some(
      (keyword) =>
        activity.state?.toLowerCase().includes(keyword) ||
        activity.details?.toLowerCase().includes(keyword),
    );
  }

  private extractPlatformId(activity: Activity): string | undefined {
    if (activity.applicationId) {
      return `steam:${activity.applicationId}`;
    }
    return undefined;
  }

  //TODO: create cron to update artists genres
  async extractAndProcessDBArtists(
    artistsString: string,
    trackId: string,
  ): Promise<ProcessedDBArtist[]> {
    const cleanString = artistsString.replace(/[()]/g, '');

    const artists = cleanString.split(';').map((artist) => artist.trim());

    const results: ProcessedDBArtist[] = [];
    let trackInfo: SpotifyTrack;
    for (const artistName of artists) {
      if (!artistName) continue;

      try {
        const existingArtist = await this.prisma.artist.findUnique({
          where: { name: artistName },
        });

        if (existingArtist) {
          results.push({
            name: artistName,
            data: existingArtist,
          });
        } else {
          if (!trackInfo) {
            trackInfo = await this.spotifyService.getTrackInfo(trackId);
          }
          const { id: artistId } = trackInfo.artists.find(
            (artist) => artist.name === artistName,
          );

          const { genres } = await this.spotifyService.getArtistInfo(artistId);

          const newArtist = {
            name: artistName,
            genres,
            spotifyId: artistId,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          const createdArtist = await this.prisma.artist.create({
            data: newArtist,
          });

          results.push({
            name: artistName,
            data: createdArtist,
          });
        }
      } catch (error) {
        console.error(`Error processing artist ${artistName}:`, error);
        throw new Error(error);
      }
    }

    return results;
  }
}
