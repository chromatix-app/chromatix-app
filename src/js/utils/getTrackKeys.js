// Function to get track keys
const getTrackKeys = (n, isShuffle, firstValue) => {
  // If shuffle is true, return shuffled track keys, else return an array from 0 to n-1
  return isShuffle ? getShuffledTrackKeys(n, firstValue) : Array.from({ length: n }, (_, i) => i);
};

// Function to get shuffled track keys
const getShuffledTrackKeys = (n, firstValue) => {
  // Create an array from 0 to n-1
  const array = Array.from({ length: n }, (_, i) => i);
  // Return the shuffled array
  return doShuffle(array, firstValue);
};

// Function to shuffle the array and avoid adjacent elements
const doShuffle = (array, firstValue) => {
  // If firstValue is provided and not null
  if (firstValue !== undefined && firstValue !== null) {
    // Find the index of firstValue in the array
    const firstValueIndex = array.indexOf(firstValue);
    // If firstValue exists in the array, swap it with the first element
    if (firstValueIndex !== -1) {
      [array[0], array[firstValueIndex]] = [array[firstValueIndex], array[0]];
    }
  }

  // Shuffle the array excluding the first element if firstValue is provided and not null
  const shuffleStartIndex = firstValue !== undefined && firstValue !== null ? 1 : 0;
  const shuffledPart = array.slice(shuffleStartIndex).sort(() => Math.random() - 0.5);
  array = firstValue !== undefined && firstValue !== null ? [array[0], ...shuffledPart] : shuffledPart;

  // Determine the starting index for the loop
  let startIndex = firstValue !== undefined ? 2 : 1;

  // Loop through the array starting from the determined index
  for (let i = startIndex; i < array.length; i++) {
    // If the current element and the previous element are adjacent
    if (array[i] === array[i - 1] + 1 || array[i] === array[i - 1] - 1) {
      let swapIndex = i;
      // Find a non-adjacent element to swap with
      while (swapIndex === i || array[swapIndex] === array[i - 1] + 1 || array[swapIndex] === array[i - 1] - 1) {
        swapIndex = Math.floor(Math.random() * array.length);
      }
      // Swap the current element with the non-adjacent element
      [array[i], array[swapIndex]] = [array[swapIndex], array[i]];
    }
  }

  // Return the shuffled array
  return array;
};

// Export the getTrackKeys function
export default getTrackKeys;
