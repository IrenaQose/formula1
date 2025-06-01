import { env } from 'process';
import { Repository } from 'typeorm';

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { ConstructorTeam } from './entities/constructor.entity';
import { RetryService } from '../../utils/retry.service';

interface ErgastConstructorResponse {
  MRData: {
    ConstructorTable: {
      season: string;
      Constructors: Array<{
        constructorId: string;
        url: string;
        name: string;
        nationality: string;
      }>;
    };
  };
}

@Injectable()
export class ConstructorsService {
  private readonly logger = new Logger(ConstructorsService.name);

  constructor(
    @InjectRepository(ConstructorTeam)
    private readonly constructorRepository: Repository<ConstructorTeam>,
    private readonly retryService: RetryService,
  ) {}

  async importConstructors(year: number): Promise<void> {
    try {
      const url = `${env.ERGAST_API_URL}/${year}/constructors/`;
      this.logger.log(`Fetching constructors from ${url}`);

      const response = await this.retryService.makeRequestWithRetry<ErgastConstructorResponse>(url);
      const constructors = response.MRData.ConstructorTable.Constructors;
      this.logger.log(`Found ${constructors.length} constructors for ${year}`);

      for (const constructorData of constructors) {
        // Find or create constructor
        let constructor = await this.constructorRepository.findOne({
          where: { constructor_ref: constructorData.constructorId },
        });

        if (!constructor) {
          constructor = this.constructorRepository.create({
            constructor_ref: constructorData.constructorId,
            name: constructorData.name,
            nationality: constructorData.nationality,
          } as ConstructorTeam);
          await this.constructorRepository.save(constructor);
          this.logger.log(`Created and saved constructor: ${constructor.name}`);
        } else {
          this.logger.log(`Constructor already exists: ${constructor.name}`);
        }
      }

      this.logger.log(`Successfully imported constructors for ${year}`);
    } catch (error) {
      this.logger.error(`Error importing constructors for ${year}:`, error);
      throw error;
    }
  }

  async findAll(): Promise<ConstructorTeam[]> {
    return this.constructorRepository.find();
  }
}
