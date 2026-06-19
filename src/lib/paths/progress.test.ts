import { describe, expect, it } from "vitest";
import { computePathProgress } from "./progress";

describe("computePathProgress", () => {
  it("returns a zero ratio for an empty path", () => {
    const progress = computePathProgress([], new Set());
    expect(progress).toEqual({ total: 0, completed: 0, ratio: 0 });
  });

  it("counts completed lessons and computes the ratio", () => {
    const progress = computePathProgress(["a", "b", "c", "d"], new Set(["a", "c"]));
    expect(progress.total).toBe(4);
    expect(progress.completed).toBe(2);
    expect(progress.ratio).toBe(0.5);
  });

  it("ignores completed ids that are not part of the path", () => {
    const progress = computePathProgress(["a", "b"], new Set(["a", "x", "y"]));
    expect(progress.completed).toBe(1);
  });
});
