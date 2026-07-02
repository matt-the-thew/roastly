export interface BoundingBox {
  minLng: number;
  minLat: number;
  maxLng: number;
  maxLat: number;
}

// How far past the visible viewport to prefetch, as a fraction of the
// viewport's own width/height (0.5 = load a region 2x the viewport size).
export const BOUNDS_BUFFER_RATIO = 0.5;

export function expandBounds(
  bounds: BoundingBox,
  ratio: number = BOUNDS_BUFFER_RATIO,
): BoundingBox {
  const lngPad = (bounds.maxLng - bounds.minLng) * ratio;
  const latPad = (bounds.maxLat - bounds.minLat) * ratio;
  return {
    minLng: bounds.minLng - lngPad,
    maxLng: bounds.maxLng + lngPad,
    minLat: bounds.minLat - latPad,
    maxLat: bounds.maxLat + latPad,
  };
}

export function isBoundsContained(
  inner: BoundingBox,
  outer: BoundingBox,
): boolean {
  return (
    inner.minLng >= outer.minLng &&
    inner.maxLng <= outer.maxLng &&
    inner.minLat >= outer.minLat &&
    inner.maxLat <= outer.maxLat
  );
}

export function isCoveredByAny(
  bounds: BoundingBox,
  regions: BoundingBox[],
): boolean {
  return regions.some((region) => isBoundsContained(bounds, region));
}
