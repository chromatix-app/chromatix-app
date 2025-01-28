import decimalToHex from './decimalToHex';

describe('Testing "decimalToHex" function', () => {
  test('Test boundary values', () => {
    expect(decimalToHex(0)).toBe('00');
    expect(decimalToHex(0.5)).toBe('80');
    expect(decimalToHex(1)).toBe('FF');
  });

  test('Test values between 0 and 1', () => {
    expect(decimalToHex(0.1)).toBe('1A');
    expect(decimalToHex(0.25)).toBe('40');
    expect(decimalToHex(0.75)).toBe('BF');
    expect(decimalToHex(0.9)).toBe('E6');
  });

  test('Test values outside the range [0, 1]', () => {
    expect(decimalToHex(-0.1)).toBe('00'); // Assuming clamping to 0
    expect(decimalToHex(1.1)).toBe('FF'); // Assuming clamping to 255
  });
});
