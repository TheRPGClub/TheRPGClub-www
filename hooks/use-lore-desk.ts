"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Value } from "platejs";
import {
  pruneLoreImagesAction,
  saveLoreEntryAction,
  uploadLoreImageAction,
  type LoreDraft,
} from "@/app/actions/codex-lore";
import { dateDraft, dateFields, type DateDraft } from "@/lib/codex/codex-date";
import { runLoreSave } from "@/lib/codex/lore-save";
import { imageIndex, storyPendingKeys } from "@/lib/codex/lore-story";
import { LORE_PATH } from "@/lib/codex/paths";
import { IMAGES_MAX, STORY_MAX, storyPlainText } from "@/lib/codex/story-schema";
import type { CodexEntry } from "@/lib/codex/types";
import { photoKey, useDeskPhotos } from "./use-desk-photos";
import { useDeskLinks } from "./use-desk-links";

// The Lore desk's state and its save (www#125, design 5D): the title, the
// story (the editor's value), the Date card, and the drawer's photos.
//
// Saving runs the actions in app/actions/codex-lore.ts in the order
// lib/codex/lore-save.ts sets: no photo is deleted before a story without it
// has saved. A failed step keeps what the desk holds; saving again picks up
// where it stopped.

const UNREACHED = "Couldn't reach the site. Check your connection and save again.";

export function useLoreDesk(entry: CodexEntry | null, initialValue: Value) {
  const router = useRouter();
  const [entryId, setEntryId] = useState<number | null>(entry?.id ?? null);
  const [title, setTitle] = useState(entry?.title ?? "");
  const [value, setValue] = useState<Value>(initialValue);
  const [date, setDate] = useState<DateDraft>(() => dateDraft(entry?.occurred_on ?? null, entry?.date_precision ?? null));
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // A create that may have gone through without saying so: publishing again
  // could make a second Lore Entry, so the desk stops here.
  const [unsure, setUnsure] = useState(false);
  const photos = useDeskPhotos(entry?.images ?? [], () => setDirty(true));
  const links = useDeskLinks(entry?.links ?? [], () => setDirty(true));

  const count = storyPlainText(value).length;
  const dateResult = dateFields(date);
  const missing = unsure
    ? "Check Club Lore first."
    : !title.trim()
      ? "Give it a title."
      : count === 0
        ? "Write the story."
        : count > STORY_MAX
          ? `Over ${STORY_MAX} characters.`
          : "error" in dateResult
            ? dateResult.error
            : null;
  const unplaced = photos.photos.filter((photo) => imageIndex(value, photoKey(photo)) < 0);

  function touch<T>(set: (v: T) => void) {
    return (v: T) => {
      set(v);
      setDirty(true);
    };
  }

  function addFiles(files: File[]) {
    setError(photos.addFiles(files, `A Lore Entry holds ${IMAGES_MAX} photos.`));
  }

  function draftOf(story: Value): LoreDraft {
    const fields = "error" in dateResult ? { occurred_on: null, date_precision: null } : dateResult;
    return { title, richBody: story, ...fields };
  }

  async function save() {
    if (missing || saving) return;
    setSaving(true);
    setError(null);
    try {
      const plan = {
        entryId,
        existing: entry !== null,
        value,
        adding: photos.waiting(storyPendingKeys(value)),
        uploaded: photos.uploaded,
      };
      const outcome = await runLoreSave(plan, {
        save: (id, story) => saveLoreEntryAction(id, draftOf(story)),
        prune: (id, story) => pruneLoreImagesAction(id, story),
        uploadEach: (id, keys) => photos.uploadEach(keys, (form) => uploadLoreImageAction(id, form)),
        saveLinks: (id) => links.save(id),
        onEntry: setEntryId,
      });
      if (outcome.id !== null) setEntryId(outcome.id);
      if (outcome.unsure) setUnsure(true);
      if (outcome.error !== null) return setError(outcome.error);
      setDirty(false);
      router.push(`${LORE_PATH}/${outcome.id}`);
      router.refresh();
    } catch {
      // The request itself failed (the site unreachable): what saved so far
      // stays saved, and saving again picks up from there.
      setError(UNREACHED);
    } finally {
      setSaving(false);
    }
  }

  return {
    entryId,
    title,
    setTitle: touch(setTitle),
    value,
    setValue: touch(setValue),
    date,
    setDate: touch(setDate),
    photos: photos.photos,
    addFiles,
    removePhoto: photos.remove,
    links,
    count,
    missing,
    unplaced,
    dirty,
    saving,
    error,
    save,
  };
}

export type LoreDesk = ReturnType<typeof useLoreDesk>;
