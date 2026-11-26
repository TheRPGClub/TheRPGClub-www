import { describe, expect, it } from "vitest";

import type { BotJob, BotJobKind, BotJobStatus } from "@/lib/api/types";
import { patchPostCopy, patchPostView, postedStamp, removesPost } from "./post-state";
import type { Patch } from "./types";

function job(kind: BotJobKind, status: BotJobStatus, id = 7): BotJob {
  return {
    id,
    kind,
    summary: "",
    status,
    requested_by_user_id: null,
    attempts: 0,
    error_message: status === "failed" ? "Missing Access" : null,
    claimed_at: null,
    finished_at: null,
    created_at: "2026-11-26T14:05:00Z",
    updated_at: "2026-11-26T14:05:00Z",
  };
}

function patch(over: Partial<Patch> = {}): Patch {
  return {
    id: 1,
    number: 4,
    title: null,
    status: "published",
    published_at: "2026-11-26T12:00:00Z",
    rich_body: [],
    body: "",
    cut_body: "",
    counts: { new: 0, improved: 0, fixed: 0 },
    posted_at: null,
    edited_since_post: false,
    post_job: null,
    created_at: "2026-11-26T10:00:00Z",
    updated_at: "2026-11-26T12:00:00Z",
    ...over,
  };
}

const POSTED = { posted_at: "2026-11-26T14:06:00Z", post_message_id: "1", post_channel_id: "2" };

describe("patchPostView", () => {
  it("offers Post to #patch-notes on a published Patch that isn't posted", () => {
    const view = patchPostView(patch(), { dirty: false });
    expect(view).toMatchObject({ show: true, posted: false, changed: false, action: "post", waiting: false, job: null });
  });

  it("hides on a draft that was never posted", () => {
    expect(patchPostView(patch({ status: "draft", published_at: null }), { dirty: false }).show).toBe(false);
  });

  it("waits while the post is queued or claimed", () => {
    for (const status of ["queued", "claimed"] as const) {
      const view = patchPostView(patch({ post_job: job("patch_post", status) }), { dirty: false });
      expect(view).toMatchObject({ action: "post", waiting: true });
      expect(view.job?.status).toBe(status);
    }
  });

  it("offers Post again after a failed post", () => {
    const view = patchPostView(patch({ post_job: job("patch_post", "failed") }), { dirty: false });
    expect(view).toMatchObject({ action: "post", waiting: false });
    expect(view.job?.status).toBe("failed");
  });

  it("shows a posted Patch with no action until it changes", () => {
    const view = patchPostView(patch({ ...POSTED, post_job: job("patch_post", "done") }), { dirty: false });
    expect(view).toMatchObject({ posted: true, changed: false, action: null });
    expect(view.job?.status).toBe("done");
  });

  it("offers Update the post once edited since, or with unsaved changes", () => {
    expect(patchPostView(patch({ ...POSTED, edited_since_post: true }), { dirty: false })).toMatchObject({ changed: true, action: "update" });
    expect(patchPostView(patch({ ...POSTED }), { dirty: true })).toMatchObject({ changed: true, action: "update" });
  });

  it("offers Post, not Update, for unsaved changes before the first post", () => {
    expect(patchPostView(patch(), { dirty: true }).action).toBe("post");
  });

  it("waits while an update is queued", () => {
    const view = patchPostView(patch({ ...POSTED, edited_since_post: true, post_job: job("patch_edit", "claimed") }), { dirty: false });
    expect(view).toMatchObject({ action: "update", waiting: true });
  });

  it("drops a finished removal from a Patch published again", () => {
    const view = patchPostView(patch({ post_job: job("patch_delete", "done") }), { dirty: false });
    expect(view).toMatchObject({ action: "post", job: null });
  });

  it("shows the removal on a draft while it is posted or the removal is open or failed", () => {
    const draft = { status: "draft" as const };
    expect(patchPostView(patch({ ...draft, ...POSTED, post_job: job("patch_delete", "queued") }), { dirty: false })).toMatchObject({
      show: true,
      removing: true,
      action: null,
      waiting: true,
    });
    expect(patchPostView(patch({ ...draft, ...POSTED, post_job: job("patch_delete", "failed") }), { dirty: false })).toMatchObject({
      show: true,
      removing: true,
    });
    expect(patchPostView(patch({ ...draft, post_job: job("patch_delete", "done") }), { dirty: false }).show).toBe(false);
  });
});

describe("removesPost", () => {
  it("is true when posted or a post is on its way", () => {
    expect(removesPost(patch({ ...POSTED }))).toBe(true);
    expect(removesPost(patch({ post_job: job("patch_post", "queued") }))).toBe(true);
    expect(removesPost(patch({ post_job: job("patch_post", "failed") }))).toBe(false);
    expect(removesPost(patch())).toBe(false);
  });
});

describe("postedStamp", () => {
  it("reads D MMM HH:MM in the given zone", () => {
    expect(postedStamp("2026-11-26T14:05:00Z", "UTC")).toBe("26 Nov 14:05");
    expect(postedStamp("2026-11-26T23:30:00Z", "Europe/Berlin")).toBe("27 Nov 00:30");
  });
});

describe("patchPostCopy", () => {
  const copy = (p: Patch, dirty = false) => {
    const view = patchPostView(p, { dirty });
    return patchPostCopy(view, view.job, { dirty });
  };

  it("drops the reason's own full stop", () => {
    const failed = { ...job("patch_post", "failed"), error_message: "Bot job 9 (patch_post) failed: Missing Access." };
    expect(copy(patch({ post_job: failed })).detail).toBe("The bot couldn't post it: Missing Access.");
  });

  it("words each state", () => {
    expect(copy(patch()).line).toBe("not_posted");
    expect(copy(patch({ post_job: job("patch_post", "queued") }))).toMatchObject({ line: "on_its_way", detail: "Waiting for the bot." });
    expect(copy(patch({ post_job: job("patch_post", "failed") }))).toMatchObject({
      line: "not_posted",
      failed: true,
      detail: "The bot couldn't post it: Missing Access.",
    });
    expect(copy(patch({ ...POSTED, post_job: job("patch_post", "done") }))).toMatchObject({ line: "posted", detail: "The post matches the Patch." });
    expect(copy(patch({ ...POSTED, edited_since_post: true })).detail).toMatch(/^Changed since/);
    expect(copy(patch({ ...POSTED }), true).detail).toMatch(/saves your changes/);
    expect(copy(patch({ ...POSTED, edited_since_post: true, post_job: job("patch_edit", "failed") }))).toMatchObject({
      failed: true,
      detail: "The bot couldn't edit the post: Missing Access.",
    });
    expect(copy(patch({ status: "draft", ...POSTED, post_job: job("patch_delete", "claimed") }))).toMatchObject({
      line: "removing",
      detail: "Unpublishing takes the post down too. The bot is working on it.",
    });
  });
});
