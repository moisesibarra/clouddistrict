import { Module } from '@nestjs/common';

import { NotificationService } from './notification.service';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [MailModule],
  providers: [NotificationService],
})
export class NotificationModule {}
