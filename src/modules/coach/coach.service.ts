import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { Coach } from './entities/coach.entity';
import { CreateCoachDto } from './dto/create-coach.dto';
import { CoachAddedEvent } from './events';

@Injectable()
export class CoachService {
  constructor(
    @InjectRepository(Coach)
    private readonly coachRepository: Repository<Coach>,
    private readonly eventEmitter: EventEmitter2,
  ) { }

  /**Creates a new coach without a club */
  async createCoach(createCoachDto: CreateCoachDto): Promise<Coach> {
    const coach = this.coachRepository.create(createCoachDto)
    const savedCoach = await this.coachRepository.save(coach)

    this.eventEmitter.emit('coach.added', new CoachAddedEvent(savedCoach))
    return savedCoach
  }
}
