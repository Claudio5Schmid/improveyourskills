/**
 * Run async tasks with a maximum concurrency, resolving each result at its
 * own index (order-preserving) regardless of finish order. Generic and
 * dependency-free so the scheduling itself is unit-testable without touching
 * uploads or the DOM.
 *
 * Used to cap how many photos are being resized/uploaded at once — the plan
 * flags "compression on a weak laptop" as a real risk; unbounded parallelism
 * across 30 photos would make that worse, not better.
 */
export async function runWithConcurrency<T, R>(
  items: readonly T[],
  limit: number,
  task: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let cursor = 0;

  async function worker(): Promise<void> {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await task(items[index], index);
    }
  }

  const workerCount = Math.max(1, Math.min(limit, items.length));
  await Promise.all(Array.from({ length: workerCount }, worker));
  return results;
}
