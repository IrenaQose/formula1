export interface ErgastRaceResponse {
    MRData: {
      RaceTable: {
        season: string;
        Races: Array<{
          round: string;
          raceName: string;
          date: string;
          time: string;
          Circuit: {
            circuitId: string;
            circuitName: string;
            Location: {
              lat: string;
              long: string;
              locality: string;
              country: string;
            };
          };
        }>;
      };
    };
  }