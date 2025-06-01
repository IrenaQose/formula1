import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HttpService } from '@nestjs/axios';
import { Repository } from 'typeorm';
import { of, throwError } from 'rxjs';
import { RetryService } from '../../utils/retry.service';

import { ConstructorsService } from './constructors.service';
import { ConstructorTeam } from './entities/constructor.entity';

describe('ConstructorsService', () => {
  let service: ConstructorsService;
  let repository: Repository<ConstructorTeam>;
  let httpService: HttpService;

  const mockConstructor = {
    constructorRef: 'mercedes',
    name: 'Mercedes',
    nationality: 'German',
  };

  const mockErgastResponse = {
    data: {
      MRData: {
        ConstructorTable: {
          season: '2024',
          Constructors: [
            {
              constructorId: 'mercedes',
              url: 'http://example.com/mercedes',
              name: 'Mercedes',
              nationality: 'German',
            },
            {
              constructorId: 'ferrari',
              url: 'http://example.com/ferrari',
              name: 'Ferrari',
              nationality: 'Italian',
            },
          ],
        },
      },
    },
  };

  const mockRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
  };

  const mockHttpService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConstructorsService,
        RetryService,
        {
          provide: getRepositoryToken(ConstructorTeam),
          useValue: mockRepository,
        },
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
      ],
    }).compile();

    service = module.get<ConstructorsService>(ConstructorsService);
    repository = module.get<Repository<ConstructorTeam>>(getRepositoryToken(ConstructorTeam));
    httpService = module.get<HttpService>(HttpService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('importConstructors', () => {
    it('should successfully import constructors for a given year', async () => {
      mockHttpService.get.mockReturnValue(of(mockErgastResponse));
      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(mockConstructor);
      mockRepository.save.mockResolvedValue(mockConstructor);

      await service.importConstructors(2024);

      expect(mockHttpService.get).toHaveBeenCalledWith(
        expect.stringContaining('2024/constructors/'),
      );
      expect(mockRepository.findOne).toHaveBeenCalledTimes(2);
      expect(mockRepository.create).toHaveBeenCalledTimes(2);
      expect(mockRepository.save).toHaveBeenCalledTimes(2);
    });

    it('should handle existing constructors without creating duplicates', async () => {
      mockHttpService.get.mockReturnValue(of(mockErgastResponse));
      mockRepository.findOne.mockResolvedValue(mockConstructor);

      await service.importConstructors(2024);

      expect(mockRepository.findOne).toHaveBeenCalledTimes(2);
      expect(mockRepository.create).not.toHaveBeenCalled();
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should handle API errors gracefully', async () => {
      const error = new Error('API Error');
      mockHttpService.get.mockReturnValue(throwError(() => error));

      await expect(service.importConstructors(2024)).rejects.toThrow('API Error');
      expect(mockRepository.findOne).not.toHaveBeenCalled();
      expect(mockRepository.create).not.toHaveBeenCalled();
      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all constructors', async () => {
      const mockConstructors = [mockConstructor];
      mockRepository.find.mockResolvedValue(mockConstructors);

      const result = await service.findAll();

      expect(result).toEqual(mockConstructors);
      expect(mockRepository.find).toHaveBeenCalled();
    });

    it('should handle empty constructor list', async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
      expect(mockRepository.find).toHaveBeenCalled();
    });
  });
});
