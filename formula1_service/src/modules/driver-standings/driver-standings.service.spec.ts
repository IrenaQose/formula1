import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { of, throwError } from 'rxjs';

import { DriverStandingsService } from './driver-standings.service';
import { DriverStanding } from './entities/driver-standing.entity';
import { Driver } from '../drivers/entities/driver.entity';
import { Season } from '../seasons/entities/season.entity';
import { ConstructorTeam } from '../constructors/entities/constructor.entity';
import { RetryService } from '../../utils/retry.service';

describe('DriverStandingsService', () => {
  let service: DriverStandingsService;
  let httpService: HttpService;
  let driverStandingRepository: Repository<DriverStanding>;
  let driverRepository: Repository<Driver>;
  let seasonRepository: Repository<Season>;
  let constructorTeamRepository: Repository<ConstructorTeam>;

  const mockHttpService = {
    get: jest.fn(),
  };

  const mockDriverStandingRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
  };

  const mockDriverRepository = {
    findOne: jest.fn(),
  };

  const mockSeasonRepository = {
    findOne: jest.fn(),
  };

  const mockConstructorTeamRepository = {
    findOne: jest.fn(),
  };

  const mockSeason = {
    id: 1,
    year: '2024',
  };

  const mockDriver = {
    id: 1,
    driver_ref: 'hamilton',
    first_name: 'Lewis',
    last_name: 'Hamilton',
  };

  const mockConstructorTeam = {
    id: 1,
    constructor_ref: 'mercedes',
    name: 'Mercedes',
  };

  const mockDriverStanding = {
    id: 1,
    points: 100,
    position: 1,
    wins: 5,
    driver_id: mockDriver.id,
    season_id: mockSeason.id,
    constructor_team_id: mockConstructorTeam.id,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockErgastResponse = {
    data: {
      MRData: {
        StandingsTable: {
          StandingsLists: [
            {
              DriverStandings: [
                {
                  Driver: {
                    driverId: 'hamilton',
                  },
                  Constructors: [
                    {
                      constructorId: 'mercedes',
                      name: 'Mercedes',
                    },
                  ],
                  points: '100',
                  position: '1',
                  wins: '5',
                },
              ],
            },
          ],
        },
      },
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DriverStandingsService,
        RetryService,
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
        {
          provide: getRepositoryToken(DriverStanding),
          useValue: mockDriverStandingRepository,
        },
        {
          provide: getRepositoryToken(Driver),
          useValue: mockDriverRepository,
        },
        {
          provide: getRepositoryToken(Season),
          useValue: mockSeasonRepository,
        },
        {
          provide: getRepositoryToken(ConstructorTeam),
          useValue: mockConstructorTeamRepository,
        },
      ],
    }).compile();

    service = module.get<DriverStandingsService>(DriverStandingsService);
    httpService = module.get<HttpService>(HttpService);
    driverStandingRepository = module.get<Repository<DriverStanding>>(
      getRepositoryToken(DriverStanding),
    );
    driverRepository = module.get<Repository<Driver>>(getRepositoryToken(Driver));
    seasonRepository = module.get<Repository<Season>>(getRepositoryToken(Season));
    constructorTeamRepository = module.get<Repository<ConstructorTeam>>(
      getRepositoryToken(ConstructorTeam),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('importDriverStandings', () => {
    it('should successfully import driver standings', async () => {
      const year = 2024;
      mockHttpService.get.mockReturnValue(of(mockErgastResponse));
      mockSeasonRepository.findOne.mockResolvedValue(mockSeason);
      mockDriverRepository.findOne.mockResolvedValue(mockDriver);
      mockConstructorTeamRepository.findOne.mockResolvedValue(mockConstructorTeam);
      mockDriverStandingRepository.findOne.mockResolvedValue(null);
      mockDriverStandingRepository.create.mockReturnValue({
        driver_id: mockDriver.id,
        season_id: mockSeason.id,
        constructor_team_id: mockConstructorTeam.id,
        points: 100,
        position: 1,
        wins: 5,
      });
      mockDriverStandingRepository.save.mockResolvedValue({});

      await service.importDriverStandings(year);

      expect(mockHttpService.get).toHaveBeenCalledWith(
        `${process.env.ERGAST_API_URL}/${year}/driverStandings`,
      );
      expect(mockSeasonRepository.findOne).toHaveBeenCalledWith({
        where: { year: year.toString() },
      });
      expect(mockDriverRepository.findOne).toHaveBeenCalledWith({
        where: { driver_ref: 'hamilton' },
      });
      expect(mockConstructorTeamRepository.findOne).toHaveBeenCalledWith({
        where: {
          constructor_ref: 'mercedes',
          name: 'Mercedes',
        },
      });
      expect(mockDriverStandingRepository.save).toHaveBeenCalled();
    });

    it('should handle no standings found', async () => {
      const year = 2024;
      mockHttpService.get.mockReturnValue(
        of({
          data: {
            MRData: {
              StandingsTable: {
                StandingsLists: [],
              },
            },
          },
        }),
      );

      await service.importDriverStandings(year);

      expect(mockDriverStandingRepository.save).not.toHaveBeenCalled();
    });

    it('should handle season not found', async () => {
      const year = 2024;
      mockHttpService.get.mockReturnValue(of(mockErgastResponse));
      mockSeasonRepository.findOne.mockResolvedValue(null);

      await expect(service.importDriverStandings(year)).rejects.toThrow(`Season ${year} not found`);
    });

    it('should handle HTTP error', async () => {
      const year = 2024;
      mockHttpService.get.mockReturnValue(throwError(() => new Error('HTTP Error')));

      await expect(service.importDriverStandings(year)).rejects.toThrow('HTTP Error');
    });
  });

  describe('findSeasonChampion', () => {
    it('should return champion when found', async () => {
      const year = 2024;
      mockSeasonRepository.findOne.mockResolvedValue(mockSeason);
      mockDriverStandingRepository.find.mockResolvedValue([{ id: 1 }]);
      mockDriverStandingRepository.findOne.mockResolvedValue({
        ...mockDriverStanding,
        driver: mockDriver,
        constructorTeam: mockConstructorTeam,
      });

      const result = await service.findSeasonChampion(year);

      expect(result).toBeDefined();
      expect(mockDriverStandingRepository.find).toHaveBeenCalledWith({
        where: { season_id: mockSeason.id },
      });
    });

    it('should import standings if none found', async () => {
      const year = 2024;
      mockSeasonRepository.findOne.mockResolvedValue(mockSeason);
      mockDriverStandingRepository.find.mockResolvedValue([]);
      mockHttpService.get.mockReturnValue(of(mockErgastResponse));
      mockDriverStandingRepository.findOne.mockResolvedValue({
        ...mockDriverStanding,
        driver: mockDriver,
        constructorTeam: mockConstructorTeam,
      });

      await service.findSeasonChampion(year);

      expect(mockHttpService.get).toHaveBeenCalled();
      expect(mockDriverStandingRepository.save).toHaveBeenCalled();
    });

    it('should return null when no champion found', async () => {
      const year = 2024;
      mockSeasonRepository.findOne.mockResolvedValue(mockSeason);
      mockDriverStandingRepository.find.mockResolvedValue([]);
      mockHttpService.get.mockReturnValue(of(mockErgastResponse));
      mockDriverStandingRepository.findOne.mockResolvedValue(null);

      const result = await service.findSeasonChampion(year);

      expect(result).toBeNull();
    });
  });
});
