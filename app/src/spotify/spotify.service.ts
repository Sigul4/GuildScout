import {
  Injectable,
  HttpException,
  HttpStatus,
  Inject,
  OnModuleInit,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigType } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { firstValueFrom } from 'rxjs';
import { envConfig } from '../config/env.config';
import { SpotifyArtist, SpotifyTrack } from './types';

@Injectable()
export class SpotifyService implements OnModuleInit {
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly redirectUri: string;
  private readonly initialAccessToken: string;
  private readonly initialRefreshToken: string;
  private readonly baseApiUrl = 'https://api.spotify.com/v1';
  private readonly authUrl = 'https://accounts.spotify.com/api/token';

  constructor(
    private readonly httpService: HttpService,
    @Inject(envConfig.KEY)
    private config: ConfigType<typeof envConfig>,
    private prisma: PrismaService,
  ) {
    this.clientId = this.config.spotify.clientId;
    this.clientSecret = this.config.spotify.clientSecret;
    this.redirectUri = this.config.spotify.redirectUri;
    this.initialAccessToken = this.config.spotify.initialAccessToken;
    this.initialRefreshToken = this.config.spotify.initialRefreshToken;
  }

  async onModuleInit(): Promise<void> {
    await this.storeTokens({
      access_token: this.initialAccessToken,
      refresh_token: this.initialRefreshToken,
      expires_in: 1,
    });
  }

  async storeTokens(tokenData: {
    access_token: string;
    refresh_token: string;
    expires_in: number;
  }): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + tokenData.expires_in);

    await this.prisma.spotifyAuth.upsert({
      where: { id: 1 },
      update: {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresIn: tokenData.expires_in,
        expiresAt,
      },
      create: {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresIn: tokenData.expires_in,
        expiresAt,
      },
    });
  }

  async getValidAccessToken(): Promise<string> {
    const auth = await this.prisma.spotifyAuth.findFirst({
      where: { id: 1 },
    });

    if (!auth) {
      throw new HttpException(
        'User not authenticated with Spotify',
        HttpStatus.UNAUTHORIZED,
      );
    }

    // Check if token is expired or will expire soon (within 5 minutes)
    const now = new Date();
    const expirationBuffer = 5 * 60 * 1000; // 5 minutes in milliseconds

    if (auth.expiresAt.getTime() - now.getTime() < expirationBuffer) {
      // Token is expired or will expire soon, refresh it
      const newTokenData = await this.refreshAccessToken(auth.refreshToken);

      // Update stored tokens
      const newExpiresAt = new Date();
      newExpiresAt.setSeconds(
        newExpiresAt.getSeconds() + newTokenData.expires_in,
      );

      await this.prisma.spotifyAuth.update({
        where: { id: 1 },
        data: {
          accessToken: newTokenData.access_token,
          expiresIn: newTokenData.expires_in,
          expiresAt: newExpiresAt,
        },
      });

      return newTokenData.access_token;
    }

    return auth.accessToken;
  }

  async getTrackInfo(trackId: string): Promise<SpotifyTrack> {
    const accessToken = await this.getValidAccessToken();

    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseApiUrl}/tracks/${trackId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }),
      );

      return response.data;
    } catch (error) {
      throw new HttpException(
        'Failed to get track information',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getArtistInfo(artistId: string): Promise<SpotifyArtist> {
    const accessToken = await this.getValidAccessToken();

    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseApiUrl}/artists/${artistId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }),
      );

      return response.data;
    } catch (error) {
      throw new HttpException(
        'Failed to get artist information',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  getAuthorizationUrl(): string {
    const scope = 'user-read-private user-read-email';
    const params = {
      response_type: 'code',
      client_id: this.clientId,
      scope,
      redirect_uri: this.redirectUri,
      show_dialog: 'true', // Force showing the auth dialog
    };

    console.log('Client ID:', this.clientId); // Debug log
    console.log('Redirect URI:', this.redirectUri); // Debug log

    const authUrl =
      'https://accounts.spotify.com/authorize?' +
      Object.entries(params)
        .map(
          ([key, value]) =>
            `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`,
        )
        .join('&');

    return authUrl;
  }

  async getAccessToken(code: string): Promise<{
    access_token: string;
    refresh_token: string;
    expires_in: number;
  }> {
    try {
      const tokenResponse = await firstValueFrom(
        this.httpService.post(
          this.authUrl,
          new URLSearchParams({
            grant_type: 'authorization_code',
            code,
            redirect_uri: this.redirectUri,
          }),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              Authorization: `Basic ${Buffer.from(
                `${this.clientId}:${this.clientSecret}`,
              ).toString('base64')}`,
            },
          },
        ),
      );

      return tokenResponse.data;
    } catch (error) {
      throw new HttpException(
        'Failed to get access token',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async refreshAccessToken(refreshToken: string): Promise<{
    access_token: string;
    expires_in: number;
  }> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          this.authUrl,
          new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
          }),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              Authorization: `Basic ${Buffer.from(
                `${this.clientId}:${this.clientSecret}`,
              ).toString('base64')}`,
            },
          },
        ),
      );

      return response.data;
    } catch (error) {
      throw new HttpException(
        'Failed to refresh token',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
