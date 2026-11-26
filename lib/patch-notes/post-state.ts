import type { BotJob } from "@/lib/api/types";
import { botJobFailureReason, isBotJobSettled } from "@/lib/bot-jobs";
import type { Patch } from "./types";

// The editor's #patch-notes post block (www#239), read from the Patch as
// saved. Client-safe and pure.

export type PatchPostAction = "post" | "update";

export interface PatchPostView {
  // Whether the editor shows the block at all.
  show: boolean;
  posted: boolean;
  // Edited since it was posted, by a save or by unsaved changes.
  changed: boolean;
  // A draft whose post the bot is taking down (or failed to).
  removing: boolean;
  // The button to offer: Post to #patch-notes or Update the post.
  action: PatchPostAction | null;
  // A post job is queued or claimed: the button waits.
  waiting: boolean;
  // The job to stamp, if any.
  job: BotJob | null;
}

function open(job: BotJob | null): boolean {
  return job !== null && !isBotJobSettled(job);
}

export function patchPostView(patch: Patch, { dirty }: { dirty: boolean }): PatchPostView {
  const latest = patch.post_job ?? null;
  const posted = Boolean(patch.posted_at);
  // A finished removal says nothing about the Patch as it stands now.
  const job = latest && !(latest.kind === "patch_delete" && latest.status === "done") ? latest : null;
  const waiting = open(job);

  if (patch.status !== "published") {
    const removing = job?.kind === "patch_delete";
    return { show: posted || removing, posted, changed: false, removing: posted || removing, action: null, waiting, job };
  }

  const changed = posted && (Boolean(patch.edited_since_post) || dirty);
  const action: PatchPostAction | null = posted ? (changed ? "update" : null) : "post";
  return { show: true, posted, changed, removing: false, action, waiting, job };
}

// Unpublishing takes the post down too: it is up, or on its way.
export function removesPost(patch: Patch): boolean {
  const job = patch.post_job ?? null;
  return Boolean(patch.posted_at) || (job?.kind === "patch_post" && open(job));
}

// "26 Nov 14:05", in the viewer's zone unless `timeZone` is given.
export function postedStamp(iso: string, timeZone?: string): string {
  const at = new Date(iso);
  const day = new Intl.DateTimeFormat("en-GB", { timeZone, day: "numeric", month: "short" }).format(at);
  const clock = new Intl.DateTimeFormat("en-GB", { timeZone, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(at);
  return `${day} ${clock}`;
}

export interface PatchPostCopy {
  // The headline: where the post stands. `posted` means "Posted <stamp>".
  line: "not_posted" | "on_its_way" | "posted" | "removing";
  detail: string;
  failed: boolean;
}

// The block's words, for the view and the job as last read (`job` may be
// fresher than the view's own).
export function patchPostCopy(view: PatchPostView, job: BotJob | null, { dirty }: { dirty: boolean }): PatchPostCopy {
  const status = job?.status ?? null;
  const waiting = status === "queued" || status === "claimed";
  const failed = status === "failed";
  const reason = failed ? botJobFailureReason(job?.error_message).replace(/[.\s]+$/, "") || "no reason given" : "";
  const busy = status === "claimed" ? "The bot is working on it." : "Waiting for the bot.";

  if (view.removing) {
    if (failed) return { line: "removing", detail: `The bot couldn't take the post down: ${reason}. Delete it in Discord.`, failed };
    return { line: "removing", detail: `Unpublishing takes the post down too. ${busy}`, failed };
  }
  if (!view.posted) {
    if (waiting) return { line: "on_its_way", detail: busy, failed };
    // Done, but the Patch hasn't been read back with its post yet.
    if (status === "done" && job?.kind === "patch_post") return { line: "on_its_way", detail: "Posted. Checking the time it went out.", failed };
    if (failed) return { line: "not_posted", detail: `The bot couldn't post it: ${reason}.`, failed };
    return { line: "not_posted", detail: "Publishing put it on the site only. Post it when Discord should see it; the post pings no one.", failed };
  }
  if (waiting) return { line: "posted", detail: `Editing the post to match. ${busy}`, failed };
  if (failed && job?.kind === "patch_edit") return { line: "posted", detail: `The bot couldn't edit the post: ${reason}.`, failed };
  if (view.changed) {
    return {
      line: "posted",
      detail: dirty ? "Update the post saves your changes, then edits the post to match." : "Changed since it was posted. Update the post to match.",
      failed: false,
    };
  }
  return { line: "posted", detail: "The post matches the Patch.", failed: false };
}
