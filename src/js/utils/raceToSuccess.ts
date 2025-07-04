/**
 * Returns a promise that resolves when the first input promise resolves,
 * or rejects when all input promises reject.
 *
 * @param promises - An array of promises to race
 * @returns A promise that resolves with the value from the first resolved promise
 */

const raceToSuccess = <T>(promises: Promise<T>[]): Promise<T> => {
  return new Promise<T>((resolve, reject) => {
    let count = promises.length;

    if (count === 0) {
      reject(new Error('No promises provided to raceToSuccess'));
      return;
    }

    promises.forEach((promise) => {
      promise
        .then(resolve) // if a promise resolves, resolve the main promise
        .catch(() => {
          count--; // if a promise rejects, decrease the count
          if (count === 0) {
            // if all promises have rejected, reject with a generic error
            reject(new Error(`All ${promises.length} promises failed`));
          }
        });
    });
  });
};

export default raceToSuccess;
