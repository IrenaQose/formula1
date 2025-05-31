import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { of, throwError } from 'rxjs';

import { RacesService } from './races.service';
import { Race } from './entities/race.entity';
import { Season } from '../seasons/entities/season.entity';
import { DriverStandingsService } from '../driver-standings/driver-standings.service';
import { ResultsService } from '../results/results.service';
import { Driver } from '../drivers/entities/driver.entity';
import { ConstructorTeam } from '../constructors/entities/constructor.entity';
import { DriverStanding } from '../driver-standings/entities/driver-standing.entity';

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
    results: [{
      id: 1,
      position: 1,
      driver: mockDriver,
      constructorTeam: mockConstructor,
      laps: 58,
      time: '1:20:235',
    }],
  } as Race;

  const mockChampion = {
    id: 1,
    driver: mockDriver,
    constructorTeam: mockConstructor,
    points: 100,
    position: 1,
    wins: 5,
  } as DriverStanding;

  const mockErgastResponse = {
    data: {
      MRData: {
        RaceTable: {
          Races: [{
            round: '1',
            raceName: 'Australian Grand Prix',
            date: '2024-03-24',
            time: '05:00:00Z',
            Circuit: {
              circuitId: 'albert_park',
              circuitName: 'Albert Park Circuit',
              Location: {
                lat: '-37.8497',
                long: '144.968',
                locality: 'Melbourne',
                country: 'Australia',
              },
            },
          }],
        },
      },
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RacesService,
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
    seasonRepository = module.get<Repository<Season>>(getRepositoryToken(Season));
    httpService = module.get<HttpService>(HttpService);
    driverStandingsService = module.get<DriverStandingsService>(DriverStandingsService);
    resultsService = module.get<ResultsService>(ResultsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
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
      const races = [mockRace];
      const results = [mockRace.results[0]];
      mockRaceRepository.find.mockResolvedValue(races);
      mockResultsService.findByYear.mockResolvedValue(results);
      mockDriverStandingsService.findSeasonChampion.mockResolvedValue(mockChampion);

      const result = await service.findByYear(year);
      expect(result.data.races).toHaveLength(1);
      expect(result.data.champion).toBeDefined();
      expect(raceRepository.find).toHaveBeenCalledWith({
        where: { season: { year: year.toString() } },
        order: { date: 'ASC' },
        relations: ['season', 'results', 'results.driver', 'results.constructorTeam'],
      });
    });

    it('should import races if none found', async () => {
      const year = 2024;
      mockRaceRepository.find.mockResolvedValue([]);
      mockResultsService.findByYear.mockResolvedValue([]);
      mockHttpService.get.mockReturnValue(of(mockErgastResponse));
      mockSeasonRepository.findOne.mockResolvedValue(mockSeason);
      mockRaceRepository.findOne.mockResolvedValue(null);
      mockRaceRepository.create.mockReturnValue(mockRace);
      mockRaceRepository.save.mockResolvedValue(mockRace);

      await service.findByYear(year);

      expect(mockHttpService.get).toHaveBeenCalled();
      expect(mockRaceRepository.save).toHaveBeenCalled();
    });

    it('should import results if none found', async () => {
      const year = 2024;
      const races = [mockRace];
      mockRaceRepository.find.mockResolvedValue(races);
      mockResultsService.findByYear.mockResolvedValue([]);

      await service.findByYear(year);

      expect(mockResultsService.importResults).toHaveBeenCalledWith(year);
    });

    it('should handle season not found', async () => {
      const year = 2024;
      mockRaceRepository.find.mockResolvedValue([]);
      mockResultsService.findByYear.mockResolvedValue([]);
      mockHttpService.get.mockReturnValue(of(mockErgastResponse));
      mockSeasonRepository.findOne.mockResolvedValue(null);

      await expect(service.findByYear(year)).rejects.toThrow(`Season ${year} not found`);
    });

    it('should handle repository errors', async () => {
      const year = 2024;
      mockRaceRepository.find.mockRejectedValue(new Error('Repository error'));

      await expect(service.findByYear(year)).rejects.toThrow('Repository error');
    });
  });

  describe('importRaces', () => {
    it('should successfully import races', async () => {
      const year = 2024;
      mockHttpService.get.mockReturnValue(of(mockErgastResponse));
      mockSeasonRepository.findOne.mockResolvedValue(mockSeason);
      mockRaceRepository.findOne.mockResolvedValue(null);
      mockRaceRepository.create.mockReturnValue(mockRace);
      mockRaceRepository.save.mockResolvedValue(mockRace);

      await service.importRaces(year);

      expect(mockHttpService.get).toHaveBeenCalledWith(`${process.env.ERGAST_API_URL}/${year}/races`);
      expect(mockSeasonRepository.findOne).toHaveBeenCalledWith({ where: { year: year.toString() } });
      expect(mockRaceRepository.save).toHaveBeenCalled();
    });

    it('should handle existing races', async () => {
      const year = 2024;
      mockHttpService.get.mockReturnValue(of(mockErgastResponse));
      mockSeasonRepository.findOne.mockResolvedValue(mockSeason);
      mockRaceRepository.findOne.mockResolvedValue(mockRace);

      await service.importRaces(year);

      expect(mockRaceRepository.create).not.toHaveBeenCalled();
      expect(mockRaceRepository.save).not.toHaveBeenCalled();
    });

    it('should handle season not found', async () => {
      const year = 2024;
      mockHttpService.get.mockReturnValue(of(mockErgastResponse));
      mockSeasonRepository.findOne.mockResolvedValue(null);

      await expect(service.importRaces(year)).rejects.toThrow(`Season ${year} not found`);
    });

    it('should handle HTTP errors', async () => {
      const year = 2024;
      mockHttpService.get.mockReturnValue(throwError(() => new Error('HTTP Error')));

      await expect(service.importRaces(year)).rejects.toThrow('HTTP Error');
    });

    it('should handle repository errors', async () => {
      const year = 2024;
      mockHttpService.get.mockReturnValue(of(mockErgastResponse));
      mockSeasonRepository.findOne.mockResolvedValue(mockSeason);
      mockRaceRepository.findOne.mockRejectedValue(new Error('Repository error'));

      await expect(service.importRaces(year)).rejects.toThrow('Repository error');
    });
  });
}); 