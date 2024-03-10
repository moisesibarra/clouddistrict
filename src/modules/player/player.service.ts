import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { Player } from './entities/player.entity';
import { Repository } from 'typeorm';
import { CreatePlayerDto } from './dto';
import { PlayerAddedEvent } from './events';

@Injectable()
export class PlayerService {
  constructor(
    @InjectRepository(Player)
    private readonly playerRepository: Repository<Player>,
    private readonly eventEmitter: EventEmitter2,
  ) { }

  /** Creates a new player without a club*/
  async createPlayer(createPlayerDto: CreatePlayerDto): Promise<Player> {
    const player = this.playerRepository.create(createPlayerDto)
    const savedPlayer = await this.playerRepository.save(player)

    this.eventEmitter.emit('player.added', new PlayerAddedEvent(savedPlayer))

    return savedPlayer
  }
}
