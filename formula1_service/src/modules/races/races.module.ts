import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { Race } from './entities/race.entity';
import { Season } from '../seasons/entities/season.entity';
import { RacesService } from './races.service';
import { RacesController } from './races.controller';
import { DriverStandingsModule } from '../driver-standings/driver-standings.module';
import { RetryService } from '../../utils/retry.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Race, Season]),
    HttpModule,
    DriverStandingsModule,
  ],
  controllers: [RacesController],
  providers: [RacesService, RetryService],
  exports: [RacesService],
})
export class RacesModule {}
