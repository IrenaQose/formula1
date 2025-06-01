import { Test, TestingModule } from '@nestjs/testing';
import { SeasonsController } from './seasons.controller';
import { SeasonsService } from './seasons.service';
import { Season } from './entities/season.entity';
import { DriverStanding } from '../driver-standings/entities/driver-standing.entity';
import { Driver } from '../drivers/entities/driver.entity';
import { ConstructorTeam } from '../constructors/entities/constructor.entity';

describe('SeasonsController', () => {
  let controller: SeasonsController;
  let service: SeasonsService;

  const mockSeason = {
    id: 1,
    year: '2024',
  } as Season;

  const mockDriver = {
    id: 1,
    driver_ref: 'hamilton',
    first_name: 'Lewis',
    last_name: 'Hamilton',
  } as Driver;

  const mockConstructor = {
    id: 1,
    constructor_ref: 'mercedes',
    name: 'Mercedes',
  } as ConstructorTeam;

  const mockChampionStanding = {
    id: 1,
    points: 410,
    position: 1,
    wins: 11,
    driver: mockDriver,
    constructorTeam: mockConstructor,
    season: mockSeason,
    season_id: 1,
    driver_id: 1,
    constructor_team_id: 1,
    created_at: new Date(),
    updated_at: new Date(),
  } as DriverStanding;

  const mockSeasonWithChampion = {
    ...mockSeason,
    champion: mockChampionStanding,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SeasonsController],
      providers: [
        {
          provide: SeasonsService,
          useValue: {
            findAll: jest.fn(),
            findSeasonChampions: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<SeasonsController>(SeasonsController);
    service = module.get<SeasonsService>(SeasonsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of seasons', async () => {
      const expectedSeasons = [mockSeason];
      jest.spyOn(service, 'findAll').mockResolvedValue(expectedSeasons);

      const result = await controller.findAll();
      expect(result).toEqual(expectedSeasons);
      expect(service.findAll).toHaveBeenCalled();
    });

    it('should return empty array when no seasons found', async () => {
      jest.spyOn(service, 'findAll').mockResolvedValue([]);

      const result = await controller.findAll();
      expect(result).toEqual([]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('getSeasonsChampions', () => {
    it('should return seasons with champions using custom year range', async () => {
      const expectedResponse = {
        seasons: [mockSeasonWithChampion],
      };
      jest
        .spyOn(service, 'findSeasonChampions')
        .mockResolvedValue(expectedResponse);

      const result = await controller.getSeasonsChampions(2020, 2024);
      expect(result).toEqual(expectedResponse);
      expect(service.findSeasonChampions).toHaveBeenCalledWith(2020, 2024);
    });

    it('should handle empty results', async () => {
      const expectedResponse = {
        seasons: [],
      };
      jest
        .spyOn(service, 'findSeasonChampions')
        .mockResolvedValue(expectedResponse);

      const result = await controller.getSeasonsChampions(2020, 2024);
      expect(result).toEqual(expectedResponse);
      expect(service.findSeasonChampions).toHaveBeenCalledWith(2020, 2024);
    });

    it('should handle service errors', async () => {
      jest
        .spyOn(service, 'findSeasonChampions')
        .mockRejectedValue(new Error('Service error'));

      await expect(controller.getSeasonsChampions(2020, 2024)).rejects.toThrow(
        'Service error',
      );
    });
  });
});
