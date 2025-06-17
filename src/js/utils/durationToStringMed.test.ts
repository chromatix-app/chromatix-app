import durationToStringMed from './durationToStringMed';

describe('Testing "durationToStringMed" function', () => {
  test('Test simple duration results', () => {
    expect(durationToStringMed(123456)).toBe('2m 3s');
    expect(durationToStringMed(111111)).toBe('1m 51s');
    expect(durationToStringMed(1111111)).toBe('18m 31s');
    expect(durationToStringMed(11111111)).toBe('3h 5m');
    expect(durationToStringMed(111111111)).toBe('1d 7h');
    expect(durationToStringMed(1111111111)).toBe('12d 21h');
    expect(durationToStringMed(222222)).toBe('3m 42s');
    expect(durationToStringMed(2222222)).toBe('37m 2s');
    expect(durationToStringMed(22222222)).toBe('6h 10m');
    expect(durationToStringMed(222222222)).toBe('2d 14h');
    expect(durationToStringMed(2222222222)).toBe('25d 17h');
  });

  test('Test zero and small values', () => {
    expect(durationToStringMed(0)).toBe(''); // Zero duration
    expect(durationToStringMed(500)).toBe(''); // Less than a second
    expect(durationToStringMed(1000)).toBe('1s'); // Exactly one second
    expect(durationToStringMed(1999)).toBe('1s'); // Just under two seconds
  });

  test('Test single unit durations', () => {
    expect(durationToStringMed(1000)).toBe('1s'); // Just seconds
    expect(durationToStringMed(60000)).toBe('1m'); // Just minutes
    expect(durationToStringMed(3600000)).toBe('1h'); // Justh
    expect(durationToStringMed(86400000)).toBe('1d'); // Just days
  });

  test('Test rounding seconds when hours exist', () => {
    expect(durationToStringMed(3600000 + 29000)).toBe('1h'); // 1h29s - seconds omitted
    expect(durationToStringMed(3600000 + 31000)).toBe('1h 1m'); // 1h31s - rounds to 1h1m
  });

  test('Test keeping minutes when hours exist', () => {
    expect(durationToStringMed(3600000 + 29 * 60000)).toBe('1h 29m'); // 1h29m - minutes shown
  });

  test('Test rounding minutes when days exist', () => {
    expect(durationToStringMed(86400000 + 29 * 60000)).toBe('1d'); // 1d29m - minutes omitted
    expect(durationToStringMed(86400000 + 30 * 60000)).toBe('1d 1h'); // 1d30m - rounds to 1d1h
  });

  test('Test rounding hours when days exist', () => {
    expect(durationToStringMed(86400000 + 11 * 3600000)).toBe('1d 11h'); // 1d11h - no rounding up
    expect(durationToStringMed(86400000 + 12 * 3600000)).toBe('1d 12h'); // 1d12h - no rounding
  });

  test('Test negative and invalid inputs', () => {
    expect(durationToStringMed(-1000)).toBe(''); // Negative duration
    expect(durationToStringMed(NaN)).toBe(''); // NaN
    expect(durationToStringMed(Infinity)).toBe(''); // Infinity
  });
});
