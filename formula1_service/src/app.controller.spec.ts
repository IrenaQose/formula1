import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;

  const mockAppService = {
    importAllData: jest.fn(),
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: mockAppService,
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
    appService = app.get<AppService>(AppService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(appController).toBeDefined();
  });

  describe('importAll', () => {
    it('should call service.importAllData and return success message', async () => {
      mockAppService.importAllData.mockResolvedValue(undefined);

      const result = await appController.importAll();

      expect(result).toEqual({ message: 'Import of all data completed' });
      expect(mockAppService.importAllData).toHaveBeenCalled();
    });

    it('should handle errors from the service', async () => {
      const error = new Error('Import failed');
      mockAppService.importAllData.mockRejectedValue(error);

      await expect(appController.importAll()).rejects.toThrow('Import failed');
      expect(mockAppService.importAllData).toHaveBeenCalled();
    });
  });
});
