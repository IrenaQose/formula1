export interface SeasonResult {
  year: number;
  champion: {
   id: number,
   driver_id: number,
   season_id: number,
   constructor_team_id: number,
   points: number,
   position: number,
   wins: number,
   driver: {
     id: number,
     driver_ref: string,
     permanent_number: number,
     first_name: string,
     last_name: string,
     birthdate: string,
     nationality: string,
    },
   constructorTeam: {
     id: number,
     constructor_ref: string,
     name: string,
     nationality: string,
    },
  } 
 
}

export interface SeasonResultsResponse {
    seasons: SeasonResult[];
} 

export interface Season {
  year: number;
}