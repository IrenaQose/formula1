import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HttpService } from '@nestjs/axios';
import { Repository } from 'typeorm';
import { of, throwError } from 'rxjs';
import { AxiosResponse } from 'axios';

import { ResultsService } from './results.service';
import { Result } from './entities/result.entity';
import { Season } from '../seasons/entities/season.entity';
import { Race } from '../races/entities/race.entity';
import { Driver } from '../drivers/entities/driver.entity';
import { ConstructorTeam } from '../constructors/entities/constructor.entity';
import { ErgastResultsResponse } from './interfaces/ergastResults.interface';
import { RetryService } from '../../utils/retry.service';

describe('ResultsService', () => {
  let service: ResultsService;
  let resultRepository: Repository<Result>;
  let seasonRepository: Repository<Season>;
  let raceRepository: Repository<Race>;
  let driverRepository: Repository<Driver>;
  let constructorRepository: Repository<ConstructorTeam>;
  let httpService: HttpService;

  const mockSeason = {
    id: 1,
    year: '2024',
  } as Season;

  const mockRace = {
    id: 1,
    name: 'Australian Grand Prix',
    season_id: 1,
  } as Race;

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

  const mockResult = {
    id: 1,
    points: 25,
    position: 1,
    grid: 1,
    laps: 58,
    status: 'Finished',
    time: '1:30:00.000',
    season: mockSeason,
    season_id: 1,
    driver: mockDriver,
    driver_id: 1,
    race: mockRace,
    race_id: 1,
    constructorTeam: mockConstructor,
    constructor_id: 1,
    created_at: new Date(),
    updated_at: new Date(),
  } as unknown as Result;

  const mockErgastResponse: ErgastResultsResponse = {
    MRData: {
      limit: '100',
      offset: '0',
      total: '1',
      RaceTable: {
        Races: [
          {
            season: '2024',
            round: '1',
            raceName: 'Australian Grand Prix',
            date: '2024-03-24',
            time: '05:00:00Z',
            Results: [
              {
                number: '44',
                position: '1',
                points: '25',
                Driver: {
                  driverId: 'hamilton',
                  permanentNumber: '44',
                  givenName: 'Lewis',
                  familyName: 'Hamilton',
                  dateOfBirth: '1985-01-07',
                  nationality: 'British',
                },
                Constructor: {
                  constructorId: 'mercedes',
                  name: 'Mercedes',
                  nationality: 'German',
                },
                grid: '1',
                laps: '58',
                status: 'Finished',
                Time: {
                  time: '1:30:00.000',
                },
              },
            ],
          },
        ],
      },
    },
  };

  const mockAxiosResponse: AxiosResponse<ErgastResultsResponse> = {
    data: mockErgastResponse,
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {} as any,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResultsService,
        RetryService,
        {
          provide: getRepositoryToken(Result),
          useValue: {
            findAndCount: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Season),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Race),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Driver),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ConstructorTeam),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ResultsService>(ResultsService);
    resultRepository = module.get<Repository<Result>>(getRepositoryToken(Result));
    seasonRepository = module.get<Repository<Season>>(getRepositoryToken(Season));
    raceRepository = module.get<Repository<Race>>(getRepositoryToken(Race));
    driverRepository = module.get<Repository<Driver>>(getRepositoryToken(Driver));
    constructorRepository = module.get<Repository<ConstructorTeam>>(
      getRepositoryToken(ConstructorTeam),
    );
    httpService = module.get<HttpService>(HttpService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated results with default values', async () => {
      const expected = {
        data: [mockResult],
        total: 1,
        page: 1,
        limit: 30,
      };

      jest.spyOn(resultRepository, 'findAndCount').mockResolvedValue([[mockResult], 1]);

      const result = await service.findAll();
      expect(result).toEqual(expected);
      expect(resultRepository.findAndCount).toHaveBeenCalledWith({
        skip: 0,
        take: 30,
        order: {
          season_id: 'DESC',
          race_id: 'ASC',
          position: 'ASC',
        },
        relations: ['season', 'race', 'driver', 'constructorTeam'],
      });
    });

    it('should return paginated results with custom values', async () => {
      const expected = {
        data: [mockResult],
        total: 1,
        page: 2,
        limit: 10,
      };

      jest.spyOn(resultRepository, 'findAndCount').mockResolvedValue([[mockResult], 1]);

      const result = await service.findAll(2, 10);
      expect(result).toEqual(expected);
      expect(resultRepository.findAndCount).toHaveBeenCalledWith({
        skip: 10,
        take: 10,
        order: {
          season_id: 'DESC',
          race_id: 'ASC',
          position: 'ASC',
        },
        relations: ['season', 'race', 'driver', 'constructorTeam'],
      });
    });

    it('should handle empty results', async () => {
      const expected = {
        data: [],
        total: 0,
        page: 1,
        limit: 30,
      };

      jest.spyOn(resultRepository, 'findAndCount').mockResolvedValue([[], 0]);

      const result = await service.findAll();
      expect(result).toEqual(expected);
    });
  });

  describe('findByYear', () => {
    it('should return results for a specific year', async () => {
      const expected = [mockResult];
      jest.spyOn(resultRepository, 'find').mockResolvedValue(expected);

      const result = await service.findByYear('2024');
      expect(result).toEqual(expected);
      expect(resultRepository.find).toHaveBeenCalledWith({
        where: {
          season: { year: '2024' },
        },
        order: {
          race_id: 'ASC',
          position: 'ASC',
        },
        relations: ['season', 'race', 'driver', 'constructorTeam'],
      });
    });

    it('should return empty array when no results found', async () => {
      jest.spyOn(resultRepository, 'find').mockResolvedValue([]);

      const result = await service.findByYear('2024');
      expect(result).toEqual([]);
    });
  });

  describe('importResults', () => {
    beforeEach(() => {
      jest.spyOn(service, 'findByYear').mockResolvedValue([]);
    });

    it('should successfully import results', async () => {
      jest.spyOn(seasonRepository, 'findOne').mockResolvedValue(mockSeason);
      jest.spyOn(raceRepository, 'findOne').mockResolvedValue(mockRace);
      jest.spyOn(driverRepository, 'findOne').mockResolvedValue(mockDriver);
      jest.spyOn(constructorRepository, 'findOne').mockResolvedValue(mockConstructor);
      jest.spyOn(resultRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(resultRepository, 'create').mockReturnValue(mockResult);
      jest.spyOn(resultRepository, 'save').mockResolvedValue(mockResult);
      jest.spyOn(httpService, 'get').mockReturnValue(of(mockAxiosResponse));

      await service.importResults(2024);

      expect(seasonRepository.findOne).toHaveBeenCalledWith({ where: { year: '2024' } });
      expect(raceRepository.findOne).toHaveBeenCalledWith({
        where: {
          name: 'Australian Grand Prix',
          season_id: 1,
        },
      });
      expect(driverRepository.findOne).toHaveBeenCalledWith({
        where: { driver_ref: 'hamilton' },
      });
      expect(constructorRepository.findOne).toHaveBeenCalledWith({
        where: { constructor_ref: 'mercedes' },
      });
      expect(resultRepository.findOne).toHaveBeenCalledWith({
        where: {
          driver_id: 1,
          race_id: 1,
        },
      });
      expect(resultRepository.create).toHaveBeenCalled();
      expect(resultRepository.save).toHaveBeenCalled();
    });

    it('should throw error if season not found', async () => {
      jest.spyOn(service, 'findByYear').mockResolvedValue([]);
      jest.spyOn(seasonRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(httpService, 'get').mockReturnValue(of(mockAxiosResponse));

      await expect(service.importResults(2024)).rejects.toThrow('Season 2024 not found');
    });

    it('should throw error if race not found', async () => {
      jest.spyOn(service, 'findByYear').mockResolvedValue([]);
      jest.spyOn(seasonRepository, 'findOne').mockResolvedValue(mockSeason);
      jest.spyOn(raceRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(httpService, 'get').mockReturnValue(of(mockAxiosResponse));

      await expect(service.importResults(2024)).rejects.toThrow(
        'Race Australian Grand Prix not found',
      );
    });

    it('should throw error if driver not found', async () => {
      jest.spyOn(service, 'findByYear').mockResolvedValue([]);
      jest.spyOn(seasonRepository, 'findOne').mockResolvedValue(mockSeason);
      jest.spyOn(raceRepository, 'findOne').mockResolvedValue(mockRace);
      jest.spyOn(driverRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(httpService, 'get').mockReturnValue(of(mockAxiosResponse));

      await expect(service.importResults(2024)).rejects.toThrow('Driver null not found');
    });

    it('should throw error if constructor not found', async () => {
      jest.spyOn(service, 'findByYear').mockResolvedValue([]);
      jest.spyOn(seasonRepository, 'findOne').mockResolvedValue(mockSeason);
      jest.spyOn(raceRepository, 'findOne').mockResolvedValue(mockRace);
      jest.spyOn(driverRepository, 'findOne').mockResolvedValue(mockDriver);
      jest.spyOn(constructorRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(httpService, 'get').mockReturnValue(of(mockAxiosResponse));

      await expect(service.importResults(2024)).rejects.toThrow('Constructor null not found');
    });

    it('should handle API errors', async () => {
      jest.spyOn(service, 'findByYear').mockResolvedValue([]);
      jest.spyOn(httpService, 'get').mockReturnValue(throwError(() => new Error('API Error')));

      await expect(service.importResults(2024)).rejects.toThrow('API Error');
    });

    it('should not create duplicate results', async () => {
      jest.spyOn(service, 'findByYear').mockResolvedValue([mockResult]);
      jest.spyOn(seasonRepository, 'findOne').mockResolvedValue(mockSeason);
      jest.spyOn(raceRepository, 'findOne').mockResolvedValue(mockRace);
      jest.spyOn(driverRepository, 'findOne').mockResolvedValue(mockDriver);
      jest.spyOn(constructorRepository, 'findOne').mockResolvedValue(mockConstructor);
      jest.spyOn(resultRepository, 'findOne').mockResolvedValue(mockResult);
      jest.spyOn(httpService, 'get').mockReturnValue(of(mockAxiosResponse));

      await service.importResults(2024);

      expect(resultRepository.create).not.toHaveBeenCalled();
      expect(resultRepository.save).not.toHaveBeenCalled();
    });
  });
});
