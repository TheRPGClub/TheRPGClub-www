"use client";

import { Loader2, Trash2 } from "lucide-react";

import type { PatchEditorState } from "@/hooks/use-patch-editor";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { removesPost } from "@/lib/patch-notes/post-state";
import { PatchPost } from "./patch-post";

// The editor's actions (www#237), under the preview: Save draft (Save
// changes once published) and Publish in highlighter yellow; Unpublish
// (signal-orange outline) on a published Patch, Delete draft (signal-orange
// ghost) on a draft, each behind the usual confirm. Length never blocks
// either: past 4000 the post is cut.
export function PatchActions({ editor }: { editor: PatchEditorState }) {
  const { patch, busy, published, dirty } = editor;
  const spin = (kind: "save" | "publish") => (busy === kind ? <Loader2 aria-hidden className="motion-safe:animate-spin" /> : null);
  return (
    <div className="flex flex-col gap-3 border-t border-border pt-3.5">
      <PatchPost editor={editor} />
      {editor.error && (
        <p role="alert" className="text-[0.875rem] text-destructive">
          {editor.error}
        </p>
      )}
      <div className="flex flex-wrap items-center justify-end gap-2">
        {published ? (
          <ConfirmDialog
            trigger={
              <Button type="button" variant="destructive-outline" disabled={busy !== null} className="mr-auto">
                Unpublish
              </Button>
            }
            title={`Unpublish Patch ${patch.number}?`}
            description={
              removesPost(patch)
                ? "It leaves /patch-notes and its page goes, and the bot deletes its post from #patch-notes. Publish it again and the post starts over. Its number stays its own."
                : "It leaves /patch-notes and its page goes, until you publish it again. Its number stays its own."
            }
            confirmLabel="Unpublish"
            pendingLabel="Unpublishing…"
            onConfirm={editor.unpublish}
          />
        ) : (
          <ConfirmDialog
            trigger={
              <Button type="button" variant="destructive-ghost" disabled={busy !== null} className="mr-auto">
                <Trash2 aria-hidden />
                Delete draft
              </Button>
            }
            title={`Delete the draft of Patch ${patch.number}?`}
            description="The draft goes for good, and its number is never used again."
            confirmLabel="Delete draft"
            pendingLabel="Deleting…"
            confirmIcon={<Trash2 aria-hidden />}
            onConfirm={editor.remove}
          />
        )}
        <Button type="button" variant="outline" onClick={() => void editor.save()} disabled={busy !== null || !dirty}>
          {spin("save")}
          {busy === "save" ? "Saving" : published ? "Save changes" : "Save draft"}
        </Button>
        {!published && (
          <Button type="button" variant="highlight" onClick={() => void editor.publish()} disabled={busy !== null} className="min-w-36">
            {spin("publish")}
            {busy === "publish" ? "Publishing" : `Publish Patch ${patch.number}`}
          </Button>
        )}
      </div>
    </div>
  );
}
