import { Test, TestingModule } from '@nestjs/testing';
import { ConstructorsController } from './constructors.controller';
import { ConstructorsService } from './constructors.service';

describe('ConstructorsController', () => {
  let controller: ConstructorsController;
  let service: ConstructorsService;
  let loggerSpy: jest.SpyInstance;

  const mockConstructor = {
    constructorRef: 'mercedes',
    name: 'Mercedes',
    nationality: 'German',
  };

  const mockConstructorsService = {
    importConstructors: jest.fn(),
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConstructorsController],
      providers: [
        {
          provide: ConstructorsService,
          useValue: mockConstructorsService,
        },
      ],
    }).compile();

    controller = module.get<ConstructorsController>(ConstructorsController);
    service = module.get<ConstructorsService>(ConstructorsService);
    loggerSpy = jest.spyOn(controller['logger'], 'log');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('importConstructors', () => {
    it('should call service.importConstructors with the provided year', async () => {
      const year = 2024;
      mockConstructorsService.importConstructors.mockResolvedValue(undefined);

      await controller.importConstructors(year);

      expect(mockConstructorsService.importConstructors).toHaveBeenCalledWith(
        year,
      );
      expect(loggerSpy).toHaveBeenCalledWith(
        `Successfully imported constructors for year ${year}`,
      );
    });

    it('should handle errors from the service', async () => {
      const year = 2024;
      const error = new Error('Import failed');
      mockConstructorsService.importConstructors.mockRejectedValue(error);

      await expect(controller.importConstructors(year)).rejects.toThrow(
        'Import failed',
      );
      expect(mockConstructorsService.importConstructors).toHaveBeenCalledWith(
        year,
      );
    });

    it('should return correct response format', async () => {
      const year = 2024;
      mockConstructorsService.importConstructors.mockResolvedValue(undefined);

      const result = await controller.importConstructors(year);

      expect(result).toEqual({
        message: `Constructors for ${year} imported successfully`,
      });
    });
  });

  describe('findAll', () => {
    it('should return all constructors', async () => {
      const mockConstructors = [mockConstructor];
      mockConstructorsService.findAll.mockResolvedValue(mockConstructors);

      const result = await controller.findAll();

      expect(result).toEqual(mockConstructors);
      expect(mockConstructorsService.findAll).toHaveBeenCalled();
    });

    it('should handle empty constructor list', async () => {
      mockConstructorsService.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
      expect(mockConstructorsService.findAll).toHaveBeenCalled();
    });

    it('should handle errors from the service', async () => {
      const error = new Error('Failed to fetch constructors');
      mockConstructorsService.findAll.mockRejectedValue(error);

      await expect(controller.findAll()).rejects.toThrow(
        'Failed to fetch constructors',
      );
      expect(mockConstructorsService.findAll).toHaveBeenCalled();
    });
  });
});
