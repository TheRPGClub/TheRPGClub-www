import type { ReviewBody } from "./types";

// `user_game_reviews.body` is a jsonb column, so the wire value is whatever
// JSON was written to it. Rows created through this app store a bare JSON
// string, but older rows hold an object (`{"summary": "..."}`) from the
// pre-web import. Rendering the raw value blows up React ("Objects are not
// valid as a React child"), so every read goes through here.
const TEXT_KEYS = ["summary", "text", "body", "content"] as const;

export function reviewBodyText(body: ReviewBody): string | null {
  if (body == null) return null;
  if (typeof body === "string") return body.trim() || null;
  if (typeof body === "object") {
    for (const key of TEXT_KEYS) {
      const value = (body as Record<string, unknown>)[key];
      if (typeof value === "string" && value.trim()) return value.trim();
    }
  }
  return null;
}
