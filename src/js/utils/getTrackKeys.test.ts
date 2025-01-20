import getTrackKeys from './getTrackKeys';

describe('Testing "getTrackKeys" function', () => {
  test('should return an array from 0 to n-1 when shuffle is false and playingOrder is null', () => {
    expect(getTrackKeys(5, null, false, null)).toEqual([0, 1, 2, 3, 4]);
  });

  test('should return the playingOrder when it is defined and shuffle is false', () => {
    expect(getTrackKeys(5, [4, 3, 2, 1, 0], false, null)).toEqual([4, 3, 2, 1, 0]);
  });

  test('should return shuffled track keys when shuffle is true', () => {
    const result = getTrackKeys(5, null, true, null);
    expect(result).toHaveLength(5);
    expect(result).toEqual(expect.arrayContaining([0, 1, 2, 3, 4]));
  });

  test('should return shuffled track keys with firstValue at the beginning when shuffle is true', () => {
    const result = getTrackKeys(5, null, true, 2);
    expect(result).toHaveLength(5);
    expect(result[0]).toBe(2);
    expect(result).toEqual(expect.arrayContaining([0, 1, 2, 3, 4]));
  });

  test('should return an empty array when trackCount is 0', () => {
    expect(getTrackKeys(0, null, false, null)).toEqual([]);
  });

  test('should handle large trackCount correctly', () => {
    const trackCount = 1000;
    const result = getTrackKeys(trackCount, null, false, null);
    expect(result).toHaveLength(trackCount);
    expect(result).toEqual(Array.from({ length: trackCount }, (_, i) => i));
  });

  test('should handle large trackCount with shuffle correctly', () => {
    const trackCount = 1000;
    const result = getTrackKeys(trackCount, null, true, null);
    expect(result).toHaveLength(trackCount);
    expect(result).toEqual(expect.arrayContaining(Array.from({ length: trackCount }, (_, i) => i)));
  });
});
