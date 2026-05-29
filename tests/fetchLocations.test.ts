import { vi, it, expect, describe } from "vitest";
import { fetchLocations } from "@/lib/fetchLocations";
import {
  mockSupabaseClient,
  createClient,
} from "@/__mocks__/supabase/supabaseClient";

describe("fetchLocations", async () => {
  it("creates a supabase client", async () => {
    await fetchLocations();
    expect(createClient).toHaveBeenCalled();
    expect(mockSupabaseClient).toBeDefined();
  });
});
