/**
 * Converts a decimal value (0-1) to a 2-digit uppercase hexadecimal string.
 * Values are clamped to the 0-1 range and scaled to 0-255.
 * @param value - Decimal value between 0 and 1
 * @returns 2-digit uppercase hex string (e.g., "00", "7F", "FF")
 */

const decimalToHex = (value: number): string => {
  // Clamp the value to the range [0, 1]
  if (value < 0) {
    value = 0;
  } else if (value > 1) {
    value = 1;
  }

  // Scale the value to the range 0-255 and convert to hexadecimal
  const hex = Math.round(value * 255)
    .toString(16)
    .padStart(2, '0')
    .toUpperCase();

  return hex;
};

export default decimalToHex;
