/* TEMPORARY PROTOTYPE CAFE DB
 * actual database is in supabase with a slightly
 * altered schema:
 * Name, location, description;
 * with location being a extensions.st_point()
 * from postGIS
 */

interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Location {
  id: number;
  name: string;
  location: Coordinates;
  description: string;
}

export const locationData: Array<Location> = [
  {
    id: 1,
    name: "Cafe Sapientia",
    description: "Really nice cafe, Steven runs this joint, he's a good guy",
    location: {
      longitude: -118.78461047927505,
      latitude: 34.18507587654156,
    },
  },
  {
    id: 2,
    name: "Ragamuffin Coffee Roasters",
    description: "This place is cool, esoteric desserts",
    location: {
      longitude: -118.953329,
      latitude: 34.179434,
    },
  },
  {
    id: 3,
    name: "Five07 on the Boulevard",
    description:
      "People in the area call this joint \"the 'Five\", and it attracts all kinds from around the neighborhood. Artists, musicians, businesspeople, tech bros, bible study, you name it, they're there.",
    location: {
      longitude: -118.837267,
      latitude: 34.170472,
    },
  },
  {
    id: 4,
    name: "Ladyface Mountain",
    description:
      "Matt threw up on a hike here, once. Everyone still talks about it.",
    location: {
      longitude: -118.76224,
      latitude: 34.13451,
    },
  },
  {
    id: 5,
    name: "Zuma Beach",
    description:
      "Matt was once absolutely smoked in volleyball at this precise location.",
    location: {
      longitude: -118.83077,
      latitude: 34.02115,
    },
  },
];
