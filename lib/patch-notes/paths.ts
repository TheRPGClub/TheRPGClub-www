// Where Patch Notes live on the site (spec api#510, www#236): the Stack at
// /patch-notes, and each Patch's own page by its number.
export const PATCH_NOTES_PATH = "/patch-notes";

export function patchPath(number: number): string {
  return `${PATCH_NOTES_PATH}/${number}`;
}

export const PATCH_NOTES_BACK = { href: PATCH_NOTES_PATH, label: "Patch Notes" } as const;

// A Patch page's number from the URL: a whole number from 1, else null.
export function patchNumberParam(raw: string): number | null {
  if (!/^[1-9]\d{0,8}$/.test(raw)) return null;
  return Number(raw);
}
