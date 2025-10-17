import { Controller, Get, Query, Redirect, Res } from '@nestjs/common';
import { SpotifyService } from './spotify.service';

@Controller('spotify')
export class SpotifyController {
  constructor(private readonly spotifyService: SpotifyService) {}

  @Get('login')
  async login(@Res() res) {
    const authUrl = this.spotifyService.getAuthorizationUrl();
    console.log('Generated Auth URL:', authUrl);
    res.writeHead(302, { Location: authUrl });
    res.end();
  }

  @Get('callback')
  async callback(@Query('code') code: string) {
    return this.spotifyService.getAccessToken(code);
  }

  @Get('track')
  async getTrackInfo(
    @Query('trackId') trackId: string,
    @Query('accessToken') accessToken: string,
  ) {
    return this.spotifyService.getTrackInfo(trackId);
  }
}
