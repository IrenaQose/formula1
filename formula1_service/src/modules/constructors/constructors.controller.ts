import {
  Controller,
  Get,
  Post,
  Param,
  ParseIntPipe,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

import { ConstructorsService } from './constructors.service';
import { ConstructorTeam } from './entities/constructor.entity';

@ApiTags('constructors')
@Controller({ path: 'constructors', version: '1' })
export class ConstructorsController {
  private readonly logger = new Logger(ConstructorsController.name);

  constructor(private readonly constructorsService: ConstructorsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all constructor teams' })
  @ApiResponse({
    status: 200,
    description: 'Returns all constructor teams',
    type: [ConstructorTeam],
  })
  async findAll(): Promise<ConstructorTeam[]> {
    return this.constructorsService.findAll();
  }

  @Post('import/:year')
  async importConstructors(
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
    await this.constructorsService.importConstructors(year);
    this.logger.log(`Successfully imported constructors for year ${year}`);
    return { message: `Constructors for ${year} imported successfully` };
  }
}
