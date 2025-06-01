import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { DriversController } from './drivers.controller';
import { DriversService } from './drivers.service';

describe('DriversController', () => {
  let controller: DriversController;
  let service: DriversService;

  const mockDriver = {
    id: 1,
    driver_ref: 'hamilton',
    permanent_number: 44,
    first_name: 'Lewis',
    last_name: 'Hamilton',
    birth_date: new Date('1985-01-07'),
    nationality: 'British',
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockDriversService = {
    importDrivers: jest.fn(),
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DriversController],
      providers: [
        {
          provide: DriversService,
          useValue: mockDriversService,
        },
      ],
    }).compile();

    controller = module.get<DriversController>(DriversController);
    service = module.get<DriversService>(DriversService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('importDrivers', () => {
    it('should call service.importDrivers with the provided year', async () => {
      const year = 2024;
      mockDriversService.importDrivers.mockResolvedValue(undefined);

      const result = await controller.importDrivers(year);

      expect(result).toEqual({ message: `Drivers for ${year} imported successfully` });
      expect(mockDriversService.importDrivers).toHaveBeenCalledWith(year);
    });

    it('should handle errors from the service', async () => {
      const year = 2024;
      const error = new Error('Import failed');
      mockDriversService.importDrivers.mockRejectedValue(error);

      await expect(controller.importDrivers(year)).rejects.toThrow('Import failed');
      expect(mockDriversService.importDrivers).toHaveBeenCalledWith(year);
    });
  });

  describe('findAll', () => {
    it('should return all drivers', async () => {
      const mockDrivers = [mockDriver];
      mockDriversService.findAll.mockResolvedValue(mockDrivers);

      const result = await controller.findAll();

      expect(result).toEqual(mockDrivers);
      expect(mockDriversService.findAll).toHaveBeenCalled();
    });

    it('should handle empty driver list', async () => {
      mockDriversService.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
      expect(mockDriversService.findAll).toHaveBeenCalled();
    });

    it('should handle errors from the service', async () => {
      const error = new Error('Failed to fetch drivers');
      mockDriversService.findAll.mockRejectedValue(error);

      await expect(controller.findAll()).rejects.toThrow('Failed to fetch drivers');
      expect(mockDriversService.findAll).toHaveBeenCalled();
    });
  });
});
