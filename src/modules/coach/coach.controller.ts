import { Body, Controller, Post } from '@nestjs/common';

import { CoachService } from './coach.service';
import { CreateCoachDto } from './dto/create-coach.dto';

@Controller('coach')
export class CoachController {
  constructor(private readonly coachService: CoachService) {}

  @Post()
  createCoach(@Body() createCoachDto: CreateCoachDto) {
    return this.coachService.createCoach(createCoachDto)
  }
}
