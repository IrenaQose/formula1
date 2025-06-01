import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';

import { ConstructorTeam } from './entities/constructor.entity';
import { ConstructorsService } from './constructors.service';
import { ConstructorsController } from './constructors.controller';
import { RetryService } from '../../utils/retry.service';

@Module({
  imports: [TypeOrmModule.forFeature([ConstructorTeam]), HttpModule],
  controllers: [ConstructorsController],
  providers: [ConstructorsService, RetryService],
  exports: [ConstructorsService],
})
export class ConstructorsModule {}
