"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { Loader2, RefreshCw, Send } from "lucide-react";

import type { PatchEditorState } from "@/hooks/use-patch-editor";
import { usePatchPost, type PatchPostState } from "@/hooks/use-patch-post";
import { useBotJob, type BotJobState } from "@/hooks/use-bot-job";
import { useIsClient } from "@/hooks/use-is-client";
import type { BotJob } from "@/lib/api/types";
import { botJobPhase, isBotJobSettled } from "@/lib/bot-jobs";
import { patchPostCopy, postedStamp } from "@/lib/patch-notes/post-state";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Stamp } from "@/components/admin/desk/stamp";

// The #patch-notes post block (www#239), atop the editor's actions on a
// published Patch (and on a draft whose post is coming down): where the
// post stands ("Posted 26 Nov 14:05", "changed since"), the bot job's
// stamp as on the desk's proof cards (Queued / Done / Failed), and Post to
// #patch-notes or Update the post in highlighter yellow. In Preview a line
// says the bot posts to the staff test channel instead.
export function PatchPost({ editor, preview }: { editor: PatchEditorState; preview: boolean }) {
  const post = usePatchPost(editor);
  const { job } = post.view;
  if (!post.view.show) return null;
  if (!job) return <PostBody editor={editor} post={post} job={null} preview={preview} />;
  return <FollowedPost key={job.id} editor={editor} post={post} job={job} preview={preview} />;
}

// Follows the job until it settles, then has the Patch read back.
function FollowedPost({ editor, post, job, preview }: { editor: PatchEditorState; post: PatchPostState; job: BotJob; preview: boolean }) {
  const state = useBotJob(job.id, job);
  const live = state.job ?? job;
  const wasOpen = useRef(!isBotJobSettled(job));
  const { settled } = post;
  useEffect(() => {
    if (!wasOpen.current || !isBotJobSettled(live)) return;
    wasOpen.current = false;
    void settled(live);
  }, [live, settled]);
  return <PostBody editor={editor} post={post} job={live} follow={state} preview={preview} />;
}

// Patch Notes in Preview posts to bot-dev (the bot's routing); once Live,
// the next Update moves the post to #patch-notes.
export const PREVIEW_NOTE =
  "Patch Notes is in Preview, so the bot posts to the staff test channel, not #patch-notes. Once it's Live, the post's next update moves it there.";

function PostBody({
  editor,
  post,
  job,
  follow,
  preview,
}: {
  editor: PatchEditorState;
  post: PatchPostState;
  job: BotJob | null;
  follow?: BotJobState;
  preview: boolean;
}) {
  const isClient = useIsClient();
  const { view, sending } = post;
  const copy = patchPostCopy(view, job, { dirty: editor.dirty });
  const postedAt = editor.patch.posted_at;
  const waiting = job ? !isBotJobSettled(job) : false;
  const lines: Record<typeof copy.line, ReactNode> = {
    not_posted: "Not on #patch-notes yet",
    on_its_way: "On its way to #patch-notes",
    posted: <span suppressHydrationWarning>Posted {isClient && postedAt ? postedStamp(postedAt) : ""}</span>,
    removing: "Coming off #patch-notes",
  };
  const label = view.action === "update" ? (sending ? "Sending" : "Update the post") : sending ? "Posting" : "Post to #patch-notes";

  return (
    <section aria-label="The #patch-notes post" className="flex flex-col gap-3 border-b border-dashed border-border pb-3.5">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1" role="status" aria-live="polite">
          <p className="text-[0.9375rem] leading-snug font-semibold text-foreground">
            {lines[copy.line]}
            {copy.line === "posted" && view.changed && !waiting && <span className="text-highlight"> · changed since</span>}
          </p>
          <p className={cn("mt-1 text-[0.8125rem] leading-[1.5] text-dim-foreground", copy.failed && "text-destructive")}>{copy.detail}</p>
          {preview && <p className="mt-1 text-[0.8125rem] leading-[1.5] text-faint-foreground">{PREVIEW_NOTE}</p>}
          {post.error && (
            <p role="alert" className="mt-1 text-[0.8125rem] leading-[1.5] text-destructive">
              {post.error}
            </p>
          )}
        </div>
        {job && <Stamp key={botJobPhase(job.status)} phase={botJobPhase(job.status)} className="mt-1" />}
      </div>
      {((view.action && !waiting) || (follow && waiting && !follow.refreshing)) && (
        <div className="flex flex-wrap items-center justify-end gap-2">
          {follow && waiting && !follow.refreshing && (
            <Button type="button" variant="ghost" size="sm" disabled={follow.checking} onClick={follow.checkAgain}>
              <RefreshCw aria-hidden className={follow.checking ? "motion-safe:animate-spin" : undefined} />
              Check again
            </Button>
          )}
          {view.action && !waiting && (
            <Button
              type="button"
              variant="highlight"
              onClick={() => void post.send(view.action ?? "post")}
              disabled={sending !== null || editor.busy !== null}
              className="min-w-44"
            >
              {sending ? <Loader2 aria-hidden className="motion-safe:animate-spin" /> : view.action === "update" ? <RefreshCw aria-hidden /> : <Send aria-hidden />}
              {label}
            </Button>
          )}
        </div>
      )}
    </section>
  );
}
