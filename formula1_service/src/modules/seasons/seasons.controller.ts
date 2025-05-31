import { Controller, Get, Query, ParseIntPipe } from '@nestjs/common';
import { SeasonsService } from './seasons.service';
import { Season } from './entities/season.entity';
import { SeasonsResponse } from './interfaces/season.interface';
import { YearRangeValidationPipe, YearRange } from '../../common/validation';

@Controller('seasons')
export class SeasonsController {
  constructor(private readonly seasonsService: SeasonsService) {}

  @Get()
  async findAll(): Promise<Season[]> {
    return this.seasonsService.findAll();
  }

  @Get('results')
  async getSeasonsChampions(
    @Query('startYear', new ParseIntPipe({ optional: true })) startYear?: number,
    @Query('endYear', new ParseIntPipe({ optional: true })) endYear?: number,
    @Query(YearRangeValidationPipe) yearRange: YearRange = { startYear, endYear }
  ): Promise<SeasonsResponse> {
    return this.seasonsService.findSeasonChampions(
      yearRange.startYear,
      yearRange.endYear
    );
  }
} 