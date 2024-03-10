import { Test, TestingModule } from '@nestjs/testing';
import { ClubController } from './club.controller';
import { ClubService } from './club.service';
import { CreateClubDto, PaginationQueryDto, UpdateClubDto } from './dto';
import { SignupPlayerInClubDto } from './dto/signup-player-in-club.dto';
import { SignupCoachInClubDto } from './dto/signup-coach-in-club.dto';

describe('ClubController', () => {
  let clubController: ClubController;
  let clubService: ClubService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClubController],
      providers: [
        {
          provide: ClubService,
          useValue: {
            createClub: jest.fn(),
            updateClubBudget: jest.fn(),
            getAllPlayers: jest.fn(),
            signupPlayerInClub: jest.fn(),
            signupCoachInClub: jest.fn(),
            unsubscribePlayerFromClub: jest.fn(),
            unsubscribeCoachFromClub: jest.fn(),
          },
        },
      ],
    }).compile();

    clubController = module.get<ClubController>(ClubController);
    clubService = module.get<ClubService>(ClubService);
  })

  it('should be defined', () => {
    expect(clubController).toBeDefined();
    expect(clubService).toBeDefined();
  })

  describe('createClub', () => {
    it('should call clubService.createClub with expected params', async () => {
      const createClubDto = new CreateClubDto();
      await clubController.createClub(createClubDto);
      expect(clubService.createClub).toHaveBeenCalledWith(createClubDto);
    })
  });

  describe('updateClubBudget', () => {
    it('should call clubService.updateClubBudget with expected params', async () => {
      const id = 1;
      const updateClubDto = new UpdateClubDto();
      await clubController.updateClubBudget(id, updateClubDto);
      expect(clubService.updateClubBudget).toHaveBeenCalledWith(
        id,
        updateClubDto,
      )
    });
  })

  describe('getAllPlayers', () => {
    it('should call clubService.getAllPlayers with expected params', async () => {
      const id = 1;
      const paginationQueryDto = new PaginationQueryDto();
      await clubController.getAllPlayers(id, paginationQueryDto);
      expect(clubService.getAllPlayers).toHaveBeenCalledWith(
        id,
        paginationQueryDto,
      )
    });
  })

  describe('signupPlayerInClub', () => {
    it('should call clubService.signupPlayerInClub with expected params', async () => {
      const clubId = 1;
      const signupPlayerInClubDto = new SignupPlayerInClubDto();
      await clubController.signupPlayerInClub(clubId, signupPlayerInClubDto);
      expect(clubService.signupPlayerInClub).toHaveBeenCalledWith(
        clubId,
        signupPlayerInClubDto,
      )
    });
  })

  describe('signupCoachInClub', () => {
    it('should call clubService.signupCoachInClub with expected params', async () => {
      const clubId = 1;
      const signupCoachInClubDto = new SignupCoachInClubDto();
      await clubController.signupCoachInClub(clubId, signupCoachInClubDto);
      expect(clubService.signupCoachInClub).toHaveBeenCalledWith(
        clubId,
        signupCoachInClubDto,
      )
    });
  })

  describe('unsubscribePlayerFromClub', () => {
    it('should call clubService.unsubscribePlayerFromClub with expected params', async () => {
      const clubId = 1;
      const playerId = 2;
      await clubController.unsubscribePlayerFromClub(clubId, playerId);
      expect(clubService.unsubscribePlayerFromClub).toHaveBeenCalledWith(
        clubId,
        playerId,
      )
    });
  })

  describe('unsubscribeCoachFromClub', () => {
    it('should call clubService.unsubscribeCoachFromClub with expected params', async () => {
      const clubId = 1;
      const coachId = 2;
      await clubController.unsubscribeCoachFromClub(clubId, coachId);
      expect(clubService.unsubscribeCoachFromClub).toHaveBeenCalledWith(
        clubId,
        coachId,
      )
    });
  })
});
