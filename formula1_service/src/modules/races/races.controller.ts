import { Controller, Get, Post, Param, ParseIntPipe } from '@nestjs/common';

import { RacesService } from './races.service';
import { RacesResponse } from './interfaces/races.interface';

@Controller({ path: 'races', version: '1' })
export class RacesController {
  constructor(private readonly racesService: RacesService) {}

  @Get()
  async findAll() {
    return this.racesService.findAll();
  }

  @Get(':year')
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
