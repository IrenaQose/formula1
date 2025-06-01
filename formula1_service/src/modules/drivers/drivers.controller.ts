import { Controller, Get, Post, Param, ParseIntPipe, BadRequestException } from '@nestjs/common';
import { DriversService } from './drivers.service';

@Controller('drivers')
export class DriversController {
  constructor(private readonly driversService: DriversService) {}

  @Get()
  async findAll() {
    return this.driversService.findAll();
  }

  @Post('import/:year')
  async importDrivers(
    @Param(
      'year',
      new ParseIntPipe({
        errorHttpStatusCode: 400,
        exceptionFactory: () => new BadRequestException('Year must be a valid number'),
      }),
    )
    year: number,
  ) {
    await this.driversService.importDrivers(year);
    return { message: `Drivers for ${year} imported successfully` };
  }
}
