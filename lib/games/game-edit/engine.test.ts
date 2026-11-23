import { describe, expect, it } from "vitest";

import { createGameEditSave, saveSummary, type GameEditSection, type StepResult } from "./engine";

// Two made-up sections, so the engine's rules (diff, gates, keep going past
// a failure, keep a failed section staged) are tested apart from any real
// section: "notes" is an Admin's list of strings, "links" the threads gate's
// set of ids.
type NoteCall = { kind: "note.add"; text: string } | { kind: "note.remove"; text: string };
type LinkCall = { kind: "link.add"; id: string };
type Map = {
  notes: { loaded: string[]; staged: string[]; call: NoteCall };
  links: { loaded: string[]; staged: string[]; call: LinkCall };
};

const notes: GameEditSection<string[], string[], NoteCall> = {
  label: "Notes",
  access: "admin",
  changes: (loaded, staged) => staged.filter((t) => !loaded.includes(t)).length + loaded.filter((t) => !staged.includes(t)).length,
  check: (staged) => (staged.includes("") ? "A note can't be blank." : null),
  plan: (loaded, staged) => [
    ...staged.filter((t) => !loaded.includes(t)).map((text) => ({ kind: "note.add" as const, text })),
    ...loaded.filter((t) => !staged.includes(t)).map((text) => ({ kind: "note.remove" as const, text })),
  ],
  apply: (_loaded, staged) => staged,
};

const links: GameEditSection<string[], string[], LinkCall> = {
  label: "Links",
  access: "threads",
  changes: (loaded, staged) => staged.filter((id) => !loaded.includes(id)).length,
  plan: (loaded, staged) => staged.filter((id) => !loaded.includes(id)).map((id) => ({ kind: "link.add" as const, id })),
  apply: (loaded, staged) => [...new Set([...loaded, ...staged])],
};

const save = createGameEditSave<Map>({ notes, links }, ["notes", "links"]);

const record = { notes: ["a"], links: ["1"] };
const admin = { admin: true, threads: true };
const regular = { admin: false, threads: true };

// Fake steps that record every call in order; `fail` names the call kinds
// that fail, `throws` those that throw.
function steps(fail: string[] = [], throws: string[] = []) {
  const calls: unknown[] = [];
  const step = (call: { kind: string }): Promise<StepResult> => {
    calls.push(call);
    if (throws.includes(call.kind)) return Promise.reject(new Error("network"));
    return Promise.resolve(fail.includes(call.kind) ? { ok: false, error: `${call.kind} broke.` } : { ok: true });
  };
  return { calls, run: { "note.add": step, "note.remove": step, "link.add": step } };
}

describe("game edit save", () => {
  it("makes no calls for an empty stage", async () => {
    const { calls, run } = steps();
    const outcome = await save.run(record, {}, admin, run);
    expect(calls).toEqual([]);
    expect(outcome.sections).toEqual([]);
    expect(outcome.staged).toEqual({});
  });

  it("makes no call for a section staged back to what was loaded, and drops it from the stage", async () => {
    const { calls, run } = steps();
    const outcome = await save.run(record, { notes: ["a"], links: ["2"] }, admin, run);
    expect(calls).toEqual([{ kind: "link.add", id: "2" }]);
    expect(outcome.sections).toEqual([{ key: "links", label: "Links", status: "saved" }]);
    expect(outcome.staged).toEqual({});
  });

  it("counts staged changes per section and in all", () => {
    expect(save.changes(record, { notes: ["b"], links: ["1", "2"] }, admin)).toEqual({
      total: 3,
      bySection: { notes: 2, links: 1 },
    });
  });

  it("runs every changed section's calls in section order", async () => {
    const { calls, run } = steps();
    const outcome = await save.run(record, { links: ["9"], notes: ["b"] }, admin, run);
    expect(calls).toEqual([
      { kind: "note.add", text: "b" },
      { kind: "note.remove", text: "a" },
      { kind: "link.add", id: "9" },
    ]);
    expect(outcome.record).toEqual({ notes: ["b"], links: ["1", "9"] });
    expect(saveSummary(outcome)).toBe("2 saved");
  });

  it("keeps going past a failed section, reports it and keeps its edits staged", async () => {
    const { calls, run } = steps(["note.add"]);
    const outcome = await save.run(record, { notes: ["a", "b"], links: ["2"] }, admin, run);
    expect(calls).toEqual([
      { kind: "note.add", text: "b" },
      { kind: "link.add", id: "2" },
    ]);
    expect(outcome.sections).toEqual([
      { key: "notes", label: "Notes", status: "failed", error: "note.add broke." },
      { key: "links", label: "Links", status: "saved" },
    ]);
    expect(outcome.staged).toEqual({ notes: ["a", "b"] });
    expect(outcome.record).toEqual({ notes: ["a"], links: ["1", "2"] });
    expect(saveSummary(outcome)).toBe("1 saved, 1 failed: Notes");
  });

  it("stops a section at its first failed call", async () => {
    const { calls, run } = steps(["note.add"]);
    await save.run(record, { notes: ["b"] }, admin, run);
    expect(calls).toEqual([{ kind: "note.add", text: "b" }]);
  });

  it("reports a step that throws as a failure of its section", async () => {
    const { run } = steps([], ["link.add"]);
    const outcome = await save.run(record, { links: ["2"] }, admin, run);
    expect(outcome.sections[0]).toMatchObject({ key: "links", status: "failed" });
    expect(outcome.sections[0].error).toMatch(/couldn't reach/i);
    expect(outcome.staged).toEqual({ links: ["2"] });
  });

  it("fails a section that doesn't pass its check without calling it", async () => {
    const { calls, run } = steps();
    const outcome = await save.run(record, { notes: ["a", ""] }, admin, run);
    expect(calls).toEqual([]);
    expect(outcome.sections).toEqual([{ key: "notes", label: "Notes", status: "failed", error: "A note can't be blank." }]);
    expect(outcome.staged).toEqual({ notes: ["a", ""] });
  });

  it("plans only the threads gate's sections for a Regular", async () => {
    const stage = { notes: ["b"], links: ["2"] };
    expect(save.plan(record, stage, regular).flatMap((entry) => entry.calls.map((c) => c.kind))).toEqual(["link.add"]);
    const { calls, run } = steps();
    const outcome = await save.run(record, stage, regular, run);
    expect(calls).toEqual([{ kind: "link.add", id: "2" }]);
    expect(outcome.sections.map((s) => s.key)).toEqual(["links"]);
    expect(save.changes(record, stage, regular)).toEqual({ total: 1, bySection: { links: 1 } });
  });

  it("plans nothing for a viewer outside every gate", () => {
    expect(save.plan(record, { notes: ["b"], links: ["2"] }, { admin: false, threads: false })).toEqual([]);
  });
});
