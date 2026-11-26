import type { BotJob } from "@/lib/api/types";

// A Patch as the API sends it (GET /api/v1/patches and /patches/:number,
// spec api#510). Client-safe.

export type PatchStatus = "draft" | "published";

// How many changes it lists under its New, Improved and Fixed headings; the
// API counts them from `rich_body`.
export interface PatchCounts {
  new: number;
  improved: number;
  fixed: number;
}

export interface Patch {
  id: number;
  number: number;
  title: string | null;
  status: PatchStatus;
  published_at: string | null;
  // The Plate value, as the editor saved it: untrusted until sanitized.
  rich_body: unknown;
  body: string;
  cut_body: string;
  counts: PatchCounts;
  // Its #patch-notes post (api#513): null while not posted. The three are
  // set together; `edited_since_post` turns on when a posted Patch's text
  // changes and off when the post is updated.
  posted_at?: string | null;
  post_channel_id?: string | null;
  post_message_id?: string | null;
  edited_since_post?: boolean;
  // Writers only, on a single Patch: the latest patch_post, patch_edit or
  // patch_delete bot job, null if none.
  post_job?: BotJob | null;
  created_at: string;
  updated_at: string;
}

// The show read adds the published Patches either side of it.
export interface PatchWithNeighbours extends Patch {
  previous_number: number | null;
  next_number: number | null;
}

// What an editor write answers (www#237): the Patch as saved, or the
// refusal in words.
export interface PatchActionResult {
  ok: boolean;
  patch?: Patch;
  error?: string;
}

// What Post to #patch-notes and Update the post answer (www#239): the
// queued bot job, and the Patch when unsaved changes were saved first.
export interface PatchPostResult {
  ok: boolean;
  job?: BotJob;
  patch?: Patch;
  error?: string;
}
