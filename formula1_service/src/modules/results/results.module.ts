import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';

import { Result } from './entities/result.entity';
import { ResultsController } from './results.controller';
import { ResultsService } from './results.service';

import { Season } from '../seasons/entities/season.entity';
import { Driver } from '../drivers/entities/driver.entity';
import { Race } from '../races/entities/race.entity';
import { ConstructorTeam } from '../constructors/entities/constructor.entity';
import { RetryService } from '../../utils/retry.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Result, Season, Race, Driver, ConstructorTeam]),
    HttpModule,
  ],
  controllers: [ResultsController],
  providers: [ResultsService, RetryService],
  exports: [ResultsService],
})
export class ResultsModule {}
