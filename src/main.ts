import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Database } from './database/databse';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const db = await new Database();
  await db.checkDatabaseConnection();
  const app = await NestFactory.create(AppModule);
  await app.useGlobalPipes(new ValidationPipe());
  await app.listen(3000);
}
bootstrap();
