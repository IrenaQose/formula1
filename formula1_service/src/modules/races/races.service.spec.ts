import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { of, throwError } from 'rxjs';
import { AxiosResponse } from 'axios';

import { RacesService } from './races.service';
import { Race } from './entities/race.entity';
import { Season } from '../seasons/entities/season.entity';
import { DriverStandingsService } from '../driver-standings/driver-standings.service';
import { ResultsService } from '../results/results.service';
import { Driver } from '../drivers/entities/driver.entity';
import { ConstructorTeam } from '../constructors/entities/constructor.entity';
import { RetryService } from '../../utils/retry.service';
import { ErgastRaceResponse } from './interfaces/ergastRace.interface';

describe('RacesService', () => {
  let service: RacesService;
  let raceRepository: Repository<Race>;
  let seasonRepository: Repository<Season>;
  let httpService: HttpService;
  let driverStandingsService: DriverStandingsService;
  let resultsService: ResultsService;

  const mockHttpService = {
    get: jest.fn(),
  };

  const mockRaceRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockSeasonRepository = {
    findOne: jest.fn(),
  };

  const mockDriverStandingsService = {
    findSeasonChampion: jest.fn(),
  };

  const mockResultsService = {
    findByYear: jest.fn(),
    importResults: jest.fn(),
  };

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

  const mockRace = {
    id: 1,
    name: 'Australian Grand Prix',
    date: new Date('2024-03-24'),
    time: '05:00:00',
    season_id: 1,
    season: mockSeason,
    results: [
      {
        id: 1,
        position: 1,
        driver: mockDriver,
        constructorTeam: mockConstructor,
        laps: 58,
        time: '1:20:235',
      },
    ],
  } as Race;

  const mockTransformedRace = {
    id: 1,
    name: 'Australian Grand Prix',
    date: new Date('2024-03-24'),
    champion: mockDriver,
    constructor: 'Mercedes',
    laps: 58,
    time: '1:20:235',
  };

  const mockErgastResponse: ErgastRaceResponse = {
    MRData: {
      limit: '100',
      offset: '0',
      total: '1',
      RaceTable: {
        season: '2024',
        Races: [
          {
            round: '1',
            raceName: 'Australian Grand Prix',
            date: '2024-03-24',
            time: '05:00:00Z',
            Circuit: {
              circuitId: 'albert_park',
              circuitName: 'Albert Park Grand Prix Circuit',
              Location: {
                lat: '-37.8497',
                long: '144.968',
                locality: 'Melbourne',
                country: 'Australia',
              },
            },
          },
        ],
      },
    },
  };

  const mockAxiosResponse: AxiosResponse<ErgastRaceResponse> = {
    data: mockErgastResponse,
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {} as any,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RacesService,
        RetryService,
        {
          provide: getRepositoryToken(Race),
          useValue: mockRaceRepository,
        },
        {
          provide: getRepositoryToken(Season),
          useValue: mockSeasonRepository,
        },
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
        {
          provide: DriverStandingsService,
          useValue: mockDriverStandingsService,
        },
        {
          provide: ResultsService,
          useValue: mockResultsService,
        },
      ],
    }).compile();

    service = module.get<RacesService>(RacesService);
    raceRepository = module.get<Repository<Race>>(getRepositoryToken(Race));
    seasonRepository = module.get<Repository<Season>>(
      getRepositoryToken(Season),
    );
    httpService = module.get<HttpService>(HttpService);
    driverStandingsService = module.get<DriverStandingsService>(
      DriverStandingsService,
    );
    resultsService = module.get<ResultsService>(ResultsService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all races ordered by date', async () => {
      const races = [mockRace];
      mockRaceRepository.find.mockResolvedValue(races);

      const result = await service.findAll();
      expect(result).toEqual({ data: races });
      expect(raceRepository.find).toHaveBeenCalledWith({
        order: { date: 'ASC' },
        relations: ['season'],
      });
    });

    it('should handle empty races array', async () => {
      mockRaceRepository.find.mockResolvedValue([]);

      const result = await service.findAll();
      expect(result).toEqual({ data: [] });
    });

    it('should handle repository errors', async () => {
      mockRaceRepository.find.mockRejectedValue(new Error('Repository error'));

      await expect(service.findAll()).rejects.toThrow('Repository error');
    });
  });

  describe('findByYear', () => {
    it('should return races for a specific year', async () => {
      const year = 2024;
      mockRaceRepository.find.mockResolvedValue([mockRace]);
      mockDriverStandingsService.findSeasonChampion.mockResolvedValue(null);

      const result = await service.findByYear(year);

      expect(result).toEqual({
        data: {
          races: [mockTransformedRace],
          champion: null,
        },
      });
      expect(mockRaceRepository.find).toHaveBeenCalledWith({
        where: {
          season: { year: year.toString() },
        },
        order: {
          date: 'ASC',
        },
        relations: [
          'season',
          'results',
          'results.driver',
          'results.constructorTeam',
        ],
      });
    });

    it('should return empty race when no races found', async () => {
      const year = 2024;
      mockSeasonRepository.findOne.mockResolvedValue(null);
      mockRaceRepository.find.mockResolvedValue([]);

      const { data } = await service.findByYear(year);

      expect(data.races.length).toBe(0);
    });

    it('should handle repository errors', async () => {
      const year = 2024;
      mockSeasonRepository.findOne.mockResolvedValue(mockSeason);
      mockRaceRepository.find.mockRejectedValue(new Error('Repository error'));

      await expect(service.findByYear(year)).rejects.toThrow(
        'Repository error',
      );
    });
  });

  describe('importRaces', () => {
    it('should successfully import races', async () => {
      const year = 2024;
      mockSeasonRepository.findOne.mockResolvedValue(mockSeason);
      mockHttpService.get.mockReturnValue(of(mockAxiosResponse));
      mockRaceRepository.findOne.mockResolvedValue(null);
      mockRaceRepository.create.mockReturnValue(mockRace);
      mockRaceRepository.save.mockResolvedValue(mockRace);

      await service.importRaces(year);

      expect(mockHttpService.get).toHaveBeenCalled();
      expect(mockRaceRepository.save).toHaveBeenCalled();
    });

    it('should handle existing races', async () => {
      const year = 2024;
      mockSeasonRepository.findOne.mockResolvedValue(mockSeason);
      mockHttpService.get.mockReturnValue(of(mockAxiosResponse));
      mockRaceRepository.findOne.mockResolvedValue(mockRace);

      await service.importRaces(year);

      expect(mockRaceRepository.create).not.toHaveBeenCalled();
      expect(mockRaceRepository.save).not.toHaveBeenCalled();
    });

    it('should handle HTTP errors', async () => {
      const year = 2024;
      mockSeasonRepository.findOne.mockResolvedValue(mockSeason);
      mockHttpService.get.mockReturnValue(
        throwError(() => new Error('HTTP Error')),
      );

      await expect(service.importRaces(year)).rejects.toThrow('HTTP Error');
    });
  });
});
