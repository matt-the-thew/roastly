import { vi, it, expect, describe, beforeEach } from "vitest";
import { fetchLocations, fetchLocationsInBounds } from "@/lib/fetchLocations";
import {
  mockSupabaseClient,
  browserClient,
  createQueryBuilder,
} from "@/__mocks__/supabase/supabaseClient";

const fromMock = mockSupabaseClient.from as ReturnType<typeof vi.fn>;

describe("fetchLocations", async () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a supabase client", async () => {
    await fetchLocations();
    expect(browserClient).toHaveBeenCalled();
    expect(mockSupabaseClient).toBeDefined();
  });

  it("returns data from cafe_list_view on success", async () => {
    const rows = [{ id: "c1", name: "Cafe One" }];
    fromMock.mockReturnValue(createQueryBuilder({ data: rows, error: null }));

    const result = await fetchLocations();

    expect(fromMock).toHaveBeenCalledWith("cafe_list_view");
    expect(result).toEqual(rows);
  });

  it("returns [] when the query resolves an error", async () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    fromMock.mockReturnValue(
      createQueryBuilder({ data: null, error: { message: "boom" } }),
    );

    const result = await fetchLocations();

    expect(result).toEqual([]);
    spy.mockRestore();
  });
});

describe("fetchLocationsInBounds", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("applies gte/lte lat/lng filters and returns data", async () => {
    const rows = [{ id: "c2", name: "In Bounds" }];
    const builder = createQueryBuilder({ data: rows, error: null });
    fromMock.mockReturnValue(builder);

    const bounds = { minLat: 1, maxLat: 2, minLng: 3, maxLng: 4 };
    const result = await fetchLocationsInBounds(bounds);

    expect(fromMock).toHaveBeenCalledWith("cafe_list_view");
    expect(builder.gte).toHaveBeenCalledWith("latitude", 1);
    expect(builder.lte).toHaveBeenCalledWith("latitude", 2);
    expect(builder.gte).toHaveBeenCalledWith("longitude", 3);
    expect(builder.lte).toHaveBeenCalledWith("longitude", 4);
    expect(result).toEqual(rows);
  });

  it("returns [] when the query resolves an error", async () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    fromMock.mockReturnValue(
      createQueryBuilder({ data: null, error: { message: "bad bounds" } }),
    );

    const result = await fetchLocationsInBounds({
      minLat: 0,
      maxLat: 0,
      minLng: 0,
      maxLng: 0,
    });

    expect(result).toEqual([]);
    spy.mockRestore();
  });
});
