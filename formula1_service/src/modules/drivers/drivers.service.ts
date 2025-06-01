import { env } from 'process';
import { firstValueFrom } from 'rxjs';
import { Repository, DeepPartial } from 'typeorm';

import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';

import { Driver } from './entities/driver.entity';
import { ErgastResponse } from './interfaces/driver.interface';
import { RetryService } from '../../utils/retry.service';

@Injectable()
export class DriversService {
  private readonly logger = new Logger(DriversService.name);

  constructor(
    @InjectRepository(Driver)
    private readonly driverRepository: Repository<Driver>,
    private readonly retryService: RetryService,
  ) {}

  async importDrivers(year: number): Promise<void> {
    try {
      const url = `${env.ERGAST_API_URL}/${year}/drivers`;

      const response = await this.retryService.makeRequestWithRetry<ErgastResponse>(url);

      const drivers = response.MRData.DriverTable.Drivers;
      this.logger.log(`Found ${drivers.length} drivers for ${year}`);

      for (const driverData of drivers) {
        let driver = await this.driverRepository.findOne({
          where: { driver_ref: driverData.driverId },
        });

        if (!driver) {
          driver = this.driverRepository.create({
            driver_ref: driverData.driverId,
            permanent_number: driverData.permanentNumber
              ? parseInt(driverData.permanentNumber)
              : undefined,
            first_name: driverData.givenName,
            last_name: driverData.familyName,
            birth_date: new Date(driverData.dateOfBirth),
            nationality: driverData.nationality,
          } as Driver);

          await this.driverRepository.save(driver);
          this.logger.log(`Created and saved driver: ${driver.first_name} ${driver.last_name}`);
        } else {
          this.logger.log(`Driver already exists: ${driver.first_name} ${driver.last_name}`);
        }
      }

      this.logger.log(`Successfully imported drivers for ${year}`);
    } catch (error) {
      this.logger.error(`Error importing drivers for ${year}:`, error);
      throw error;
    }
  }

  async findAll(): Promise<Driver[]> {
    const data = await this.driverRepository.find({
      order: { last_name: 'ASC', first_name: 'ASC' },
    });

    return data;
  }
}
