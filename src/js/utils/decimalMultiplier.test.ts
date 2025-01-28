import decimalMultiplier from './decimalMultiplier';

describe('Testing "decimalMultiplier" function', () => {
  test('Test boundary values', () => {
    expect(decimalMultiplier(2, 0)).toBe(0);
    expect(decimalMultiplier(2, 1)).toBe(1);
  });

  test('Test typical values within the range', () => {
    expect(decimalMultiplier(2, 0.25)).toBe(0.4375);
    expect(decimalMultiplier(2, 0.5)).toBe(0.75);
    expect(decimalMultiplier(2, 0.75)).toBe(0.9375);
  });

  test('Test different multipliers', () => {
    expect(decimalMultiplier(3, 0.5)).toBe(0.875);
    expect(decimalMultiplier(4, 0.5)).toBe(0.9375);
  });

  test('Test different decimal places', () => {
    expect(decimalMultiplier(2, 0.33333, 2)).toBe(0.56);
    expect(decimalMultiplier(2, 0.33333, 4)).toBe(0.5556);
  });

  test('Test error cases for values outside the range [0, 1]', () => {
    expect(() => decimalMultiplier(2, -0.1)).toThrow('Value must be between 0 and 1');
    expect(() => decimalMultiplier(2, 1.1)).toThrow('Value must be between 0 and 1');
  });
});
