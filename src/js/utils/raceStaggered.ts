type StaggeredTask<T> = {
  /**
   * How long to wait (in ms) before starting this task, unless every task before it has already
   * failed
   */
  delay: number;
  /** Starts the task. The signal is aborted once another task succeeds */
  run: (signal: AbortSignal) => Promise<T>;
};

/**
 * Races tasks that start in a staggered order, resolving with the first to succeed. Each task
 * starts after its delay, or as soon as every task before it in the array has failed, whichever
 * comes first. Once one succeeds, tasks still waiting are skipped and those in progress are
 * aborted. Rejects when every task fails.
 *
 * @param tasks - Tasks in order of preference
 * @returns A promise that resolves with the value from the first successful task
 */

const raceStaggered = <T>(tasks: StaggeredTask<T>[]): Promise<T> => {
  return new Promise<T>((resolve, reject) => {
    if (tasks.length === 0) {
      reject(new Error('No tasks provided to raceStaggered'));
      return;
    }

    const controller = new AbortController();
    const timers: ReturnType<typeof setTimeout>[] = [];
    const started = tasks.map(() => false);
    const failed = tasks.map(() => false);
    let failedCount = 0;
    let firstNotFailed = 0;
    let settled = false;

    const finish = () => {
      settled = true;
      timers.forEach((timer) => clearTimeout(timer));
    };

    const start = (index: number) => {
      if (settled || started[index]) return;
      started[index] = true;
      clearTimeout(timers[index]);

      // Wrapped so a task that throws synchronously counts as a failure
      Promise.resolve()
        .then(() => tasks[index].run(controller.signal))
        .then(
          (value) => {
            if (settled) return;
            finish();
            controller.abort();
            resolve(value);
          },
          () => {
            if (settled) return;
            failed[index] = true;
            failedCount++;
            if (failedCount === tasks.length) {
              finish();
              reject(new Error(`All ${tasks.length} tasks failed`));
              return;
            }
            // Start the next task early if every task before it has now failed
            while (failed[firstNotFailed]) firstNotFailed++;
            start(firstNotFailed);
          }
        );
    };

    tasks.forEach(({ delay }, index) => {
      if (delay > 0) timers[index] = setTimeout(() => start(index), delay);
      else start(index);
    });
  });
};

export default raceStaggered;
