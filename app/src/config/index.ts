import { ConfigType, ConfigModuleOptions } from '@nestjs/config';
import { envConfig } from './env.config';

export const config: ConfigModuleOptions = {
  isGlobal: true,
  load: [envConfig],
};

export type Config = ConfigType<typeof envConfig>;
