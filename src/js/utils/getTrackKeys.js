const getTrackKeys = (n, isShuffle) => {
  return isShuffle ? getShuffledTrackKeys(n) : Array.from({ length: n }, (_, i) => i);
};

const getShuffledTrackKeys = (n) => {
  const array = Array.from({ length: n }, (_, i) => i);
  return doShuffle(array);
};

// shuffle the array and avoid adjacent elements
const doShuffle = (array) => {
  array.sort(() => Math.random() - 0.5); // First, shuffle the array

  for (let i = 1; i < array.length; i++) {
    if (array[i] === array[i - 1] + 1 || array[i] === array[i - 1] - 1) {
      let swapIndex = i;
      while (swapIndex === i || array[swapIndex] === array[i - 1] + 1 || array[swapIndex] === array[i - 1] - 1) {
        swapIndex = Math.floor(Math.random() * array.length);
      }
      [array[i], array[swapIndex]] = [array[swapIndex], array[i]];
    }
  }

  return array;
};

export default getTrackKeys;
