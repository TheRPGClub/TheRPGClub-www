// The Patch Mark (spec api#510, api#512, ticket www#238): the newest Patch
// number a member has seen. The session says whether a published Patch is
// past it (`patch_notes_unseen`) and where it is (`patch_mark`); both are
// off (false / null) for a Visitor, the service, and a member the Feature
// is hidden from, so none of them gets a NEW mark. Opening /patch-notes or
// a Patch page moves it forward to the newest Patch shown; the API never
// moves it back. Client-safe and pure.

// What the session says about the viewer's Patch Mark.
export interface PatchSeen {
  // A published Patch past the mark.
  unseen: boolean;
  // null until the first visit moves it: every published Patch is unseen.
  mark: number | null;
}

export const NO_PATCH_SEEN: PatchSeen = { unseen: false, mark: null };

// The session's Patch Mark; an API without the fields reads as nothing
// unseen.
export function patchSeen(session: { patch_notes_unseen?: boolean; patch_mark?: number | null } | null | undefined): PatchSeen {
  if (!session || session.patch_notes_unseen !== true) return NO_PATCH_SEEN;
  const mark = session.patch_mark;
  return { unseen: true, mark: typeof mark === "number" && Number.isInteger(mark) && mark > 0 ? mark : null };
}

// Whether the published Patch `number` wears the NEW chip.
export function isUnseenPatch(number: number, seen: PatchSeen): boolean {
  return seen.unseen && number > (seen.mark ?? 0);
}

// Whether opening a page that shows Patch `shown` (the newest Patch on
// /patch-notes, the Patch itself on its page) should move the mark: only
// past it, so an older Patch or nothing new sends nothing.
export function shouldMovePatchMark(shown: number | null, seen: PatchSeen): shown is number {
  return shown !== null && isUnseenPatch(shown, seen);
}

// The API's answer to moving the mark: where it is now, and whether a
// published Patch is still past it.
export interface PatchMarkMoved {
  mark: number;
  unseen: boolean;
}

export function readPatchMarkAnswer(body: unknown): PatchMarkMoved | null {
  if (!body || typeof body !== "object") return null;
  const { patch_mark, unseen } = body as { patch_mark?: unknown; unseen?: unknown };
  if (typeof patch_mark !== "number" || !Number.isInteger(patch_mark) || typeof unseen !== "boolean") return null;
  return { mark: patch_mark, unseen };
}

// The sidebar's NEW mark. The frame around a page can be older than a move
// made since (a layout kept across navigations): a move past the mark it
// was drawn with wins; a frame drawn after the move (its mark caught up)
// is the session's own word again, so a Patch published later shows.
export function sidebarPatchUnseen(seen: PatchSeen, moved: PatchMarkMoved | null): boolean {
  if (!seen.unseen) return false;
  if (moved && (seen.mark ?? 0) < moved.mark) return moved.unseen;
  return true;
}
