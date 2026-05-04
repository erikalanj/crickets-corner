import { json } from "@sveltejs/kit";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

import {
  createFeedbackSubmission,
  listFeedbackSubmissions,
  isFeedbackType,
} from "$lib/server/feedbackStore";
import type { FeedbackAttachment } from "$lib/data/feedback";

export async function GET() {
  const submissions = await listFeedbackSubmissions();
  return json({ submissions });
}

export async function POST({ request }) {
  const form = await request.formData().catch(() => null);

  if (!form) return json({ message: "Invalid form data." }, { status: 400 });

  const textFeedback = String(form.get("textFeedback") ?? "").trim();
  const selectedLocation = String(form.get("selectedLocation") ?? "");
  const selectedAge = String(form.get("selectedAge") ?? "");
  const targetImageIdRaw = form.get("targetImageId");
  const targetImageId =
    targetImageIdRaw === "" ? null : String(targetImageIdRaw ?? "");
  const feedbackType = String(form.get("feedbackType") ?? "");

  if (!textFeedback)
    return json(
      { message: "Please add a message before submitting feedback." },
      { status: 400 },
    );
  if (!isFeedbackType(feedbackType))
    return json(
      { message: "Feedback type is not recognized." },
      { status: 400 },
    );

  const id = randomUUID();
  const uploadsDir = path.join(process.cwd(), ".feedback", "uploads", id);
  await mkdir(uploadsDir, { recursive: true });

  const uploadedFiles: FeedbackAttachment[] = [];

  const entries = form.getAll("uploadedImages");
  for (const entry of entries) {
    // FormDataEntryValue can be string or File-like; narrow to any to access arrayBuffer
    const file = entry as any;
    if (!file || typeof file.arrayBuffer !== "function") continue;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer as ArrayBuffer);
    const filename = String(file.name ?? `file-${Date.now()}`);
    await writeFile(path.join(uploadsDir, filename), buffer);

    uploadedFiles.push({
      name: filename,
      size: buffer.length,
      type: String(file.type ?? "application/octet-stream"),
      lastModified: Number(file.lastModified ?? Date.now()),
      path: path.join(".feedback", "uploads", id, filename),
    });
  }

  const submission = await createFeedbackSubmission({
    textFeedback,
    selectedLocation,
    selectedAge,
    uploadedImages: uploadedFiles,
    targetImageId,
    feedbackType,
  });

  return json({ submission }, { status: 201 });
}
