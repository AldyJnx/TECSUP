import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  const allowedOrigin = config.get<string>('ALLOWED_ORIGIN') ?? 'http://localhost:5173';
  const port = Number(config.get<string>('PORT') ?? 3000);

  app.enableCors({ origin: allowedOrigin });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`Backend escuchando en http://localhost:${port} (CORS: ${allowedOrigin})`);
}

bootstrap();
