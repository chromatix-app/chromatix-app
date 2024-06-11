// Function to get track keys
const getTrackKeys = (trackCount, playingOrder, isShuffle, firstValue) => {
  // If shuffle is true, return shuffled track keys
  if (isShuffle) {
    return getShuffledTrackKeys(trackCount, firstValue);
  }
  // Else if playingOrder is defined, return the playingOrder
  else if (playingOrder) {
    return playingOrder;
  }
  // Else return an array from 0 to n-1
  else {
    return Array.from({ length: trackCount }, (_, i) => i);
  }
};

// Function to get shuffled track keys
const getShuffledTrackKeys = (n, firstValue) => {
  // Create an array from 0 to n-1
  const array = Array.from({ length: n }, (_, i) => i);
  // Return the shuffled array
  return doShuffle(array, firstValue);
};

// Function to shuffle the array and avoid adjacent elements
const doShuffle = (originalArray, firstValue) => {
  // Create a new copy of the original array
  let newArray = [...originalArray];

  // Make sure firstValue is at the beginning of the array, if applicable
  if (firstValue !== undefined && firstValue !== null) {
    // Find the index of firstValue in the array
    const firstValueIndex = newArray.indexOf(firstValue);
    // If firstValue exists in the array, swap it with the first element
    if (firstValueIndex !== -1) {
      [newArray[0], newArray[firstValueIndex]] = [newArray[firstValueIndex], newArray[0]];
    }
  }

  // Shuffle the array, excluding the first value if applicable
  const shuffleStartIndex = firstValue !== undefined && firstValue !== null ? 1 : 0;
  const shuffledArray = shuffleArray(newArray.slice(shuffleStartIndex));

  // Try to make sure no adjacent elements are next to each other
  for (let i = 1; i < shuffledArray.length; i++) {
    // If the current element and the previous element are adjacent
    if (shuffledArray[i] === shuffledArray[i - 1] + 1 || shuffledArray[i] === shuffledArray[i - 1] - 1) {
      let swapIndex = i;
      let counter = 0; // Add a counter
      const maxTries = shuffledArray.length * 2; // Maximum number of tries

      // Find a non-adjacent element to swap with
      while (
        (swapIndex === i ||
          shuffledArray[swapIndex] === shuffledArray[i - 1] + 1 ||
          shuffledArray[swapIndex] === shuffledArray[i - 1] - 1) &&
        counter < maxTries // Add a condition to limit the number of tries
      ) {
        swapIndex = Math.floor(Math.random() * shuffledArray.length);
        counter++; // Increment the counter
      }

      // If a non-adjacent element is found, swap the elements
      if (counter < maxTries) {
        [shuffledArray[i], shuffledArray[swapIndex]] = [shuffledArray[swapIndex], shuffledArray[i]];
      }
    }
  }

  // Create our final array, by combining the first value (if applicable) and the shuffled array
  newArray = firstValue !== undefined && firstValue !== null ? [newArray[0], ...shuffledArray] : shuffledArray;

  // If the shuffled array is shorter than the original array, add the missing values back to the array
  // (This shouldn't happen, but is here as a failsafe just in case)
  if (newArray.length < originalArray.length) {
    // Find the missing values
    const missingValues = originalArray.filter((i) => !newArray.includes(i));
    // Shuffle the missing values
    const shuffledMissingValues = shuffleArray(missingValues);
    // Add the missing values to the end of the array
    newArray = [...newArray, ...shuffledMissingValues];
  }

  // Return the new array
  return newArray;
};

// Fisher-Yates (aka Knuth) Shuffle
const shuffleArray = (array) => {
  let currentIndex = array.length,
    temporaryValue,
    randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
};

// Export the getTrackKeys function
export default getTrackKeys;
