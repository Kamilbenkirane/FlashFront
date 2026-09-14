// Serializes async read-modify-write sequences so two callers can never
// interleave between reading a stored value and writing it back.
export const createAsyncLock = () => {
  let tail: Promise<unknown> = Promise.resolve();

  return <T>(task: () => Promise<T>): Promise<T> => {
    const run = tail.then(task, task);
    tail = run.then(
      () => undefined,
      () => undefined,
    );
    return run;
  };
};
