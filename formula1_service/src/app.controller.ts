import { Controller, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('import/all')
  async importAll() {
    await this.appService.importAllData();
    return { message: 'Import of all data completed' };
  }
}
