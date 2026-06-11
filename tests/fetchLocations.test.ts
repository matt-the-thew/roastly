import { vi, it, expect, describe } from "vitest";
import { fetchLocations } from "@/lib/fetchLocations";
import {
  mockSupabaseClient,
  browserClient,
} from "@/__mocks__/supabase/supabaseClient";

describe("fetchLocations", async () => {
  it("creates a supabase client", async () => {
    await fetchLocations();
    expect(browserClient).toHaveBeenCalled();
    expect(mockSupabaseClient).toBeDefined();
  });
});
