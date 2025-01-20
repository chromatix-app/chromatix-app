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
});
