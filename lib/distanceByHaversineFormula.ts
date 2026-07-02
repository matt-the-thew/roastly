/*
Implementation of distance between two lat/lng coords via the Haversine
formula.

d=2*Rarcsin(sqrt(sin^2(deltaLAT/2)+cos(lat1)*cos(lat2)sin^2(deltaLON/2)))

where
d: distance between two points
R: radius of the earth, (3959mi)
lat1, lon1: lat/lng of point 1
lat2, lon2: lat/lng of point 2
deltaLAT: lat2 - lat1 in radians
deltaLON: lon2 - lon1 in radians

NOTE: Ensure everything is in radians
*/
export type CoordinatesType = {
  lat: number;
  lon: number;
};

export function distanceByHaversine(pointsObj: CoordinatesType[]): number {
  // https://www.movable-type.co.uk/scripts/latlong.html
  // where φ is latitude, λ is longitude, R is earth radius
  const R = 3959; // mi
  const φ1 = (pointsObj[0].lat * Math.PI) / 180; // φ, λ in radians
  const φ2 = (pointsObj[1].lat * Math.PI) / 180;
  const Δφ = ((pointsObj[1].lat - pointsObj[0].lat) * Math.PI) / 180;
  const Δλ = ((pointsObj[1].lon - pointsObj[0].lon) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const d = R * c; // in metresconst earthRadius = 3959;
  return Math.round(d);
}
