import { describe, expect, it } from "vitest";

import {
  applyCover,
  patchScope,
  pendingChangeValue,
  pendingChangesValue,
  pendingCount,
  scopeNote,
  type PendingChange,
} from "./pending-changes";

function change(over: Partial<PendingChange> = {}): PendingChange {
  return {
    id: 1,
    repo: "www",
    pr_number: 10,
    type: "feat",
    title: "feat(www): a change",
    version: "1.0.0",
    patch_note: null,
    section: "new",
    status: "open",
    patch_number: null,
    created_at: "2026-11-01T00:00:00Z",
    ...over,
  };
}

describe("pendingChangeValue", () => {
  it("keeps a well-formed item and trims its text", () => {
    expect(pendingChangeValue({ ...change(), patch_note: "  Nice  ", extra: 1 })).toEqual(change({ patch_note: "Nice" }));
  });

  it("drops what isn't a Pending Change", () => {
    expect(pendingChangeValue({ ...change(), repo: "docs" })).toBeNull();
    expect(pendingChangeValue({ ...change(), section: "other" })).toBeNull();
    expect(pendingChangesValue([change(), null, "x"])).toHaveLength(1);
    expect(pendingChangesValue(undefined)).toEqual([]);
  });
});

describe("patchScope", () => {
  const changes = [
    change({ id: 1, created_at: "2026-11-01" }),
    change({ id: 2, section: "fixed", status: "covered", patch_number: 4, repo: "api", created_at: "2026-11-02" }),
    change({ id: 3, status: "covered", patch_number: 3, created_at: "2026-11-03" }),
    change({ id: 4, status: "dismissed", created_at: "2026-11-04" }),
    change({ id: 5, created_at: "2026-11-05", repo: "bot", status: "covered", patch_number: 4 }),
  ];

  it("offers the open ones and this Patch's, by section, newest first, leaving out another Patch's", () => {
    const scope = patchScope(changes, 4);
    expect(scope.sections.map((s) => [s.label, s.changes.map((c) => c.id)])).toEqual([
      ["New", [5, 1]],
      ["Fixed", [2]],
    ]);
    expect(scope.offered).toBe(3);
    expect(scope.covered.map((c) => c.id)).toEqual([5, 2]);
    expect(scope.dismissed.map((c) => c.id)).toEqual([4]);
    expect(scope.repos).toEqual([
      { repo: "api", name: "api", count: 1 },
      { repo: "bot", name: "bot", count: 1 },
    ]);
  });
});

describe("applyCover", () => {
  it("covers what the answer lists and reopens what this Patch left out", () => {
    const changes = [change({ id: 1 }), change({ id: 2, status: "covered", patch_number: 4 }), change({ id: 3, status: "covered", patch_number: 3 })];
    const next = applyCover(changes, 4, [change({ id: 1, status: "covered", patch_number: 4 })]);
    expect(next.map((c) => [c.id, c.status, c.patch_number])).toEqual([
      [1, "covered", 4],
      [2, "open", null],
      [3, "covered", 3],
    ]);
  });
});

describe("pendingCount", () => {
  it("says one or many", () => {
    expect(pendingCount(1)).toBe("1 Pending Change");
    expect(pendingCount(7)).toBe("7 Pending Changes");
  });
});

describe("scopeNote", () => {
  it("names step 1's state", () => {
    expect(scopeNote(null)).toEqual({ note: "Couldn't load", tone: "bad" });
    expect(scopeNote(patchScope([], 4))).toEqual({ note: "No Pending Changes yet" });
    expect(scopeNote(patchScope([change({ status: "dismissed" })], 4))).toEqual({ note: "None open · 1 dismissed" });
    expect(scopeNote(patchScope([change({ id: 1 }), change({ id: 2 })], 4))).toEqual({ note: "0 of 2 Pending Changes", tone: undefined });
    expect(scopeNote(patchScope([change({ status: "covered", patch_number: 4 })], 4))).toEqual({ note: "1 of 1 Pending Change", tone: "live" });
  });
});
