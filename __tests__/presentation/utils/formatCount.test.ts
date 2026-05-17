import { formatCount } from '@/presentation/utils/formatCount';

describe('formatCount', () => {
  it('returns the raw integer when value < 1000', () => {
    expect(formatCount(0)).toBe('0');
    expect(formatCount(42)).toBe('42');
    expect(formatCount(999)).toBe('999');
  });

  it('formats with one decimal "k" between 1000 and 9999', () => {
    expect(formatCount(1000)).toBe('1.0k');
    expect(formatCount(1234)).toBe('1.2k');
    expect(formatCount(9999)).toBe('10.0k');
  });

  it('formats with integer "k" between 10000 and 999999', () => {
    expect(formatCount(12345)).toBe('12k');
    expect(formatCount(120000)).toBe('120k');
    expect(formatCount(999999)).toBe('999k');
  });

  it('formats with one decimal "M" at 1 million and above', () => {
    expect(formatCount(1_000_000)).toBe('1.0M');
    expect(formatCount(2_500_000)).toBe('2.5M');
  });
});
