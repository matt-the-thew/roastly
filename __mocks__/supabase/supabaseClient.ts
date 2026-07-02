import { vi } from "vitest";

// A chainable, awaitable stand-in for the Supabase PostgREST query builder.
// Every filter/modifier method returns `this`, so any chain length works, and
// the object is thenable so `await supabase.from(...).select()...` resolves to
// a { data, error } result. Terminal methods (single/maybeSingle) resolve too.
//
// Tests that care about a specific return value should override `from` with a
// purpose-built chain (see tests/profile.test.ts) rather than relying on this
// default, which always resolves to { data: null, error: null }.
export function createQueryBuilder(
  result: { data: unknown; error: unknown } = { data: null, error: null },
) {
  const builder: Record<string, unknown> = {};
  const chainMethods = [
    "select",
    "insert",
    "update",
    "upsert",
    "delete",
    "eq",
    "neq",
    "gt",
    "gte",
    "lt",
    "lte",
    "is",
    "in",
    "or",
    "and",
    "match",
    "contains",
    "like",
    "ilike",
    "filter",
    "order",
    "limit",
    "range",
  ];
  for (const name of chainMethods) {
    builder[name] = vi.fn(() => builder);
  }
  builder.single = vi.fn().mockResolvedValue(result);
  builder.maybeSingle = vi.fn().mockResolvedValue(result);
  // thenable: `await builder` and `Promise.all([builder])` resolve to `result`
  builder.then = (
    onFulfilled: (value: typeof result) => unknown,
    onRejected?: (reason: unknown) => unknown,
  ) => Promise.resolve(result).then(onFulfilled, onRejected);
  return builder;
}

export const mockSupabaseClient = {
  auth: {
    getSession: vi.fn(),
    getUser: vi.fn(),
    getClaims: vi.fn(),
    signInWithPassword: vi.fn(),
    signInWithOAuth: vi.fn(),
    signInAnonymously: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    onAuthStateChange: vi.fn(() => ({
      data: { subscription: { unsubscribe: vi.fn() } },
    })),
  },
  from: vi.fn(() => createQueryBuilder()),
  // Postgres RPC (get_or_create_conversation, etc.)
  rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
  // Realtime: channel(name).on(...).subscribe() returns the channel; the
  // client also exposes removeChannel(channel) for teardown.
  channel: vi.fn(() => {
    const channel: Record<string, unknown> = {};
    channel.on = vi.fn(() => channel);
    channel.subscribe = vi.fn(() => channel);
    channel.unsubscribe = vi.fn(() => channel);
    return channel;
  }),
  removeChannel: vi.fn(),
  storage: {
    from: vi.fn(() => ({
      getPublicUrl: vi.fn((path: string) => ({
        data: { publicUrl: `https://mock.storage/${path}` },
      })),
      upload: vi.fn().mockResolvedValue({ data: null, error: null }),
      remove: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
  },
};

export const browserClient = vi.fn(() => mockSupabaseClient);
// Some modules import the service-role/server client factories; point them at
// the same mock so nothing reaches a real network client under test.
export const createClient = vi.fn(() => mockSupabaseClient);
