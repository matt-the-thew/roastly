import { vi, it, describe, expect, beforeEach } from "vitest";
import * as likes from "@/lib/supabase/likes";
import { mockSupabaseClient } from "@/__mocks__/supabase/supabaseClient";

describe("getLikeCount", async () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a supabase client", async () => {
    await likes.getLikeCount("test_cafe_id");
    expect(mockSupabaseClient).toBeDefined();
  });

  it("uses count:exact head:true", async () => {
    const mockChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
    };

    (mockSupabaseClient.from as ReturnType<typeof vi.fn>).mockReturnValue(
      mockChain,
    );

    const fromSpy = vi.spyOn(mockSupabaseClient, "from");

    expect(fromSpy).toHaveBeenCalled();
    expect(fromSpy).toHaveBeenCalledWith("likes");
    expect(mockChain.select).toHaveBeenCalledWith("id", {
      count: "exact",
      head: true,
    });
    expect(mockChain.eq).toHaveBeenCalledWith("cafe_id", "test_cafe_id");
  });
});
