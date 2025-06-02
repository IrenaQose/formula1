import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { env } from 'process';

import { DriverStanding } from './entities/driver-standing.entity';
import { ErgastStandingsResponse } from './interfaces/driver-standing.interface';
import { Driver } from '../drivers/entities/driver.entity';
import { Season } from '../seasons/entities/season.entity';
import { ConstructorTeam } from '../constructors/entities/constructor.entity';
import { RetryService } from '../../utils/retry.service';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class DriverStandingsService {
  private readonly logger = new Logger(DriverStandingsService.name);

  constructor(
    @InjectRepository(DriverStanding)
    private readonly driverStandingRepository: Repository<DriverStanding>,
    @InjectRepository(Driver)
    private readonly driverRepository: Repository<Driver>,
    @InjectRepository(Season)
    private readonly seasonRepository: Repository<Season>,
    @InjectRepository(ConstructorTeam)
    private readonly constructorTeamRepository: Repository<ConstructorTeam>,
    private readonly retryService: RetryService,
  ) {}

  async importDriverStandings(year: number): Promise<void> {
    try {
      const url = `${env.ERGAST_API_URL}/${year}/driverStandings`;

      const response =
        await this.retryService.makeRequestWithRetry<ErgastStandingsResponse>(
          url,
        );

      const standingsList = response.MRData.StandingsTable.StandingsLists[0];
      if (!standingsList) {
        this.logger.warn(`No standings found for year ${year}`);
        return;
      }

      const season = await this.seasonRepository.findOne({
        where: { year: year.toString() },
      });

      if (!season) {
        throw new Error(`Season ${year} not found`);
      }

      for (const standingData of standingsList.DriverStandings) {
        const driver = await this.driverRepository.findOne({
          where: { driver_ref: standingData.Driver.driverId },
        });

        if (!driver) {
          this.logger.warn(`Driver not found: ${standingData.Driver.driverId}`);
          continue;
        }

        const constructorTeam = await this.constructorTeamRepository.findOne({
          where: {
            constructor_ref: standingData.Constructors[0].constructorId,
            name: standingData.Constructors[0].name,
          },
        });

        if (!constructorTeam) {
          this.logger.warn(
            `Constructor team not found: ${standingData.Constructors[0].constructorId}`,
          );
          continue;
        }

        let standing = await this.driverStandingRepository.findOne({
          where: {
            driver_id: driver.id,
            season_id: season.id,
          },
        });

        if (!standing) {
          standing = this.driverStandingRepository.create({
            driver_id: driver.id,
            season_id: season.id,
            constructor_team_id: constructorTeam.id,
            points: parseFloat(standingData.points),
            position: isNaN(parseInt(standingData.position))
              ? 0
              : parseInt(standingData.position),
            wins: isNaN(parseInt(standingData.wins))
              ? 0
              : parseInt(standingData.wins),
          });
        } else {
          standing.points = parseFloat(standingData.points);
          standing.position = isNaN(parseInt(standingData.position))
            ? 0
            : parseInt(standingData.position);
          standing.wins = isNaN(parseInt(standingData.wins))
            ? 0
            : parseInt(standingData.wins);
          standing.constructor_team_id = constructorTeam.id;
        }

        await this.driverStandingRepository.save(standing);
        this.logger.log(
          `Saved standings for driver ${driver.first_name} ${driver.last_name}`,
        );
      }

      this.logger.log(`Successfully imported driver standings for ${year}`);
    } catch (error) {
      this.logger.error(`Error importing driver standings for ${year}:`, error);
      throw error;
    }
  }

  async importDriverStandingsFromJson(): Promise<void> {
    const jsonFile = path.join(__dirname, '../../data/driver_standings.json');
    const jsonData = fs.readFileSync(jsonFile, 'utf8');
    const data = JSON.parse(jsonData);
    const driverStandings = data.driver_standings;

    for (const driverStanding of driverStandings) {
      // Check if driver standing already exists
      const existingDriverStanding =
        await this.driverStandingRepository.findOne({
          where: {
            driver_id: driverStanding.driver_id,
            season_id: driverStanding.season_id,
          },
        });
      if (!existingDriverStanding) {
        await this.driverStandingRepository.save(driverStanding);
      }
    }
  }

  async findSeasonChampion(year: number): Promise<DriverStanding | null> {
    try {
      const season = await this.seasonRepository.findOne({
        where: { year: year.toString() },
      });

      if (!season) {
        this.logger.warn(`Season ${year} not found`);
        return null;
      }

      // Check if there are driver stangings for that season, if not, import them
      const driverStandings = await this.driverStandingRepository.find({
        where: {
          season_id: season.id,
        },
      });

      if (driverStandings.length === 0) {
        await this.importDriverStandings(year);
      }

      const championStanding = await this.driverStandingRepository.findOne({
        where: {
          season_id: season.id,
          position: 1,
        },
        relations: ['driver', 'constructorTeam'],
        order: { points: 'DESC' },
      });

      return championStanding || null;
    } catch (error) {
      this.logger.error(`Error finding season champion for ${year}:`, error);
      throw error;
    }
  }

  async findByYear(year: number): Promise<DriverStanding[]> {
    try {
      const season = await this.seasonRepository.findOne({
        where: { year: year.toString() },
      });

      if (!season) {
        this.logger.warn(`Season ${year} not found`);
        return [];
      }

      // Check if there are driver standings for that season, if not, import them
      const driverStandings = await this.driverStandingRepository.find({
        where: {
          season_id: season.id,
        },
        relations: ['driver', 'constructorTeam', 'season'],
        order: { position: 'ASC' },
      });

      return driverStandings;
    } catch (error) {
      this.logger.error(`Error finding driver standings for ${year}:`, error);
      throw error;
    }
  }
}
