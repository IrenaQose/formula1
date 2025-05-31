import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DriverStanding } from '../driver-standings/entities/driver-standing.entity';
import { DriverStandingsModule } from '../driver-standings/driver-standings.module';
import { Season } from './entities/season.entity';
import { SeasonsService } from './seasons.service';
import { SeasonsController } from './seasons.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Season, DriverStanding]),
    DriverStandingsModule
  ],
  controllers: [SeasonsController],
  providers: [SeasonsService],
  exports: [SeasonsService]
})
export class SeasonsModule {} 