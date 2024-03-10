import { Body, Controller, Post } from '@nestjs/common';

import { PlayerService } from './player.service';
import { CreatePlayerDto } from './dto';

@Controller('player')
export class PlayerController {
  constructor(private readonly playerService: PlayerService) {}

  @Post()
  createPlayer(@Body() createPlayerDto: CreatePlayerDto) {
    return this.playerService.createPlayer(createPlayerDto)
  }
}
