import { YearValidationPipe } from './year.validation.pipe';

describe('YearValidationPipe', () => {
  let pipe: YearValidationPipe;
  const currentYear = new Date().getFullYear();

  beforeEach(() => {
    pipe = new YearValidationPipe();
  });

  it('should pass valid year', () => {
    expect(pipe.transform(2020)).toBe(2020);
  });

  it('should throw error if year < 2005', () => {
    expect(() => pipe.transform(1949)).toThrow(`Year must be a valid number between 2005 and ${currentYear}`);
  });

  it('should throw error if year > current year', () => {
    expect(() => pipe.transform(currentYear + 1)).toThrow(`Year must be a valid number between 2005 and ${currentYear}`);
  });

  it('should throw error if year is not a 4-digit number', () => {
    expect(() => pipe.transform('invalid' as any)).toThrow('Year must be a 4-digit number');
    expect(() => pipe.transform(123 as any)).toThrow('Year must be a 4-digit number');
    expect(() => pipe.transform(NaN as any)).toThrow('Year must be a 4-digit number');
  });
}); 