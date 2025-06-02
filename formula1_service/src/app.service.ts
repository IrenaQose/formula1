import { Repository } from 'typeorm';

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { ConstructorsService } from './modules/constructors/constructors.service';
import { DriversService } from './modules/drivers/drivers.service';
import { Season } from './modules/seasons/entities/season.entity';
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
    private readonly racesService: RacesService,
    private readonly resultsService: ResultsService,
    private readonly driverStandingsService: DriverStandingsService,
  ) {}

  async importAllData(): Promise<void> {
    try {
      const seasons = await this.seasonRepository.find({
        order: { year: 'ASC' },
      });

      // Create operations for each season, grouped by dependencies
      const importOperations = seasons.map((season) => ({
        year: parseInt(season.year),
        batches: [
          // First batch: independent data (constructors, drivers)
          [
            async () =>
              await this.constructorsService.importConstructors(
                parseInt(season.year),
              ),
            async () =>
              await this.driversService.importDrivers(parseInt(season.year)),
          ],
          // Second batch: races (needed for results)
          [
            async () =>
              await this.racesService.importRaces(parseInt(season.year)),
          ],
          // Third batch: dependent data (results, standings)
          [
            async () =>
              await this.resultsService.importResults(parseInt(season.year)),
            async () =>
              await this.driverStandingsService.importDriverStandings(
                parseInt(season.year),
              ),
          ],
        ],
      }));

      for (const { year, batches } of importOperations) {
        const hasDriverStandings = await this.hasDriverStandingsPerYear(year);

        if (hasDriverStandings) {
          this.logger.log(`Data for ${year} already imported`);
          continue;
        }

        for (const batch of batches) {
          await Promise.all(batch.map((operation) => operation()));
        }
        this.logger.log(`Completed processing season ${year}`);
      }

      this.logger.log('Successfully imported all data');
    } catch (error) {
      this.logger.error('Error importing all data:', error);
      throw error;
    }
  }

  async importDataFromJson(): Promise<void> {
    try {
      await this.constructorsService.importConstructorsFromJson();
      await this.driversService.importDriversFromJson();
      await this.racesService.importRacesFromJson();
      await this.resultsService.importResultsFromJson();
      await this.driverStandingsService.importDriverStandingsFromJson();

      this.logger.log('Successfully imported data from JSON');
    } catch (error) {
      this.logger.error('Error importing data from JSON:', error);
      throw error;
    }
  }

  async hasDriverStandingsPerYear(year: number): Promise<boolean> {
    const driverStandingRepository =
      await this.driverStandingsService.findByYear(year);
    return driverStandingRepository && driverStandingRepository.length > 0;
  }
}
