"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { postPatchAction, readPatchAction } from "@/app/actions/patch-notes";
import type { PatchEditorState } from "@/hooks/use-patch-editor";
import type { BotJob } from "@/lib/api/types";
import { patchPostView, type PatchPostAction } from "@/lib/patch-notes/post-state";

const UNREACHED = "Couldn't reach the site. Check your connection and try again.";

// The editor's #patch-notes post (www#239): Post to #patch-notes or Update
// the post (saving unsaved changes first), the job it queued kept on the
// Patch as `post_job`, and a re-read once that job settles so "Posted ..."
// and "changed since" follow what the bot did.
export function usePatchPost(editor: PatchEditorState) {
  const router = useRouter();
  const [sending, setSending] = useState<PatchPostAction | null>(null);
  const [error, setError] = useState<string | null>(null);
  const view = patchPostView(editor.patch, { dirty: editor.dirty });

  async function send(step: PatchPostAction) {
    if (sending || editor.busy) return;
    setSending(step);
    setError(null);
    try {
      // Only what is sent is saved: text typed while it goes stays unsaved.
      const sent = editor.dirty ? editor.draft() : null;
      const result = await postPatchAction(editor.patch.number, step, sent);
      if (result.patch) editor.adopt(result.patch, { saved: sent });
      if (!result.ok) return setError(result.error ?? UNREACHED);
      const base = result.patch ?? editor.patch;
      editor.adopt({ ...base, post_job: result.job ?? base.post_job });
      router.refresh();
    } catch {
      setError(UNREACHED);
    } finally {
      setSending(null);
    }
  }

  // The followed job settled: read the Patch again for its post fields.
  async function settled(job: BotJob) {
    const fresh = await readPatchAction(editor.patch.number).catch(() => null);
    editor.adopt(fresh ?? { ...editor.patch, post_job: job });
  }

  return { view, sending, error, send, settled };
}

export type PatchPostState = ReturnType<typeof usePatchPost>;
