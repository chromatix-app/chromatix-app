// Tests generated using AI

import raceStaggered from './raceStaggered';

// ======================================================================
// HELPERS
// ======================================================================

/** A task that settles after `duration` ms, recording when it started and whether it was aborted. */
const createTask = (delay: number, duration: number, outcome: 'resolve' | 'reject', value = 'ok') => {
  const task = {
    delay,
    startedAt: null as number | null,
    signal: null as AbortSignal | null,
    run: (signal: AbortSignal) => {
      task.startedAt = Date.now();
      task.signal = signal;
      return new Promise<string>((resolve, reject) =>
        setTimeout(() => (outcome === 'resolve' ? resolve(value) : reject(new Error('fail'))), duration)
      );
    },
  };
  return task;
};

const settle = async <T>(promise: Promise<T>) => {
  const settled = promise.then(
    (value) => ({ value }),
    (error: Error) => ({ error })
  );
  await vi.runAllTimersAsync();
  return settled;
};

// ======================================================================
// TESTS
// ======================================================================

describe('Testing "raceStaggered" function', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // EMPTY INPUT

  test('Rejects with an error when given an empty array', async () => {
    await expect(raceStaggered([])).rejects.toThrow('No tasks provided to raceStaggered');
  });

  // RESOLVING

  test('Resolves with the value of a single successful task', async () => {
    expect(await settle(raceStaggered([createTask(0, 10, 'resolve', 'hello')]))).toEqual({ value: 'hello' });
  });

  test('Resolves with whichever task succeeds first, even if it started later', async () => {
    const slow = createTask(0, 5000, 'resolve', 'slow');
    const fast = createTask(1000, 100, 'resolve', 'fast');
    expect(await settle(raceStaggered([slow, fast]))).toEqual({ value: 'fast' });
  });

  test('Lets an earlier task win if it succeeds before a later one starts', async () => {
    const first = createTask(0, 500, 'resolve', 'first');
    const second = createTask(1000, 0, 'resolve', 'second');
    expect(await settle(raceStaggered([first, second]))).toEqual({ value: 'first' });
    expect(second.startedAt).toBeNull();
  });

  // STAGGERED STARTS

  test('Starts each task after its delay while earlier tasks are still pending', async () => {
    const start = Date.now();
    const first = createTask(0, 5000, 'reject');
    const second = createTask(1000, 5000, 'reject');
    const third = createTask(2000, 5000, 'resolve');
    await settle(raceStaggered([first, second, third]));
    expect(first.startedAt).toBe(start);
    expect(second.startedAt).toBe(start + 1000);
    expect(third.startedAt).toBe(start + 2000);
  });

  test('Starts the next task early once every task before it has failed', async () => {
    const start = Date.now();
    const first = createTask(0, 100, 'reject');
    const second = createTask(2000, 0, 'resolve', 'second');
    expect(await settle(raceStaggered([first, second]))).toEqual({ value: 'second' });
    expect(second.startedAt).toBe(start + 100);
  });

  test('Does not start a task early while an earlier task is still pending', async () => {
    const start = Date.now();
    const pending = createTask(0, 5000, 'reject');
    const failing = createTask(0, 100, 'reject');
    const later = createTask(2000, 0, 'resolve');
    await settle(raceStaggered([pending, failing, later]));
    expect(later.startedAt).toBe(start + 2000);
  });

  test('Chains early starts through several quick failures', async () => {
    const start = Date.now();
    const tasks = [createTask(0, 50, 'reject'), createTask(1000, 50, 'reject'), createTask(2000, 0, 'resolve')];
    await settle(raceStaggered(tasks));
    expect(tasks[2].startedAt).toBe(start + 100);
  });

  test('Treats a task that throws synchronously as a failure', async () => {
    const throwing = {
      delay: 0,
      run: () => {
        throw new Error('sync');
      },
    };
    expect(await settle(raceStaggered([throwing, createTask(1000, 0, 'resolve', 'next')]))).toEqual({
      value: 'next',
    });
  });

  // CANCELLATION

  test('Skips tasks still waiting on their delay once one succeeds', async () => {
    const winner = createTask(0, 10, 'resolve');
    const waiting = createTask(1000, 0, 'resolve');
    await settle(raceStaggered([winner, waiting]));
    expect(waiting.startedAt).toBeNull();
  });

  test('Aborts tasks still in progress once one succeeds', async () => {
    const slow = createTask(0, 5000, 'resolve');
    const fast = createTask(100, 10, 'resolve');
    await settle(raceStaggered([slow, fast]));
    expect(slow.signal?.aborted).toBe(true);
  });

  // REJECTING

  test('Rejects with a count once every task has failed', async () => {
    const tasks = [createTask(0, 10, 'reject'), createTask(1000, 10, 'reject'), createTask(2000, 10, 'reject')];
    const { error } = (await settle(raceStaggered(tasks))) as { error: Error };
    expect(error.message).toBe('All 3 tasks failed');
  });

  test('Waits for slow tasks to fail before rejecting', async () => {
    const start = Date.now();
    const result = raceStaggered([createTask(0, 10, 'reject'), createTask(0, 3000, 'reject')]);
    let rejectedAt = 0;
    result.catch(() => (rejectedAt = Date.now()));
    await settle(result);
    expect(rejectedAt).toBe(start + 3000);
  });
});
