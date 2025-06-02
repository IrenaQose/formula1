import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SeasonsModule } from './modules/seasons/seasons.module';
import { ConstructorsModule } from './modules/constructors/constructors.module';
import { DriversModule } from './modules/drivers/drivers.module';
import { RacesModule } from './modules/races/races.module';
import { ResultsModule } from './modules/results/results.module';
import { DriverStandingsModule } from './modules/driver-standings/driver-standings.module';
import { Season } from './modules/seasons/entities/season.entity';
import { databaseConfig } from './config/database.config';
import { ConstructorTeam } from './modules/constructors/entities/constructor.entity';
import { DriverStanding } from './modules/driver-standings/entities/driver-standing.entity';
import { Driver } from './modules/drivers/entities/driver.entity';
import { Race } from './modules/races/entities/race.entity';
import { Result } from './modules/results/entities/result.entity';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60, // time to live in seconds
          limit: 10, // number of requests per ttl per IP
        },
      ],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: databaseConfig,
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([
      Season,
      ConstructorTeam,
      DriverStanding,
      Driver,
      Race,
      Result,
    ]),
    SeasonsModule,
    ConstructorsModule,
    DriversModule,
    RacesModule,
    ResultsModule,
    DriverStandingsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
