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
    photos: [], // Add photo paths here later
  },
];
