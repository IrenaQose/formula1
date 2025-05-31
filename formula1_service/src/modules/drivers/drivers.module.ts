import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';

import { Driver } from './entities/driver.entity';
import { DriversService } from './drivers.service';
import { DriversController } from './drivers.controller';
import { RetryService } from '../../utils/retry.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Driver]),
    HttpModule
  ],
  controllers: [DriversController],
  providers: [DriversService, RetryService],
  exports: [DriversService]
})
export class DriversModule {} 