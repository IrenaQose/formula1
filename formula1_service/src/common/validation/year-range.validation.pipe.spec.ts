import { YearRangeValidationPipe } from './index';

describe('YearRangeValidationPipe', () => {
  let pipe: YearRangeValidationPipe;

  beforeEach(() => {
    pipe = new YearRangeValidationPipe();
  });

  it('should pass valid year range', () => {
    expect(pipe.transform({ startYear: 2010, endYear: 2020 })).toEqual({ startYear: 2010, endYear: 2020 });
  });

  it('should throw if startYear < MIN_YEAR', () => {
    expect(() => pipe.transform({ startYear: 1999, endYear: 2020 })).toThrow();
  });

  it('should throw if endYear > MAX_YEAR', () => {
    expect(() => pipe.transform({ startYear: 2010, endYear: 3000 })).toThrow();
  });

  it('should throw if startYear > endYear', () => {
    expect(() => pipe.transform({ startYear: 2021, endYear: 2020 })).toThrow();
  });

  it('should allow missing years (defaults)', () => {
    expect(pipe.transform({})).toEqual({startYear: 2005, endYear: 2025});
  });
});