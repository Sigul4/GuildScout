import { INestApplication } from '@nestjs/common';

export async function setupSwagger(
  app: INestApplication<NonNullable<unknown>>,
  baseUrl: string,
  env: string,
) {
  if (env !== 'development') return;

  const { DocumentBuilder, SwaggerModule } = await import('@nestjs/swagger');
  const config = new DocumentBuilder()
    .setTitle('Discord bot and event processing service')
    .setVersion('1.0')
    .addServer(baseUrl, 'Server')
    .build();

  SwaggerModule.setup(
    '/api/swagger',
    app,
    SwaggerModule.createDocument(app, config),
  );
}
