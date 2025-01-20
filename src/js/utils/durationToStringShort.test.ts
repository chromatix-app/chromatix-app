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
});
