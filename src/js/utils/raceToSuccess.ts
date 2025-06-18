/**
 * Returns a promise that resolves when the first input promise resolves,
 * or rejects when all input promises reject.
 *
 * @param promises - An array of promises to race
 * @param errorMessage - Optional custom error message if all promises fail
 * @returns A promise that resolves with the value from the first resolved promise
 */

const raceToSuccess = <T>(promises: Promise<T>[], errorMessage?: string | Error): Promise<T> => {
  return new Promise<T>((resolve, reject) => {
    let count = promises.length;

    if (count === 0) {
      reject(errorMessage || new Error('No promises provided to raceToSuccess'));
      return;
    }

    promises.forEach((promise) => {
      promise
        .then(resolve) // if a promise resolves, resolve the main promise
        .catch((error: Error) => {
          count--; // if a promise rejects, decrease the count
          if (count === 0) {
            // if all promises have rejected, reject the main promise
            reject(errorMessage || error);
          }
        });
    });
  });
};

export default raceToSuccess;
