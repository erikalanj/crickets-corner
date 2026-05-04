import { listFeedbackSubmissions } from "$lib/server/feedbackStore";

export async function load() {
  const submissions = await listFeedbackSubmissions();

  return {
    submissions,
  };
}
