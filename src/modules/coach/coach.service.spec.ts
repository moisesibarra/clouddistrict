import { Coach } from './entities/coach.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CoachService } from './coach.service';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateCoachDto } from './dto';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CoachAddedEvent } from './events';

//Mock for coach repository
interface MockCoachRepository {
  create: jest.Mock;
  save: jest.Mock;
}

// Mock for EventEmitter2
interface MockEventEmitter {
  emit: jest.Mock;
}

describe('CoachService', () => {
  let service: CoachService
  let mockRepository: MockCoachRepository
  let mockEventEmitter: MockEventEmitter

  beforeEach(async () => {
    mockRepository = {
      create: jest.fn((dto) => dto),
      save: jest.fn((coach) => Promise.resolve({ id: Date.now(), ...coach })),
    };

    mockEventEmitter = {
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoachService,
        {
          provide: getRepositoryToken(Coach),
          useValue: mockRepository,
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
      ],
    }).compile();

    service = module.get<CoachService>(CoachService)
  });

  it('should be defined', () => {
    expect(service).toBeDefined()
  });

  describe('createCoach', () => {
    it('should successfully create a coach and emit an event', async () => {
      const createCoachDto: CreateCoachDto = {
        name: 'Test Coach',
        surname: 'Test surname',
        email: 'example@example.com',
      }

      const result = await service.createCoach(createCoachDto)

      expect(mockRepository.create).toHaveBeenCalledWith(createCoachDto)
      expect(mockRepository.save).toHaveBeenCalled()
      expect(result).toMatchObject(createCoachDto) // Verifica si el resultado coincide con el DTO
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'coach.added',
        expect.any(CoachAddedEvent),
      )
    });
  })
});
