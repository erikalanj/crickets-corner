import { json } from "@sveltejs/kit";
import { toggleResolved } from "$lib/server/feedbackStore";

export async function PATCH({ params, request }) {
  const { id } = params;
  const body = (await request.json().catch(() => null)) as {
    resolved?: boolean;
  } | null;

  if (!body || typeof body.resolved !== "boolean") {
    return json({ message: "Invalid payload" }, { status: 400 });
  }

  const updated = await toggleResolved(id, body.resolved);
  if (!updated)
    return json({ message: "Submission not found" }, { status: 404 });

  return json({ submission: updated }, { status: 200 });
}
