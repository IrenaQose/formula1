import {
  Controller,
  Post,
  Param,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import { DriverStandingsService } from './driver-standings.service';

@Controller({ path: 'driver-standings', version: '1' })
export class DriverStandingsController {
  constructor(
    private readonly driverStandingsService: DriverStandingsService,
  ) {}

  @Post('import/:year')
  async importDriverStandings(
    @Param(
      'year',
      new ParseIntPipe({
        errorHttpStatusCode: 400,
        exceptionFactory: () =>
          new BadRequestException('Year must be a valid number'),
      }),
    )
    year: number,
  ) {
    await this.driverStandingsService.importDriverStandings(year);
    return { message: `Driver standings for ${year} imported successfully` };
  }
}
