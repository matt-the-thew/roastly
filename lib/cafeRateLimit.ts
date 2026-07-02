// Client-side rate limiting for the "Load cafes here" button. This is a
// soft deterrent against accidental over-clicking, not a security boundary —
// it lives in localStorage and can be bypassed by clearing storage. If real
// abuse shows up, replace with a server-tracked limiter (e.g. Redis-backed,
// keyed by user/IP) instead of trusting this client-side check.

const STORAGE_KEY = "roastly:load-cafes-clicks";
const MAX_CLICKS = 5;
const WINDOW_MS = 60 * 1000;
const JAIL_MS = 2 * 60 * 1000;

interface RateLimitState {
  clickTimestamps: number[];
  jailUntil: number | null;
}

function readState(): RateLimitState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { clickTimestamps: [], jailUntil: null };
    return JSON.parse(raw) as RateLimitState;
  } catch {
    return { clickTimestamps: [], jailUntil: null };
  }
}

function writeState(state: RateLimitState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export interface RateLimitResult {
  allowed: boolean;
  jailedUntil: number | null;
}

// Call when the user clicks "Load cafes here". Returns whether the click is
// allowed; if not, the caller is in jail until `jailedUntil`.
export function registerLoadCafesClick(now: number = Date.now()): RateLimitResult {
  const state = readState();

  if (state.jailUntil && now < state.jailUntil) {
    return { allowed: false, jailedUntil: state.jailUntil };
  }

  const recentClicks = state.clickTimestamps.filter(
    (t) => now - t < WINDOW_MS,
  );

  if (recentClicks.length >= MAX_CLICKS) {
    const jailUntil = now + JAIL_MS;
    writeState({ clickTimestamps: [], jailUntil });
    return { allowed: false, jailedUntil: jailUntil };
  }

  recentClicks.push(now);
  writeState({ clickTimestamps: recentClicks, jailUntil: null });
  return { allowed: true, jailedUntil: null };
}

// Call on mount/render to check jail status without registering a click.
export function getJailStatus(now: number = Date.now()): {
  jailed: boolean;
  jailedUntil: number | null;
} {
  const state = readState();
  if (state.jailUntil && now < state.jailUntil) {
    return { jailed: true, jailedUntil: state.jailUntil };
  }
  return { jailed: false, jailedUntil: null };
}
