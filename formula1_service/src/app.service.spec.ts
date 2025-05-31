import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppService } from './app.service';
import { Season } from './modules/seasons/entities/season.entity';
import { ConstructorsService } from './modules/constructors/constructors.service';
import { DriversService } from './modules/drivers/drivers.service';
import { RacesService } from './modules/races/races.service';
import { ResultsService } from './modules/results/results.service';
import { DriverStandingsService } from './modules/driver-standings/driver-standings.service';
import { RateLimiterService } from './utils/rate-limiter.service';
import { In } from 'typeorm';

describe('AppService', () => {
  let service: AppService;
  let seasonRepository: Repository<Season>;
  let constructorsService: ConstructorsService;
  let driversService: DriversService;
  let racesService: RacesService;
  let resultsService: ResultsService;
  let driverStandingsService: DriverStandingsService;
  let rateLimiter: RateLimiterService;

  const mockSeasons = [
    { id: 1, year: '2022' },
    { id: 2, year: '2023' },
    { id: 3, year: '2024' }
  ];

  const mockSeasonRepository = {
    find: jest.fn(),
  };

  const mockConstructorsService = {
    importConstructors: jest.fn(),
  };

  const mockDriversService = {
    importDrivers: jest.fn(),
  };

  const mockRacesService = {
    importRaces: jest.fn(),
  };

  const mockResultsService = {
    importResults: jest.fn(),
  };

  const mockDriverStandingsService = {
    importDriverStandings: jest.fn(),
  };

  const mockRateLimiter = {
    executeBatchWithRateLimit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppService,
        {
          provide: getRepositoryToken(Season),
          useValue: mockSeasonRepository,
        },
        {
          provide: ConstructorsService,
          useValue: mockConstructorsService,
        },
        {
          provide: DriversService,
          useValue: mockDriversService,
        },
        {
          provide: RacesService,
          useValue: mockRacesService,
        },
        {
          provide: ResultsService,
          useValue: mockResultsService,
        },
        {
          provide: DriverStandingsService,
          useValue: mockDriverStandingsService,
        },
        {
          provide: RateLimiterService,
          useValue: mockRateLimiter,
        },
      ],
    }).compile();

    service = module.get<AppService>(AppService);
    seasonRepository = module.get<Repository<Season>>(getRepositoryToken(Season));
    constructorsService = module.get<ConstructorsService>(ConstructorsService);
    driversService = module.get<DriversService>(DriversService);
    racesService = module.get<RacesService>(RacesService);
    resultsService = module.get<ResultsService>(ResultsService);
    driverStandingsService = module.get<DriverStandingsService>(DriverStandingsService);
    rateLimiter = module.get<RateLimiterService>(RateLimiterService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('importAllData', () => {
    it('should successfully import data for all seasons', async () => {
      mockSeasonRepository.find.mockResolvedValue(mockSeasons);
      mockRateLimiter.executeBatchWithRateLimit.mockResolvedValue(undefined);

      await service.importAllData();

      expect(mockSeasonRepository.find).toHaveBeenCalledWith({
        order: { year: 'ASC' }
      });

      // Verify rate limiter was called for each season
      expect(mockRateLimiter.executeBatchWithRateLimit).toHaveBeenCalledTimes(3);
      
      // Verify each season's operations
      mockSeasons.forEach((season, index) => {
        const year = parseInt(season.year);
        expect(mockRateLimiter.executeBatchWithRateLimit).toHaveBeenNthCalledWith(
          index + 1,
          expect.arrayContaining([
            expect.any(Function), // constructors
            expect.any(Function), // drivers
            expect.any(Function), // races
            expect.any(Function), // results
            expect.any(Function), // driver standings
          ]),
          `Season ${year} import`,
          2
        );
      });
    });

    it('should handle empty seasons list', async () => {
      mockSeasonRepository.find.mockResolvedValue([]);

      await service.importAllData();

      expect(mockSeasonRepository.find).toHaveBeenCalled();
      expect(mockRateLimiter.executeBatchWithRateLimit).not.toHaveBeenCalled();
    });

    it('should handle errors during import', async () => {
      mockSeasonRepository.find.mockResolvedValue(mockSeasons);
      const error = new Error('Import failed');
      mockRateLimiter.executeBatchWithRateLimit.mockRejectedValue(error);

      await expect(service.importAllData()).rejects.toThrow('Import failed');
      expect(mockSeasonRepository.find).toHaveBeenCalled();
      expect(mockRateLimiter.executeBatchWithRateLimit).toHaveBeenCalled();
    });

    it('should handle errors from season repository', async () => {
      const error = new Error('Database error');
      mockSeasonRepository.find.mockRejectedValue(error);

      await expect(service.importAllData()).rejects.toThrow('Database error');
      expect(mockSeasonRepository.find).toHaveBeenCalled();
      expect(mockRateLimiter.executeBatchWithRateLimit).not.toHaveBeenCalled();
    });
  });
}); 