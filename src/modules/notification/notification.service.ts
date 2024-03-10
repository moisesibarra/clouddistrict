import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { PlayerAddedEvent, PlayerRemovedEvent } from '@/modules/player/events';
import { CoachAddedEvent, CoachRemovedEvent } from '../coach/events';
import { MailService } from '../mail/mail.service';

@Injectable()
export class NotificationService {
  constructor(private readonly mailService: MailService) {}

  @OnEvent('player.added')
  async handlePlayerAddedEvent(event: PlayerAddedEvent) {
    await this.mailService.sendMail(
      event.player.email,
      'NEW SUBSCRIPTION',
      'subscribe-email',
      { name: event.player.name },
    )
  }

  @OnEvent('player.removed')
  async handlePlayerRemovedEvent(event: PlayerRemovedEvent) {
    await this.mailService.sendMail(
      event.player.email,
      'UNSUBSCRIPTION SUCCESSFUL',
      'unsubscribe-email',
      { name: event.player.name },
    )
  }

  @OnEvent('coach.added')
  async handleCoachAddedEvent(event: CoachAddedEvent) {
    await this.mailService.sendMail(
      event.coach.email,
      'NEW SUBSCRIPTION',
      'subscribe-email',
      { name: event.coach.name },
    )
  }

  @OnEvent('coach.removed')
  async handleCoachRemovedEvent(event: CoachRemovedEvent) {
    await this.mailService.sendMail(
      event.coach.email,
      'UNSUBSCRIPTION SUCCESSFUL',
      'unsubscribe-email',
      { name: event.coach.name },
    )
  }
}
