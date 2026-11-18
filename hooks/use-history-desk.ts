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
import { dateDraft, dateFields, type DateDraft } from "@/lib/codex/codex-date";
import { HISTORY_PATH, historyEventAnchor } from "@/lib/codex/paths";
import { IMAGES_MAX, STORY_MAX, storyPlainText } from "@/lib/codex/story-schema";
import type { CodexEntry, HistoryKind } from "@/lib/codex/types";
import { useDeskPhotos } from "./use-desk-photos";
import { useDeskLinks } from "./use-desk-links";

// The History Event desk's state and its save (www#126, design 5D): the
// title, the description (the editor's value), the Kind, the date (always
// given, Day by default), and the gallery's photos.
//
// Saving runs the steps in app/actions/codex-history.ts: create or edit the
// History Event, then remove the images taken off the gallery (so a full one
// has room; the gallery isn't placed in the description, so nothing saved
// still shows them), then upload each new photo, then save its See also
// links (www#127). A photo that fails keeps its slot with the reason; saving
// again picks up where it stopped.

const RETRY = "That didn't save. Try again.";

function startDate(entry: CodexEntry | null): DateDraft {
  const draft = dateDraft(entry?.occurred_on ?? null, entry?.date_precision ?? null);
  return draft.choice === "none" ? { ...draft, choice: "day" } : draft;
}

const UNREACHED = "Couldn't reach the site. Check your connection and save again.";

export function useHistoryDesk(entry: CodexEntry | null, initialValue: Value) {
  const router = useRouter();
  const [entryId, setEntryId] = useState<number | null>(entry?.id ?? null);
  const [title, setTitle] = useState(entry?.title ?? "");
  const [value, setValue] = useState<Value>(initialValue);
  const [kind, setKind] = useState<HistoryKind | null>(entry?.kind ?? null);
  const [date, setDate] = useState<DateDraft>(() => startDate(entry));
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // A create that may have gone through without saying so (see the Lore
  // desk): publishing again could make a second History Event.
  const [unsure, setUnsure] = useState(false);
  const photos = useDeskPhotos(entry?.images ?? [], () => setDirty(true));
  const links = useDeskLinks(entry?.links ?? [], () => setDirty(true));

  const count = storyPlainText(value).length;
  const dateResult = dateFields(date);
  const missing = unsure
    ? "Check the Club History first."
    : !title.trim()
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
    setError(photos.addFiles(files, `A History Event holds ${IMAGES_MAX} images.`));
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
      if (!saved.ok || !saved.id) {
        if (saved.unsure) setUnsure(true);
        return setError(saved.error ?? RETRY);
      }
      const id = saved.id;
      setEntryId(id);
      // Off the gallery: the entry's images no longer on the desk, and any
      // uploaded on an earlier try and removed since.
      const onDesk = new Set(photos.photos.map((photo) => photo.key));
      const kept = new Set(photos.photos.map((photo) => photo.id).filter((photoId) => photoId !== undefined));
      const removed = [
        ...(entry?.images ?? []).map((image) => image.id).filter((imageId) => !kept.has(imageId)),
        ...[...photos.uploaded].filter(([key]) => !onDesk.has(key)).map(([, image]) => image.id),
      ];
      if (removed.length > 0) {
        const result = await removeHistoryImagesAction(id, removed);
        if (!result.ok) return setError(`The History Event is saved, but an image didn't come off: ${result.error ?? RETRY}`);
      }
      const upload = await photos.uploadEach(
        photos.waiting(photos.photos.map((photo) => photo.key)),
        (form) => uploadHistoryImageAction(id, form),
      );
      const linkError = await links.save(id);
      if (linkError) return setError(`The History Event is saved, but See also isn't: ${linkError}`);
      if (upload.failed) return setError("The History Event is saved, but an image didn't upload. Retry it or remove it.");
      setDirty(false);
      router.push(`${HISTORY_PATH}#${historyEventAnchor(id)}`);
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
    kind,
    setKind: touch(setKind),
    date,
    setDate: touch(setDate),
    photos: photos.photos,
    addFiles,
    removePhoto: photos.remove,
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
