import { Controller, Get, Post, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { RacesService } from './races.service';
import { RacesResponse } from './interfaces/races.interface';
import { Race } from './entities/race.entity';

@ApiTags('races')
@Controller({ path: 'races', version: '1' })
export class RacesController {
  constructor(private readonly racesService: RacesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all races' })
  @ApiResponse({
    status: 200,
    description: 'Returns all races',
    type: () => ({ data: [Race] }),
  })
  async findAll(): Promise<{ data: Race[] }> {
    return this.racesService.findAll();
  }

  @Get(':year')
  @ApiOperation({ summary: 'Get races for a specific year' })
  @ApiParam({
    name: 'year',
    required: true,
    type: Number,
    description: 'The year to get races for',
  })
  @ApiResponse({
    status: 200,
    description:
      'Returns races for the specified year with results and champion',
  })
  @ApiResponse({
    status: 404,
    description: 'No races found for the specified year',
  })
  async findByYear(
    @Param('year', ParseIntPipe) year: number,
  ): Promise<{ data: RacesResponse }> {
    return this.racesService.findByYear(year);
  }

  @Post('import/:year')
  async importRaces(@Param('year', ParseIntPipe) year: number) {
    await this.racesService.importRaces(year);
    return { message: `Races for ${year} imported successfully` };
  }
}
