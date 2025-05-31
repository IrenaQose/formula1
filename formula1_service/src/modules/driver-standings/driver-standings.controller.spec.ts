import { Test, TestingModule } from '@nestjs/testing';
import { DriverStandingsController } from './driver-standings.controller';
import { DriverStandingsService } from './driver-standings.service';

describe('DriverStandingsController', () => {
  let controller: DriverStandingsController;
  let service: DriverStandingsService;

  const mockDriverStandingsService = {
    importDriverStandings: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DriverStandingsController],
      providers: [
        {
          provide: DriverStandingsService,
          useValue: mockDriverStandingsService,
        },
      ],
    }).compile();

    controller = module.get<DriverStandingsController>(DriverStandingsController);
    service = module.get<DriverStandingsService>(DriverStandingsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('importDriverStandings', () => {
    it('should call service.importDriverStandings with the provided year', async () => {
      const year = 2024;
      mockDriverStandingsService.importDriverStandings.mockResolvedValue(undefined);

      await controller.importDriverStandings(year);

      expect(mockDriverStandingsService.importDriverStandings).toHaveBeenCalledWith(year);
    });

    it('should handle errors from the service', async () => {
      const year = 2024;
      const error = new Error('Import failed');
      mockDriverStandingsService.importDriverStandings.mockRejectedValue(error);

      await expect(controller.importDriverStandings(year)).rejects.toThrow('Import failed');
      expect(mockDriverStandingsService.importDriverStandings).toHaveBeenCalledWith(year);
    });

    it('should return correct response format', async () => {
      const year = 2024;
      mockDriverStandingsService.importDriverStandings.mockResolvedValue(undefined);

      const result = await controller.importDriverStandings(year);

      expect(result).toEqual({
        message: `Driver standings for ${year} imported successfully`
      });
    });
  });
}); 