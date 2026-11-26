import { describe, expect, it } from "vitest";

import {
  NO_PATCH_SEEN,
  isUnseenPatch,
  patchSeen,
  readPatchMarkAnswer,
  shouldMovePatchMark,
  sidebarPatchUnseen,
} from "./patch-mark";

describe("patchSeen", () => {
  it("reads the session's fields", () => {
    expect(patchSeen({ patch_notes_unseen: true, patch_mark: 3 })).toEqual({ unseen: true, mark: 3 });
    expect(patchSeen({ patch_notes_unseen: true, patch_mark: null })).toEqual({ unseen: true, mark: null });
  });

  it("is nothing unseen for a Visitor, a hidden Feature or an older API", () => {
    expect(patchSeen(null)).toEqual(NO_PATCH_SEEN);
    expect(patchSeen({ patch_notes_unseen: false, patch_mark: null })).toEqual(NO_PATCH_SEEN);
    expect(patchSeen({})).toEqual(NO_PATCH_SEEN);
  });
});

describe("isUnseenPatch", () => {
  it("marks Patches past the mark", () => {
    const seen = { unseen: true, mark: 2 };
    expect(isUnseenPatch(3, seen)).toBe(true);
    expect(isUnseenPatch(2, seen)).toBe(false);
    expect(isUnseenPatch(1, seen)).toBe(false);
  });

  it("marks every Patch before the first visit", () => {
    expect(isUnseenPatch(1, { unseen: true, mark: null })).toBe(true);
  });

  it("marks nothing when the session says nothing is unseen", () => {
    expect(isUnseenPatch(9, NO_PATCH_SEEN)).toBe(false);
    expect(isUnseenPatch(9, { unseen: false, mark: 2 })).toBe(false);
  });
});

describe("shouldMovePatchMark", () => {
  it("moves only past the mark", () => {
    expect(shouldMovePatchMark(4, { unseen: true, mark: 2 })).toBe(true);
    expect(shouldMovePatchMark(4, { unseen: true, mark: null })).toBe(true);
    expect(shouldMovePatchMark(2, { unseen: true, mark: 2 })).toBe(false);
    expect(shouldMovePatchMark(1, { unseen: true, mark: 2 })).toBe(false);
    expect(shouldMovePatchMark(null, { unseen: true, mark: null })).toBe(false);
    expect(shouldMovePatchMark(4, NO_PATCH_SEEN)).toBe(false);
  });
});

describe("readPatchMarkAnswer", () => {
  it("reads the API's answer", () => {
    expect(readPatchMarkAnswer({ user_id: "1", patch_mark: 4, unseen: false })).toEqual({ mark: 4, unseen: false });
  });

  it("refuses anything else", () => {
    expect(readPatchMarkAnswer(null)).toBeNull();
    expect(readPatchMarkAnswer({ patch_mark: null, unseen: true })).toBeNull();
    expect(readPatchMarkAnswer({ patch_mark: 2 })).toBeNull();
  });
});

describe("sidebarPatchUnseen", () => {
  it("is the session's word with no move", () => {
    expect(sidebarPatchUnseen({ unseen: true, mark: null }, null)).toBe(true);
    expect(sidebarPatchUnseen(NO_PATCH_SEEN, null)).toBe(false);
  });

  it("clears once a visit moved the mark past the frame's", () => {
    expect(sidebarPatchUnseen({ unseen: true, mark: 2 }, { mark: 4, unseen: false })).toBe(false);
    expect(sidebarPatchUnseen({ unseen: true, mark: null }, { mark: 4, unseen: false })).toBe(false);
  });

  it("stays while a newer Patch is still past the moved mark", () => {
    expect(sidebarPatchUnseen({ unseen: true, mark: null }, { mark: 2, unseen: true })).toBe(true);
  });

  it("follows a frame drawn after the move", () => {
    expect(sidebarPatchUnseen({ unseen: true, mark: 4 }, { mark: 4, unseen: false })).toBe(true);
  });

  it("never marks a viewer the session says nothing for", () => {
    expect(sidebarPatchUnseen(NO_PATCH_SEEN, { mark: 4, unseen: true })).toBe(false);
  });
});
