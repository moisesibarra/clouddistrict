import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService } from './notification.service';
import { MailService } from '../mail/mail.service';
import { PlayerAddedEvent, PlayerRemovedEvent } from '@/modules/player/events';
import { CoachAddedEvent, CoachRemovedEvent } from '../coach/events';
import { Player } from '../player/entities/player.entity';
import { Club } from '../club/entities/club.entity';

describe('NotificationService', () => {
  let service: NotificationService
  let mailService: MailService

  const TestPlayer: Player = {
    id: Date.now(),
    name: 'Test player',
    surname: 'Test surname',
    salary: 1000,
    email: '',
    createdAt: new Date(),
    club: new Club(),
  }

  const TestCoach: Player = {
    id: Date.now(),
    name: 'Test coach',
    surname: 'Test surname',
    salary: 1000,
    email: '',
    createdAt: new Date(),
    club: new Club(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      // Importar los módulos necesarios o proveer servicios mock directamente
      providers: [
        NotificationService,
        {
          provide: MailService,
          useValue: {
            sendMail: jest.fn(),
          },
        },
      ],
    }).compile()

    service = module.get<NotificationService>(NotificationService)
    mailService = module.get<MailService>(MailService)
  });

  it('should send an email when a player is added', async () => {
    const event = new PlayerAddedEvent(TestPlayer)
    await service.handlePlayerAddedEvent(event)
    expect(mailService.sendMail).toHaveBeenCalledWith(
      event.player.email,
      'NEW SUBSCRIPTION',
      'subscribe-email',
      { name: event.player.name },
    )
  });

  it('should send an email when a player is removed', async () => {
    const event = new PlayerRemovedEvent(TestPlayer)
    await service.handlePlayerRemovedEvent(event)
    expect(mailService.sendMail).toHaveBeenCalledWith(
      event.player.email,
      'UNSUBSCRIPTION SUCCESSFUL',
      'unsubscribe-email',
      { name: event.player.name },
    )
  });

  it('should send an email when a coach is added', async () => {
    const event = new CoachAddedEvent(TestCoach)
    await service.handleCoachAddedEvent(event)
    expect(mailService.sendMail).toHaveBeenCalledWith(
      event.coach.email,
      'NEW SUBSCRIPTION',
      'subscribe-email',
      { name: event.coach.name },
    )
  });

  it('should send an email when a coach is removed', async () => {
    const event = new CoachRemovedEvent(TestCoach)
    await service.handleCoachRemovedEvent(event)
    expect(mailService.sendMail).toHaveBeenCalledWith(
      event.coach.email,
      'UNSUBSCRIPTION SUCCESSFUL',
      'unsubscribe-email',
      { name: event.coach.name },
    )
  });
})
