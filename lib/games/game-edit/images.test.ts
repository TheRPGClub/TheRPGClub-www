import { describe, expect, it } from "vitest";

import { gameEditSave, type GameEditCall, type GameEditRecord, type GameEditSteps } from "./index";
import type { StepResult } from "./engine";
import {
  imageKindView,
  imagesUntouched,
  moveImage,
  setPrimaryImage,
  stageImageUpload,
  toggleImageDelete,
  unstageImageUpload,
  type GameImageEntry,
  type ImagesStage,
  type PendingImage,
} from "./images";

// The Images section through the save module, with fake steps that record
// each call and fail on demand.
function steps(failOn?: (call: GameEditCall) => boolean) {
  const calls: GameEditCall[] = [];
  const answer = async (call: GameEditCall): Promise<StepResult> => {
    calls.push(call);
    return failOn?.(call) ? { ok: false, error: "Backblaze request failed." } : { ok: true };
  };
  const run = {
    "game.update": answer,
    "image.upload": answer,
    "image.update": answer,
    "image.delete": answer,
  } as GameEditSteps;
  return { calls, run };
}

const img = (image_id: number, kind: GameImageEntry["kind"], position: number, is_primary = false): GameImageEntry => ({
  image_id,
  kind,
  position,
  is_primary,
  url: `https://img.example/${image_id}.jpg`,
});

const images: GameImageEntry[] = [
  img(1, "cover", 1, true),
  img(2, "cover", 2),
  img(3, "cover", 3),
  img(10, "artwork", 1, true),
  img(11, "artwork", 2),
  img(20, "logo", 1, true),
];

const record = {
  text: { description: "A hero sets out.", featured_video_url: null },
  images,
} as GameEditRecord;
const admin = { admin: true, threads: true };
const regular = { admin: false, threads: true };

const pending = (key: string, kind: PendingImage["kind"], size = 1000, type = "image/png"): PendingImage => ({
  key,
  kind,
  file: new File([new Uint8Array(size)], `${key}.png`, { type }),
});

