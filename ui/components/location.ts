export interface Location {
  id: number;
  name: string;
  longitude: number;
  latitude: number;
}

export const locationData: Array<Location> = [
  {
    id: 1,
    name: "Cafe Sapientia",
    longitude: -118.78461047927505,
    latitude: 34.18507587654156,
  },
  {
    id: 2,
    name: "Ragamuffin Coffee Roasters",
    longitude: -118.953329,
    latitude: 34.179434,
  },
  {
    id: 3,
    name: "Five07 on the Boulevard",
    longitude: -118.837267,
    latitude: 34.170472,
  },
];
