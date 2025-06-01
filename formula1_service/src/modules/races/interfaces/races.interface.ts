import { Driver } from 'src/modules/drivers/entities/driver.entity';
import { DriverStanding } from 'src/modules/driver-standings/entities/driver-standing.entity';

export interface RacesResponse {
  races: RaceResponse[];
  champion: DriverStanding | null;
}

export interface RaceResponse {
  name: string;
  date: Date;
  champion: Driver | null;
  constructor: string | null;
  laps: number | null;
  time: string | null;
}
