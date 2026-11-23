import type { GameEditSection } from "./engine";

// Images: the game's covers, key art and logos (GET /games/:id/images).
// Uploads, primary changes, reorders and deletes stage here; Save all runs
// the deletes, then one update per moved or newly primary image, then the
// uploads. Refresh from IGDB is an action, not an edit (see the tab).

export type ImageKind = "cover" | "artwork" | "logo";
export const IMAGE_KINDS: readonly ImageKind[] = ["cover", "artwork", "logo"];

export interface GameImageEntry {
  image_id: number;
  kind: ImageKind;
  url: string | null;
  is_primary: boolean;
  position: number;
}

// A chosen file, shown as a pending preview until Save all uploads it.
export interface PendingImage {
  key: string;
  kind: ImageKind;
  file: File;
}

// An image on the page: a loaded one's id, or a pending upload's key.
export type ImageRef = number | string;

export interface ImagesStage {
  uploads?: PendingImage[];
  deletes?: number[];
  // The primary chosen per kind, where it differs from the record's.
  primary?: Partial<Record<ImageKind, ImageRef>>;
  // A kind's loaded images in their new order.
  order?: Partial<Record<ImageKind, number[]>>;
}

export type ImageCall =
  | { kind: "image.upload"; image: PendingImage; primary: boolean }
  | { kind: "image.update"; imageId: number; fields: { is_primary?: true; position?: number } }
  | { kind: "image.delete"; imageId: number };

// Server actions carry at most 5 MB (next.config.ts), multipart included.
export const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

// Why a chosen file can't be uploaded, or null.
export function imageFileProblem(file: File): string | null {
  if (!IMAGE_TYPES.includes(file.type)) return `${file.name} isn't a JPEG, PNG, WebP or GIF.`;
  if (file.size === 0) return `${file.name} is empty.`;
  if (file.size > MAX_IMAGE_BYTES) return `${file.name} is larger than 4 MB.`;
  return null;
}

function loadedOfKind(loaded: GameImageEntry[], kind: ImageKind) {
  return loaded.filter((i) => i.kind === kind).sort((a, b) => a.position - b.position || a.image_id - b.image_id);
}

// The kind's loaded ids in staged order; ids no longer loaded drop out and
// any not in the staged order keep their place at the end.
function orderOf(loaded: GameImageEntry[], staged: ImagesStage, kind: ImageKind): number[] {
  const ids = loadedOfKind(loaded, kind).map((i) => i.image_id);
  const wanted = (staged.order?.[kind] ?? []).filter((id) => ids.includes(id));
  return [...wanted, ...ids.filter((id) => !wanted.includes(id))];
}

const deleted = (staged: ImagesStage, id: number) => (staged.deletes ?? []).includes(id);
const uploadsOf = (staged: ImagesStage, kind: ImageKind) => (staged.uploads ?? []).filter((u) => u.kind === kind);

// The kind's primary once saved: the one starred, else the record's while it
// stays; with that deleted, or a kind with none getting uploads, the first left.
function primaryOf(loaded: GameImageEntry[], staged: ImagesStage, kind: ImageKind): ImageRef | null {
  const remaining = orderOf(loaded, staged, kind).filter((id) => !deleted(staged, id));
  const uploads = uploadsOf(staged, kind).map((u) => u.key);
  const starred = staged.primary?.[kind];
  if (starred !== undefined && [...remaining, ...uploads].includes(starred)) return starred;
  const current = loadedOfKind(loaded, kind).find((i) => i.is_primary)?.image_id;
  if (current !== undefined && remaining.includes(current)) return current;
  if (current === undefined && uploads.length === 0) return null;
  return remaining[0] ?? uploads[0] ?? null;
}

const sameOrder = (a: number[], b: number[]) => a.length === b.length && a.every((id, i) => id === b[i]);

function reordered(loaded: GameImageEntry[], staged: ImagesStage, kind: ImageKind): boolean {
  const live = (ids: number[]) => ids.filter((id) => !deleted(staged, id));
  return !sameOrder(live(orderOf(loaded, staged, kind)), live(loadedOfKind(loaded, kind).map((i) => i.image_id)));
}

function plan(loaded: GameImageEntry[], staged: ImagesStage): ImageCall[] {
  const ids = new Set(loaded.map((i) => i.image_id));
  const calls: ImageCall[] = (staged.deletes ?? [])
    .filter((id) => ids.has(id))
    .map((imageId) => ({ kind: "image.delete", imageId }));
  const uploads: ImageCall[] = [];
  for (const kind of IMAGE_KINDS) {
    const primary = primaryOf(loaded, staged, kind);
    const moved = reordered(loaded, staged, kind);
    const remaining = orderOf(loaded, staged, kind).filter((id) => !deleted(staged, id));
    remaining.forEach((id, i) => {
      const image = loaded.find((l) => l.image_id === id)!;
      const fields: { is_primary?: true; position?: number } = {};
      if (moved && image.position !== i + 1) fields.position = i + 1;
      if (primary === id && !image.is_primary) fields.is_primary = true;
      if (Object.keys(fields).length > 0) calls.push({ kind: "image.update", imageId: id, fields });
    });
    for (const u of uploadsOf(staged, kind)) uploads.push({ kind: "image.upload", image: u, primary: primary === u.key });
  }
  return [...calls, ...uploads];
}

