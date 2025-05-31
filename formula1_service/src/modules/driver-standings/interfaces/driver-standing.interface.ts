export interface ErgastDriverStanding {
  position: string;
  positionText: string;
  points: string;
  wins: string;
  Driver: {
    driverId: string;
    permanentNumber: string;
    code: string;
    url: string;
    givenName: string;
    familyName: string;
    dateOfBirth: string;
    nationality: string;
  };
  Constructors: Array<{
    constructorId: string;
    url: string;
    name: string;
    nationality: string;
  }>;
}

export interface ErgastStandingsResponse {
  MRData: {
    xmlns: string;
    series: string;
    url: string;
    limit: string;
    offset: string;
    total: string;
    StandingsTable: {
      season: string;
      round: string;
      StandingsLists: Array<{
        season: string;
        round: string;
        DriverStandings: ErgastDriverStanding[];
      }>;
    };
  };
}

export interface DriverStandingResponse {
  id: number;
  position: number;
  points: number;
  wins: number;
  driver: {
    id: number;
    driverRef: string;
    firstName: string;
    lastName: string;
    nationality: string;
  };
  constructorTeam: {
    id: number;
    name: string;
    nationality: string;
  } | null;
  season: {
    id: number;
    year: string;
  };
}

export interface DriverStandingsResponse {
  standings: DriverStandingResponse[];
  total: number;
} 