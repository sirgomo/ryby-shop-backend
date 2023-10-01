import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Database } from './database/databse';
import { ValidationPipe } from '@nestjs/common';
import { env } from './env/env';
import { json, urlencoded } from 'express';

async function bootstrap() {
 
  const db = await new Database();
  await db.checkDatabaseConnection();
  const app = await NestFactory.create(AppModule);
  await app.useGlobalPipes(new ValidationPipe());
  await app.enableCors({ origin: env.address });
  await app.setGlobalPrefix('api');
  await app.use(json({ limit: '50mb' }));
  await app.use(urlencoded({ extended: true, limit: '50mb' }));
  await app.listen(30300);
}
bootstrap();
