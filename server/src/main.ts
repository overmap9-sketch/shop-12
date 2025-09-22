import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module.js';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import express from 'express';
import { resolve } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const config = app.get(ConfigService);

  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const origin = config.get<string>('CORS_ORIGIN') || '*';
  app.enableCors({ origin, credentials: true });

  // Static serving for uploads
  const uploadDir = config.get<string>('UPLOAD_DIR') || './uploads';
  app.use('/uploads', express.static(resolve(process.cwd(), uploadDir)));

  // Stripe webhook endpoint requires raw body
  app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

  const port = config.get<number>('PORT') || 4000;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`Backend listening on http://localhost:${port}`);
}

// Global handlers to avoid process exit on unhandled errors in dev
process.on('unhandledRejection', (reason: any) => {
  // eslint-disable-next-line no-console
  console.error('[unhandledRejection]', reason?.stack || reason);
});
process.on('uncaughtException', (err: any) => {
  // eslint-disable-next-line no-console
  console.error('[uncaughtException]', err?.stack || err);
});

bootstrap();
