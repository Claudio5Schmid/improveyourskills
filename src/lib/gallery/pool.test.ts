import { describe, expect, it } from "vitest";
import { runWithConcurrency } from "./pool";

describe("runWithConcurrency", () => {
  it("processes every item and returns results in original order", async () => {
    const items = [5, 1, 4, 2, 3];
    const results = await runWithConcurrency(items, 2, async (n) => n * 10);
    expect(results).toEqual([50, 10, 40, 20, 30]);
  });

  it("never runs more than `limit` tasks at once", async () => {
    let active = 0;
    let maxActive = 0;
    const items = Array.from({ length: 10 }, (_, i) => i);

    await runWithConcurrency(items, 3, async (n) => {
      active++;
      maxActive = Math.max(maxActive, active);
      await new Promise((resolve) => setTimeout(resolve, 5));
      active--;
      return n;
    });

    expect(maxActive).toBeLessThanOrEqual(3);
  });

  it("handles an empty list", async () => {
    const results = await runWithConcurrency([], 3, async (n: number) => n);
    expect(results).toEqual([]);
  });

  it("handles limit larger than the item count", async () => {
    const results = await runWithConcurrency([1, 2], 10, async (n) => n + 1);
    expect(results).toEqual([2, 3]);
  });

  it("propagates a task error", async () => {
    await expect(
      runWithConcurrency([1, 2, 3], 2, async (n) => {
        if (n === 2) throw new Error("boom");
        return n;
      })
    ).rejects.toThrow("boom");
  });
});
