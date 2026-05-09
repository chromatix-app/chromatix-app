// Generated using GitHub Copilot

import raceToSuccess from './raceToSuccess';

describe('Testing "raceToSuccess" function', () => {
  // EMPTY INPUT

  test('Rejects with an error when given an empty array', async () => {
    await expect(raceToSuccess([])).rejects.toThrow('No promises provided to raceToSuccess');
  });

  // SINGLE PROMISE

  test('Resolves with the value of a single resolving promise', async () => {
    await expect(raceToSuccess([Promise.resolve('hello')])).resolves.toBe('hello');
  });

  test('Rejects when the only promise rejects', async () => {
    await expect(raceToSuccess([Promise.reject(new Error('fail'))])).rejects.toThrow('All 1 promises failed');
  });

  // MULTIPLE PROMISES — ALL RESOLVE

  test('Resolves with the value of the first promise to resolve', async () => {
    let resolveSecond!: (value: string) => void;
    const first = Promise.resolve('first');
    const second = new Promise<string>((resolve) => {
      resolveSecond = resolve;
    });
    const result = await raceToSuccess([first, second]);
    resolveSecond('second'); // clean up the dangling promise
    expect(result).toBe('first');
  });

  // MULTIPLE PROMISES — MIX OF RESOLVE AND REJECT

  test('Resolves when at least one promise resolves, ignoring rejections', async () => {
    const fail = Promise.reject(new Error('fail'));
    const succeed = Promise.resolve(42);
    await expect(raceToSuccess([fail, succeed])).resolves.toBe(42);
  });

  test('Resolves even when only the last promise resolves', async () => {
    const fail1 = Promise.reject(new Error('fail 1'));
    const fail2 = Promise.reject(new Error('fail 2'));
    const succeed = Promise.resolve('last hope');
    await expect(raceToSuccess([fail1, fail2, succeed])).resolves.toBe('last hope');
  });

  // MULTIPLE PROMISES — ALL REJECT

  test('Rejects with a count when all promises reject', async () => {
    const promises = [
      Promise.reject(new Error('fail 1')),
      Promise.reject(new Error('fail 2')),
      Promise.reject(new Error('fail 3')),
    ];
    await expect(raceToSuccess(promises)).rejects.toThrow('All 3 promises failed');
  });
});
