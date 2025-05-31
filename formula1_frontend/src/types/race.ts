import type { Driver } from "./driver";
import type { DriverStandings } from "./driver-standings";

export interface Race {
  name: string;
  date: Date;
  champion: Driver;
  constructor: string;
  laps: number;
  time: string;
}

export interface RaceTableProps {
  year: number;
} 

export interface RaceResponse {
  data: {
    races: Race[];
    champion: DriverStandings;
  };
}