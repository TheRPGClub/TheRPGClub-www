import type { Value } from "platejs";

import { patchValue } from "./patch-schema";
import { PATCH_POST_MAX, patchText } from "./patch-text";

// Writing a Patch (www#237, spec api#510): what a new Patch starts as, and
// what a save sends. Client-safe and pure, so the editor counts with the
// same text the save stores.

// The API's limit on a title.
export const PATCH_TITLE_MAX = 100;

// The sections a Patch's changes are sorted into; the API counts the items
// under them.
export const PATCH_SECTIONS = ["New", "Improved", "Fixed"] as const;

const line = (text: string) => ({ type: "lic", children: [{ text }] });

// A new Patch: an intro paragraph, then the New, Improved and Fixed
// headings each over one empty bullet. Drafting the bullets from Pending
// Changes is www#240's.
export function patchTemplate(): Value {
  return [
    { type: "p", children: [{ text: "" }] },
    ...PATCH_SECTIONS.flatMap((section) => [
      { type: "h2", children: [{ text: section }] },
      { type: "ul", children: [{ type: "li", children: [line("")] }] },
    ]),
  ] as Value;
}

// A title as saved: spaces squeezed and trimmed, null when blank.
export function patchTitleField(title: string): string | null {
  const clean = title.replaceAll("\u0000", "").replace(/\s+/g, " ").trim();
  return clean ? clean : null;
}

export interface PatchFields {
  title: string | null;
  rich_body: Value;
  body: string;
  cut_body: string;
}

// The save's `data`: the sanitized value, its whole Discord markdown and
// the cut markdown the bot posts. `siteUrl` makes the site's own links
// whole, so they work from Discord.
export function patchFields(title: string, raw: unknown, siteUrl: string | null): PatchFields {
  const value = patchValue(raw);
  const text = patchText(value, siteUrl ? { siteUrl } : {});
  return { title: patchTitleField(title), rich_body: value, body: text.markdown, cut_body: text.cutMarkdown };
}

// The editor's counter: "1,284" against "4,000".
export function patchCount(length: number): { count: string; max: string; over: boolean } {
  const format = (n: number) => new Intl.NumberFormat("en-GB").format(n);
  return { count: format(length), max: format(PATCH_POST_MAX), over: length > PATCH_POST_MAX };
}
