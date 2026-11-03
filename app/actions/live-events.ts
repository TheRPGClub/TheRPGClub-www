"use server";

import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api";
import { apiErrorMessage, readApiError } from "@/lib/api/errors";
import type { LiveEvent } from "@/lib/api/types";
import { imageFileProblem, validateLiveEventInput } from "@/lib/live-events";

const UNREACHABLE = "Couldn't reach the club's server. Try again.";

const ERRORS: Record<string, string> = {
  backblaze_not_configured: "Image uploads aren't set up on the club's server. Use an image URL instead.",
  backblaze_request_failed: "The image upload failed. Try again, or use an image URL.",
};

export interface LiveEventActionResult {
  ok: boolean;
  data?: LiveEvent;
  error?: string;
  // A read that can't succeed on a retry (403, 404, signed out).
  final?: boolean;
}

// Create a live event. The form sends `topic`, `starts_at` and `ends_at`
// (ISO instants with the browser's offset) and either `image_url` or an
// `image` file. A file goes to the API as multipart, a URL as JSON. The API
// queues `live_event_create`, which makes the forum thread and the Discord
// scheduled event.
export async function createLiveEventAction(formData: FormData): Promise<LiveEventActionResult> {
  const text = (key: string) => {
    const value = formData.get(key);
    return typeof value === "string" ? value : null;
  };
  const file = formData.get("image");
  const image = file instanceof File && file.size > 0 ? file : null;
  const imageUrl = text("image_url")?.trim() || null;
  if (image && imageUrl) return { ok: false, error: "Use an image file or an image URL, not both." };
  if (image) {
    const problem = imageFileProblem(image);
    if (problem) return { ok: false, error: problem };
  }

  const checked = validateLiveEventInput({
    topic: text("topic") ?? "",
    starts_at: text("starts_at"),
    ends_at: text("ends_at"),
    image_url: imageUrl,
  });
  if (!checked.ok) return { ok: false, error: checked.error };
  const { topic, starts_at, ends_at, image_url } = checked.data;

  let body: BodyInit;
  if (image) {
    const form = new FormData();
    form.append("data[topic]", topic);
    form.append("data[starts_at]", starts_at);
    form.append("data[ends_at]", ends_at);
    form.append("data[image]", image, image.name);
    body = form;
  } else {
    body = JSON.stringify({ data: { topic, starts_at, ends_at, image_url } });
  }

  let res: Response;
  try {
    res = await apiFetch("/api/v1/live_events", { method: "POST", body });
  } catch {
    return { ok: false, error: UNREACHABLE };
  }
  if (!res.ok) {
    if (res.status === 401) return { ok: false, error: "Sign in again to create a live event." };
    if (res.status === 403) {
      return { ok: false, error: "Only Moderators, Admins and Superadmins can create live events." };
    }
    return { ok: false, error: apiErrorMessage(await readApiError(res), ERRORS) };
  }
  const { data } = (await res.json()) as { data: LiveEvent };
  revalidatePath("/admin/live-events");
  revalidatePath("/admin");
  return { ok: true, data };
}

// Re-read one live event, to follow it from queued to created.
export async function getLiveEventAction(id: number): Promise<LiveEventActionResult> {
  if (!Number.isInteger(id) || id <= 0) return { ok: false, error: "That live event doesn't exist.", final: true };
  let res: Response;
  try {
    res = await apiFetch(`/api/v1/live_events/${id}`, { cache: "no-store" });
  } catch {
    return { ok: false, error: UNREACHABLE };
  }
  if (!res.ok) {
    if (res.status === 401) return { ok: false, error: "Sign in again to check this.", final: true };
    if (res.status === 403) return { ok: false, error: "You can't see this live event.", final: true };
    if (res.status === 404) return { ok: false, error: "That live event doesn't exist.", final: true };
    return { ok: false, error: `Couldn't check the live event (HTTP ${res.status}).` };
  }
  const { data } = (await res.json()) as { data: LiveEvent };
  return { ok: true, data };
}
