import { vi, describe, it, expect, test, beforeEach } from "vitest";
import * as haverSine from "@/lib/distanceByHaversineFormula";

type testDataType = {
  pairOne: haverSine.CoordinatesType;
  pairTwo: haverSine.CoordinatesType;
  distanceBetween: number;
};

describe("distanceByHaversine", () => {
  const haverSpy = vi.spyOn(haverSine, "distanceByHaversine");

  beforeEach(() => {
    haverSpy.mockClear();
  });

  const testData: Record<string, testDataType> = {
    LA_AGOURA: {
      pairOne: { lat: 34.0522, lon: -118.2437 },
      pairTwo: { lat: 34.0194, lon: -118.7621 },
      distanceBetween: 30,
    },
    LA_LAS_VEGAS: {
      pairOne: { lon: -118.2437, lat: 34.0522 },
      pairTwo: { lon: -115.1398, lat: 36.1699 },
      distanceBetween: 230,
    },
    LA_TOKYO: {
      pairOne: { lon: -118.2437, lat: 34.0522 },
      pairTwo: { lon: 139.6503, lat: 35.6762 },
      distanceBetween: 5546,
    },
  };

  it.each(Object.entries(testData))(
    "finds the correct distance between %s",
    (key, value) => {
      const result = haverSine.distanceByHaversine([
        value.pairOne,
        value.pairTwo,
      ]);

      expect(result).toBeDefined();
      expect(result).toEqual(Math.round(value.distanceBetween));
      expect(haverSpy).toHaveBeenCalledExactlyOnceWith([
        value.pairOne,
        value.pairTwo,
      ]);
    },
  );

  it("finds the distance between LA and Agoura", () => {
    const result = haverSine.distanceByHaversine([
      testData.LA_AGOURA.pairOne,
      testData.LA_AGOURA.pairTwo,
    ]);

    expect(result).toBeDefined();
    expect(result).toEqual(Math.round(testData.LA_AGOURA.distanceBetween));
    expect(haverSpy).toHaveBeenCalledExactlyOnceWith([
      testData.LA_AGOURA.pairOne,
      testData.LA_AGOURA.pairTwo,
    ]);
  });
});
