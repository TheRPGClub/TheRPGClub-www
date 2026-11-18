"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Value } from "platejs";
import {
  removeHistoryImagesAction,
  saveHistoryEventAction,
  uploadHistoryImageAction,
  type HistoryDraft,
} from "@/app/actions/codex-history";
import type { DeskPhoto } from "@/hooks/use-lore-desk";
import { historyEventAnchor, isHistoryKind, type HistoryKind } from "@/lib/codex/history";
import { dateDraft, dateFields, type DateDraft } from "@/lib/codex/lore-date";
import { HISTORY_PATH } from "@/lib/codex/paths";
import { IMAGES_MAX, STORY_MAX, storyPlainText } from "@/lib/codex/story-schema";
import type { CodexEntry } from "@/lib/codex/types";
import { imageFileProblem } from "@/lib/live-events";
import { useDeskLinks } from "./use-desk-links";

// The History Event desk's state and its save (www#126, design 5D): the
// title, the description (the editor's value), the Kind, the date (always
// given, Day by default), and the gallery's photos.
//
// Saving runs the steps in app/actions/codex-history.ts: create or edit the
// History Event, remove the images taken off the gallery (so a full one has
// room), then upload each new photo, then save its See also links (www#127).
// A photo that fails keeps its slot with the reason; saving again picks up
// where it stopped.

let counter = 0;

function startDate(entry: CodexEntry | null): DateDraft {
  const draft = dateDraft(entry?.occurred_on ?? null, entry?.date_precision ?? null);
  return draft.choice === "none" ? { ...draft, choice: "day" } : draft;
}

export function useHistoryDesk(entry: CodexEntry | null, initialValue: Value) {
  const router = useRouter();
  const [entryId, setEntryId] = useState<number | null>(entry?.id ?? null);
  const [title, setTitle] = useState(entry?.title ?? "");
  const [value, setValue] = useState<Value>(initialValue);
  const [kind, setKind] = useState<HistoryKind | null>(isHistoryKind(entry?.kind) ? entry.kind : null);
  const [date, setDate] = useState<DateDraft>(() => startDate(entry));
  const [photos, setPhotos] = useState<DeskPhoto[]>(
    () => entry?.images.map((image) => ({ key: `image-${image.id}`, id: image.id, url: image.url, state: "ready" as const })) ?? [],
  );
  const [uploaded] = useState(() => new Map<string, { id: number; url: string }>());
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const links = useDeskLinks(entry?.links ?? [], () => setDirty(true));

  const count = storyPlainText(value).length;
  const dateResult = dateFields(date);
  const missing = !title.trim()
    ? "Give it a title."
    : !kind
      ? "Pick its Kind."
      : count > STORY_MAX
        ? `Over ${STORY_MAX} characters.`
        : "error" in dateResult
          ? dateResult.error
          : null;

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
    else if (usable.length > room) setError(`A History Event holds ${IMAGES_MAX} images.`);
    else setError(null);
  }

  function removePhoto(key: string) {
    touch(setPhotos)(photos.filter((photo) => photo.key !== key));
  }

  function mark(key: string, patch: Partial<DeskPhoto>) {
    setPhotos((list) => list.map((photo) => (photo.key === key ? { ...photo, ...patch } : photo)));
  }

  function draft(): HistoryDraft {
    const fields = "error" in dateResult ? { occurred_on: null, date_precision: null } : dateResult;
    return { title, kind, richBody: value, ...fields };
  }

  async function save() {
    if (missing || saving) return;
    setSaving(true);
    setError(null);
    try {
      const saved = await saveHistoryEventAction(entryId, draft());
      if (!saved.ok || !saved.id) return setError(saved.error ?? "That didn't save. Try again.");
      const id = saved.id;
      setEntryId(id);
      // Off the gallery: the entry's images no longer on the desk, and any
      // uploaded on an earlier try and removed since.
      const onDesk = new Set(photos.map((photo) => photo.key));
      const kept = new Set(photos.map((photo) => photo.id).filter((photoId) => photoId !== undefined));
      const removed = [
        ...(entry?.images ?? []).map((image) => image.id).filter((imageId) => !kept.has(imageId)),
        ...[...uploaded].filter(([key]) => !onDesk.has(key)).map(([, image]) => image.id),
      ];
      if (removed.length > 0) {
        const result = await removeHistoryImagesAction(id, removed);
        if (!result.ok) return setError(result.error ?? "An image didn't come off. Try again.");
      }
      let failed = false;
      for (const photo of photos) {
        if (!photo.file || uploaded.has(photo.key)) continue;
        mark(photo.key, { state: "uploading", error: undefined });
        const form = new FormData();
        form.append("file", photo.file, photo.file.name);
        const result = await uploadHistoryImageAction(id, form);
        if (result.ok && result.image) {
          uploaded.set(photo.key, result.image);
          mark(photo.key, { state: "ready" });
        } else {
          failed = true;
          mark(photo.key, { state: "failed", error: result.error });
        }
      }
      const linkError = await links.save(id);
      if (linkError) return setError(`The History Event is saved, but See also isn't: ${linkError}`);
      if (failed) return setError("The History Event is saved, but an image didn't upload. Retry it or remove it.");
      setDirty(false);
      router.push(`${HISTORY_PATH}#${historyEventAnchor(id)}`);
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
    kind,
    setKind: touch(setKind),
    date,
    setDate: touch(setDate),
    photos,
    addFiles,
    removePhoto,
    links,
    count,
    missing,
    dirty,
    saving,
    error,
    save,
  };
}

export type HistoryDesk = ReturnType<typeof useHistoryDesk>;
