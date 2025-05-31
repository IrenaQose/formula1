import { Repository } from 'typeorm';

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { ConstructorsService } from './modules/constructors/constructors.service';
import { DriversService } from './modules/drivers/drivers.service';
import { Season } from './modules/seasons/entities/season.entity';
import { RateLimiterService } from './utils/rate-limiter.service';
import { DriverStandingsService } from './modules/driver-standings/driver-standings.service';
import { RacesService } from './modules/races/races.service';
import { ResultsService } from './modules/results/results.service';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(
    @InjectRepository(Season)
    private readonly seasonRepository: Repository<Season>,
    private readonly constructorsService: ConstructorsService,
    private readonly driversService: DriversService,
    private readonly rateLimiter: RateLimiterService,
    private readonly racesService: RacesService,
    private readonly resultsService: ResultsService,
    private readonly driverStandingsService: DriverStandingsService,
  ) {}

  async importAllData(): Promise<void> {  
    try {
      const seasons = await this.seasonRepository.find({
        order: { year: 'ASC' }
      });

      // Create operations for each season
      const importOperations = seasons.map(season => ({
        year: parseInt(season.year),
        operations: [
          async() =>  await this.constructorsService.importConstructors(parseInt(season.year)),
          async() =>  await this.driversService.importDrivers(parseInt(season.year)),
          async() =>  await this.racesService.importRaces(parseInt(season.year)),
          async() =>  await this.resultsService.importResults(parseInt(season.year)),
          async() =>  await this.driverStandingsService.importDriverStandings(parseInt(season.year)),
        ]
      }));

     
      for (const { year, operations } of importOperations) {
        this.logger.log(`Processing season ${year}`);

        await this.rateLimiter.executeBatchWithRateLimit(
          operations,
          `Season ${year} import`,
          2
        );
        this.logger.log(`Completed processing season ${year}`);
      }

      this.logger.log('Successfully imported all data');
    } catch (error) {
      this.logger.error('Error importing all data:', error);
      throw error;
    }
  }
}
