import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';

import { DriverStanding } from './entities/driver-standing.entity';
import { DriverStandingsService } from './driver-standings.service';
import { DriverStandingsController } from './driver-standings.controller';

import { Driver } from '../drivers/entities/driver.entity';
import { Season } from '../seasons/entities/season.entity';
import { Race } from '../races/entities/race.entity';
import { ConstructorTeam } from '../constructors/entities/constructor.entity';
import { RetryService } from '../../utils/retry.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DriverStanding,
      Driver,
      Race,
      Season,
      ConstructorTeam,
    ]),
    HttpModule,
  ],
  controllers: [DriverStandingsController],
  providers: [DriverStandingsService, RetryService],
  exports: [DriverStandingsService],
})
export class DriverStandingsModule {}
