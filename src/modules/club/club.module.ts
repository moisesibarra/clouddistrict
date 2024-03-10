import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ClubController } from './club.controller';
import { ClubService } from './club.service';
import { Club } from './entities/club.entity';
import { PlayerModule } from '../player/player.module';
import { CoachModule } from '../coach/coach.module';

@Module({
  imports: [TypeOrmModule.forFeature([Club]), PlayerModule, CoachModule],
  exports: [TypeOrmModule.forFeature([Club])],
  controllers: [ClubController],
  providers: [ClubService],
})
export class ClubModule {}
