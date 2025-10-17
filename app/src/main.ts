import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { setupGlobalMiddleware } from './common/setup/setupGlobalMiddleware';
import { setupSwagger } from './common/setup/setupSwagger';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);

    const ENV = configService.get<string>('env.app.nodeEnv');
    const HOST = configService.get('env.app.host');
    const PORT = configService.get<number>('env.app.port');

    setupGlobalMiddleware(app, ENV);
    await setupSwagger(app, HOST, ENV);

    await app.listen(PORT, () => {
      new Logger('Bootstrap').log(`App is listening on port ${PORT}`);
      ENV === 'development' &&
      new Logger('Bootstrap').verbose(
          `Swagger UI is available at ${HOST}/api/swagger`,
      );
    });
  } catch (e) {
    console.log(e);
  }
}
bootstrap();
