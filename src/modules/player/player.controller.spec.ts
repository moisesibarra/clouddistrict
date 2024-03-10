import { Test, TestingModule } from '@nestjs/testing';
import { PlayerController } from './player.controller';
import { PlayerService } from './player.service';
import { CreatePlayerDto } from './dto';

// Mock para PlayerService
const mockPlayerService = {
  createPlayer: jest.fn((dto) => {
    return {
      id: Date.now(),
      ...dto,
    }
  }),
}

describe('PlayerController', () => {
  let controller: PlayerController
  let service: PlayerService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlayerController],
      providers: [
        {
          provide: PlayerService,
          useValue: mockPlayerService,
        },
      ],
    }).compile()

    controller = module.get<PlayerController>(PlayerController)
    service = module.get<PlayerService>(PlayerService)
  });

  it('should be defined', () => {
    expect(controller).toBeDefined()
  });

  describe('addPlayer', () => {
    it('should create a player and return the created player data', async () => {
      const createPlayerDto: CreatePlayerDto = {
        name: 'Test Player',
        surname: 'Test Surname',
        email: 'example@example.com',
      }

      jest.clearAllMocks() // Limpia las llamadas a mocks entre pruebas para evitar interferencias

      const result = await controller.createPlayer(createPlayerDto)

      expect(mockPlayerService.createPlayer).toHaveBeenCalledWith(
        createPlayerDto,
      )
      expect(result).toMatchObject(createPlayerDto) // Verifica que el resultado incluya los datos del DTO
      expect(result).toHaveProperty('id') // Verifica que el resultado tenga una propiedad 'id', indicando la creación exitosa
    });
  })
});
