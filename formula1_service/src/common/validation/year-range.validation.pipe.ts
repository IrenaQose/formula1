import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

export interface YearRange {
  startYear?: number;
  endYear?: number;
}

@Injectable()
export class YearRangeValidationPipe implements PipeTransform<YearRange, YearRange> {
  private readonly MIN_YEAR = 2005;
  private readonly MAX_YEAR = 2025;

  transform(value: YearRange): YearRange {
    const { startYear, endYear } = value;

    // If no years provided, use defaults
    if (!startYear && !endYear) {
      return { startYear: this.MIN_YEAR, endYear: this.MAX_YEAR };
    }

    // Validate startYear if provided
    if (startYear !== undefined) {
      if (isNaN(startYear)) {
        throw new BadRequestException('Start year must be a valid number');
      }
      if (startYear < this.MIN_YEAR || startYear > this.MAX_YEAR) {
        throw new BadRequestException(
          `Start year must be between ${this.MIN_YEAR} and ${this.MAX_YEAR}`
        );
      }
    }

    // Validate endYear if provided
    if (endYear !== undefined) {
      if (isNaN(endYear)) {
        throw new BadRequestException('End year must be a valid number');
      }
      if (endYear < this.MIN_YEAR || endYear > this.MAX_YEAR) {
        throw new BadRequestException(
          `End year must be between ${this.MIN_YEAR} and ${this.MAX_YEAR}`
        );
      }
    }

    // If only one year is provided, use defaults for the other
    const finalStartYear = startYear ?? this.MIN_YEAR;
    const finalEndYear = endYear ?? this.MAX_YEAR;

    // Validate year range
    if (finalStartYear > finalEndYear) {
      throw new BadRequestException('Start year must be less than or equal to end year');
    }

    return {
      startYear: finalStartYear,
      endYear: finalEndYear
    };
  }
} 