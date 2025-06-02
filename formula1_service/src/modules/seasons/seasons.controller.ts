import { Controller, Get, Query } from '@nestjs/common';
import { SeasonsService } from './seasons.service';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { YearRangeValidationPipe } from '../../common/validation';
import { YearRange } from '../../common/interfaces/year-range.interface';
import { Season } from './entities/season.entity';
import { SeasonsResponse } from './interfaces/season.interface';

@ApiTags('seasons')
@Controller('seasons')
export class SeasonsController {
  constructor(private readonly seasonsService: SeasonsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all seasons' })
  @ApiResponse({
    status: 200,
    description: 'Returns all seasons',
    type: [Season],
  })
  async findAll(): Promise<Season[]> {
    return this.seasonsService.findAll();
  }

  @Get('results')
  @ApiOperation({ summary: 'Get seasons with champions' })
  @ApiQuery({
    name: 'startYear',
    required: false,
    type: Number,
    description: 'Start year for the range (default: 2005)',
  })
  @ApiQuery({
    name: 'endYear',
    required: false,
    type: Number,
    description: 'End year for the range (default: 2025)',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns seasons with their champions',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid year range provided',
  })
  async getSeasonsChampions(
    @Query(YearRangeValidationPipe) yearRange: YearRange,
  ): Promise<SeasonsResponse> {
    return this.seasonsService.findSeasonChampions(
      yearRange.startYear,
      yearRange.endYear,
    );
  }
}
