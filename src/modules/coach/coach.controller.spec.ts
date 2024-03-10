import { Test, TestingModule } from '@nestjs/testing';
import { CoachController } from './coach.controller';
import { CoachService } from './coach.service';
import { CreateCoachDto } from './dto';

// Mock para CoachService
const mockCoachService = {
  createCoach: jest.fn((dto) => {
    return {
      id: Date.now(),
      ...dto,
    }
  }),
}

describe('CoachController', () => {
  let controller: CoachController
  let service: CoachService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CoachController],
      providers: [
        {
          provide: CoachService,
          useValue: mockCoachService,
        },
      ],
    }).compile()

    controller = module.get<CoachController>(CoachController)
    service = module.get<CoachService>(CoachService)
  });

  it('should be defined', () => {
    expect(controller).toBeDefined()
  });

  describe('addCoach', () => {
    it('should create a coach and return the created coach data', async () => {
      const createCoachDto: CreateCoachDto = {
        name: 'Test Coach',
        surname: 'Test Surname',
        email: 'example@example.com',
      }

      jest.clearAllMocks()

      const result = await controller.createCoach(createCoachDto)

      expect(mockCoachService.createCoach).toHaveBeenCalledWith(createCoachDto)
      expect(result).toMatchObject(createCoachDto)
      expect(result).toHaveProperty('id')
    });
  })
});
