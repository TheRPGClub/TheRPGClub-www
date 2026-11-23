import { describe, expect, it } from "vitest";

import type { Release } from "@/lib/api/types";
import { gameEditSave, type GameEditCall, type GameEditRecord, type GameEditSteps } from "./index";
import type { StepResult } from "./engine";
import {
  addRelease,
  deleteRelease,
  editRelease,
  editAddedRelease,
  emptyReleaseDraft,
  periodStart,
  releaseDraft,
  releasesStageOrNone,
  removeAddedRelease,
  undoRelease,
  type ReleasesStage,
} from "./releases";

// The Releases section through the fake steps the app replaces with server
// actions.
function steps(failOn?: GameEditCall["kind"]) {
  const calls: GameEditCall[] = [];
  const answer = (call: GameEditCall): Promise<StepResult> => {
    calls.push(call);
    return Promise.resolve(call.kind === failOn ? { ok: false, error: "Release date doesn't fit." } : { ok: true });
  };
  // Only the Releases steps: no other section is staged here.
  const run = {
    "release.create": answer,
    "release.update": answer,
    "release.delete": answer,
  } as unknown as GameEditSteps;
  return { calls, run };
}

const release = (over: Partial<Release>): Release => ({
  release_id: 1,
  game_id: 7,
  platform_id: 10,
  region_id: 1,
  format: null,
  notes: null,
  release_date: "2024-11-14",
  date_precision: "day",
  source: "igdb",
  platform_code: "SWITCH",
  platform_name: "Switch",
  region_code: "NA",
  region_name: "North America",
  ...over,
});

const igdb = release({ release_id: 1 });
const manual = release({
  release_id: 2,
  source: "manual",
  region_id: 2,
  region_code: "EU",
  region_name: "Europe",
  format: "Physical",
  notes: "Collector's edition",
  release_date: "2024-12-01",
  date_precision: "month",
});

const record: GameEditRecord = {
  text: { description: null, featured_video_url: null },
  releases: [igdb, manual],
};
const admin = { admin: true, threads: true };
const regular = { admin: false, threads: true };
const none: ReleasesStage = { added: [], edited: {}, deleted: [] };

const switch2Jp = {
  ...emptyReleaseDraft(),
  platform_id: 11,
  platform_code: "SWITCH2",
  platform_name: "Switch 2",
  region_id: 3,
  region_code: "JP",
  region_name: "Japan",
  format: "Physical",
  notes: "Switch 2 Edition",
  date_precision: "quarter" as const,
  release_date: "2027-05-17",
};

describe("Releases: staging", () => {
  it("can't stage an IGDB Release for edit or delete", () => {
    expect(editRelease(record.releases, none, 1, { ...releaseDraft(igdb), notes: "mine" })).toEqual(none);
    expect(deleteRelease(record.releases, none, 1)).toEqual(none);
  });

  it("stages an edit to a Manual Release, and drops it once it matches the record again", () => {
    const edited = editRelease(record.releases, none, 2, { ...releaseDraft(manual), notes: "Standard" });
    expect(edited.edited[2]?.notes).toBe("Standard");
    expect(editRelease(record.releases, edited, 2, releaseDraft(manual))).toEqual(none);
  });

  it("a delete replaces the Release's edit, and undo drops either", () => {
    const edited = editRelease(record.releases, none, 2, { ...releaseDraft(manual), notes: "Standard" });
    const deleted = deleteRelease(record.releases, edited, 2);
    expect(deleted).toEqual({ added: [], edited: {}, deleted: [2] });
    expect(undoRelease(deleted, 2)).toEqual(none);
    expect(undoRelease(edited, 2)).toEqual(none);
  });

  it("adds, edits and removes a new Release by its key", () => {
    const added = addRelease(none, "a", switch2Jp);
    expect(added.added).toEqual([{ key: "a", draft: switch2Jp }]);
    const changed = editAddedRelease(added, "a", { ...switch2Jp, notes: "Day one" });
    expect(changed.added[0].draft.notes).toBe("Day one");
    expect(removeAddedRelease(changed, "a")).toEqual(none);
  });

  it("an empty stage is no stage", () => {
    expect(releasesStageOrNone(none)).toBeUndefined();
    expect(releasesStageOrNone({ ...none, deleted: [2] })).toEqual({ ...none, deleted: [2] });
  });
});

describe("Releases: period start", () => {
  it("puts a vague date on the first day of its period, and TBA has none", () => {
    expect(periodStart("2027-05-17", "day")).toBe("2027-05-17");
    expect(periodStart("2027-05-17", "month")).toBe("2027-05-01");
    expect(periodStart("2027-05-17", "quarter")).toBe("2027-04-01");
    expect(periodStart("2027-12-31", "quarter")).toBe("2027-10-01");
    expect(periodStart("2027-05-17", "year")).toBe("2027-01-01");
    expect(periodStart("2027-05-17", "tba")).toBeNull();
    expect(periodStart(null, "month")).toBeNull();
  });
});

