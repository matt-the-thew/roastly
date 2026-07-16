import { vi, it, describe, expect, beforeEach } from "vitest";
import {
  getCafeImages,
  getCafeImagesForMany,
  getPublicUrl,
} from "@/lib/supabase/images";
import {
  mockSupabaseClient,
  createQueryBuilder,
} from "@/__mocks__/supabase/supabaseClient";

const fromMock = mockSupabaseClient.from as ReturnType<typeof vi.fn>;

describe("getCafeImages", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("queries cafe_images for the cafe and returns rows", async () => {
    const rows = [
      { id: "i1", cafe_id: "c1", storage_path: "a.jpg", display_order: 0 },
    ];
    const builder = createQueryBuilder({ data: rows, error: null });
    fromMock.mockReturnValue(builder);

    const result = await getCafeImages("c1");

    expect(fromMock).toHaveBeenCalledWith("cafe_images");
    expect(builder.eq).toHaveBeenCalledWith("cafe_id", "c1");
    expect(result).toEqual(rows);
  });

  it("returns [] when data is null", async () => {
    fromMock.mockReturnValue(createQueryBuilder({ data: null, error: null }));
    expect(await getCafeImages("c1")).toEqual([]);
  });
});

describe("getCafeImagesForMany", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns {} without querying for empty input", async () => {
    const result = await getCafeImagesForMany([]);
    expect(result).toEqual({});
    expect(fromMock).not.toHaveBeenCalled();
  });

  it("groups rows into a Record keyed by cafe_id", async () => {
    const rows = [
      { id: "i1", cafe_id: "c1", storage_path: "a.jpg", display_order: 0 },
      { id: "i2", cafe_id: "c1", storage_path: "b.jpg", display_order: 1 },
      { id: "i3", cafe_id: "c2", storage_path: "c.jpg", display_order: 0 },
    ];
    const builder = createQueryBuilder({ data: rows, error: null });
    fromMock.mockReturnValue(builder);

    const result = await getCafeImagesForMany(["c1", "c2"]);

    expect(builder.in).toHaveBeenCalledWith("cafe_id", ["c1", "c2"]);
    expect(Object.keys(result).sort()).toEqual(["c1", "c2"]);
    expect(result.c1).toHaveLength(2);
    expect(result.c1.map((r) => r.id)).toEqual(["i1", "i2"]);
    expect(result.c2.map((r) => r.id)).toEqual(["i3"]);
  });

  it("returns {} when data is null", async () => {
    fromMock.mockReturnValue(createQueryBuilder({ data: null, error: null }));
    expect(await getCafeImagesForMany(["c1"])).toEqual({});
  });
});

describe("getPublicUrl", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the publicUrl from the cafe-images storage bucket", () => {
    const url = getPublicUrl("cafes/c1/photo.jpg");
    expect(mockSupabaseClient.storage.from).toHaveBeenCalledWith("cafe-images");
    expect(url).toBe("https://mock.storage/cafes/c1/photo.jpg");
  });
});
