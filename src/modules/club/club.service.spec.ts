import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { ClubService } from './club.service';
import { Club } from './entities/club.entity';
import { Player } from '../player/entities/player.entity';
import { Coach } from '../coach/entities/coach.entity';
import { CreateClubDto, PaginationQueryDto, UpdateClubDto } from './dto';
import { SignupPlayerInClubDto } from './dto/signup-player-in-club.dto';
import { SignupCoachInClubDto } from './dto/signup-coach-in-club.dto';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

describe('ClubService', () => {
  let service: ClubService;
  let clubRepository: Repository<Club>;
  let playerRepository: Repository<Player>;
  let coachRepository: Repository<Coach>;
  let eventEmitter: EventEmitter2;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClubService,
        {
          provide: getRepositoryToken(Club),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Player),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Coach),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ClubService>(ClubService);
    clubRepository = module.get<Repository<Club>>(getRepositoryToken(Club));
    playerRepository = module.get<Repository<Player>>(
      getRepositoryToken(Player),
    )
    coachRepository = module.get<Repository<Coach>>(getRepositoryToken(Coach));
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
  })

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(clubRepository).toBeDefined();
    expect(playerRepository).toBeDefined();
    expect(coachRepository).toBeDefined();
    expect(eventEmitter).toBeDefined();
  })

  describe('createClub', () => {
    it('should successfully create a club', async () => {
      const createClubDto: CreateClubDto = {
        name: 'Test name',
        budget: 10000,
      };
      const result = new Club(); // Simulate the `Club` object that should be returned

      jest.spyOn(clubRepository, 'create').mockReturnValue(result);
      jest.spyOn(clubRepository, 'save').mockResolvedValue(result);

      expect(await service.createClub(createClubDto)).toBe(result);
      expect(clubRepository.create).toHaveBeenCalledWith(createClubDto);
      expect(clubRepository.save).toHaveBeenCalledWith(result);
    })
  });

  describe('updateClubBudget', () => {
    it("should successfully update the club's budget", async () => {
      const id = 1;
      const updateClubDto: UpdateClubDto = { budget: 100000 };
      const club = new Club();
      club.id = id;
      club.budget = 50000; // Initial budget
      club.players = [];
      club.coaches = [];

      jest.spyOn(service, 'getBudgetUsed').mockReturnValue(30000); // Simulate used budget
      jest.spyOn(clubRepository, 'findOne').mockResolvedValue(club);
      jest
        .spyOn(clubRepository, 'save')
        .mockResolvedValue({ ...club, ...updateClubDto });

      const updatedClub = await service.updateClubBudget(id, updateClubDto);

      expect(updatedClub.budget).toEqual(updateClubDto.budget);
      expect(clubRepository.findOne).toHaveBeenCalledWith({
        where: { id: id },
        relations: ['players', 'coaches'],
      });
      expect(clubRepository.save).toHaveBeenCalledWith({
        ...club,
        budget: updateClubDto.budget,
      });
    })

    it('should throw NotFoundException if club is not found', async () => {
      const id = 2;
      const updateClubDto: UpdateClubDto = { budget: 100000 };

      jest.spyOn(clubRepository, 'findOne').mockResolvedValue(null);

      await expect(service.updateClubBudget(id, updateClubDto)).rejects.toThrow(
        NotFoundException,
      )
    });

    it('should throw ForbiddenException if the new budget is lower than the used budget', async () => {
      const id = 3;
      const updateClubDto: UpdateClubDto = { budget: 20000 }; // Lower than used budget
      const club = new Club();
      club.id = id;
      club.budget = 50000; // Initial budget
      club.players = [];
      club.coaches = [];

      jest.spyOn(service, 'getBudgetUsed').mockReturnValue(30000); // Simulate used budget higher than new budget
      jest.spyOn(clubRepository, 'findOne').mockResolvedValue(club);
      await expect(service.updateClubBudget(id, updateClubDto)).rejects.toThrow(
        ForbiddenException,
      )
    });
  })

  describe('getAllPlayers', () => {
    it('should return all players of a club with pagination and optional search term', async () => {
      const clubId = 1;
      const paginationQueryDto: PaginationQueryDto = {
        limit: 10,
        offset: 0,
        searchTerm: 'Test Player',
      };
      const club = new Club();
      club.id = clubId;
      const players = [new Player(), new Player()]; // Simulating an array of Player entities

      jest.spyOn(clubRepository, 'findOne').mockResolvedValue(club);
      jest.spyOn(playerRepository, 'find').mockResolvedValue(players);

      const result = await service.getAllPlayers(clubId, paginationQueryDto);

      expect(result).toEqual(players);
      expect(clubRepository.findOne).toHaveBeenCalledWith({
        where: { id: clubId },
      });
      expect(playerRepository.find).toHaveBeenCalledWith({
        where: {
          club: club,
          name: Like(`%${paginationQueryDto.searchTerm}%`),
        },
        skip: paginationQueryDto.offset,
        take: paginationQueryDto.limit,
      });
    })

    it('should return all players of a club without search term', async () => {
      const clubId = 2;
      const paginationQueryDto: PaginationQueryDto = {
        limit: 10,
        offset: 0,
        searchTerm: '',
      };
      const club = new Club();
      club.id = clubId;
      const players = [new Player(), new Player()]; // Simulating an array of Player entities

      jest.spyOn(clubRepository, 'findOne').mockResolvedValue(club);
      jest.spyOn(playerRepository, 'find').mockResolvedValue(players);

      const result = await service.getAllPlayers(clubId, paginationQueryDto);

      expect(result).toEqual(players);
      expect(clubRepository.findOne).toHaveBeenCalledWith({
        where: { id: clubId },
      });
      expect(playerRepository.find).toHaveBeenCalledWith({
        where: { club: club },
        skip: paginationQueryDto.offset,
        take: paginationQueryDto.limit,
      });
    })

    it('should throw NotFoundException if club is not found', async () => {
      const clubId = 3;
      const paginationQueryDto: PaginationQueryDto = {
        limit: 10,
        offset: 0,
        searchTerm: '',
      };

      jest.spyOn(clubRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.getAllPlayers(clubId, paginationQueryDto),
      ).rejects.toThrow(NotFoundException);
    })
  });

  describe('signupPlayerInClub', () => {
    it('should successfully sign up a new player in a club', async () => {
      const clubId = 1;
      const playerId = 2;
      const signupPlayerInClubDto: SignupPlayerInClubDto = {
        name: 'New Player',
        surname: 'Test surname',
        email: 'email@example.test',
        salary: 1000,
      };
      const club = new Club();
      club.id = clubId;
      club.budget = 5000;
      club.players = [];
      club.coaches = [];

      const newPlayer = new Player();
      newPlayer.name = signupPlayerInClubDto.name;
      newPlayer.salary = signupPlayerInClubDto.salary;

      jest.spyOn(clubRepository, 'findOne').mockResolvedValue(club);
      jest.spyOn(service, 'getBudgetUsed').mockReturnValue(3000);
      jest.spyOn(playerRepository, 'create').mockReturnValue(newPlayer);
      jest.spyOn(playerRepository, 'save').mockResolvedValue(newPlayer);

      const result = await service.signupPlayerInClub(
        clubId,
        signupPlayerInClubDto,
      )

      expect(result).toEqual(newPlayer);
      expect(clubRepository.findOne).toHaveBeenCalledWith({
        where: { id: clubId },
        relations: ['players', 'coaches'],
      });
      expect(playerRepository.create).toHaveBeenCalledWith({
        ...signupPlayerInClubDto,
        club,
      });
      expect(playerRepository.save).toHaveBeenCalledWith(newPlayer);
    })

    it('should successfully sign up an existing player in a club', async () => {
      const clubId = 1;
      const playerId = 2;
      const signupPlayerInClubDto: SignupPlayerInClubDto = {
        id: playerId,
        surname: 'Test surname',
        email: 'email@example.test',
        name: 'Existing Player',
        salary: 1000,
      };
      const club = new Club();
      club.id = clubId;
      club.budget = 5000;
      club.players = [];
      club.coaches = [];

      const existingPlayer = new Player();
      existingPlayer.id = playerId;
      existingPlayer.club = null;

      jest.spyOn(clubRepository, 'findOne').mockResolvedValue(club);
      jest.spyOn(service, 'getBudgetUsed').mockReturnValue(3000);
      jest.spyOn(playerRepository, 'findOne').mockResolvedValue(existingPlayer);
      jest.spyOn(playerRepository, 'save').mockResolvedValue({
        ...existingPlayer,
        club: club,
        name: signupPlayerInClubDto.name,
        salary: signupPlayerInClubDto.salary,
      });

      const result = await service.signupPlayerInClub(
        clubId,
        signupPlayerInClubDto,
      )

      expect(result.club).toEqual(club);
      expect(playerRepository.findOne).toHaveBeenCalledWith({
        where: { id: playerId },
      });
      expect(playerRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ club: club }),
      )
    });

    it('should throw NotFoundException if club is not found', async () => {
      const clubId = 1;
      const playerId = 2;
      const signupPlayerInClubDto: SignupPlayerInClubDto = {
        id: playerId,
        name: 'New Player',
        surname: 'Test surname',
        email: 'email@example.test',
        salary: 1000,
      };

      jest.spyOn(clubRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.signupPlayerInClub(clubId, signupPlayerInClubDto),
      ).rejects.toThrow(NotFoundException);
    })

    it('should throw ForbiddenException if the budget is too low', async () => {
      const clubId = 1;
      const signupPlayerInClubDto: SignupPlayerInClubDto = {
        id: Date.now(),
        name: 'New Player',
        surname: 'Test surname',
        email: 'email@example.test',
        salary: 10000, // Salary that exceeds the remaining budget
      };
      const club = new Club();
      club.id = clubId;
      club.budget = 5000; // Lower than the player's salary
      club.players = [];
      club.coaches = [];

      jest.spyOn(clubRepository, 'findOne').mockResolvedValue(club);
      jest.spyOn(service, 'getBudgetUsed').mockReturnValue(0); // No budget used yet, but total budget is too low

      await expect(
        service.signupPlayerInClub(clubId, signupPlayerInClubDto),
      ).rejects.toThrow(ForbiddenException);
    })

    it('should throw ForbiddenException if the player is already signed', async () => {
      const clubId = 1;
      const playerId = 2;
      const anotherClub = new Club();
      anotherClub.id = 3;
      const signupPlayerInClubDto: SignupPlayerInClubDto = {
        id: playerId,
        name: 'Already Signed Player',
        surname: 'Test surname',
        email: 'email@example.test',
        salary: 1000,
      };
      const club = new Club();
      club.id = clubId;
      club.budget = 5000;
      club.players = [];
      club.coaches = [];

      const alreadySignedPlayer = new Player();
      alreadySignedPlayer.id = playerId;
      alreadySignedPlayer.club = anotherClub; // Player is already signed to another club

      jest.spyOn(clubRepository, 'findOne').mockResolvedValue(club);
      jest
        .spyOn(playerRepository, 'findOne')
        .mockResolvedValue(alreadySignedPlayer);

      await expect(
        service.signupPlayerInClub(clubId, signupPlayerInClubDto),
      ).rejects.toThrow(ForbiddenException);
    })
  });

  describe('signupCoachInClub', () => {
    it('should successfully sign up a new coach in a club', async () => {
      const clubId = 1;
      const coachId = 2;
      const signupCoachInClubDto: SignupCoachInClubDto = {
        name: 'New Coach',
        surname: 'Test surname',
        email: 'email@example.test',
        salary: 1000,
      };
      const club = new Club();
      club.id = clubId;
      club.budget = 5000;
      club.players = [];
      club.coaches = [];

      const newCoach = new Coach();
      newCoach.name = signupCoachInClubDto.name;
      newCoach.salary = signupCoachInClubDto.salary;

      jest.spyOn(clubRepository, 'findOne').mockResolvedValue(club);
      jest.spyOn(service, 'getBudgetUsed').mockReturnValue(3000);
      jest.spyOn(coachRepository, 'create').mockReturnValue(newCoach);
      jest.spyOn(coachRepository, 'save').mockResolvedValue(newCoach);

      const result = await service.signupCoachInClub(
        clubId,
        signupCoachInClubDto,
      )

      expect(result).toEqual(newCoach);
      expect(clubRepository.findOne).toHaveBeenCalledWith({
        where: { id: clubId },
        relations: ['players', 'coaches'],
      });
      expect(coachRepository.create).toHaveBeenCalledWith({
        ...signupCoachInClubDto,
        club,
      });
      expect(coachRepository.save).toHaveBeenCalledWith(newCoach);
    })

    it('should successfully sign up an existing coach in a club', async () => {
      const clubId = 1;
      const coachId = 2;
      const signupCoachInClubDto: SignupCoachInClubDto = {
        id: coachId,
        surname: 'Test surname',
        email: 'email@example.test',
        name: 'Existing Coach',
        salary: 1000,
      };
      const club = new Club();
      club.id = clubId;
      club.budget = 5000;
      club.players = [];
      club.coaches = [];

      const existingCoach = new Coach();
      existingCoach.id = coachId;
      existingCoach.club = null;

      jest.spyOn(clubRepository, 'findOne').mockResolvedValue(club);
      jest.spyOn(service, 'getBudgetUsed').mockReturnValue(3000);
      jest.spyOn(coachRepository, 'findOne').mockResolvedValue(existingCoach);
      jest.spyOn(coachRepository, 'save').mockResolvedValue({
        ...existingCoach,
        club: club,
        name: signupCoachInClubDto.name,
        salary: signupCoachInClubDto.salary,
      });

      const result = await service.signupCoachInClub(
        clubId,
        signupCoachInClubDto,
      )

      expect(result.club).toEqual(club);
      expect(coachRepository.findOne).toHaveBeenCalledWith({
        where: { id: coachId },
      });
      expect(coachRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ club: club }),
      )
    });

    it('should throw NotFoundException if club is not found', async () => {
      const clubId = 1;
      const coachId = 2;
      const signupCoachInClubDto: SignupCoachInClubDto = {
        id: coachId,
        name: 'New Coach',
        surname: 'Test surname',
        email: 'email@example.test',
        salary: 1000,
      };

      jest.spyOn(clubRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.signupCoachInClub(clubId, signupCoachInClubDto),
      ).rejects.toThrow(NotFoundException);
    })

    it('should throw ForbiddenException if the budget is too low', async () => {
      const clubId = 1;
      const signupCoachInClubDto: SignupCoachInClubDto = {
        id: Date.now(),
        name: 'New Coach',
        surname: 'Test surname',
        email: 'email@example.test',
        salary: 10000, // Salary that exceeds the remaining budget
      };
      const club = new Club();
      club.id = clubId;
      club.budget = 5000; // Lower than the coach's salary
      club.players = [];
      club.coaches = [];

      jest.spyOn(clubRepository, 'findOne').mockResolvedValue(club);
      jest.spyOn(service, 'getBudgetUsed').mockReturnValue(0); // No budget used yet, but total budget is too low

      await expect(
        service.signupCoachInClub(clubId, signupCoachInClubDto),
      ).rejects.toThrow(ForbiddenException);
    })

    it('should throw ForbiddenException if the coach is already signed', async () => {
      const clubId = 1;
      const coachId = 2;
      const anotherClub = new Club();
      anotherClub.id = 3;
      const signupCoachInClubDto: SignupCoachInClubDto = {
        id: coachId,
        name: 'Already Signed Coach',
        surname: 'Test surname',
        email: 'email@example.test',
        salary: 1000,
      };
      const club = new Club();
      club.id = clubId;
      club.budget = 5000;
      club.players = [];
      club.coaches = [];

      const alreadySignedCoach = new Coach();
      alreadySignedCoach.id = coachId;
      alreadySignedCoach.club = anotherClub; // Coach is already signed to another club

      jest.spyOn(clubRepository, 'findOne').mockResolvedValue(club);
      jest
        .spyOn(coachRepository, 'findOne')
        .mockResolvedValue(alreadySignedCoach);

      await expect(
        service.signupCoachInClub(clubId, signupCoachInClubDto),
      ).rejects.toThrow(ForbiddenException);
    })
  });

  describe('unsubscribePlayerFromClub', () => {
    it('should successfully unsubscribe a player from a club', async () => {
      const clubId = 1;
      const playerId = 2;
      const club = new Club();
      club.id = clubId;
      const player = new Player();
      player.id = playerId;
      player.club = club;

      jest
        .spyOn(clubRepository, 'findOne')
        .mockResolvedValue({ ...club, players: [player] });
      jest.spyOn(playerRepository, 'save').mockResolvedValue(player);

      await service.unsubscribePlayerFromClub(clubId, playerId);

      expect(clubRepository.findOne).toHaveBeenCalledWith({
        where: { id: clubId },
        relations: ['players'],
      });
      expect(playerRepository.save).toHaveBeenCalled();
      expect(player.club).toBeNull();
    })

    it('should throw NotFoundException if club is not found', async () => {
      const clubId = 3;
      const playerId = 4;

      jest.spyOn(clubRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.unsubscribePlayerFromClub(clubId, playerId),
      ).rejects.toThrow(NotFoundException);
    })

    it('should throw NotFoundException if player is not found in the club', async () => {
      const clubId = 1;
      const playerId = 2;
      const club = new Club();
      club.id = clubId;
      club.players = []; // Player not in club

      jest.spyOn(clubRepository, 'findOne').mockResolvedValue(club);

      await expect(
        service.unsubscribePlayerFromClub(clubId, playerId),
      ).rejects.toThrow(NotFoundException);
    })
  });

  describe('unsubscribeCoachFromClub', () => {
    it('should successfully unsubscribe a coach from a club', async () => {
      const clubId = 1;
      const coachId = 2;
      const club = new Club();
      club.id = clubId;
      const coach = new Coach();
      coach.id = coachId;
      coach.club = club;

      jest
        .spyOn(clubRepository, 'findOne')
        .mockResolvedValue({ ...club, coaches: [coach] });
      jest.spyOn(coachRepository, 'save').mockResolvedValue(coach);

      await service.unsubscribeCoachFromClub(clubId, coachId);

      expect(clubRepository.findOne).toHaveBeenCalledWith({
        where: { id: clubId },
        relations: ['coaches'],
      });
      expect(coachRepository.save).toHaveBeenCalled();
      expect(coach.club).toBeNull();
    })

    it('should throw NotFoundException if club is not found', async () => {
      const clubId = 3;
      const coachId = 4;

      jest.spyOn(clubRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.unsubscribeCoachFromClub(clubId, coachId),
      ).rejects.toThrow(NotFoundException);
    })

    it('should throw NotFoundException if coach is not found in the club', async () => {
      const clubId = 1;
      const coachId = 2;
      const club = new Club();
      club.id = clubId;
      club.coaches = []; // Coach not in club

      jest.spyOn(clubRepository, 'findOne').mockResolvedValue(club);

      await expect(
        service.unsubscribeCoachFromClub(clubId, coachId),
      ).rejects.toThrow(NotFoundException);
    })
  });
})
