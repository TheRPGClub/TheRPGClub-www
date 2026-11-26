// Where the Patch editor lives on the staff desk (www#237): the list of
// drafts and published Patches, and each Patch's edit page by its number.
export const PATCH_EDITOR_PATH = "/admin/patch-notes";

export function patchEditPath(number: number): string {
  return `${PATCH_EDITOR_PATH}/${number}/edit`;
}

export const PATCH_EDITOR_BACK = { href: PATCH_EDITOR_PATH, label: "Patch Notes" } as const;
