import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';

import { ConstructorTeam } from './entities/constructor.entity';
import { ConstructorsService } from './constructors.service';
import { ConstructorsController } from './constructors.controller';
import { Season } from '../seasons/entities/season.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ConstructorTeam, Season]),
    HttpModule
  ],
  controllers: [ConstructorsController],
  providers: [ConstructorsService],
  exports: [ConstructorsService]
})
export class ConstructorsModule {} 