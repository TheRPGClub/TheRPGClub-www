"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Value } from "platejs";

import {
  deletePatchAction,
  publishPatchAction,
  savePatchAction,
  unpublishPatchAction,
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

  // As a save stores it: sanitized, without empty bullets.
  const clean = patchValue(dropEmptyItems(patchValue(value)));
  const text = patchText(clean, siteUrl ? { siteUrl } : {});
  const published = patch.status === "published";
  const draft = () => ({ title, richBody: value });

  function setTitle(next: string) {
    setTitleState(next);
    setDirty(true);
  }
  function setValue(next: Value) {
    setValueState(next);
    setDirty(true);
  }

  // Runs a write; on success keeps the Patch it answers with.
  async function run(kind: "save" | "publish", write: () => Promise<PatchActionResult>) {
    if (busy) return;
    setBusy(kind);
    setError(null);
    try {
      const result = await write();
      if (!result.ok) return setError(result.error ?? UNREACHED);
      if (result.patch) setPatch(result.patch);
      setDirty(false);
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
    // `saved` when it holds the unsaved changes.
    adopt: (next: Patch, { saved = false }: { saved?: boolean } = {}) => {
      setPatch(next);
      if (saved) setDirty(false);
    },
    draft,
    save: () => run("save", () => savePatchAction(patch.number, draft())),
    publish: () => run("publish", () => publishPatchAction(patch.number, dirty ? draft() : null)),
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
