import { registerAs } from '@nestjs/config';
import * as process from 'process';

export const envConfig = registerAs('env', () => ({
  db: {
    url: process.env.DATABASE_URL,
  },
  discord_bot: {
    token: process.env.DISCORD_BOT_TOKEN,
    guildId: process.env.GUILD_ID,
  },
  app: {
    port: Number(process.env.APP_PORT || 3000),
    host: process.env.CONTENT_APP_HOST,
    nodeEnv: process.env.NODE_ENV,
  },
  spotify: {
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    redirectUri: process.env.SPOTIFY_REDIRECT_URI,
    initialAccessToken: process.env.SPOTIFY_INITIAL_ACCESS_TOKEN,
    initialRefreshToken: process.env.SPOTIFY_INITIAL_REFRESH_TOKEN,
  },
}));
