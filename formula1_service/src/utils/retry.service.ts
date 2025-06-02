import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';

@Injectable()
export class RetryService {
  private readonly logger = new Logger(RetryService.name);
  private readonly MAX_RETRIES = 10;
  private readonly INITIAL_RETRY_DELAY = 1000; // 1.5 second

  constructor(private readonly httpService: HttpService) {}

  private async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async makeRequestWithRetry<T>(url: string, attempt = 1): Promise<T> {
    try {
      const response = await firstValueFrom(this.httpService.get<T>(url));
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 429) {
        if (attempt > this.MAX_RETRIES) {
          this.logger.error(
            `Max retries (${this.MAX_RETRIES}) exceeded for ${url}`,
          );
          throw new Error(
            `Failed to fetch data after ${this.MAX_RETRIES} retries`,
          );
        }

        const delay = this.INITIAL_RETRY_DELAY * Math.pow(2, attempt - 1);
        this.logger.warn(
          `Rate limited (429). Retrying in ${delay}ms (attempt ${attempt}/${this.MAX_RETRIES})`,
        );
        await this.sleep(delay);
        return this.makeRequestWithRetry<T>(url, attempt + 1);
      }
      throw error;
    }
  }
}
