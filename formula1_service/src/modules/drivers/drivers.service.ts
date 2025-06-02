import { env } from 'process';
import { Repository } from 'typeorm';

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Driver } from './entities/driver.entity';
import { ErgastResponse } from './interfaces/driver.interface';
import { RetryService } from '../../utils/retry.service';
import * as path from 'path';
import * as fs from 'fs';

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

      const response =
        await this.retryService.makeRequestWithRetry<ErgastResponse>(url);

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
          this.logger.log(
            `Created and saved driver: ${driver.first_name} ${driver.last_name}`,
          );
        } else {
          this.logger.log(
            `Driver already exists: ${driver.first_name} ${driver.last_name}`,
          );
        }
      }

      this.logger.log(`Successfully imported drivers for ${year}`);
    } catch (error) {
      this.logger.error(`Error importing drivers for ${year}:`, error);
      throw error;
    }
  }

  async importDriversFromJson(): Promise<void> {
    const jsonFile = path.join(__dirname, '../../data/drivers.json');
    const jsonData = fs.readFileSync(jsonFile, 'utf8');
    const data = JSON.parse(jsonData);
    const drivers = data.drivers;
    for (const driver of drivers) {
      // Check if driver already exists
      const existingDriver = await this.driverRepository.findOne({
        where: { driver_ref: driver.driver_ref },
      });
      if (!existingDriver) {
        await this.driverRepository.save(driver);
      }
    }
  }

  async findAll(): Promise<Driver[]> {
    return await this.driverRepository.find({
      order: { last_name: 'ASC', first_name: 'ASC' },
    });
  }
}
