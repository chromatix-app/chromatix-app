// Generated using GitHub Copilot

import durationToStringLong from './durationToStringLong';

describe('Testing "durationToStringLong" function', () => {
  test('Test simple duration results', () => {
    expect(durationToStringLong(123456)).toBe('2 mins, 3 secs');
    expect(durationToStringLong(111111)).toBe('1 min, 51 secs');
    expect(durationToStringLong(1111111)).toBe('18 mins, 31 secs');
    expect(durationToStringLong(11111111)).toBe('3 hours, 5 mins');
    expect(durationToStringLong(111111111)).toBe('1 day, 7 hours');
    expect(durationToStringLong(1111111111)).toBe('12 days, 21 hours');
    expect(durationToStringLong(222222)).toBe('3 mins, 42 secs');
    expect(durationToStringLong(2222222)).toBe('37 mins, 2 secs');
    expect(durationToStringLong(22222222)).toBe('6 hours, 10 mins');
    expect(durationToStringLong(222222222)).toBe('2 days, 14 hours');
    expect(durationToStringLong(2222222222)).toBe('25 days, 17 hours');
  });

  test('Test zero and small values', () => {
    expect(durationToStringLong(0)).toBe(''); // Zero duration
    expect(durationToStringLong(500)).toBe(''); // Less than a second
    expect(durationToStringLong(1000)).toBe('1 sec'); // Exactly one second
    expect(durationToStringLong(1999)).toBe('1 sec'); // Just under two seconds
  });

  test('Test single unit durations', () => {
    expect(durationToStringLong(1000)).toBe('1 sec'); // Just seconds
    expect(durationToStringLong(60000)).toBe('1 min'); // Just minutes
    expect(durationToStringLong(3600000)).toBe('1 hour'); // Just hours
    expect(durationToStringLong(86400000)).toBe('1 day'); // Just days
  });

  test('Test rounding seconds when hours exist', () => {
    expect(durationToStringLong(3600000 + 29000)).toBe('1 hour'); // 1h29s - seconds omitted
    expect(durationToStringLong(3600000 + 31000)).toBe('1 hour, 1 min'); // 1h31s - rounds to 1h1m
  });

  test('Test keeping minutes when hours exist', () => {
    expect(durationToStringLong(3600000 + 29 * 60000)).toBe('1 hour, 29 mins'); // 1h29m - minutes shown
  });

  test('Test rounding minutes when days exist', () => {
    expect(durationToStringLong(86400000 + 29 * 60000)).toBe('1 day'); // 1d29m - minutes omitted
    expect(durationToStringLong(86400000 + 30 * 60000)).toBe('1 day, 1 hour'); // 1d30m - rounds to 1d1h
  });

  test('Test rounding hours when days exist', () => {
    expect(durationToStringLong(86400000 + 11 * 3600000)).toBe('1 day, 11 hours'); // 1d11h - no rounding up
    expect(durationToStringLong(86400000 + 12 * 3600000)).toBe('1 day, 12 hours'); // 1d12h - no rounding
  });

  test('Test negative and invalid inputs', () => {
    expect(durationToStringLong(-1000)).toBe(''); // Negative duration
    expect(durationToStringLong(NaN)).toBe(''); // NaN
    expect(durationToStringLong(Infinity)).toBe(''); // Infinity
  });
});
