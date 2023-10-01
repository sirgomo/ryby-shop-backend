import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Database } from './database/databse';
import { ValidationPipe } from '@nestjs/common';
import { env } from './env/env';

async function bootstrap() {
 
  const db = await new Database();
  await db.checkDatabaseConnection();
  const app = await NestFactory.create(AppModule);
  await app.useGlobalPipes(new ValidationPipe());
  await app.enableCors({ origin: env.address });
  await app.setGlobalPrefix('api');
  await app.listen(30300);
}
bootstrap();
