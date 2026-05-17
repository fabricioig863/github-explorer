import { formatRelativeDate } from '@/presentation/utils/formatRelativeDate';

describe('formatRelativeDate', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-05-17T12:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('formats minutes-ago in pt-BR with "há" prefix', () => {
    const fiveMinAgo = new Date('2026-05-17T11:55:00Z');
    expect(formatRelativeDate(fiveMinAgo)).toBe('há 5 minutos');
  });

  it('formats hours-ago in pt-BR', () => {
    const threeHoursAgo = new Date('2026-05-17T09:00:00Z');
    expect(formatRelativeDate(threeHoursAgo)).toBe('há cerca de 3 horas');
  });

  it('formats days-ago in pt-BR', () => {
    const threeDaysAgo = new Date('2026-05-14T12:00:00Z');
    expect(formatRelativeDate(threeDaysAgo)).toBe('há 3 dias');
  });

  it('uses "menos de" copy for very recent moments', () => {
    const tenSecondsAgo = new Date('2026-05-17T11:59:50Z');
    expect(formatRelativeDate(tenSecondsAgo)).toBe('há menos de um minuto');
  });
});
