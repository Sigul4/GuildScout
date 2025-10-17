import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from '../filters/all-exception.filter';
import { TransformHttpInterceptor } from '../interceptors/transform-http.interceptor';

export function setupGlobalMiddleware(
  app: INestApplication<NonNullable<unknown>>,
  env: string,
) {
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter(env === 'development'));
  app.useGlobalInterceptors(new TransformHttpInterceptor());
  app.setGlobalPrefix('api');
  app.enableCors({ credentials: true, origin: true });
}
