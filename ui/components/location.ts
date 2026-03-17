export interface Location {
  id: number;
  name: string;
  description: string;
  longitude: number;
  latitude: number;
}

export const locationData: Array<Location> = [
  {
    id: 1,
    name: "Cafe Sapientia",
    description: "Really nice cafe, Steven runs this joint, he's a good guy",
    longitude: -118.78461047927505,
    latitude: 34.18507587654156,
  },
  {
    id: 2,
    name: "Ragamuffin Coffee Roasters",
    description: "This place is cool, esoteric desserts",
    longitude: -118.953329,
    latitude: 34.179434,
  },
  {
    id: 3,
    name: "Five07 on the Boulevard",
    description: "Nice joint, interesting management",
    longitude: -118.837267,
    latitude: 34.170472,
  },
  {
    id: 4,
    name: "Ladyface Mountain",
    description:
      "Matt threw up on a hike here, once. Everyone still talks about it.",
    longitude: -118.76224,
    latitude: 34.13451,
  },
];
