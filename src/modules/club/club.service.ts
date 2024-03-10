import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { Like, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { ERROR_MESSAGES } from '@/common/constants'
import { Club } from './entities/club.entity';
import { CreateClubDto, PaginationQueryDto, UpdateClubDto } from './dto';
import { Player } from '../player/entities/player.entity';
import { Coach } from '../coach/entities/coach.entity';
import { SignupPlayerInClubDto } from './dto/signup-player-in-club.dto';
import { SignupCoachInClubDto } from './dto/signup-coach-in-club.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CoachAddedEvent, CoachRemovedEvent } from '../coach/events';
import { PlayerAddedEvent, PlayerRemovedEvent } from '../player/events';

@Injectable()
export class ClubService {
  constructor(
    @InjectRepository(Club)
    private readonly clubRepository: Repository<Club>,
    @InjectRepository(Player)
    private readonly playerRepository: Repository<Player>,
    @InjectRepository(Coach)
    private readonly coachRepository: Repository<Coach>,
    private readonly eventEmitter: EventEmitter2,
  ) { }


  /** Creates a new club */
  async createClub(createClubDto: CreateClubDto): Promise<Club> {
    const club = this.clubRepository.create(createClubDto)
    return this.clubRepository.save(club)
  }

  /** Updates a club budget */
  async updateClubBudget(
    id: number,
    updateClubDto: UpdateClubDto,
  ): Promise<Club> {
    const club = await this.clubRepository.findOne({
      where: { id: id },
      relations: ['players', 'coaches'],
    })
    if (!club) throw new NotFoundException(ERROR_MESSAGES.CLUB_NOT_FOUND)

    const budget = updateClubDto.budget //Checks if new budget is enough to pay the salaries
    if (budget < this.getBudgetUsed(club))
      throw new ForbiddenException(ERROR_MESSAGES.LOW_BUDGET)

    club.budget = budget //Update budget

    return this.clubRepository.save(club)
  }

  /** List all players signed up in a club */
  async getAllPlayers(
    id: number,
    { limit, offset, searchTerm }: PaginationQueryDto,
  ) {
    const club = await this.clubRepository.findOne({ where: { id: id } })
    if (!club) throw new NotFoundException(ERROR_MESSAGES.CLUB_NOT_FOUND)

    const condition = {
      club: club,
      name: Like(`%${searchTerm}%`),
    }

    return await this.playerRepository.find({
      where: searchTerm ? condition : { club: club }, //Includes condition if searchTerm exists 
      skip: offset,
      take: limit,
    })
  }

  /**Signs up a player in a club */
  async signupPlayerInClub(
    clubId: number,
    signupPlayerInClubDto: SignupPlayerInClubDto,
  ): Promise<Player> {
    const club = await this.clubRepository.findOne({
      where: { id: clubId },
      relations: ['players', 'coaches'],
    })
    if (!club) throw new NotFoundException(ERROR_MESSAGES.CLUB_NOT_FOUND) //The club must exists
    const playerId = signupPlayerInClubDto.id

    const salary = signupPlayerInClubDto.salary //Check if club budget is enough to pay the new salary
    const usedBudget = this.getBudgetUsed(club)
    if (!club.budget || club.budget - usedBudget < salary)
      throw new ForbiddenException(ERROR_MESSAGES.LOW_BUDGET)

    if (!playerId) { // If there is no id, it means the player is new in the platform
      const player = this.playerRepository.create({
        ...signupPlayerInClubDto,
        club: club,
      })

      const savedPlayer = await this.playerRepository.save(player)

      this.eventEmitter.emit('player.added', new PlayerAddedEvent(savedPlayer))
      return savedPlayer
    }

    const player = await this.playerRepository.findOne({ //With id, the player should be registered
      where: { id: playerId },
    })
    if (!player) throw new NotFoundException(ERROR_MESSAGES.PLAYER_NOT_FOUND)
    if (player.club != null) //If player already has a club it can't set another one
      throw new ForbiddenException(ERROR_MESSAGES.PLAYER_SIGNED)

    player.club = club
    const savedPlayer = await this.playerRepository.save(player)

    this.eventEmitter.emit('player.added', new PlayerAddedEvent(savedPlayer))

    return savedPlayer
  }

  /**Signs up a player in a club */
  async signupCoachInClub(
    clubId: number,
    signupCoachInClubDto: SignupCoachInClubDto,
  ) {
    const club = await this.clubRepository.findOne({
      where: { id: clubId },
      relations: ['players', 'coaches'],
    })
    if (!club) throw new NotFoundException(ERROR_MESSAGES.CLUB_NOT_FOUND) //The club must exists
    const coachId = signupCoachInClubDto.id

    const salary = signupCoachInClubDto.salary //Check if club budget is enough to pay the new salary
    const usedBudget = this.getBudgetUsed(club)
    if (!club.budget || club.budget - usedBudget < salary)
      throw new ForbiddenException(ERROR_MESSAGES.LOW_BUDGET)

    if (!coachId) { // If there is no id, it means the coach is new in the platform
      const coach = this.coachRepository.create({
        ...signupCoachInClubDto,
        club: club,
      })

      const savedCoach = await this.coachRepository.save(coach)
      this.eventEmitter.emit('coach.added', new CoachAddedEvent(savedCoach))
      return savedCoach
    }

    const coach = await this.coachRepository.findOne({ //With id, the player should be registered
      where: { id: coachId },
    })
    if (!coach) throw new NotFoundException(ERROR_MESSAGES.COACH_NOT_FOUND)
    if (coach.club != null) //If player already has a club it can't set another one
      throw new ForbiddenException(ERROR_MESSAGES.COACH_SIGNED)

    coach.club = club
    const savedCoach = await this.coachRepository.save(coach)

    this.eventEmitter.emit('coach.added', new CoachAddedEvent(savedCoach))

    return savedCoach
  }

  /** Unsubscribe player from club */
  async unsubscribePlayerFromClub(clubId: number, playerId: number) {
    const club = await this.clubRepository.findOne({
      where: { id: clubId },
      relations: ['players'],
    })
    if (!club) throw new NotFoundException(ERROR_MESSAGES.CLUB_NOT_FOUND)

    //Club must exists and player must exists in the club players list
    const player = club.players.find((player) => player.id === playerId)
    if (!player)
      throw new NotFoundException(ERROR_MESSAGES.PLAYER_MISSING_IN_CLUB)

    player.club = null
    const playerRemoved = await this.playerRepository.save(player)

    this.eventEmitter.emit(
      'player.removed',
      new PlayerRemovedEvent(playerRemoved),
    )
  }

  /** Unsubscribe coach from club */
  async unsubscribeCoachFromClub(clubId: number, coachId: number) {
    const club = await this.clubRepository.findOne({
      where: { id: clubId },
      relations: ['coaches'],
    })
    if (!club) throw new NotFoundException(ERROR_MESSAGES.CLUB_NOT_FOUND)

    //Club must exists and coach must exists in the club coaches list
    const coach = club.coaches.find((coach) => coach.id === coachId)
    if (!coach)
      throw new NotFoundException(ERROR_MESSAGES.COACH_MISSING_IN_CLUB)

    coach.club = null
    const coachRemoved = await this.coachRepository.save(coach)

    this.eventEmitter.emit(
      'coach.removed',
      new CoachRemovedEvent(coachRemoved),
    )
  }

  /** Calculates the salary a club is using */
  getBudgetUsed(club: Club) {
    let usedBudget = 0
    club.coaches.forEach((coach) => {
      usedBudget += coach.salary ? coach.salary : 0
    });
    club.players.forEach((player) => {
      usedBudget += player.salary ? player.salary : 0
    });
    return usedBudget
  }
}
