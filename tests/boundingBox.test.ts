import { describe, it, expect } from "vitest";
import {
  expandBounds,
  isBoundsContained,
  isCoveredByAny,
  BOUNDS_BUFFER_RATIO,
  type BoundingBox,
} from "@/lib/boundingBox";

describe("expandBounds", () => {
  it("pads by the default ratio (0.5) of the viewport dimensions", () => {
    const bounds: BoundingBox = {
      minLng: 0,
      maxLng: 10,
      minLat: 0,
      maxLat: 20,
    };
    // width 10 * 0.5 = 5 lng pad, height 20 * 0.5 = 10 lat pad
    expect(expandBounds(bounds)).toEqual({
      minLng: -5,
      maxLng: 15,
      minLat: -10,
      maxLat: 30,
    });
  });

  it("uses BOUNDS_BUFFER_RATIO as the default ratio", () => {
    expect(BOUNDS_BUFFER_RATIO).toBe(0.5);
    const bounds: BoundingBox = {
      minLng: 0,
      maxLng: 4,
      minLat: 0,
      maxLat: 4,
    };
    expect(expandBounds(bounds)).toEqual(
      expandBounds(bounds, BOUNDS_BUFFER_RATIO),
    );
  });

  it("pads by a custom ratio", () => {
    const bounds: BoundingBox = {
      minLng: -100,
      maxLng: -90,
      minLat: 30,
      maxLat: 40,
    };
    // width 10 * 0.25 = 2.5, height 10 * 0.25 = 2.5
    expect(expandBounds(bounds, 0.25)).toEqual({
      minLng: -102.5,
      maxLng: -87.5,
      minLat: 27.5,
      maxLat: 42.5,
    });
  });

  it("returns identical bounds when ratio is 0", () => {
    const bounds: BoundingBox = {
      minLng: 1,
      maxLng: 2,
      minLat: 3,
      maxLat: 4,
    };
    expect(expandBounds(bounds, 0)).toEqual(bounds);
  });
});

describe("isBoundsContained", () => {
  const outer: BoundingBox = {
    minLng: -10,
    maxLng: 10,
    minLat: -20,
    maxLat: 20,
  };

  it("returns true when inner is fully inside outer", () => {
    const inner: BoundingBox = {
      minLng: -5,
      maxLng: 5,
      minLat: -10,
      maxLat: 10,
    };
    expect(isBoundsContained(inner, outer)).toBe(true);
  });

  it("returns true for equal bounds", () => {
    expect(isBoundsContained(outer, outer)).toBe(true);
  });

  it("returns false when inner extends past the left edge (minLng)", () => {
    const inner: BoundingBox = { ...outer, minLng: -10.0001 };
    expect(isBoundsContained(inner, outer)).toBe(false);
  });

  it("returns false when inner extends past the right edge (maxLng)", () => {
    const inner: BoundingBox = { ...outer, maxLng: 10.0001 };
    expect(isBoundsContained(inner, outer)).toBe(false);
  });

  it("returns false when inner extends past the bottom edge (minLat)", () => {
    const inner: BoundingBox = { ...outer, minLat: -20.0001 };
    expect(isBoundsContained(inner, outer)).toBe(false);
  });

  it("returns false when inner extends past the top edge (maxLat)", () => {
    const inner: BoundingBox = { ...outer, maxLat: 20.0001 };
    expect(isBoundsContained(inner, outer)).toBe(false);
  });
});

describe("isCoveredByAny", () => {
  const bounds: BoundingBox = {
    minLng: 0,
    maxLng: 1,
    minLat: 0,
    maxLat: 1,
  };

  it("returns true when covered by one of several regions", () => {
    const regions: BoundingBox[] = [
      { minLng: 100, maxLng: 200, minLat: 100, maxLat: 200 },
      { minLng: -1, maxLng: 2, minLat: -1, maxLat: 2 }, // contains bounds
      { minLng: 5, maxLng: 6, minLat: 5, maxLat: 6 },
    ];
    expect(isCoveredByAny(bounds, regions)).toBe(true);
  });

  it("returns false when covered by none", () => {
    const regions: BoundingBox[] = [
      { minLng: 100, maxLng: 200, minLat: 100, maxLat: 200 },
      { minLng: 0.5, maxLng: 2, minLat: 0.5, maxLat: 2 }, // only partial overlap
    ];
    expect(isCoveredByAny(bounds, regions)).toBe(false);
  });

  it("returns false for an empty regions array", () => {
    expect(isCoveredByAny(bounds, [])).toBe(false);
  });
});
