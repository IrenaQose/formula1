export interface ErgastDriver {
    driverId: string;
    permanentNumber?: string;
    code?: string;
    url: string;
    givenName: string;
    familyName: string;
    dateOfBirth: string;
    nationality: string;
}

export interface ErgastResponse {
    MRData: {
        DriverTable: {
            season: string;
            Drivers: ErgastDriver[];
        };
    };
};