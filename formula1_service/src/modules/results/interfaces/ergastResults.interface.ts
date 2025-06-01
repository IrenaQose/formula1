export interface ErgastResultsResponse {
  MRData: {
    limit: string;
    offset: string;
    total: string;
    RaceTable: {
      Races: Array<{
        season: string;
        round: string;
        raceName: string;
        date: string;
        time: string;
        Results: Array<{
          number: string;
          position: string;
          points: string;
          Driver: {
            driverId: string;
            permanentNumber: string;
            givenName: string;
            familyName: string;
            dateOfBirth: string;
            nationality: string;
          };
          Constructor: {
            constructorId: string;
            name: string;
            nationality: string;
          };
          grid: string;
          laps: string;
          status: string;
          Time?: {
            time: string;
          };
        }>;
      }>;
    };
  };
}
