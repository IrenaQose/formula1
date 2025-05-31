import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class RateLimiterService {
  private readonly logger = new Logger(RateLimiterService.name);
  private readonly delayBetweenRequests = 4000; // 1 second delay between requests

  async wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async executeWithRateLimit<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    try {
      const result = await operation();
      await this.wait(this.delayBetweenRequests);
      return result;
    } catch (error) {
      this.logger.error(`Error in ${operationName}:`, error);
      throw error;
    }
  }

  async executeBatchWithRateLimit<T>(
    operations: Array<() => Promise<T>>,
    batchName: string,
    batchSize: number = 3
  ): Promise<T[]> {
    const results: T[] = [];
    const totalOperations = operations.length;

    for (let i = 0; i < totalOperations; i += batchSize) {
      const batch = operations.slice(i, i + batchSize);
      this.logger.log(`Processing batch ${i / batchSize + 1} of ${Math.ceil(totalOperations / batchSize)} for ${batchName}`);

      const batchResults = await Promise.all(
        batch.map(op => this.executeWithRateLimit(op, `${batchName} operation`))
      );
      results.push(...batchResults);

      // Add extra delay between batches
      if (i + batchSize < totalOperations) {
        await this.wait(this.delayBetweenRequests * 2);
      }
    }

    return results;
  }
} 