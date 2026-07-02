import { describe, it, expect, beforeEach, beforeAll, afterAll } from "vitest";
import {
  registerLoadCafesClick,
  getJailStatus,
} from "@/lib/cafeRateLimit";

const STORAGE_KEY = "roastly:load-cafes-clicks";
const WINDOW_MS = 60 * 1000;
const JAIL_MS = 2 * 60 * 1000;
const MAX_CLICKS = 5;

// This jsdom config does not expose a working `localStorage` global (Node's
// built-in is disabled and jsdom's window.localStorage isn't wired up), so the
// module-under-test — which reads the bare `localStorage` global — has nothing
// to talk to. Provide a minimal in-memory Storage from the test file only
// (no source/config changes) so we can exercise the real read/write behavior.
class MemoryStorage implements Storage {
  private store = new Map<string, string>();
  get length() {
    return this.store.size;
  }
  clear() {
    this.store.clear();
  }
  getItem(key: string) {
    return this.store.has(key) ? this.store.get(key)! : null;
  }
  key(index: number) {
    return Array.from(this.store.keys())[index] ?? null;
  }
  removeItem(key: string) {
    this.store.delete(key);
  }
  setItem(key: string, value: string) {
    this.store.set(key, String(value));
  }
}

let hadLocalStorage: boolean;
let originalLocalStorage: Storage | undefined;

describe("cafeRateLimit", () => {
  beforeAll(() => {
    hadLocalStorage = "localStorage" in globalThis;
    originalLocalStorage = (globalThis as { localStorage?: Storage })
      .localStorage;
    if (typeof (globalThis as { localStorage?: Storage }).localStorage !==
      "object" ||
      (globalThis as { localStorage?: Storage }).localStorage == null) {
      (globalThis as { localStorage?: Storage }).localStorage =
        new MemoryStorage();
    }
  });

  afterAll(() => {
    if (hadLocalStorage) {
      (globalThis as { localStorage?: Storage }).localStorage =
        originalLocalStorage;
    } else {
      delete (globalThis as { localStorage?: Storage }).localStorage;
    }
  });

  beforeEach(() => {
    localStorage.clear();
  });

  it("allows the first click", () => {
    const result = registerLoadCafesClick(1000);
    expect(result).toEqual({ allowed: true, jailedUntil: null });
  });

  it("allows up to MAX_CLICKS (5) within the 60s window", () => {
    const base = 1000;
    for (let i = 0; i < MAX_CLICKS; i++) {
      // Spread clicks across the window but keep them all recent.
      const result = registerLoadCafesClick(base + i * 1000);
      expect(result.allowed).toBe(true);
      expect(result.jailedUntil).toBeNull();
    }
  });

  it("denies the 6th within-window click and jails ~2min out", () => {
    const base = 1000;
    for (let i = 0; i < MAX_CLICKS; i++) {
      registerLoadCafesClick(base + i * 1000);
    }
    const sixthTime = base + MAX_CLICKS * 1000;
    const result = registerLoadCafesClick(sixthTime);

    expect(result.allowed).toBe(false);
    expect(result.jailedUntil).toBe(sixthTime + JAIL_MS);
  });

  it("denies further clicks while jailed", () => {
    const base = 1000;
    for (let i = 0; i < MAX_CLICKS; i++) {
      registerLoadCafesClick(base + i * 1000);
    }
    const sixthTime = base + MAX_CLICKS * 1000;
    const jailResult = registerLoadCafesClick(sixthTime);
    const jailedUntil = jailResult.jailedUntil!;

    // A click one second into jail is still denied against the same jailUntil.
    const duringJail = registerLoadCafesClick(sixthTime + 1000);
    expect(duringJail.allowed).toBe(false);
    expect(duringJail.jailedUntil).toBe(jailedUntil);
  });

  it("does not count clicks older than the window toward the limit", () => {
    const start = 1000;
    // 5 old clicks, all more than 60s before the new click.
    for (let i = 0; i < MAX_CLICKS; i++) {
      registerLoadCafesClick(start + i * 100);
    }
    // Now click well past the window so the old ones expire.
    const laterClick = start + WINDOW_MS + 5000;
    const result = registerLoadCafesClick(laterClick);
    expect(result.allowed).toBe(true);
    expect(result.jailedUntil).toBeNull();
  });

  it("getJailStatus reports jailed=true during jail and false after expiry", () => {
    const base = 1000;
    for (let i = 0; i < MAX_CLICKS; i++) {
      registerLoadCafesClick(base + i * 1000);
    }
    const sixthTime = base + MAX_CLICKS * 1000;
    const jailResult = registerLoadCafesClick(sixthTime);
    const jailedUntil = jailResult.jailedUntil!;

    // Mid-jail.
    const during = getJailStatus(sixthTime + 1000);
    expect(during.jailed).toBe(true);
    expect(during.jailedUntil).toBe(jailedUntil);

    // Exactly at jailedUntil: jail has elapsed (now < jailUntil is false).
    const atExpiry = getJailStatus(jailedUntil);
    expect(atExpiry.jailed).toBe(false);
    expect(atExpiry.jailedUntil).toBeNull();

    // Well after expiry.
    const after = getJailStatus(jailedUntil + 10000);
    expect(after.jailed).toBe(false);
    expect(after.jailedUntil).toBeNull();
  });

  it("returns a clean default when localStorage holds corrupt JSON", () => {
    localStorage.setItem(STORAGE_KEY, "{ not valid json");
    // readState swallows the parse error and treats it as empty state.
    const result = registerLoadCafesClick(1000);
    expect(result).toEqual({ allowed: true, jailedUntil: null });

    const status = getJailStatus(1000);
    expect(status).toEqual({ jailed: false, jailedUntil: null });
  });

  it("treats missing localStorage entry as empty state", () => {
    // Nothing written; STORAGE_KEY absent.
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    const status = getJailStatus(5000);
    expect(status).toEqual({ jailed: false, jailedUntil: null });
  });
});