describe("Releases: Save all", () => {
  it("creates a Manual Release at its Date Precision, its date on the period's first day", async () => {
    const { calls, run } = steps();
    const outcome = await gameEditSave.run(record, { releases: addRelease(none, "a", switch2Jp) }, admin, run);
    expect(calls).toEqual([
      {
        kind: "release.create",
        key: "a",
        fields: {
          platform_id: 11,
          region_id: 3,
          format: "Physical",
          notes: "Switch 2 Edition",
          release_date: "2027-04-01",
          date_precision: "quarter",
        },
      },
    ]);
    expect(outcome.sections).toEqual([{ key: "releases", label: "Releases", status: "saved" }]);
    expect(outcome.staged).toEqual({});
    expect(outcome.record.releases).toHaveLength(3);
  });

  it("creates a TBA Release with no date", async () => {
    const { calls, run } = steps();
    const tba = { ...switch2Jp, date_precision: "tba" as const, notes: "" };
    await gameEditSave.run(record, { releases: addRelease(none, "a", tba) }, admin, run);
    expect(calls).toMatchObject([
      { kind: "release.create", fields: { release_date: null, date_precision: "tba", notes: null } },
    ]);
  });

  it("updates only the changed fields, sending date and Date Precision together", async () => {
    const { calls, run } = steps();
    const notes = editRelease(record.releases, none, 2, { ...releaseDraft(manual), notes: "Standard" });
    await gameEditSave.run(record, { releases: notes }, admin, run);
    expect(calls).toEqual([{ kind: "release.update", releaseId: 2, fields: { notes: "Standard" } }]);

    calls.length = 0;
    const year = editRelease(record.releases, none, 2, { ...releaseDraft(manual), date_precision: "year" });
    const outcome = await gameEditSave.run(record, { releases: year }, admin, run);
    expect(calls).toEqual([
      { kind: "release.update", releaseId: 2, fields: { release_date: "2024-01-01", date_precision: "year" } },
    ]);
    expect(outcome.record.releases[1]).toMatchObject({ release_id: 2, date_precision: "year", release_date: "2024-01-01" });
  });

  it("deletes a Manual Release", async () => {
    const { calls, run } = steps();
    const outcome = await gameEditSave.run(record, { releases: deleteRelease(record.releases, none, 2) }, admin, run);
    expect(calls).toEqual([{ kind: "release.delete", releaseId: 2 }]);
    expect(outcome.record.releases).toEqual([igdb]);
  });

  it("never plans a call for an IGDB Release, even one staged by hand", async () => {
    const { calls, run } = steps();
    const forced: ReleasesStage = { added: [], edited: { 1: { ...releaseDraft(igdb), notes: "mine" } }, deleted: [1] };
    expect(gameEditSave.changes(record, { releases: forced }, admin).total).toBe(0);
    await gameEditSave.run(record, { releases: forced }, admin, run);
    expect(calls).toEqual([]);
  });

  it("counts one change per added, edited and deleted Release", () => {
    let stage = addRelease(none, "a", switch2Jp);
    stage = editRelease(record.releases, stage, 2, { ...releaseDraft(manual), notes: "x" });
    expect(gameEditSave.changes(record, { releases: stage }, admin).bySection).toEqual({ releases: 2 });
  });

  it("refuses a dated Release without a date, or one missing its platform, without calling", async () => {
    const { calls, run } = steps();
    const undated = addRelease(none, "a", { ...switch2Jp, release_date: null });
    const outcome = await gameEditSave.run(record, { releases: undated }, admin, run);
    expect(calls).toEqual([]);
    expect(outcome.sections[0]).toMatchObject({ status: "failed" });
    expect(outcome.staged).toEqual({ releases: undated });

    const nowhere = addRelease(none, "b", { ...switch2Jp, platform_id: 0 });
    expect((await gameEditSave.run(record, { releases: nowhere }, admin, run)).sections[0].status).toBe("failed");
    expect(calls).toEqual([]);
  });

  it("keeps only the calls that didn't go through staged after a failure", async () => {
    const { calls, run } = steps("release.update");
    let stage = addRelease(none, "a", switch2Jp);
    stage = editRelease(record.releases, stage, 2, { ...releaseDraft(manual), notes: "x" });
    const outcome = await gameEditSave.run(record, { releases: stage }, admin, run);
    expect(calls.map((c) => c.kind)).toEqual(["release.create", "release.update"]);
    expect(outcome.sections).toEqual([
      { key: "releases", label: "Releases", status: "failed", error: "Release date doesn't fit." },
    ]);
    expect(outcome.staged).toEqual({ releases: { added: [], edited: stage.edited, deleted: [] } });
  });

  it("never plans a Release call for a Regular", async () => {
    const { calls, run } = steps();
    await gameEditSave.run(record, { releases: deleteRelease(record.releases, none, 2) }, regular, run);
    expect(calls).toEqual([]);
  });
});
