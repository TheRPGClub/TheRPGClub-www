"use client";

import { useState } from "react";
import type { CodexImageResult } from "@/lib/api/codex-write";
import type { PhotoKey } from "@/lib/codex/lore-story";
import { IMAGES_MAX } from "@/lib/codex/story-schema";
import type { CodexEntry } from "@/lib/codex/types";
import { imageFileProblem } from "@/lib/live-events";

// A desk's photos (www#125, www#126, design 5D), shared by the Lore desk and
// the History Event desk: the entry's images and the files picked on this
// visit, each shown from a local preview until it is uploaded, and the
// uploads that have gone through so far (by the photo's key), so saving
// again after a failure never sends one twice.

export interface DeskPhoto {
  key: string;
  url: string;
  id?: number;
  file?: File;
  state: "ready" | "uploading" | "failed";
  error?: string;
}

// What the manuscript sheet (and its photo drop) reads of a desk.
export interface SheetDesk {
  title: string;
  setTitle: (title: string) => void;
  count: number;
  dirty: boolean;
  photos: DeskPhoto[];
}

export type UploadedImage = { id: number; url: string };

export function photoKey(photo: DeskPhoto): PhotoKey {
  return photo.id !== undefined ? { id: photo.id } : { pendingKey: photo.key };
}

let counter = 0;

export function useDeskPhotos(images: CodexEntry["images"], onChange: () => void) {
  const [photos, setPhotos] = useState<DeskPhoto[]>(() =>
    images.map((image) => ({ key: `image-${image.id}`, id: image.id, url: image.url, state: "ready" as const })),
  );
  const [uploaded] = useState(() => new Map<string, UploadedImage>());

  function change(next: DeskPhoto[]) {
    setPhotos(next);
    onChange();
  }

  // Adds the picked files while there is room. Returns why any were left
  // out (`full` says how many the entry holds), or null.
  function addFiles(files: File[], full: string): string | null {
    const room = Math.max(IMAGES_MAX - photos.length, 0);
    const problems = files.map((file) => imageFileProblem(file)).filter(Boolean);
    const usable = files.filter((file) => !imageFileProblem(file));
    const added = usable.slice(0, room).map((file): DeskPhoto => {
      counter += 1;
      return { key: `new-${Date.now()}-${counter}`, url: URL.createObjectURL(file), file, state: "ready" };
    });
    if (added.length > 0) change([...photos, ...added]);
    if (problems.length > 0) return problems[0]!.replace(", or link it by URL", "");
    return usable.length > room ? full : null;
  }

  function remove(key: string) {
    change(photos.filter((photo) => photo.key !== key));
  }

  function mark(key: string, patch: Partial<DeskPhoto>) {
    setPhotos((list) => list.map((photo) => (photo.key === key ? { ...photo, ...patch } : photo)));
  }

  // The keys of the picked photos not uploaded yet, of those in `keys`.
  function waiting(keys: readonly string[]): string[] {
    return keys.filter((key) => !uploaded.has(key) && photos.some((photo) => photo.key === key && photo.file));
  }

  // Uploads each of `keys` (from `waiting`), one request at a time. A photo
  // that fails keeps its slot with the reason. Returns how many went up and
  // whether any failed.
  async function uploadEach(
    keys: readonly string[],
    upload: (form: FormData) => Promise<CodexImageResult>,
  ): Promise<{ count: number; failed: boolean }> {
    let count = 0;
    let failed = false;
    for (const key of keys) {
      const file = photos.find((photo) => photo.key === key)?.file;
      if (!file || uploaded.has(key)) continue;
      mark(key, { state: "uploading", error: undefined });
      const form = new FormData();
      form.append("file", file, file.name);
      const result = await upload(form);
      if (result.ok && result.image) {
        uploaded.set(key, result.image);
        mark(key, { state: "ready" });
        count += 1;
      } else {
        failed = true;
        mark(key, { state: "failed", error: result.error });
      }
    }
    return { count, failed };
  }

  return { photos, uploaded, addFiles, remove, waiting, uploadEach };
}
