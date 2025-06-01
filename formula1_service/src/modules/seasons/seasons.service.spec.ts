import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { SeasonsService } from './seasons.service';
import { Season } from './entities/season.entity';
import { DriverStanding } from '../driver-standings/entities/driver-standing.entity';
import { Driver } from '../drivers/entities/driver.entity';
import { ConstructorTeam } from '../constructors/entities/constructor.entity';
import { DriverStandingsService } from '../driver-standings/driver-standings.service';
import { RetryService } from '../../utils/retry.service';

describe('SeasonsService', () => {
  let service: SeasonsService;
  let seasonRepository: Repository<Season>;
  let driverStandingsService: DriverStandingsService;

  const mockSeason = {
    id: 1,
    year: '2024',
    created_at: new Date(),
    updated_at: new Date(),
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
  } as unknown as DriverStanding;

  const mockSeasonWithChampion = {
    ...mockSeason,
    champion: mockChampionStanding,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SeasonsService,
        RetryService,
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Season),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: DriverStandingsService,
          useValue: {
            findSeasonChampion: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SeasonsService>(SeasonsService);
    seasonRepository = module.get<Repository<Season>>(
      getRepositoryToken(Season),
    );
    driverStandingsService = module.get<DriverStandingsService>(
      DriverStandingsService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of seasons ordered by year DESC', async () => {
      const expectedSeasons = [mockSeason];
      jest.spyOn(seasonRepository, 'find').mockResolvedValue(expectedSeasons);

      const result = await service.findAll();
      expect(result).toEqual(expectedSeasons);
      expect(seasonRepository.find).toHaveBeenCalledWith({
        order: { year: 'DESC' },
      });
    });

    it('should return empty array when no seasons found', async () => {
      jest.spyOn(seasonRepository, 'find').mockResolvedValue([]);

      const result = await service.findAll();
      expect(result).toEqual([]);
      expect(seasonRepository.find).toHaveBeenCalledWith({
        order: { year: 'DESC' },
      });
    });

    it('should handle repository errors', async () => {
      jest
        .spyOn(seasonRepository, 'find')
        .mockRejectedValue(new Error('Repository error'));

      await expect(service.findAll()).rejects.toThrow('Repository error');
    });
  });

  describe('findSeasonChampions', () => {
    it('should return seasons with champions using default year range', async () => {
      const seasons = [mockSeason];
      const expectedResponse = {
        seasons: [mockSeasonWithChampion],
      };

      jest.spyOn(seasonRepository, 'find').mockResolvedValue(seasons);
      jest
        .spyOn(driverStandingsService, 'findSeasonChampion')
        .mockResolvedValue(mockChampionStanding);

      const result = await service.findSeasonChampions();
      expect(result).toEqual(expectedResponse);
      expect(seasonRepository.find).toHaveBeenCalledWith({
        where: {
          year: Between('2005', '2025'), // Default values from service
        },
        order: { year: 'DESC' },
      });
      expect(driverStandingsService.findSeasonChampion).toHaveBeenCalledWith(
        parseInt(mockSeason.year),
      );
    });

    it('should return seasons with champions using custom year range', async () => {
      const seasons = [mockSeason];
      const expectedResponse = {
        seasons: [mockSeasonWithChampion],
      };

      jest.spyOn(seasonRepository, 'find').mockResolvedValue(seasons);
      jest
        .spyOn(driverStandingsService, 'findSeasonChampion')
        .mockResolvedValue(mockChampionStanding);

      const result = await service.findSeasonChampions(2020, 2024);
      expect(result).toEqual(expectedResponse);
      expect(seasonRepository.find).toHaveBeenCalledWith({
        where: {
          year: Between('2020', '2024'),
        },
        order: { year: 'DESC' },
      });
      expect(driverStandingsService.findSeasonChampion).toHaveBeenCalledWith(
        parseInt(mockSeason.year),
      );
    });

    it('should handle seasons without champions', async () => {
      const seasons = [mockSeason];
      const expectedResponse = {
        seasons: [{ ...mockSeason, champion: null }],
      };

      jest.spyOn(seasonRepository, 'find').mockResolvedValue(seasons);
      jest
        .spyOn(driverStandingsService, 'findSeasonChampion')
        .mockResolvedValue(null);

      const result = await service.findSeasonChampions(2020, 2024);
      expect(result).toEqual(expectedResponse);
      expect(seasonRepository.find).toHaveBeenCalledWith({
        where: {
          year: Between('2020', '2024'),
        },
        order: { year: 'DESC' },
      });
      expect(driverStandingsService.findSeasonChampion).toHaveBeenCalledWith(
        parseInt(mockSeason.year),
      );
    });

    it('should handle empty seasons array', async () => {
      const expectedResponse = {
        seasons: [],
      };

      jest.spyOn(seasonRepository, 'find').mockResolvedValue([]);

      const result = await service.findSeasonChampions(2020, 2024);
      expect(result).toEqual(expectedResponse);
      expect(seasonRepository.find).toHaveBeenCalledWith({
        where: {
          year: Between('2020', '2024'),
        },
        order: { year: 'DESC' },
      });
      expect(driverStandingsService.findSeasonChampion).not.toHaveBeenCalled();
    });

    it('should handle repository errors', async () => {
      jest
        .spyOn(seasonRepository, 'find')
        .mockRejectedValue(new Error('Repository error'));

      await expect(service.findSeasonChampions(2020, 2024)).rejects.toThrow(
        'Repository error',
      );
    });

    it('should handle driver standings service errors', async () => {
      const seasons = [mockSeason];
      jest.spyOn(seasonRepository, 'find').mockResolvedValue(seasons);
      jest
        .spyOn(driverStandingsService, 'findSeasonChampion')
        .mockRejectedValue(new Error('Driver standings service error'));

      await expect(service.findSeasonChampions(2020, 2024)).rejects.toThrow(
        'Driver standings service error',
      );
    });
  });
});
