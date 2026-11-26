"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Value } from "platejs";

import {
  deletePatchAction,
  publishPatchAction,
  savePatchAction,
  unpublishPatchAction,
  type PatchDraft,
} from "@/app/actions/patch-notes";
import { PATCH_EDITOR_PATH } from "@/lib/patch-notes/editor-paths";
import { dropEmptyItems } from "@/lib/patch-notes/patch-draft";
import { patchValue } from "@/lib/patch-notes/patch-schema";
import { patchText } from "@/lib/patch-notes/patch-text";
import type { Patch, PatchActionResult } from "@/lib/patch-notes/types";

const UNREACHED = "Couldn't reach the site. Check your connection and try again.";

// The Patch editor's state (www#237): the title and the editor's value,
// the Patch as last saved, and its writes. `text` is the live value cut as
// the card and the post cut it, made with the site's own links whole (as
// the save makes them), so the count matches what is stored.
export function usePatchEditor(initial: Patch, initialValue: Value, siteUrl: string | null) {
  const router = useRouter();
  const [patch, setPatch] = useState(initial);
  const [title, setTitleState] = useState(initial.title ?? "");
  const [value, setValueState] = useState<Value>(initialValue);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState<"save" | "publish" | null>(null);
  const [error, setError] = useState<string | null>(null);
  // The title and value as typed now, for writes that finish later: only
  // what was sent is saved, so text typed meanwhile stays unsaved.
  const current = useRef({ title: initial.title ?? "", richBody: initialValue as unknown });

  // As a save stores it: sanitized, without empty bullets.
  const clean = patchValue(dropEmptyItems(patchValue(value)));
  const text = patchText(clean, siteUrl ? { siteUrl } : {});
  const published = patch.status === "published";
  const draft = (): PatchDraft => ({ title, richBody: value });

  function setTitle(next: string) {
    current.current = { ...current.current, title: next };
    setTitleState(next);
    setDirty(true);
  }
  function setValue(next: Value) {
    current.current = { ...current.current, richBody: next };
    setValueState(next);
    setDirty(true);
  }

  // `sent` was saved: clean, unless the title or text changed since.
  function savedAs(sent: PatchDraft | null) {
    if (sent && current.current.title === sent.title && current.current.richBody === sent.richBody) setDirty(false);
  }

  // Runs a write that sends `sent` (null: nothing to save) and keeps the
  // Patch it answers with. A Patch in a refusal is the save that went
  // through before the step failed (Publish), so it is kept too.
  async function run(kind: "save" | "publish", sent: PatchDraft | null, write: () => Promise<PatchActionResult>) {
    if (busy) return;
    setBusy(kind);
    setError(null);
    try {
      const result = await write();
      if (result.patch) {
        setPatch(result.patch);
        savedAs(sent);
      }
      if (!result.ok) return setError(result.error ?? UNREACHED);
      router.refresh();
    } catch {
      setError(UNREACHED);
    } finally {
      setBusy(null);
    }
  }

  // A confirmed step (Unpublish, Delete): the dialog shows the error.
  async function confirmStep(write: () => Promise<PatchActionResult>, after?: () => void): Promise<string | null> {
    try {
      const result = await write();
      if (!result.ok) return result.error ?? UNREACHED;
      if (result.patch) setPatch(result.patch);
      after?.();
      router.refresh();
      return null;
    } catch {
      return UNREACHED;
    }
  }

  return {
    patch,
    siteUrl,
    title,
    setTitle,
    value,
    setValue,
    text,
    clean,
    published,
    dirty,
    busy,
    error,
    // Keeps a Patch read or written elsewhere (the post block, www#239);
    // `saved` is the draft it saved, if any.
    adopt: (next: Patch, { saved = null }: { saved?: PatchDraft | null } = {}) => {
      setPatch(next);
      savedAs(saved);
    },
    draft,
    // The value as typed now, for a write that finishes later (a tick's
    // redraft checks the template against it, not against its render's).
    currentValue: () => current.current.richBody,
    save: () => {
      const sent = draft();
      return run("save", sent, () => savePatchAction(patch.number, sent));
    },
    publish: () => {
      const sent = dirty ? draft() : null;
      return run("publish", sent, () => publishPatchAction(patch.number, sent));
    },
    unpublish: () => confirmStep(() => unpublishPatchAction(patch.number)),
    remove: () =>
      confirmStep(
        () => deletePatchAction(patch.number),
        () => {
          setDirty(false);
          router.push(PATCH_EDITOR_PATH);
        },
      ),
  };
}

export type PatchEditorState = ReturnType<typeof usePatchEditor>;
