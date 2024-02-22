import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { env } from 'src/env/env';
import { join } from 'path';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { AuthModule } from 'src/auth/auth.module';
import { LogsService } from 'src/ebay_paypal_logs/logs.service';
import { LogsModule } from 'src/ebay_paypal_logs/logs.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogsEntity } from 'src/entity/logsEntity';

@Module({
  imports: [
    TypeOrmModule.forFeature([LogsEntity]),
    MailerModule.forRoot({
      transport: {
        host: env.email_host,
        port: env.email_port,
        auth: {
          user: env.email_user,
          pass: env.email_pass,
        },
      },
      defaults: {
        from: env.email_from,
      },
      template: {
        dir: join(__dirname, 'templates'),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
    AuthModule,
    LogsModule,
  ],
  providers: [MailService, LogsService],
  exports: [MailService],
})
export class MailModule {}
