import { env } from 'process';
import { Repository } from 'typeorm';
import { firstValueFrom } from 'rxjs';

import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';

import { Race } from './entities/race.entity';
import { ErgastRaceResponse } from './interfaces/ergastRace.interface';
import { RacesResponse, RaceResponse } from './interfaces/races.interface';
import { Season } from '../seasons/entities/season.entity';
import { DriverStandingsService } from '../driver-standings/driver-standings.service';
import { ResultsService } from '../results/results.service';


@Injectable()
export class RacesService {
  private readonly logger = new Logger(RacesService.name);

  constructor(
    @InjectRepository(Race)
    private readonly raceRepository: Repository<Race>,
    @InjectRepository(Season)
    private readonly seasonRepository: Repository<Season>,
    private readonly httpService: HttpService,
    private readonly driverStandingsService: DriverStandingsService,
    private readonly resultsService: ResultsService,
  ) {}

  async importRaces(year: number): Promise<void> {
    try {
      const url = `${env.ERGAST_API_URL}/${year}/races`;

      const response = await firstValueFrom(
        this.httpService.get<ErgastRaceResponse>(url)
      );

      const races = response.data.MRData.RaceTable.Races;
      this.logger.log(`Found ${races.length} races for ${year}`);

      // Find season
      const season = await this.seasonRepository.findOne({ 
        where: { year: year.toString() } 
      });

      if (!season) {
        throw new Error(`Season ${year} not found`);
      }

      for (const raceData of races) {
        let race = await this.raceRepository.findOne({
          where: { 
            name: raceData.raceName,
            season_id: season.id
          }
        });

        const cleanTime = raceData.time.replace(/Z$/, '');
        if (!race) {
          race = this.raceRepository.create({
            name: raceData.raceName,
            date: new Date(raceData.date),
            time: cleanTime || null,
            season_id: season.id
          } as Race);
          await this.raceRepository.save(race);
          this.logger.log(`Created and saved race: ${race.name}`);
        } else {
          this.logger.log(`Race already exists: ${race.name}`);
        }
      }

      this.logger.log(`Successfully imported races for ${year}`);
    } catch (error) {
      this.logger.error(`Error importing races for ${year}:`, error);
      throw error;
    }
  }

  async findAll(): Promise<{ data: Race[]; }> {
    const data = await this.raceRepository.find({
      order: { date: 'ASC' },
      relations: ['season']
    });

    return {
      data
    };
  }

  async findByYear(year: number): Promise<{ data: RacesResponse}> {
    const races = await this.raceRepository.find({
      where: {
        season: { year: year.toString() }
      },
      order: { date: 'ASC' },
      relations: [
        'season',
        'results',
        'results.driver',
        'results.constructorTeam'
      ]
    });

    const results = await this.resultsService.findByYear(year.toString());

     // If no races are found, import them
     if (races.length === 0) {
      await this.importRaces(year);
    }

    //If no results are found, import them
    if (results.length === 0) {
      await this.resultsService.importResults(year);
    }

    const transformedRaces: RaceResponse[] = await Promise.all(races.map(async race => {
      const winnerResult = race.results.find(result => result.position === 1);

      return {
        id: race.id,
        name: race.name,
        date: race.date,
        champion: winnerResult?.driver || null,
        constructor: winnerResult?.constructorTeam?.name || '',
        laps: winnerResult?.laps || 0,
        time: winnerResult?.time || '',
      };
    }));

    const seasonChampion = await this.driverStandingsService.findSeasonChampion(year);

    return {
      data: {
        races: transformedRaces,
        champion: seasonChampion
      }
    };
  }
} 