function changes(loaded: GameImageEntry[], staged: ImagesStage): number {
  const ids = new Set(loaded.map((i) => i.image_id));
  let n = (staged.uploads ?? []).length + (staged.deletes ?? []).filter((id) => ids.has(id)).length;
  for (const kind of IMAGE_KINDS) {
    const starred = staged.primary?.[kind];
    const current = loadedOfKind(loaded, kind).find((i) => i.is_primary)?.image_id;
    if (starred !== undefined && starred !== current && primaryOf(loaded, staged, kind) === starred) n += 1;
    if (reordered(loaded, staged, kind)) n += 1;
  }
  return n;
}

function apply(loaded: GameImageEntry[], staged: ImagesStage): GameImageEntry[] {
  return IMAGE_KINDS.flatMap((kind) => {
    const primary = primaryOf(loaded, staged, kind);
    const moved = reordered(loaded, staged, kind);
    return orderOf(loaded, staged, kind)
      .filter((id) => !deleted(staged, id))
      .map((id, i) => {
        const image = loaded.find((l) => l.image_id === id)!;
        const isPrimary = typeof primary === "string" ? false : primary === null ? image.is_primary : primary === id;
        return { ...image, position: moved ? i + 1 : image.position, is_primary: isPrimary };
      });
  });
}

// After a partial failure: what went through (deletes, uploads) leaves the
// stage so a retry doesn't repeat it; reorders and stars are diffs, kept.
function remaining(_loaded: GameImageEntry[], staged: ImagesStage, saved: ImageCall[]): ImagesStage {
  const gone = saved.flatMap((c) => (c.kind === "image.delete" ? [c.imageId] : []));
  const sent = saved.flatMap((c) => (c.kind === "image.upload" ? [c.image.key] : []));
  const next: ImagesStage = { ...staged };
  if (staged.deletes) next.deletes = staged.deletes.filter((id) => !gone.includes(id));
  if (staged.uploads) next.uploads = staged.uploads.filter((u) => !sent.includes(u.key));
  if (staged.primary) {
    next.primary = Object.fromEntries(
      Object.entries(staged.primary).filter(([, ref]) => !(typeof ref === "string" && sent.includes(ref))),
    );
  }
  return next;
}

export const imagesSection: GameEditSection<GameImageEntry[], ImagesStage, ImageCall> = {
  label: "Images",
  access: "admin",
  changes,
  check: (staged) => {
    for (const u of staged.uploads ?? []) {
      const problem = imageFileProblem(u.file);
      if (problem) return problem;
    }
    return null;
  },
  plan,
  apply,
  remaining,
};

// ---- Staging helpers for the tab -------------------------------------------

export interface ImageTile {
  ref: ImageRef;
  url: string | null;
  upload?: PendingImage;
  deleted: boolean;
  primary: boolean;
}

// A kind as the tab shows it: loaded images in staged order (deletes marked),
// then the pending uploads, with the primary-to-be marked.
export function imageKindView(loaded: GameImageEntry[], staged: ImagesStage, kind: ImageKind): ImageTile[] {
  const primary = primaryOf(loaded, staged, kind);
  const tiles: ImageTile[] = orderOf(loaded, staged, kind).map((id) => {
    const image = loaded.find((l) => l.image_id === id)!;
    return { ref: id, url: image.url, deleted: deleted(staged, id), primary: primary === id };
  });
  for (const u of uploadsOf(staged, kind)) tiles.push({ ref: u.key, url: null, upload: u, deleted: false, primary: primary === u.key });
  return tiles;
}

// True when the stage holds nothing (the tab then unstages the section).
export function imagesUntouched(staged: ImagesStage): boolean {
  return (
    !staged.uploads?.length &&
    !staged.deletes?.length &&
    Object.keys(staged.primary ?? {}).length === 0 &&
    Object.keys(staged.order ?? {}).length === 0
  );
}

function withKey<T>(map: Partial<Record<ImageKind, T>> | undefined, kind: ImageKind, value: T | undefined) {
  const next = { ...map };
  if (value === undefined) delete next[kind];
  else next[kind] = value;
  return next;
}

export function stageImageUpload(staged: ImagesStage, upload: PendingImage): ImagesStage {
  return { ...staged, uploads: [...(staged.uploads ?? []), upload] };
}

export function unstageImageUpload(staged: ImagesStage, key: string): ImagesStage {
  const primary = Object.fromEntries(Object.entries(staged.primary ?? {}).filter(([, ref]) => ref !== key));
  return { ...staged, uploads: (staged.uploads ?? []).filter((u) => u.key !== key), primary };
}

export function toggleImageDelete(staged: ImagesStage, id: number): ImagesStage {
  const deletes = staged.deletes ?? [];
  return { ...staged, deletes: deletes.includes(id) ? deletes.filter((d) => d !== id) : [...deletes, id] };
}

export function setPrimaryImage(loaded: GameImageEntry[], staged: ImagesStage, kind: ImageKind, ref: ImageRef): ImagesStage {
  const current = loadedOfKind(loaded, kind).find((i) => i.is_primary)?.image_id;
  return { ...staged, primary: withKey(staged.primary, kind, ref === current ? undefined : ref) };
}

// Moves a loaded image one place earlier (-1) or later (+1) in its kind.
export function moveImage(loaded: GameImageEntry[], staged: ImagesStage, kind: ImageKind, id: number, by: -1 | 1): ImagesStage {
  const order = orderOf(loaded, staged, kind);
  const from = order.indexOf(id);
  const to = from + by;
  if (from < 0 || to < 0 || to >= order.length) return staged;
  [order[from], order[to]] = [order[to], order[from]];
  const original = loadedOfKind(loaded, kind).map((i) => i.image_id);
  return { ...staged, order: withKey(staged.order, kind, sameOrder(order, original) ? undefined : order) };
}
