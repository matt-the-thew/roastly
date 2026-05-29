import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";
import { vi, afterEach } from "vitest";

// mock nextJS metadata
vi.mock("next/headers", () => ({
  cookies: () => ({
    get: (name: string) => ({ value: "mock-cookie-value" }),
    set: vi.fn(),
  }),
}));

// mock supabase client
vi.mock("@/lib/supabase/client", async () => {
  const mock = await import("@/__mocks__/supabase/supabaseClient");
  return mock;
});

// old mock logic for supabase-js library
// done more throughly in __mocks__
vi.mock("@supabase/supabase-js", () => ({
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  eq: vi.fn().mockResolvedValue({
    data: [{ id: 1, name: "mock_data" }],
    error: null,
  }),
  auth: {
    getSession: vi
      .fn()
      .mockResolvedValue({ data: { session: {} }, error: null }),
    onAuthStateChange: vi.fn(() => ({
      data: { subscription: { unsubscribe: vi.fn() } },
    })),
  },
}));

afterEach(() => {
  cleanup();
});
