export interface SeasonRaceResult {
  raceId: number;
  raceName: string;
  date: Date;
  winner: {
    driverId: number;
    driverRef: string;
    firstName: string;
    lastName: string;
    constructor: string;
    points: number;
  } | null;
}

export interface SeasonResponse {
  id: number;
  year: string;
  races: SeasonRaceResult[];
  champion: {
    driverId: number;
    driverRef: string;
    firstName: string;
    lastName: string;
    points: number;
    wins: number;
  } | null;
}

export interface SeasonsResponse {
  seasons: SeasonResponse[];
  total: number;
} 

export interface SeasonChampionsResponse {
  seasons: SeasonResponse[];
  total: number;
} 