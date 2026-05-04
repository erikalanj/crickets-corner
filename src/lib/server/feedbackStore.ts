import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

import type {
  FeedbackSubmission,
  FeedbackAttachment,
  FeedbackType,
} from "$lib/data/feedback";

export interface StoredFeedbackSubmission extends FeedbackSubmission {
  id: string;
  createdAt: string;
}

const storeDirectory = path.join(process.cwd(), ".feedback");
const storeFilePath = path.join(storeDirectory, "feedback-submissions.json");

async function ensureStoreDirectory() {
  await mkdir(storeDirectory, { recursive: true });
  // ensure uploads directory exists
  await mkdir(path.join(storeDirectory, "uploads"), { recursive: true });
}

async function readStoredFeedback(): Promise<StoredFeedbackSubmission[]> {
  try {
    const raw = await readFile(storeFilePath, "utf8");
    const parsed = JSON.parse(raw) as unknown;

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed as StoredFeedbackSubmission[];
  } catch (error) {
    const code =
      error instanceof Error ? (error as { code?: string }).code : undefined;

    if (code === "ENOENT") {
      return [];
    }

    throw error;
  }
}

async function writeStoredFeedback(submissions: StoredFeedbackSubmission[]) {
  await ensureStoreDirectory();
  await writeFile(storeFilePath, JSON.stringify(submissions, null, 2), "utf8");
}

export async function listFeedbackSubmissions() {
  return await readStoredFeedback();
}

export async function createFeedbackSubmission(
  submission: FeedbackSubmission,
): Promise<StoredFeedbackSubmission> {
  const existingSubmissions = await readStoredFeedback();
  const storedSubmission: StoredFeedbackSubmission = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    ...submission,
  };

  existingSubmissions.unshift(storedSubmission);
  await writeStoredFeedback(existingSubmissions);

  return storedSubmission;
}

export function isFeedbackType(value: string): value is FeedbackType {
  return (
    value === "general" ||
    value === "location-correction" ||
    value === "timeline-correction"
  );
}

export function isFeedbackAttachment(
  value: unknown,
): value is FeedbackAttachment {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as FeedbackAttachment).name === "string" &&
    typeof (value as FeedbackAttachment).size === "number" &&
    typeof (value as FeedbackAttachment).type === "string" &&
    typeof (value as FeedbackAttachment).lastModified === "number"
  );
}
