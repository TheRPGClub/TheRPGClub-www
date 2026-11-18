import type { Value } from "platejs";
import { describe, expect, it } from "vitest";

import { runLoreSave, type LoreSavePlan, type LoreSaveSteps } from "./lore-save";
import { storyImageIds } from "./lore-story";

const p = (text: string) => ({ type: "p", children: [{ text }] });
const placed = (id: number) => ({ type: "img", id, url: `https://cdn.example/${id}.png`, children: [{ text: "" }] });
const pending = (pendingKey: string) => ({ type: "img", pendingKey, url: "blob:x", children: [{ text: "" }] });

type Call = [string, ...unknown[]];

// Fake actions that record what ran, in order, with the image ids each
// story placed. `fail` names the calls that fail (by name and count).
function steps(fail: Partial<Record<"save" | "prune" | "upload" | "links", number[]>> = {}) {
  const calls: Call[] = [];
  const counts = { save: 0, prune: 0, upload: 0, links: 0 };
  const failing = (name: keyof typeof counts) => (fail[name] ?? []).includes(++counts[name]);
  const uploaded = new Map<string, { id: number; url: string }>();
  const run: LoreSaveSteps = {
    save: async (id, story) => {
      calls.push(["save", id, storyImageIds(story)]);
      return failing("save") ? { ok: false, error: "500." } : { ok: true, id: id ?? 9 };
    },
    prune: async (id, story) => {
      calls.push(["prune", id, storyImageIds(story)]);
      return failing("prune") ? { ok: false, error: "500." } : { ok: true, id };
    },
    uploadEach: async (id, keys) => {
      calls.push(["upload", id, [...keys]]);
      if (failing("upload")) return { count: 0, failed: true };
      keys.forEach((key, i) => uploaded.set(key, { id: 100 + i, url: `https://cdn.example/${100 + i}.png` }));
      return { count: keys.length, failed: false };
    },
    saveLinks: async (id) => {
      calls.push(["links", id]);
      return failing("links") ? "500." : null;
    },
  };
  return { calls, run, uploaded };
}

function plan(over: Partial<LoreSavePlan>, uploaded: LoreSavePlan["uploaded"]): LoreSavePlan {
  return { entryId: 5, existing: true, value: [p("Story")] as Value, adding: [], uploaded, ...over };
}

describe("runLoreSave", () => {
  it("on an edit, deletes the photos taken out only after the story saved", async () => {
    const { calls, run, uploaded } = steps();
    const outcome = await runLoreSave(plan({ value: [p("Story"), placed(1)] as Value }, uploaded), run);
    expect(outcome).toEqual({ id: 5, error: null });
    expect(calls).toEqual([
      ["upload", 5, []],
      ["save", 5, [1]],
      ["prune", 5, [1]],
      ["links", 5],
    ]);
  });

  it("deletes nothing when the edit's save fails", async () => {
    const { calls, run, uploaded } = steps({ save: [1] });
    const outcome = await runLoreSave(plan({}, uploaded), run);
    expect(outcome.error).toBe("500.");
    expect(calls.map(([name]) => name)).toEqual(["upload", "save"]);
  });

  it("on an edit adding photos, saves without them, makes room, uploads, places them, then prunes", async () => {
    const { calls, run, uploaded } = steps();
    const value = [p("Story"), placed(1), pending("new-1")] as Value;
    const outcome = await runLoreSave(plan({ value, adding: ["new-1"] }, uploaded), run);
    expect(outcome).toEqual({ id: 5, error: null });
    expect(calls).toEqual([
      ["save", 5, [1]],
      ["prune", 5, [1]],
      ["upload", 5, ["new-1"]],
      ["save", 5, [1, 100]],
      ["prune", 5, [1, 100]],
      ["links", 5],
    ]);
  });

  it("deletes nothing when the first save of an edit adding photos fails", async () => {
    const { calls, run, uploaded } = steps({ save: [1] });
    await runLoreSave(plan({ value: [p("Story"), pending("new-1")] as Value, adding: ["new-1"] }, uploaded), run);
    expect(calls.map(([name]) => name)).toEqual(["save"]);
  });

  it("creates a new entry, uploads, places the photos, then saves its links", async () => {
    const { calls, run, uploaded } = steps();
    const value = [p("Story"), pending("new-1")] as Value;
    const outcome = await runLoreSave(plan({ entryId: null, existing: false, value, adding: ["new-1"] }, uploaded), run);
    expect(outcome).toEqual({ id: 9, error: null });
    expect(calls).toEqual([
      ["save", null, []],
      ["upload", 9, ["new-1"]],
      ["save", 9, [100]],
      ["prune", 9, [100]],
      ["links", 9],
    ]);
  });

  it("creates a new entry without photos in one save", async () => {
    const { calls, run, uploaded } = steps();
    const outcome = await runLoreSave(plan({ entryId: null, existing: false }, uploaded), run);
    expect(outcome).toEqual({ id: 9, error: null });
    expect(calls).toEqual([
      ["save", null, []],
      ["upload", 9, []],
      ["links", 9],
    ]);
  });

  it("says a new entry is live when placing its photos fails, and keeps its id", async () => {
    const { run, uploaded } = steps({ save: [2] });
    const value = [p("Story"), pending("new-1")] as Value;
    const outcome = await runLoreSave(plan({ entryId: null, existing: false, value, adding: ["new-1"] }, uploaded), run);
    expect(outcome.id).toBe(9);
    expect(outcome.error).toMatch(/^The Lore Entry is live, but its photos aren't in the story yet: 500\. .*delete it\.$/);
  });

  it("passes on a create that may have gone through", async () => {
    const { run, uploaded } = steps();
    run.save = async () => ({ ok: false, unsure: true, error: "Check Club Lore." });
    const outcome = await runLoreSave(plan({ entryId: null, existing: false }, uploaded), run);
    expect(outcome).toEqual({ id: null, error: "Check Club Lore.", unsure: true });
  });

  it("reports a late prune that failed without losing the save", async () => {
    const { calls, run, uploaded } = steps({ prune: [1] });
    const outcome = await runLoreSave(plan({}, uploaded), run);
    expect(outcome.error).toMatch(/^The Lore Entry is saved, but a photo you took out is still stored/);
    expect(calls.map(([name]) => name)).toEqual(["upload", "save", "prune"]);
  });

  it("keeps the story saved when an upload fails, and says so after the links", async () => {
    const { calls, run, uploaded } = steps({ upload: [1] });
    const value = [p("Story"), pending("new-1")] as Value;
    const outcome = await runLoreSave(plan({ value, adding: ["new-1"] }, uploaded), run);
    expect(outcome.error).toMatch(/a photo didn't upload/);
    expect(calls.map(([name]) => name)).toEqual(["save", "prune", "upload", "prune", "links"]);
  });
});
