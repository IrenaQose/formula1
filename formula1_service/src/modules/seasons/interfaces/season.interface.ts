import { Driver } from '../../drivers/entities/driver.entity';
import { ConstructorTeam } from '../../constructors/entities/constructor.entity';

export interface SeasonResponse {
  id: number;
  year: string;
  champion: {
    id: number;
    driver_id: number;
    season_id: number;
    constructor_team_id: number;
    points: number;
    position: number;
    wins: number;
    driver: Driver;
    constructorTeam: ConstructorTeam;
  } | null;
}

export interface SeasonsResponse {
  seasons: SeasonResponse[];
}
