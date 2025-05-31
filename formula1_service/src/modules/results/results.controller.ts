import { Controller, Get, Post, Param, ParseIntPipe, Query, BadRequestException } from '@nestjs/common';

import { ResultsService } from './results.service';
import { Result } from './entities/result.entity';

import { YearValidationPipe } from '../../common/validation';

@Controller('results')
export class ResultsController {
  constructor(private readonly resultsService: ResultsService) {}

  @Get()
  async findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    if (!page) page = 1;
    if (!limit) limit = 30;

    if (page < 1 || limit < 1) {
      throw new BadRequestException('Page and limit must be greater than 0');
    }

    return this.resultsService.findAll(page, limit);
  }

  @Get(':year')
  async findByYear(
    @Param('year', YearValidationPipe) year: number,
  ) {
    return this.resultsService.findByYear(year.toString());
  }

  @Post('import/:year')
  async importResults(@Param('year', ParseIntPipe) year: number) {
    await this.resultsService.importResults(year);
    return { message: `Results for ${year} imported successfully` };
  }
} 