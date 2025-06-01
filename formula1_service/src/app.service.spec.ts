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
import { RetryService } from './utils/retry.service';
import { HttpService } from '@nestjs/axios';

describe('AppService', () => {
  let service: AppService;
  let seasonRepository: Repository<Season>;
  let constructorsService: ConstructorsService;
  let driversService: DriversService;
  let racesService: RacesService;
  let resultsService: ResultsService;
  let driverStandingsService: DriverStandingsService;

  const mockSeasons = [
    { id: 1, year: '2022' },
    { id: 2, year: '2023' },
    { id: 3, year: '2024' },
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
    findByYear: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppService,
        RetryService,
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
          },
        },
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
      ],
    }).compile();

    service = module.get<AppService>(AppService);
    seasonRepository = module.get<Repository<Season>>(
      getRepositoryToken(Season),
    );
    constructorsService = module.get<ConstructorsService>(ConstructorsService);
    driversService = module.get<DriversService>(DriversService);
    racesService = module.get<RacesService>(RacesService);
    resultsService = module.get<ResultsService>(ResultsService);
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

  describe('importAllData', () => {
    it('should successfully import data for all seasons', async () => {
      mockSeasonRepository.find.mockResolvedValue(mockSeasons);
      mockConstructorsService.importConstructors.mockResolvedValue(undefined);
      mockDriversService.importDrivers.mockResolvedValue(undefined);
      mockRacesService.importRaces.mockResolvedValue(undefined);
      mockResultsService.importResults.mockResolvedValue(undefined);
      mockDriverStandingsService.importDriverStandings.mockResolvedValue(
        undefined,
      );

      await service.importAllData();

      expect(mockSeasonRepository.find).toHaveBeenCalledWith({
        order: { year: 'ASC' },
      });

      // Verify each service was called for each season
      mockSeasons.forEach((season) => {
        const year = parseInt(season.year);
        expect(mockConstructorsService.importConstructors).toHaveBeenCalledWith(
          year,
        );
        expect(mockDriversService.importDrivers).toHaveBeenCalledWith(year);
        expect(mockRacesService.importRaces).toHaveBeenCalledWith(year);
        expect(mockResultsService.importResults).toHaveBeenCalledWith(year);
        expect(
          mockDriverStandingsService.importDriverStandings,
        ).toHaveBeenCalledWith(year);
      });
    });

    it('should execute import operations in correct order for each season', async () => {
      mockSeasonRepository.find.mockResolvedValue([mockSeasons[0]]);
      await service.importAllData();

      // Verify call order
      const constructorCall =
        mockConstructorsService.importConstructors.mock.invocationCallOrder[0];
      const driverCall =
        mockDriversService.importDrivers.mock.invocationCallOrder[0];
      const raceCall = mockRacesService.importRaces.mock.invocationCallOrder[0];
      const resultCall =
        mockResultsService.importResults.mock.invocationCallOrder[0];
      const standingCall =
        mockDriverStandingsService.importDriverStandings.mock
          .invocationCallOrder[0];

      expect(constructorCall).toBeLessThan(driverCall);
      expect(driverCall).toBeLessThan(raceCall);
      expect(raceCall).toBeLessThan(resultCall);
      expect(resultCall).toBeLessThan(standingCall);
    });

    it('should handle empty seasons list', async () => {
      mockSeasonRepository.find.mockResolvedValue([]);

      await service.importAllData();

      expect(mockSeasonRepository.find).toHaveBeenCalledWith({
        order: { year: 'ASC' },
      });
      expect(mockConstructorsService.importConstructors).not.toHaveBeenCalled();
      expect(mockDriversService.importDrivers).not.toHaveBeenCalled();
      expect(mockRacesService.importRaces).not.toHaveBeenCalled();
      expect(mockResultsService.importResults).not.toHaveBeenCalled();
      expect(
        mockDriverStandingsService.importDriverStandings,
      ).not.toHaveBeenCalled();
    });

    it('should handle errors during import', async () => {
      mockSeasonRepository.find.mockResolvedValue(mockSeasons);
      const error = new Error('Import failed');
      mockConstructorsService.importConstructors.mockRejectedValue(error);

      await expect(service.importAllData()).rejects.toThrow('Import failed');
      expect(mockSeasonRepository.find).toHaveBeenCalledWith({
        order: { year: 'ASC' },
      });
      expect(mockConstructorsService.importConstructors).toHaveBeenCalled();
      expect(mockRacesService.importRaces).not.toHaveBeenCalled();
      expect(mockResultsService.importResults).not.toHaveBeenCalled();
      expect(
        mockDriverStandingsService.importDriverStandings,
      ).not.toHaveBeenCalled();
    });

    it('should handle errors from season repository', async () => {
      const error = new Error('Database error');
      mockSeasonRepository.find.mockRejectedValue(error);

      await expect(service.importAllData()).rejects.toThrow('Database error');
      expect(mockSeasonRepository.find).toHaveBeenCalledWith({
        order: { year: 'ASC' },
      });
      expect(mockConstructorsService.importConstructors).not.toHaveBeenCalled();
      expect(mockDriversService.importDrivers).not.toHaveBeenCalled();
      expect(mockRacesService.importRaces).not.toHaveBeenCalled();
      expect(mockResultsService.importResults).not.toHaveBeenCalled();
      expect(
        mockDriverStandingsService.importDriverStandings,
      ).not.toHaveBeenCalled();
    });

    it('should handle partial import failures', async () => {
      mockSeasonRepository.find.mockResolvedValue(mockSeasons);
      const year = parseInt(mockSeasons[0].year);
      const error = new Error('Partial import failed');

      mockConstructorsService.importConstructors.mockResolvedValue(undefined);
      mockDriversService.importDrivers.mockRejectedValue(error);

      await expect(service.importAllData()).rejects.toThrow(
        'Partial import failed',
      );

      expect(mockConstructorsService.importConstructors).toHaveBeenCalledWith(
        year,
      );
      expect(mockDriversService.importDrivers).toHaveBeenCalledWith(year);
      expect(mockRacesService.importRaces).not.toHaveBeenCalled();
      expect(mockResultsService.importResults).not.toHaveBeenCalled();
      expect(
        mockDriverStandingsService.importDriverStandings,
      ).not.toHaveBeenCalled();
    });
  });
});
