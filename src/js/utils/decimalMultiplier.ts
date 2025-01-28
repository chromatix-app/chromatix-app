const decimalMultiplier = (multiplier: number, value: number, decimalPlaces: number = 5): number => {
  if (value < 0 || value > 1) {
    throw new Error('Value must be between 0 and 1');
  }

  if (multiplier === 1) {
    return value;
  }

  const result = 1 - Math.pow(1 - value, multiplier);
  const factor = Math.pow(10, decimalPlaces);
  return Math.round(result * factor) / factor;
};

// console.log('------');
// console.log(decimalMultiplier(1, 0.1));
// console.log(decimalMultiplier(1, 0.2));
// console.log(decimalMultiplier(1, 0.3));
// console.log(decimalMultiplier(1, 0.4));
// console.log(decimalMultiplier(1, 0.5));
// console.log(decimalMultiplier(1, 0.6));
// console.log(decimalMultiplier(1, 0.7));
// console.log(decimalMultiplier(1, 0.8));
// console.log(decimalMultiplier(1, 0.9));
// console.log(decimalMultiplier(1, 1));

// console.log('------');
// console.log(decimalMultiplier(1.5, 0.1));
// console.log(decimalMultiplier(1.5, 0.2));
// console.log(decimalMultiplier(1.5, 0.3));
// console.log(decimalMultiplier(1.5, 0.4));
// console.log(decimalMultiplier(1.5, 0.5));
// console.log(decimalMultiplier(1.5, 0.6));
// console.log(decimalMultiplier(1.5, 0.7));
// console.log(decimalMultiplier(1.5, 0.8));
// console.log(decimalMultiplier(1.5, 0.9));
// console.log(decimalMultiplier(1.5, 1));

// console.log('------');
// console.log(decimalMultiplier(2, 0.1));
// console.log(decimalMultiplier(2, 0.2));
// console.log(decimalMultiplier(2, 0.3));
// console.log(decimalMultiplier(2, 0.4));
// console.log(decimalMultiplier(2, 0.5));
// console.log(decimalMultiplier(2, 0.6));
// console.log(decimalMultiplier(2, 0.7));
// console.log(decimalMultiplier(2, 0.8));
// console.log(decimalMultiplier(2, 0.9));
// console.log(decimalMultiplier(2, 1));

// console.log('------');
// console.log(decimalMultiplier(5, 0.1));
// console.log(decimalMultiplier(5, 0.2));
// console.log(decimalMultiplier(5, 0.3));
// console.log(decimalMultiplier(5, 0.4));
// console.log(decimalMultiplier(5, 0.5));
// console.log(decimalMultiplier(5, 0.6));
// console.log(decimalMultiplier(5, 0.7));
// console.log(decimalMultiplier(5, 0.8));
// console.log(decimalMultiplier(5, 0.9));
// console.log(decimalMultiplier(5, 1));

export default decimalMultiplier;
