export type FeedbackType =
  | "location-correction"
  | "timeline-correction"
  | "general";

export interface FeedbackTargetImage {
  id: string;
  label: string;
  src: string;
  currentLocation?: string;
  currentStage?: string;
}

export interface Feedback {
  textFeedback: string;
  selectedLocation: string;
  selectedAge: string;
  uploadedImages: File[];
  targetImageId: string | null;
  feedbackType: FeedbackType;
}