describe("Images", () => {
  it("makes no call for an untouched or empty stage", async () => {
    const { calls, run } = steps();
    await gameEditSave.run(record, {}, admin, run);
    await gameEditSave.run(record, { images: {} }, admin, run);
    expect(calls).toEqual([]);
    expect(gameEditSave.changes(record, { images: {} }, admin).total).toBe(0);
  });

  it("uploads a staged image as an extra of its kind", async () => {
    const { calls, run } = steps();
    const upload = pending("u1", "artwork");
    const outcome = await gameEditSave.run(record, { images: { uploads: [upload] } }, admin, run);
    expect(calls).toEqual([{ kind: "image.upload", image: upload, primary: false }]);
    expect(outcome.staged).toEqual({});
  });

  it("makes the first upload of an empty kind its primary", async () => {
    const { calls, run } = steps();
    const bare = { ...record, images: images.filter((i) => i.kind !== "logo") };
    const upload = pending("u1", "logo");
    await gameEditSave.run(bare, { images: { uploads: [upload, pending("u2", "logo")] } }, admin, run);
    expect(calls.map((c) => c.kind === "image.upload" && [c.image.key, c.primary])).toEqual([
      ["u1", true],
      ["u2", false],
    ]);
  });

  it("leaves a kind without a primary alone, but makes its first upload primary", async () => {
    const { calls, run } = steps();
    const noPrimary = { ...record, images: [img(1, "cover", 1), img(2, "cover", 2)] };
    const upload = pending("u1", "cover");
    const outcome = await gameEditSave.run(noPrimary, { images: { uploads: [upload] } }, admin, run);
    expect(calls).toEqual([{ kind: "image.upload", image: upload, primary: true }]);
    expect(outcome.record.images.filter((i) => i.is_primary)).toEqual([]);
    expect(imageKindView(noPrimary.images, { uploads: [upload] }, "cover").map((t) => t.primary)).toEqual([false, false, true]);
  });

  it("counts a starred pending upload once", () => {
    const stage: ImagesStage = { uploads: [pending("u1", "cover")], primary: { cover: "u1" } };
    expect(gameEditSave.changes(record, { images: stage }, admin).total).toBe(1);
  });

  it("uploads a staged upload as primary when it was starred", async () => {
    const { calls, run } = steps();
    const upload = pending("u1", "cover");
    await gameEditSave.run(record, { images: { uploads: [upload], primary: { cover: "u1" } } }, admin, run);
    expect(calls).toEqual([{ kind: "image.upload", image: upload, primary: true }]);
  });

  it("makes another image primary with one update", async () => {
    const { calls, run } = steps();
    const outcome = await gameEditSave.run(record, { images: { primary: { cover: 3 } } }, admin, run);
    expect(calls).toEqual([{ kind: "image.update", imageId: 3, fields: { is_primary: true } }]);
    expect(outcome.record.images.filter((i) => i.kind === "cover" && i.is_primary).map((i) => i.image_id)).toEqual([3]);
  });

  it("sends a position update only for the images a reorder moved", async () => {
    const { calls, run } = steps();
    await gameEditSave.run(record, { images: { order: { cover: [1, 3, 2] } } }, admin, run);
    expect(calls).toEqual([
      { kind: "image.update", imageId: 3, fields: { position: 2 } },
      { kind: "image.update", imageId: 2, fields: { position: 3 } },
    ]);
  });

  it("deletes a staged delete", async () => {
    const { calls, run } = steps();
    const outcome = await gameEditSave.run(record, { images: { deletes: [2] } }, admin, run);
    expect(calls).toEqual([{ kind: "image.delete", imageId: 2 }]);
    expect(outcome.record.images.map((i) => i.image_id)).not.toContain(2);
  });

  it("promotes the next image when the primary is deleted", async () => {
    const { calls, run } = steps();
    await gameEditSave.run(record, { images: { deletes: [1] } }, admin, run);
    expect(calls).toEqual([
      { kind: "image.delete", imageId: 1 },
      { kind: "image.update", imageId: 2, fields: { is_primary: true } },
    ]);
  });

  it("runs deletes, then updates, then uploads", async () => {
    const { calls, run } = steps();
    const upload = pending("u1", "artwork");
    await gameEditSave.run(
      record,
      { images: { uploads: [upload], deletes: [3], primary: { artwork: 11 }, order: { artwork: [11, 10] } } },
      admin,
      run,
    );
    expect(calls.map((c) => c.kind)).toEqual(["image.delete", "image.update", "image.update", "image.upload"]);
    expect(calls[1]).toEqual({ kind: "image.update", imageId: 11, fields: { position: 1, is_primary: true } });
    expect(calls[2]).toEqual({ kind: "image.update", imageId: 10, fields: { position: 2 } });
  });

  it("counts each upload, delete, primary change and reordered kind", () => {
    const stage: ImagesStage = {
      uploads: [pending("u1", "cover"), pending("u2", "logo")],
      deletes: [11],
      primary: { cover: 2 },
      order: { cover: [2, 1, 3] },
    };
    expect(gameEditSave.changes(record, { images: stage }, admin)).toEqual({ total: 5, bySection: { images: 5 } });
  });

  it("doesn't count a reorder that was moved back", () => {
    expect(gameEditSave.changes(record, { images: { order: { cover: [1, 2, 3] } } }, admin).total).toBe(0);
  });

  it("keeps a failed upload staged and drops the calls that went through", async () => {
    const { calls, run } = steps((c) => c.kind === "image.upload" && c.image.key === "u2");
    const u1 = pending("u1", "artwork");
    const u2 = pending("u2", "artwork");
    const outcome = await gameEditSave.run(record, { images: { deletes: [2], uploads: [u1, u2] } }, admin, run);
    expect(calls.map((c) => c.kind)).toEqual(["image.delete", "image.upload", "image.upload"]);
    expect(outcome.sections).toEqual([
      { key: "images", label: "Images", status: "failed", error: "Backblaze request failed." },
    ]);
    expect(outcome.staged).toEqual({ images: { deletes: [], uploads: [u2] } });
  });

  it("saves the other sections when Images fails", async () => {
    const { run } = steps((c) => c.kind === "image.delete");
    const outcome = await gameEditSave.run(
      record,
      { text: { description: "New." }, images: { deletes: [2] } },
      admin,
      run,
    );
    expect(outcome.sections.map((s) => [s.key, s.status])).toEqual([
      ["text", "saved"],
      ["images", "failed"],
    ]);
    expect(outcome.staged).toEqual({ images: { deletes: [2] } });
  });

  it("refuses an upload that isn't an image or is too large, without calling", async () => {
    const { calls, run } = steps();
    const big = await gameEditSave.run(
      record,
      { images: { uploads: [pending("u1", "cover", 5 * 1024 * 1024)] } },
      admin,
      run,
    );
    const pdf = await gameEditSave.run(
      record,
      { images: { uploads: [pending("u1", "cover", 10, "application/pdf")] } },
      admin,
      run,
    );
    expect(calls).toEqual([]);
    expect(big.sections[0].error).toMatch(/4 MB/);
    expect(pdf.sections[0].error).toMatch(/JPEG, PNG, WebP or GIF/);
  });

  it("never plans an image call for a Regular", () => {
    expect(gameEditSave.plan(record, { images: { deletes: [2], uploads: [pending("u1", "cover")] } }, regular)).toEqual([]);
  });
});

describe("Images staging", () => {
  it("lists a kind in its staged order with the uploads after and the primary marked", () => {
    const stage: ImagesStage = { uploads: [pending("u1", "cover")], deletes: [2], order: { cover: [3, 1, 2] }, primary: { cover: "u1" } };
    expect(
      imageKindView(images, stage, "cover").map((t) => [t.ref, t.deleted, t.primary]),
    ).toEqual([
      [3, false, false],
      [1, false, false],
      [2, true, false],
      ["u1", false, true],
    ]);
  });

  it("moves an image within its kind, and drops the order once it's back", () => {
    let stage = moveImage(images, {}, "cover", 3, -1);
    expect(stage.order).toEqual({ cover: [1, 3, 2] });
    stage = moveImage(images, stage, "cover", 3, 1);
    expect(imagesUntouched(stage)).toBe(true);
  });

  it("stars and unstars back to the loaded primary", () => {
    let stage = setPrimaryImage(images, {}, "cover", 2);
    expect(stage.primary).toEqual({ cover: 2 });
    stage = setPrimaryImage(images, stage, "cover", 1);
    expect(imagesUntouched(stage)).toBe(true);
  });

  it("stages and undoes a delete, and adds and drops an upload", () => {
    let stage = toggleImageDelete({}, 2);
    expect(stage.deletes).toEqual([2]);
    stage = toggleImageDelete(stage, 2);
    expect(imagesUntouched(stage)).toBe(true);
    const upload = pending("u1", "logo");
    stage = stageImageUpload(stage, upload);
    expect(stage.uploads).toEqual([upload]);
    stage = setPrimaryImage(images, stage, "logo", "u1");
    stage = unstageImageUpload(stage, "u1");
    expect(imagesUntouched(stage)).toBe(true);
  });
});
