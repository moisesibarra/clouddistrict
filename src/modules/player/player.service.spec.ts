import { Player } from './entities/player.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PlayerService } from './player.service';
import { Test, TestingModule } from '@nestjs/testing';
import { CreatePlayerDto } from './dto';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PlayerAddedEvent } from './events';

//Mock for player repository
interface MockPlayerRepository {
  create: jest.Mock;
  save: jest.Mock;
}

// Mock for EventEmitter2
interface MockEventEmitter {
  emit: jest.Mock;
}

describe('PlayerService', () => {
  let service: PlayerService;
  let mockRepository: MockPlayerRepository;
  let mockEventEmitter: MockEventEmitter;

  beforeEach(async () => {
    mockRepository = {
      create: jest.fn((dto) => dto),
      save: jest.fn((player) => Promise.resolve({ id: Date.now(), ...player })),
    };

    mockEventEmitter = {
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlayerService,
        {
          provide: getRepositoryToken(Player),
          useValue: mockRepository,
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
      ],
    }).compile();

    service = module.get<PlayerService>(PlayerService);
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  });

  describe('createPlayer', () => {
    it('should successfully create a player and emit an event', async () => {
      const createPlayerDto: CreatePlayerDto = {
        name: 'Test Player',
        surname: 'Test surname',
        email: 'example@example.com',
      }

      const result = await service.createPlayer(createPlayerDto)

      expect(mockRepository.create).toHaveBeenCalledWith(createPlayerDto)
      expect(mockRepository.save).toHaveBeenCalled()
      expect(result).toMatchObject(createPlayerDto) // Verifica si el resultado coincide con el DTO
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'player.added',
        expect.any(PlayerAddedEvent),
      )
    });
  })
});
