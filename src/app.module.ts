import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { env } from 'env/env';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: env.host,
      port: env.port,
      username: env.user,
      password: env.pass,
      database: env.db,
      entities: [],
      synchronize: false,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
