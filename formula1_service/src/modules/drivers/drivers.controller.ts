import {
  Controller,
  Get,
  Post,
  Param,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import { DriversService } from './drivers.service';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { Driver } from './entities/driver.entity';

@ApiTags('drivers')
@Controller({ path: 'drivers', version: '1' })
export class DriversController {
  constructor(private readonly driversService: DriversService) {}

  @Get()
  @ApiOperation({ summary: 'Get all drivers' })
  @ApiResponse({
    status: 200,
    description: 'Returns all drivers',
    type: [Driver],
  })
  async findAll(): Promise<Driver[]> {
    return this.driversService.findAll();
  }

  @Post('import/:year')
  async importDrivers(
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
    await this.driversService.importDrivers(year);
    return { message: `Drivers for ${year} imported successfully` };
  }
}
