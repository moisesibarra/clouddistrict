import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { ClubModule } from './modules/club/club.module';
import { PlayerModule } from './modules/player/player.module';
import { CoachModule } from './modules/coach/coach.module';
import { NotificationModule } from './modules/notification/notification.module';
import { MailModule } from './modules/mail/mail.module';
import { CONFIG_VALUES } from './common/constants';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get('DB_HOST'),
        port: config.get('DB_PORT'),
        username: config.get('DB_USERNAME'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_DATABASE'),
        autoLoadEntities: true,
        synchronize: (config.get('NODE_ENV') != CONFIG_VALUES.PRODUCTION_STRING),
      }),
    }),
    EventEmitterModule.forRoot(),
    ClubModule,
    PlayerModule,
    CoachModule,
    NotificationModule,
    MailModule,
  ],
})
export class AppModule {
  static port: number

  constructor(private readonly configService: ConfigService) {
    AppModule.port = +this.configService.get('PORT')
  }
}
