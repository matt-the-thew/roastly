import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";
import { vi, afterEach } from "vitest";

// This jsdom setup does not expose a real localStorage (Node's built-in is
// disabled without --localstorage-file). Provide a minimal in-memory Storage
// shim so client-side code that reads/writes localStorage (e.g.
// lib/cafeRateLimit.ts) can be unit tested. Cleared after every test.
if (typeof globalThis.localStorage === "undefined") {
  const store = new Map<string, string>();
  const localStorageShim: Storage = {
    get length() {
      return store.size;
    },
    clear: () => store.clear(),
    getItem: (key: string) => (store.has(key) ? store.get(key)! : null),
    key: (index: number) => Array.from(store.keys())[index] ?? null,
    removeItem: (key: string) => void store.delete(key),
    setItem: (key: string, value: string) => void store.set(key, String(value)),
  };
  Object.defineProperty(globalThis, "localStorage", {
    value: localStorageShim,
    configurable: true,
    writable: true,
  });
}

// mock nextJS metadata
vi.mock("next/headers", () => ({
  cookies: () => ({
    get: () => ({ value: "mock-cookie-value" }),
    set: vi.fn(),
  }),
}));

// mock supabase client
vi.mock("@/lib/supabase/client", async () => {
  const mock = await import("@/__mocks__/supabase/supabaseClient");
  return mock;
});

// mock the raw supabase-js library. `createClient` (used by the service-role
// client) and `createBrowserClient` return the shared mock client so nothing
// under test reaches a real network client. Type-only exports (OAuthResponse,
// UserResponse, SupabaseClient, ...) are erased at compile time, so re-exporting
// just the runtime factories is enough.
vi.mock("@supabase/supabase-js", async () => {
  const { mockSupabaseClient } = await import(
    "@/__mocks__/supabase/supabaseClient"
  );
  return {
    createClient: vi.fn(() => mockSupabaseClient),
  };
});

vi.mock("@supabase/ssr", async () => {
  const { mockSupabaseClient } = await import(
    "@/__mocks__/supabase/supabaseClient"
  );
  return {
    createBrowserClient: vi.fn(() => mockSupabaseClient),
    createServerClient: vi.fn(() => mockSupabaseClient),
  };
});

afterEach(() => {
  cleanup();
  globalThis.localStorage?.clear();
});
