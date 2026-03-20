import boyBaby from "$lib/assets/boy/IMG_1597.jpg";
import boyTeen from "$lib/assets/boy/IMG_1613.jpg";
import boyOldMan from "$lib/assets/boy/IMG_1629.jpg";

export interface TimelineStage {
  name: string;
  photo: string;
}

export const boyTimeline: TimelineStage[] = [
  { name: "Baby", photo: boyBaby },
  { name: "Teen", photo: boyTeen },
  { name: "Old Man", photo: boyOldMan },
];
