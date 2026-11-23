import { describe, expect, it } from "vitest";

import { gameEditSave, type GameEditCall, type GameEditRecord, type GameEditSteps } from "./index";
import type { StepResult } from "./engine";
import { hltbFieldValue, hltbTimeText } from "./hltb";

// The HowLongToBeat section through fake steps (the app's are server actions).
function steps(fail = false) {
  const calls: GameEditCall[] = [];
  const step = async (call: GameEditCall): Promise<StepResult> => {
    calls.push(call);
    return fail ? { ok: false, error: "HowLongToBeat times are invalid." } : { ok: true };
  };
  const run = { "game.update": step, "hltb.upsert": step } as unknown as GameEditSteps;
  return { calls, run };
}

const hltb = {
  name: "Dragon Quest III",
  url: "https://howlongtobeat.com/game/1",
  image_url: null,
  main: "37 Hours",
  main_sides: "52½ Hours",
  completionist: "78 Hours",
  single_player: null,
  co_op: null,
  vs: null,
  source_query: "Dragon Quest III",
  scraped_at: "2026-01-02T00:00:00Z",
  updated_at: "2026-01-02T00:00:00Z",
};
const record = {
  text: { description: null, featured_video_url: null },
  hltb,
} as GameEditRecord;
const empty = { ...record, hltb: null } as GameEditRecord;
const admin = { admin: true, threads: true };
const regular = { admin: false, threads: true };

describe("HLTB times as fields", () => {
  it("reads a saved time as plain hours", () => {
    expect(hltbFieldValue("37 Hours")).toBe("37");
    expect(hltbFieldValue("52½ Hours")).toBe("52.5");
    expect(hltbFieldValue("45 Mins")).toBe("0.75");
    expect(hltbFieldValue("--")).toBe("");
    expect(hltbFieldValue(null)).toBe("");
  });

  it("writes hours the way HowLongToBeat does", () => {
    expect(hltbTimeText(81)).toBe("81 Hours");
    expect(hltbTimeText(52.5)).toBe("52½ Hours");
    expect(hltbTimeText(10.25)).toBe("10.25 Hours");
  });
});

describe("HowLongToBeat section", () => {
  it("upserts only the changed time, written as HowLongToBeat writes it", async () => {
    const { calls, run } = steps();
    const outcome = await gameEditSave.run(record, { hltb: { completionist: "81" } }, admin, run);
    expect(calls).toEqual([{ kind: "hltb.upsert", fields: { completionist: "81 Hours" } }]);
    expect(outcome.record.hltb?.completionist).toBe("81 Hours");
    expect(outcome.record.hltb?.main).toBe("37 Hours");
    expect(outcome.staged).toEqual({});
  });

  it("sends the times and the source link together in one upsert", async () => {
    const { calls, run } = steps();
    await gameEditSave.run(
      record,
      { hltb: { main: "40.5", main_sides: "", url: " https://howlongtobeat.com/game/2 " } },
      admin,
      run,
    );
    expect(calls).toEqual([
      {
        kind: "hltb.upsert",
        fields: { main: "40½ Hours", main_sides: null, url: "https://howlongtobeat.com/game/2" },
      },
    ]);
  });

  it("makes no call when the staged times match the saved ones", async () => {
    const { calls, run } = steps();
    await gameEditSave.run(
      record,
      { hltb: { main: "37", main_sides: "52.5", completionist: " 78 ", url: "https://howlongtobeat.com/game/1" } },
      admin,
      run,
    );
    expect(calls).toEqual([]);
  });

  it("counts one change per changed field", () => {
    expect(gameEditSave.changes(record, { hltb: { main: "38", completionist: "80", main_sides: "52.5" } }, admin)).toEqual({
      total: 2,
      bySection: { hltb: 2 },
    });
  });

  it("creates the times for a game with none saved", async () => {
    const { calls, run } = steps();
    const outcome = await gameEditSave.run(empty, { hltb: { main: "12" } }, admin, run);
    expect(calls).toEqual([{ kind: "hltb.upsert", fields: { main: "12 Hours" } }]);
    expect(outcome.record.hltb).toMatchObject({ main: "12 Hours", main_sides: null, url: null });
  });

  it("refuses a time that isn't a number of hours, without calling", async () => {
    const { calls, run } = steps();
    const outcome = await gameEditSave.run(record, { hltb: { main: "about forty" } }, admin, run);
    expect(calls).toEqual([]);
    expect(outcome.sections[0]).toMatchObject({ key: "hltb", status: "failed" });
    expect(outcome.staged).toEqual({ hltb: { main: "about forty" } });
  });

  it("refuses a source link that isn't a web link, without calling", async () => {
    const { calls, run } = steps();
    const outcome = await gameEditSave.run(record, { hltb: { url: "howlongtobeat" } }, admin, run);
    expect(calls).toEqual([]);
    expect(outcome.sections[0]).toMatchObject({ key: "hltb", status: "failed" });
  });

  it("keeps the times staged and the record as it was when the upsert fails", async () => {
    const { run } = steps(true);
    const stage = { hltb: { main: "40" } };
    const outcome = await gameEditSave.run(record, stage, admin, run);
    expect(outcome.sections).toEqual([
      { key: "hltb", label: "Time to beat", status: "failed", error: "HowLongToBeat times are invalid." },
    ]);
    expect(outcome.staged).toEqual(stage);
    expect(outcome.record).toEqual(record);
  });

  it("never plans an upsert for a Regular", () => {
    expect(gameEditSave.plan(record, { hltb: { main: "40" } }, regular)).toEqual([]);
  });
});
