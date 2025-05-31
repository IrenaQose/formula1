import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HttpService } from '@nestjs/axios';
import { Repository } from 'typeorm';
import { of, throwError } from 'rxjs';
import * as rxjs from 'rxjs';

import { DriversService } from './drivers.service';
import { Driver } from './entities/driver.entity';
import { ErgastResponse } from './interfaces/driver.interface';

// Mock firstValueFrom to properly handle errors
jest.mock('rxjs', () => ({
  ...jest.requireActual('rxjs'),
  firstValueFrom: jest.fn(),
}));

describe('DriversService', () => {
    let service: DriversService;
    let driverRepository: Repository<Driver>;
    let httpService: HttpService;

    const mockDriver = {
        id: 1,
        driverRef: 'hamilton',
        permanent_number: 44,
        first_name: 'Lewis',
        last_name: 'Hamilton',
        birth_date: new Date('1985-01-07'),
        nationality: 'British',
        created_at: new Date(),
        updated_at: new Date(),
    };

    const mockErgastResponse: {data: ErgastResponse} = {
        data: {
            MRData: {
                DriverTable: {
                    season: '2024',
                    Drivers: [
                        {
                            driverId: 'hamilton',
                            permanentNumber: '44',
                            code: 'HAM',
                            url: 'http://example.com/hamilton',
                            givenName: 'Lewis',
                            familyName: 'Hamilton',
                            dateOfBirth: '1985-01-07',
                            nationality: 'British',
                        },
                        {
                            driverId: 'verstappen',
                            permanentNumber: '33',
                            code: 'VER',
                            url: 'http://example.com/verstappen',
                            givenName: 'Max',
                            familyName: 'Verstappen',
                            dateOfBirth: '1997-09-30',
                            nationality: 'Dutch',
                        },
                    ],
                },
            },
        },
    };

    const mockDriverRepository = {
        findOne: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
        find: jest.fn(),
    };

    const mockHttpService = {
        get: jest.fn(),
    };

    const responseWithoutNumber:{data: ErgastResponse} = {
        data: {
            MRData: {
                DriverTable: {
                    season: '2024',
                    Drivers: [{
                        driverId: 'test',
                        url: 'http://example.com/test',
                        givenName: 'Test',
                        familyName: 'Driver',
                        dateOfBirth: '1990-01-01',
                        nationality: 'Test',
                    }],
                },
            },
        },
    };

    const setupImportTest = (response = mockErgastResponse) => {
        mockHttpService.get.mockReturnValue(of(response));
        (rxjs.firstValueFrom as jest.Mock).mockImplementation((obs) => {
            if (obs === throwError(() => new Error('API Error'))) {
                throw new Error('API Error');
            }
            return Promise.resolve(response);
        });
        return service.importDrivers(2024);
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DriversService,
                {
                    provide: getRepositoryToken(Driver),
                    useValue: mockDriverRepository,
                },
                {
                    provide: HttpService,
                    useValue: mockHttpService,
                },
            ],
        }).compile();

        service = module.get<DriversService>(DriversService);
        driverRepository = module.get<Repository<Driver>>(getRepositoryToken(Driver));
        httpService = module.get<HttpService>(HttpService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('importDrivers', () => {
        it('should successfully import drivers for a given year', async () => {
            mockDriverRepository.findOne.mockResolvedValue(null);
            mockDriverRepository.create.mockImplementation((data) => ({
                ...data,
                id: Math.random(),
                created_at: new Date(),
                updated_at: new Date(),
            }));
            mockDriverRepository.save.mockImplementation((data) => Promise.resolve(data));

            await setupImportTest();

            expect(mockHttpService.get).toHaveBeenCalledWith(
                expect.stringContaining('2024/drivers'),
            );
            expect(mockDriverRepository.findOne).toHaveBeenCalledTimes(2);
            expect(mockDriverRepository.create).toHaveBeenCalledTimes(2);
            expect(mockDriverRepository.save).toHaveBeenCalledTimes(2);

            expect(mockDriverRepository.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    driver_ref: 'hamilton',
                    permanent_number: 44,
                    first_name: 'Lewis',
                    last_name: 'Hamilton',
                    birth_date: expect.any(Date),
                    nationality: 'British',
                }),
            );
        });

        it('should handle existing drivers without creating duplicates', async () => {
            mockDriverRepository.findOne.mockResolvedValue(mockDriver);

            await setupImportTest();

            expect(mockDriverRepository.findOne).toHaveBeenCalledTimes(2);
            expect(mockDriverRepository.findOne).toHaveBeenCalledWith({
                where: { driver_ref: 'hamilton' },
            });
            expect(mockDriverRepository.create).not.toHaveBeenCalled();
            expect(mockDriverRepository.save).not.toHaveBeenCalled();
        });

        it('should handle drivers without permanent numbers', async () => {
            mockDriverRepository.findOne.mockResolvedValue(null);
            mockDriverRepository.create.mockImplementation((data) => ({
                ...data,
                id: Math.random(),
                created_at: new Date(),
                updated_at: new Date(),
            }));
            mockDriverRepository.save.mockImplementation((data) => Promise.resolve(data));

            await setupImportTest(responseWithoutNumber);

            expect(mockDriverRepository.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    driver_ref: 'test',
                    permanent_number: undefined,
                    first_name: 'Test',
                    last_name: 'Driver',
                    birth_date: new Date('1990-01-01'),
                    nationality: 'Test',
                }),
            );
        });

        it('should handle API errors gracefully', async () => {
            mockHttpService.get.mockReturnValue(throwError(() => new Error('API Error')));
            (rxjs.firstValueFrom as jest.Mock).mockRejectedValue(new Error('API Error'));

            await expect(service.importDrivers(2024)).rejects.toThrow('API Error');
            expect(mockDriverRepository.findOne).not.toHaveBeenCalled();
            expect(mockDriverRepository.create).not.toHaveBeenCalled();
            expect(mockDriverRepository.save).not.toHaveBeenCalled();
        });

        it('should handle invalid date format gracefully', async () => {
            mockDriverRepository.findOne.mockResolvedValue(null);
            (rxjs.firstValueFrom as jest.Mock).mockImplementation(() => {
                throw new Error('Invalid date format');
            });

            await expect(service.importDrivers(2024)).rejects.toThrow('Invalid date format');
        });
    });

    describe('findAll', () => {
        it('should return all drivers ordered by last name and first name', async () => {
            const mockDrivers = [
                { ...mockDriver, last_name: 'Hamilton', first_name: 'Lewis' },
                { ...mockDriver, last_name: 'Verstappen', first_name: 'Max' },
            ];
            mockDriverRepository.find.mockResolvedValue(mockDrivers);

            const result = await service.findAll();

            expect(result).toEqual(mockDrivers);
            expect(mockDriverRepository.find).toHaveBeenCalledWith({
                order: { last_name: 'ASC', first_name: 'ASC' },
            });
        });

        it('should handle empty driver list', async () => {
            mockDriverRepository.find.mockResolvedValue([]);

            const result = await service.findAll();

            expect(result).toEqual([]);
            expect(mockDriverRepository.find).toHaveBeenCalled();
        });

        it('should handle database error', async () => {
            const error = new Error('Database error');
            mockDriverRepository.find.mockRejectedValue(error);

            await expect(service.findAll()).rejects.toThrow('Database error');
        });
    });
}); 