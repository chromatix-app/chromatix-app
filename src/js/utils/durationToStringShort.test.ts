// Tests generated using AI

import durationToStringShort from './durationToStringShort';

describe('Testing "durationToStringShort" function', () => {
  test('Test simple duration results', () => {
    expect(durationToStringShort(123456)).toBe('2:03');
    expect(durationToStringShort(111111)).toBe('1:51');
    expect(durationToStringShort(1111111)).toBe('18:31');
    expect(durationToStringShort(11111111)).toBe('3:05:11');
    expect(durationToStringShort(111111111)).toBe('30:51:51');
    expect(durationToStringShort(1111111111)).toBe('308:38:31');
    expect(durationToStringShort(222222)).toBe('3:42');
    expect(durationToStringShort(2222222)).toBe('37:02');
    expect(durationToStringShort(22222222)).toBe('6:10:22');
    expect(durationToStringShort(222222222)).toBe('61:43:42');
    expect(durationToStringShort(2222222222)).toBe('617:17:02');
  });

  test('Test zero and small values', () => {
    expect(durationToStringShort(0)).toBe('0:00');
    expect(durationToStringShort(500)).toBe('0:00'); // Less than a second
    expect(durationToStringShort(999)).toBe('0:00');
    expect(durationToStringShort(1000)).toBe('0:01'); // Exactly one second
  });

  test('Test exact minute and hour boundaries', () => {
    expect(durationToStringShort(60000)).toBe('1:00'); // Exactly one minute
    expect(durationToStringShort(59999)).toBe('0:59'); // Just under one minute
    expect(durationToStringShort(3599000)).toBe('59:59'); // Just under one hour
    expect(durationToStringShort(3600000)).toBe('1:00:00'); // Exactly one hour
  });

  test('Test leading zeros in hours', () => {
    expect(durationToStringShort(9 * 3600000)).toBe('9:00:00'); // Single digit hour
  });

  test('Test mixed precise values', () => {
    expect(durationToStringShort(3661000)).toBe('1:01:01'); // 1h 1m 1s
    expect(durationToStringShort(3661999)).toBe('1:01:01'); // Rounding check
  });

  test('Test negative and invalid inputs', () => {
    expect(durationToStringShort(-1000)).toBe('0:00'); // Negative duration
    expect(durationToStringShort(NaN)).toBe('0:00'); // NaN
    expect(durationToStringShort(Infinity)).toBe('0:00'); // Infinity
  });
});
