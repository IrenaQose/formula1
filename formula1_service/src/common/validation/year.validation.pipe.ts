import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class YearValidationPipe implements PipeTransform<number, number> {
  transform(value: number): number {
    if (!/^\d{4}$/.test(value.toString())) {
      throw new BadRequestException('Year must be a 4-digit number');
    }
    const currentYear = new Date().getFullYear();
    if (isNaN(value) || value < 2005 || value > currentYear) {
      throw new BadRequestException(
        `Year must be a valid number between 2005 and ${currentYear}`,
      );
    }
    return value;
  }
} 