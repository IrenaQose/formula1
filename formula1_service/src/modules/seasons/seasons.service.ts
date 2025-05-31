import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Season } from './entities/season.entity';
import { SeasonsResponse } from './interfaces/season.interface';
import { DriverStandingsService } from '../driver-standings/driver-standings.service';

@Injectable()
export class SeasonsService {
  private readonly MIN_YEAR = 2005;
  private readonly MAX_YEAR = 2025;

  constructor(
    @InjectRepository(Season)
    private readonly seasonRepository: Repository<Season>,
    private readonly driverStandingsService: DriverStandingsService,
  ) { }

  async findAll(): Promise<Season[]> {
    return this.seasonRepository.find({
      order: { year: 'DESC' }
    });
  }

  async findSeasonChampions(
    startYear: number = this.MIN_YEAR,
    endYear: number = this.MAX_YEAR
  ): Promise<any> {
    const seasons = await this.seasonRepository.find({
      where: {
        year: Between(startYear.toString(), endYear.toString())
      },
      order: { year: 'DESC' }
    });
    const seasonsWithResults = await Promise.all(seasons.map(async (season) => {
      const champion = await this.driverStandingsService.findSeasonChampion(parseInt(season.year));
      return {
        ...season,
        champion
      }
    }));

    return {
      seasons: seasonsWithResults,
    };
  }
} 