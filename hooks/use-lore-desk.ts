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
import { dateDraft, dateFields, type DateDraft } from "@/lib/codex/lore-date";
import { imageIndex, resolvePending, storyPendingKeys } from "@/lib/codex/lore-story";
import { LORE_PATH } from "@/lib/codex/paths";
import { IMAGES_MAX, STORY_MAX, storyPlainText } from "@/lib/codex/story-schema";
import type { CodexEntry } from "@/lib/codex/types";
import { imageFileProblem } from "@/lib/live-events";

// The Lore desk's state and its save (www#125, design 5D): the title, the
// story (the editor's value), the Date card, and the drawer's photos.
//
// A photo is one the entry already has (`id`) or one picked on this visit
// (`file`, shown from a local preview until it is uploaded). Saving runs the
// steps in app/actions/codex-lore.ts: create the entry if it is new, delete
// the images the story no longer places, upload the placed photos, then save
// the story with their ids and urls. A photo that fails keeps its slot with
// the reason; saving again picks up where it stopped.

export interface DeskPhoto {
  key: string;
  url: string;
  id?: number;
  file?: File;
  state: "ready" | "uploading" | "failed";
  error?: string;
}

// What the manuscript sheet (and its photo drop) reads of a desk: the Lore
// desk's and the History Event desk's (www#126).
export interface SheetDesk {
  title: string;
  setTitle: (title: string) => void;
  count: number;
  dirty: boolean;
  photos: DeskPhoto[];
}

export function photoKey(photo: DeskPhoto) {
  return photo.id !== undefined ? { id: photo.id } : { pendingKey: photo.key };
}

let counter = 0;

export function useLoreDesk(entry: CodexEntry | null, initialValue: Value) {
  const router = useRouter();
  const [entryId, setEntryId] = useState<number | null>(entry?.id ?? null);
  const [title, setTitle] = useState(entry?.title ?? "");
  const [value, setValue] = useState<Value>(initialValue);
  const [date, setDate] = useState<DateDraft>(() => dateDraft(entry?.occurred_on ?? null, entry?.date_precision ?? null));
  const [photos, setPhotos] = useState<DeskPhoto[]>(
    () => entry?.images.map((image) => ({ key: `image-${image.id}`, id: image.id, url: image.url, state: "ready" as const })) ?? [],
  );
  const [uploaded] = useState(() => new Map<string, { id: number; url: string }>());
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const count = storyPlainText(value).length;
  const dateResult = dateFields(date);
  const missing =
    !title.trim() ? "Give it a title." : count === 0 ? "Write the story." : count > STORY_MAX ? `Over ${STORY_MAX} characters.` : "error" in dateResult ? dateResult.error : null;
  const unplaced = photos.filter((photo) => imageIndex(value, photoKey(photo)) < 0);

  function touch<T>(set: (v: T) => void) {
    return (v: T) => {
      set(v);
      setDirty(true);
    };
  }

  function addFiles(files: File[]) {
    const room = Math.max(IMAGES_MAX - photos.length, 0);
    const problems = files.map((file) => imageFileProblem(file)).filter(Boolean);
    const usable = files.filter((file) => !imageFileProblem(file));
    const added = usable.slice(0, room).map((file): DeskPhoto => {
      counter += 1;
      return { key: `new-${Date.now()}-${counter}`, url: URL.createObjectURL(file), file, state: "ready" };
    });
    if (added.length > 0) touch(setPhotos)([...photos, ...added]);
    if (problems.length > 0) setError(problems[0]!.replace(", or link it by URL", ""));
    else if (usable.length > room) setError(`A Lore Entry holds ${IMAGES_MAX} photos.`);
    else setError(null);
  }

  function removePhoto(key: string) {
    touch(setPhotos)(photos.filter((photo) => photo.key !== key));
  }

  function mark(key: string, patch: Partial<DeskPhoto>) {
    setPhotos((list) => list.map((photo) => (photo.key === key ? { ...photo, ...patch } : photo)));
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
      let id = entryId;
      const created = id === null;
      if (id === null) {
        const result = await saveLoreEntryAction(null, draftOf(value));
        if (!result.ok || !result.id) return setError(result.error ?? "That didn't save. Try again.");
        id = result.id;
        setEntryId(id);
      } else {
        const pruned = await pruneLoreImagesAction(id, resolvePending(value, uploaded));
        if (!pruned.ok) return setError(pruned.error ?? "That didn't save. Try again.");
      }
      let failed = false;
      for (const key of storyPendingKeys(value)) {
        const photo = photos.find((p) => p.key === key);
        if (!photo?.file || uploaded.has(key)) continue;
        mark(key, { state: "uploading", error: undefined });
        const form = new FormData();
        form.append("file", photo.file, photo.file.name);
        const result = await uploadLoreImageAction(id, form);
        if (result.ok && result.image) {
          uploaded.set(key, result.image);
          mark(key, { state: "ready" });
        } else {
          failed = true;
          mark(key, { state: "failed", error: result.error });
        }
      }
      if (!created || uploaded.size > 0) {
        const result = await saveLoreEntryAction(id, draftOf(resolvePending(value, uploaded)));
        if (!result.ok) return setError(result.error ?? "That didn't save. Try again.");
      }
      if (failed) return setError("The Lore Entry is saved, but a photo didn't upload. Retry it or remove it, then save again.");
      setDirty(false);
      router.push(`${LORE_PATH}/${id}`);
      router.refresh();
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
    photos,
    addFiles,
    removePhoto,
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
