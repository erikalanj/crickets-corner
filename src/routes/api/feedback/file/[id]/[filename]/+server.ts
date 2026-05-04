import { json } from "@sveltejs/kit";
import path from "node:path";
import { readFile } from "node:fs/promises";

import { listFeedbackSubmissions } from "$lib/server/feedbackStore";

export async function GET({ params }) {
  const { id, filename } = params;

  const submissions = await listFeedbackSubmissions();
  const submission = submissions.find((s) => s.id === id);

  if (!submission) {
    return json({ message: "Submission not found" }, { status: 404 });
  }

  const attachment = submission.uploadedImages.find((a) => a.name === filename);

  if (!attachment || !attachment.path) {
    return json({ message: "File not found" }, { status: 404 });
  }

  const filePath = path.join(process.cwd(), attachment.path);
  try {
    const buffer = await readFile(filePath);
    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": attachment.type || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${attachment.name}"`,
      },
    });
  } catch (err) {
    return json({ message: "Unable to read file" }, { status: 500 });
  }
}
