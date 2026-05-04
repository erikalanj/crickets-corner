import { json } from "@sveltejs/kit";

import {
  createFeedbackSubmission,
  isFeedbackAttachment,
  isFeedbackType,
  listFeedbackSubmissions,
} from "$lib/server/feedbackStore";
import type {
  FeedbackAttachment,
  FeedbackSubmission,
} from "$lib/data/feedback";

type IncomingFeedbackPayload = Omit<FeedbackSubmission, "uploadedImages"> & {
  uploadedImages: unknown[];
};

function isIncomingFeedbackPayload(
  value: unknown,
): value is IncomingFeedbackPayload {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const payload = value as Record<string, unknown>;

  return (
    typeof payload.textFeedback === "string" &&
    typeof payload.selectedLocation === "string" &&
    typeof payload.selectedAge === "string" &&
    (typeof payload.targetImageId === "string" ||
      payload.targetImageId === null) &&
    typeof payload.feedbackType === "string" &&
    Array.isArray(payload.uploadedImages) &&
    payload.uploadedImages.every(isFeedbackAttachment)
  );
}

export async function GET() {
  const submissions = await listFeedbackSubmissions();

  return json({ submissions });
}

export async function POST({ request }) {
  const body = (await request.json().catch(() => null)) as unknown;

  if (!isIncomingFeedbackPayload(body)) {
    return json(
      { message: "Invalid feedback payload." },
      {
        status: 400,
      },
    );
  }

  if (!body.textFeedback.trim()) {
    return json(
      { message: "Please add a message before submitting feedback." },
      {
        status: 400,
      },
    );
  }

  if (!isFeedbackType(body.feedbackType)) {
    return json(
      { message: "Feedback type is not recognized." },
      {
        status: 400,
      },
    );
  }

  const submission = await createFeedbackSubmission({
    textFeedback: body.textFeedback.trim(),
    selectedLocation: body.selectedLocation,
    selectedAge: body.selectedAge,
    uploadedImages: body.uploadedImages as FeedbackAttachment[],
    targetImageId: body.targetImageId,
    feedbackType: body.feedbackType,
  });

  return json(
    { submission },
    {
      status: 201,
    },
  );
}
