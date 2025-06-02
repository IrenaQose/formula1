import {
  Controller,
  Get,
  Post,
  Param,
  ParseIntPipe,
  Query,
  BadRequestException,
} from '@nestjs/common';

import { ResultsService } from './results.service';
import { YearValidationPipe } from '../../common/validation';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Result } from './entities/result.entity';

@ApiTags('results')
@Controller({ path: 'results', version: '1' })
export class ResultsController {
  constructor(private readonly resultsService: ResultsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all results' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'The page number to get results for',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'The number of results per page',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns all results',
    type: () => ({ data: [Result] }),
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid page or limit provided',
  })
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
  @ApiOperation({ summary: 'Get results for a specific year' })
  @ApiParam({
    name: 'year',
    required: true,
    type: Number,
    description: 'The year to get results for',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns results for a specific year',
    type: () => ({ data: [Result] }),
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid year provided',
  })
  async findByYear(@Param('year', YearValidationPipe) year: number) {
    return this.resultsService.findByYear(year.toString());
  }

  @Post('import/:year')
  async importResults(@Param('year', ParseIntPipe) year: number) {
    await this.resultsService.importResults(year);
    return { message: `Results for ${year} imported successfully` };
  }
}
