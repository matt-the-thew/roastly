import { vi, describe, it, expect, beforeEach } from "vitest";
import { createServerClient } from "@supabase/ssr";
import { SessionHandler } from "@/lib/supabase/sessionhandler";
import { mockSupabaseClient } from "@/__mocks__/supabase/supabaseClient";
import type { NextRequest } from "next/server";

// Minimal NextRequest stand-in: updateSession only touches request.cookies.
function makeRequest(): NextRequest {
  return {
    cookies: {
      getAll: vi.fn(() => [{ name: "sb-token", value: "abc" }]),
      set: vi.fn(),
    },
  } as unknown as NextRequest;
}

describe("SessionHandler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("stores the supabase url and publishable key on construction", () => {
    const handler = new SessionHandler("https://proj.supabase.co", "pub-key");
    // constructing must not throw and user starts undefined
    expect(handler).toBeInstanceOf(SessionHandler);
    expect(handler.user).toBeUndefined();
  });

  it("constructs a server client with the configured credentials", async () => {
    (
      mockSupabaseClient.auth as unknown as {
        getClaims: ReturnType<typeof vi.fn>;
      }
    ).getClaims = vi.fn().mockResolvedValue({ data: { claims: {} } });

    const handler = new SessionHandler("https://proj.supabase.co", "pub-key");
    await handler.updateSession(makeRequest());

    expect(createServerClient).toHaveBeenCalledWith(
      "https://proj.supabase.co",
      "pub-key",
      expect.objectContaining({ cookies: expect.any(Object) }),
    );
  });

  it("refreshes the session and populates user claims", async () => {
    const claims = { sub: "user-123", email: "a@b.com" };
    (
      mockSupabaseClient.auth as unknown as {
        getClaims: ReturnType<typeof vi.fn>;
      }
    ).getClaims = vi.fn().mockResolvedValue({ data: { claims } });

    const handler = new SessionHandler("https://proj.supabase.co", "pub-key");
    const response = await handler.updateSession(makeRequest());

    expect(mockSupabaseClient.auth.getClaims).toHaveBeenCalled();
    expect(handler.user).toEqual(claims);
    // updateSession returns a NextResponse on the happy path
    expect(response).toBeDefined();
  });

  it("swallows errors and leaves user undefined when getClaims throws", async () => {
    (
      mockSupabaseClient.auth as unknown as {
        getClaims: ReturnType<typeof vi.fn>;
      }
    ).getClaims = vi.fn().mockRejectedValue(new Error("network down"));

    const handler = new SessionHandler("https://proj.supabase.co", "pub-key");
    const response = await handler.updateSession(makeRequest());

    expect(handler.user).toBeUndefined();
    // catch branch returns void
    expect(response).toBeUndefined();
  });

  it("wires cookie getAll/setAll callbacks that read from and write to the request", async () => {
    (
      mockSupabaseClient.auth as unknown as {
        getClaims: ReturnType<typeof vi.fn>;
      }
    ).getClaims = vi.fn().mockResolvedValue({ data: { claims: {} } });

    const request = makeRequest();
    const handler = new SessionHandler("https://proj.supabase.co", "pub-key");
    await handler.updateSession(request);

    // grab the cookies config object handed to the (mocked) server client
    const cookiesConfig = (
      createServerClient as unknown as ReturnType<typeof vi.fn>
    ).mock.calls[0][2].cookies as {
      getAll: () => unknown;
      setAll: (
        c: Array<{ name: string; value: string; options?: unknown }>,
      ) => void;
    };

    // getAll must delegate to the request's cookie store
    const all = cookiesConfig.getAll();
    expect(request.cookies.getAll).toHaveBeenCalled();
    expect(all).toEqual([{ name: "sb-token", value: "abc" }]);

    // setAll must push each cookie back onto the request
    cookiesConfig.setAll([
      { name: "sb-access", value: "tok1", options: { path: "/" } },
      { name: "sb-refresh", value: "tok2", options: { path: "/" } },
    ]);
    expect(request.cookies.set).toHaveBeenCalledWith("sb-access", "tok1");
    expect(request.cookies.set).toHaveBeenCalledWith("sb-refresh", "tok2");
  });
});
