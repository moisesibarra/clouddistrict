import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import { ClubService } from './club.service';
import { CreateClubDto, PaginationQueryDto, UpdateClubDto } from './dto';
import { SignupPlayerInClubDto } from './dto/signup-player-in-club.dto';
import { SignupCoachInClubDto } from './dto/signup-coach-in-club.dto';

@Controller('clubs')
export class ClubController {
  constructor(private readonly clubService: ClubService) {}

  @Post()
  createClub(@Body() createClubDto: CreateClubDto) {
    return this.clubService.createClub(createClubDto)
  }

  @Patch(':id')
  updateClubBudget(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateClubDto: UpdateClubDto,
  ) {
    return this.clubService.updateClubBudget(id, updateClubDto)
  }

  @Get(':id/players')
  getAllPlayers(
    @Param('id', ParseIntPipe) id: number,
    @Query() pagination: PaginationQueryDto,
  ) {
    return this.clubService.getAllPlayers(id, pagination)
  }

  @Post(':id/players')
  signupPlayerInClub(
    @Param('id', ParseIntPipe) clubId: number,
    @Body() signupPlayerInClubDto: SignupPlayerInClubDto,
  ) {
    return this.clubService.signupPlayerInClub(clubId, signupPlayerInClubDto)
  }

  @Post(':id/coaches')
  signupCoachInClub(
    @Param('id', ParseIntPipe) clubId: number,
    @Body() signupCoachInClubDto: SignupCoachInClubDto,
  ) {
    return this.clubService.signupCoachInClub(clubId, signupCoachInClubDto)
  }

  @Delete(':id/players/:playerId')
  @HttpCode(HttpStatus.NO_CONTENT)
  unsubscribePlayerFromClub(
    @Param('id', ParseIntPipe) clubId: number,
    @Param('playerId', ParseIntPipe) playerId: number,
  ) {
    return this.clubService.unsubscribePlayerFromClub(clubId, playerId)
  }

  @Delete(':id/coaches/:coachId')
  @HttpCode(HttpStatus.NO_CONTENT)
  unsubscribeCoachFromClub(
    @Param('id', ParseIntPipe) clubId: number,
    @Param('coachId', ParseIntPipe) coachId: number,
  ) {
    return this.clubService.unsubscribeCoachFromClub(clubId, coachId)
  }
}
