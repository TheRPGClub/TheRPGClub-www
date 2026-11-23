import { describe, expect, it } from "vitest";

import { gameEditSave, type GameEditCall, type GameEditSteps } from "./index";
import type { StepResult } from "./engine";

// The Game Edit save module's real sections, through the fake steps the app
// replaces with server actions. Only Text & video's step is faked; the other
// sections aren't staged here.
function steps(fail = false) {
  const calls: GameEditCall[] = [];
  const run = {
    "game.update": async (call: GameEditCall): Promise<StepResult> => {
      calls.push(call);
      return fail ? { ok: false, error: "Featured Video is invalid." } : { ok: true };
    },
  } as GameEditSteps;
  return { calls, run };
}

const record = {
  text: { description: "A hero sets out.", featured_video_url: "https://www.youtube.com/watch?v=abc" },
  versions: [],
};
const admin = { admin: true, threads: true };
const regular = { admin: false, threads: true };

describe("Text & video", () => {
  it("sends only the changed field in one game update", async () => {
    const { calls, run } = steps();
    const outcome = await gameEditSave.run(record, { text: { description: "A hero sets out again." } }, admin, run);
    expect(calls).toEqual([{ kind: "game.update", fields: { description: "A hero sets out again." } }]);
    expect(outcome.record.text.description).toBe("A hero sets out again.");
    expect(outcome.staged).toEqual({});
  });

  it("sends both fields in the same update when both changed", async () => {
    const { calls, run } = steps();
    await gameEditSave.run(
      record,
      { text: { description: "New.", featured_video_url: "https://youtu.be/xyz" } },
      admin,
      run,
    );
    expect(calls).toEqual([
      { kind: "game.update", fields: { description: "New.", featured_video_url: "https://youtu.be/xyz" } },
    ]);
  });

  it("makes no call when the staged text matches the record, ignoring the video link's spaces", async () => {
    const { calls, run } = steps();
    await gameEditSave.run(
      record,
      { text: { description: "A hero sets out.", featured_video_url: "  https://www.youtube.com/watch?v=abc " } },
      admin,
      run,
    );
    expect(calls).toEqual([]);
  });

  it("clears the Featured Video and the description as null", async () => {
    const { calls, run } = steps();
    await gameEditSave.run(record, { text: { description: "  ", featured_video_url: "" } }, admin, run);
    expect(calls).toEqual([{ kind: "game.update", fields: { description: null, featured_video_url: null } }]);
  });

  it("counts one change per changed field", () => {
    expect(gameEditSave.changes(record, { text: { description: "x", featured_video_url: "https://a.b/c" } }, admin)).toEqual({
      total: 2,
      bySection: { text: 2 },
    });
  });

  it("refuses a Featured Video that isn't a web link, without calling", async () => {
    const { calls, run } = steps();
    const outcome = await gameEditSave.run(record, { text: { featured_video_url: "not a link" } }, admin, run);
    expect(calls).toEqual([]);
    expect(outcome.sections[0]).toMatchObject({ key: "text", status: "failed" });
    expect(outcome.staged).toEqual({ text: { featured_video_url: "not a link" } });
  });

  it("keeps the edits staged and the record as it was when the update fails", async () => {
    const { run } = steps(true);
    const stage = { text: { description: "New." } };
    const outcome = await gameEditSave.run(record, stage, admin, run);
    expect(outcome.sections).toEqual([
      { key: "text", label: "Text & video", status: "failed", error: "Featured Video is invalid." },
    ]);
    expect(outcome.staged).toEqual(stage);
    expect(outcome.record).toEqual(record);
  });

  it("never plans a game update for a Regular", async () => {
    const { calls, run } = steps();
    expect(gameEditSave.plan(record, { text: { description: "New." } }, regular)).toEqual([]);
    await gameEditSave.run(record, { text: { description: "New." } }, regular, run);
    expect(calls).toEqual([]);
  });
});
