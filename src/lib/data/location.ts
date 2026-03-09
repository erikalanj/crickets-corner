import boyInVermont from "$lib/assets/boy/IMG_1622.jpg";
import boyInVermont2 from "$lib/assets/boy/IMG_1624.jpg";
import boyInVermont3 from "$lib/assets/boy/IMG_1625.jpg";
import boyInVermont4 from "$lib/assets/boy/IMG_1626.jpg";
import boyInVermont5 from "$lib/assets/boy/IMG_1627.jpg";
import boyInVermont6 from "$lib/assets/boy/IMG_1628.jpg";

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
    photos: [
      boyInVermont,
      boyInVermont2,
      boyInVermont3,
      boyInVermont4,
      boyInVermont5,
      boyInVermont6,
    ], // Add photo paths here later
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
