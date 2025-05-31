import { Test, TestingModule } from '@nestjs/testing';
import { ResultsController } from './results.controller';
import { ResultsService } from './results.service';
import { BadRequestException } from '@nestjs/common';


describe('ResultsController', () => {
  let controller: ResultsController;
  let service: ResultsService;

  const mockResultsService = {
    findAll: jest.fn(),
    findByYear: jest.fn(),
    importResults: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ResultsController],
      providers: [
        { provide: ResultsService, useValue: mockResultsService }
      ],
    }).compile();

    controller = module.get<ResultsController>(ResultsController);
    service = module.get<ResultsService>(ResultsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all results with default pagination', async () => {
      const expected = { data: [{ id: 1, raceId: 1, position: 1 }], page: 1, limit: 30 };
      mockResultsService.findAll.mockResolvedValue(expected);
      const result = await controller.findAll(undefined, undefined);
      expect(result).toEqual(expected);
      expect(mockResultsService.findAll).toHaveBeenCalledWith(1, 30);
    });

    it('should return all results with custom pagination', async () => {
      const expected = { data: [{ id: 1, raceId: 1, position: 1 }], page: 2, limit: 5 };
      mockResultsService.findAll.mockResolvedValue(expected);
      const result = await controller.findAll(2, 5);
      expect(result).toEqual(expected);
      expect(mockResultsService.findAll).toHaveBeenCalledWith(2, 5);
    });

    it('should throw BadRequestException for invalid page/limit', async () => {
      await expect(controller.findAll(-1, 10)).rejects.toThrow(BadRequestException);
      await expect(controller.findAll(1, -1)).rejects.toThrow(BadRequestException);
    });

    it('should handle service errors', async () => {
      mockResultsService.findAll.mockRejectedValue(new Error('DB error'));
      await expect(controller.findAll(1, 30)).rejects.toThrow('DB error');
    });
  });

  describe('findByYear', () => {
    it('should return results for a year', async () => {
      const expected = { data: [{ id: 1, raceId: 1, position: 1 }] };
      mockResultsService.findByYear.mockResolvedValue(expected);
      const result = await controller.findByYear(2024);
      expect(result).toEqual(expected);
      expect(mockResultsService.findByYear).toHaveBeenCalledWith('2024');
    });

    it('should handle service errors', async () => {
      mockResultsService.findByYear.mockRejectedValue(new BadRequestException('DB error'));
      await expect(controller.findByYear(2024)).rejects.toThrow(BadRequestException);
    });

  });

  describe('importResults', () => {
    it('should import results for a year', async () => {
      const year = 2024;
      mockResultsService.importResults.mockResolvedValue(undefined);
      const result = await controller.importResults(year);
      expect(result).toEqual({ message: `Results for ${year} imported successfully` });
      expect(mockResultsService.importResults).toHaveBeenCalledWith(year);
    });

    it('should handle service errors', async () => {
      const year = 2024;
      mockResultsService.importResults.mockRejectedValue(new BadRequestException('Import error'));
      await expect(controller.importResults(year)).rejects.toThrow(BadRequestException);
    });
  });
}); 