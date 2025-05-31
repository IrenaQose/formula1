import { Test, TestingModule } from '@nestjs/testing';
import { RacesController } from './races.controller';
import { RacesService } from './races.service';
import { Race } from './entities/race.entity';
import { RacesResponse } from './interfaces/races.interface';
import { Driver } from '../drivers/entities/driver.entity';
import { DriverStanding } from '../driver-standings/entities/driver-standing.entity';

describe('RacesController', () => {
  let controller: RacesController;
  let racesService: RacesService;

  const mockRace: Race = {
    id: 1,
    name: 'Australian Grand Prix',
    date: new Date('2024-03-24'),
    time: '05:00:00',
    season_id: 1,
    season: { id: 1, year: '2024' } as any,
    results: [],
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockDriver: Driver = {
    id: 1,
    driver_ref: 'hamilton',
    permanent_number: 44,
    first_name: 'Lewis',
    last_name: 'Hamilton',
    nationality: 'British',
    birth_date: new Date('1985-01-07'),
    results: [],
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockChampion: DriverStanding = {
    id: 1,
    driver_id: 1,
    season_id: 1,
    constructor_team_id: 1,
    points: 100,
    position: 1,
    wins: 5,
    driver: mockDriver,
    constructorTeam: { id: 1, name: 'Mercedes' } as any,
    season: { id: 1, year: '2024' } as any,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockRacesResponse: RacesResponse = {
    races: [{
      name: 'Australian Grand Prix',
      date: new Date('2024-03-24'),
      champion: mockDriver,
      constructor: 'Mercedes',
      laps: 58,
      time: '1:20:235',
    }],
    champion: mockChampion,
  };

  const mockRacesService = {
    findAll: jest.fn(),
    findByYear: jest.fn(),
    importRaces: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RacesController],
      providers: [
        {
          provide: RacesService,
          useValue: mockRacesService,
        },
      ],
    }).compile();

    controller = module.get<RacesController>(RacesController);
    racesService = module.get<RacesService>(RacesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all races', async () => {
      const expectedResponse = { data: [mockRace] };
      mockRacesService.findAll.mockResolvedValue(expectedResponse);

      const result = await controller.findAll();

      expect(result).toEqual(expectedResponse);
      expect(mockRacesService.findAll).toHaveBeenCalled();
    });

    it('should handle service errors', async () => {
      const error = new Error('Database error');
      mockRacesService.findAll.mockRejectedValue(error);

      await expect(controller.findAll()).rejects.toThrow('Database error');
    });
  });

  describe('findByYear', () => {
    it('should return races for a specific year', async () => {
      const year = 2024;
      const expectedResponse = { data: mockRacesResponse };
      mockRacesService.findByYear.mockResolvedValue(expectedResponse);

      const result = await controller.findByYear(year);

      expect(result).toEqual(expectedResponse);
      expect(mockRacesService.findByYear).toHaveBeenCalledWith(year);
    });

    it('should handle service errors', async () => {
      const year = 2024;
      const error = new Error('Database error');
      mockRacesService.findByYear.mockRejectedValue(error);

      await expect(controller.findByYear(year)).rejects.toThrow('Database error');
    });
  });

  describe('importRaces', () => {
    it('should import races for a specific year', async () => {
      const year = 2024;
      mockRacesService.importRaces.mockResolvedValue(undefined);

      const result = await controller.importRaces(year);

      expect(result).toEqual({ message: `Races for ${year} imported successfully` });
      expect(mockRacesService.importRaces).toHaveBeenCalledWith(year);
    });

    it('should handle service errors', async () => {
      const year = 2024;
      const error = new Error('Import error');
      mockRacesService.importRaces.mockRejectedValue(error);

      await expect(controller.importRaces(year)).rejects.toThrow('Import error');
    });
  });
}); 