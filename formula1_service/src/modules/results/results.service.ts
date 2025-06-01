import { Repository } from 'typeorm';
import { env } from 'process';

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Result } from './entities/result.entity';
import { ConstructorTeam } from '../constructors/entities/constructor.entity';
import { Season } from '../seasons/entities/season.entity';
import { Driver } from '../drivers/entities/driver.entity';
import { Race } from '../races/entities/race.entity';
import { ErgastResultsResponse } from './interfaces/ergastResults.interface';
import { RetryService } from '../../utils/retry.service';

@Injectable()
export class ResultsService {
  private readonly logger = new Logger(ResultsService.name);

  constructor(
    @InjectRepository(Result)
    private readonly resultRepository: Repository<Result>,
    @InjectRepository(Season)
    private readonly seasonRepository: Repository<Season>,
    @InjectRepository(Race)
    private readonly raceRepository: Repository<Race>,
    @InjectRepository(Driver)
    private readonly driverRepository: Repository<Driver>,
    @InjectRepository(ConstructorTeam)
    private readonly constructorRepository: Repository<ConstructorTeam>,
    private readonly retryService: RetryService,
  ) {}

  async importResults(year: number, url?: string): Promise<void> {
    try {
      const existingResultsInDB = await this.findByYear(year.toString());
      if (existingResultsInDB.length > 0) {
        this.logger.log(`Results for ${year} already imported`);
        return;
      }

      const apiUrl = url || `${env.ERGAST_API_URL}/${year}/results?limit=100`;
      this.logger.log(`Fetching results from ${apiUrl}`);

      const response = await this.retryService.makeRequestWithRetry<ErgastResultsResponse>(apiUrl);

      const limit = parseInt(response.MRData.limit);
      const total = parseInt(response.MRData.total);
      const offset = parseInt(response.MRData.offset);

      const races = response.MRData.RaceTable.Races;
      const nextOffset = limit + offset;

      this.logger.log(`Found ${races.length} races for ${year}`);

      // Find season
      let season = await this.seasonRepository.findOne({ where: { year: year.toString() } });

      if (!season) {
        throw new Error(`Season ${year} not found`);
      }

      for (const raceData of races) {
        // Find race
        let race = await this.raceRepository.findOne({
          where: {
            name: raceData.raceName,
            season_id: season.id,
          },
        });

        if (!race) {
          throw new Error(`Race ${raceData.raceName} not found`);
        }

        for (const resultData of raceData.Results) {
          // Find driver
          const driverRef = resultData.Driver.driverId;
          let driver = await this.driverRepository.findOne({
            where: { driver_ref: driverRef },
          });

          if (!driver) {
            throw new Error(`Driver ${driver} not found`);
          }

          // Find constructor
          const constructorRef = resultData.Constructor.constructorId;
          let constructor = await this.constructorRepository.findOne({
            where: { constructor_ref: constructorRef },
          });

          if (!constructor) {
            throw new Error(`Constructor ${constructor} not found`);
          }

          // Create or update result
          const existingResult = await this.resultRepository.findOne({
            where: {
              driver_id: driver.id,
              race_id: race.id,
            },
          });

          if (!existingResult && resultData.position === '1') {
            const result = this.resultRepository.create({
              points: parseFloat(resultData.points),
              position: resultData.position ? parseInt(resultData.position) : null,
              grid: parseInt(resultData.grid),
              laps: parseInt(resultData.laps),
              status: resultData.status,
              time: resultData.Time?.time || null,
              season_id: season.id,
              driver_id: driver.id,
              race_id: race.id,
              constructor_id: constructor.id,
              season,
              driver,
              race,
              constructorTeam: constructor,
            } as Result);
            await this.resultRepository.save(result);
          }
        }
      }

      if (total > nextOffset) {
        const nextUrl = `${env.ERGAST_API_URL}/${year}/results?limit=${limit}&offset=${nextOffset}`;
        this.importResults(year, nextUrl);
      }

      this.logger.log(`Successfully imported results for ${year}`);
    } catch (error) {
      this.logger.error(`Error importing results for ${year}:`, error);
      throw error;
    }
  }

  async findAll(
    page: number = 1,
    limit: number = 30,
  ): Promise<{ data: Result[]; total: number; page: number; limit: number }> {
    const [data, total] = await this.resultRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: {
        season_id: 'DESC',
        race_id: 'ASC',
        position: 'ASC',
      },
      relations: ['season', 'race', 'driver', 'constructorTeam'],
    });

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findByYear(year: string): Promise<Result[]> {
    const data = await this.resultRepository.find({
      where: {
        season: { year },
      },
      order: {
        race_id: 'ASC',
        position: 'ASC',
      },
      relations: ['season', 'race', 'driver', 'constructorTeam'],
    });

    return data;
  }
}
