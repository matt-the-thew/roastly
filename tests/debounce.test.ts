import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { debounce } from "@/lib/debounce";

describe("debounce", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("does not call fn before the wait has elapsed", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 200);

    debounced();
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(199);
    expect(fn).not.toHaveBeenCalled();
  });

  it("calls fn exactly once after the wait elapses", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 200);

    debounced();
    vi.advanceTimersByTime(200);

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("collapses rapid successive calls into a single trailing call", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 200);

    debounced();
    vi.advanceTimersByTime(100);
    debounced();
    vi.advanceTimersByTime(100);
    debounced();
    vi.advanceTimersByTime(100);

    // The timer keeps resetting, so nothing fires yet.
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(200);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("invokes fn with the arguments from the latest call", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 200);

    debounced("first");
    debounced("second");
    debounced("third");

    vi.advanceTimersByTime(200);

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith("third");
  });

  it("forwards all arguments to fn", () => {
    const fn = vi.fn<(a: number, b: string, c: boolean) => void>();
    const debounced = debounce(fn, 50);

    debounced(1, "two", true);
    vi.advanceTimersByTime(50);

    expect(fn).toHaveBeenCalledWith(1, "two", true);
  });

  it("allows a fresh call after a completed debounce cycle", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    debounced("a");
    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenNthCalledWith(1, "a");

    debounced("b");
    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenNthCalledWith(2, "b");
    expect(fn).toHaveBeenCalledTimes(2);
  });
});
