import type { Driver } from "./driver";
import type { Constructor } from "./constructor";

export interface DriverStandings {
    id: number;
    driver_id: number;
    season_id: number;
    constructor_team_id: number;
    points: number;
    position: number;
    wins: number;
    driver: Driver;
    constructorTeam: Constructor;
}