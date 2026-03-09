import boyInVermont from "$lib/assets/boy/IMG_1622.jpg";

export interface Location {
  id: string;
  name: string;
  coords: [number, number];
  description: string;
  photos: string[];
}

export const locations: Location[] = [
  {
    id: "vermont",
    name: "Vermont",
    coords: [44.26, -72.58],
    description: "my vermont home!",
    photos: [boyInVermont], // Add photo paths here later
  },
  {
    id: "boston",
    name: "Boston",
    coords: [42.355, -71.056],
    description: "my sisters home!",
    photos: [],
  },
  {
    id: "cheshire",
    name: "Cheshire",
    coords: [41.508, -72.91],
    description: "my family's home",
    photos: [],
  },
];
