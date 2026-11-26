import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type { Patch, PatchWithNeighbours } from "@/lib/patch-notes/types";
import { PatchPage } from "./patch-page";
import { PatchStack, SLIPS_MAX } from "./patch-stack";

const t = (text: string, marks: Record<string, boolean> = {}) => ({ text, ...marks });
const li = (text: string) => ({ type: "li", children: [{ type: "lic", children: [t(text)] }] });
const body = (...items: string[]) => [
  { type: "p", children: [t("Intro line.")] },
  { type: "h2", children: [t("New")] },
  { type: "ul", children: items.map(li) },
];

const patch = (number: number, title: string | null, rich_body: unknown = body("One thing.")): Patch => ({
  id: number,
  number,
  title,
  status: "published",
  published_at: `2026-11-${String(number + 1).padStart(2, "0")}T15:00:00Z`,
  rich_body,
  body: "",
  cut_body: "",
  counts: { new: 1, improved: 0, fixed: 0 },
  created_at: "",
  updated_at: "",
});

const text = (html: string) => html.replace(/<[^>]+>/g, " ").replace(/&#x27;/g, "'").replace(/\s+/g, " ");

describe("PatchStack", () => {
  it("shows the newest Patch as the card, the older as slips and every one in the list", () => {
    const html = renderToStaticMarkup(<PatchStack patches={[patch(3, "GOTY season"), patch(2, null), patch(1, "Launch")]} />);
    expect(text(html)).toContain("3 Patches · newest 4 Nov");
    expect(html.match(/href="\/patch-notes\/3"/g)).toHaveLength(2); // the card's button and the list
    expect(html.match(/href="\/patch-notes\/2"/g)).toHaveLength(2); // a slip and the list
    expect(text(html)).toContain("Read the full Patch");
    expect(text(html)).toContain("Patch 2");
  });

  it("shows at most SLIPS_MAX slips; the list holds every Patch", () => {
    const many = Array.from({ length: SLIPS_MAX + 4 }, (_, i) => patch(SLIPS_MAX + 4 - i, `Patch title ${i}`));
    const html = renderToStaticMarkup(<PatchStack patches={many} />);
    const slips = html.split('aria-label="Older Patches"')[1].split("</nav>")[0];
    expect(slips.match(/<li/g)).toHaveLength(SLIPS_MAX);
    expect(html.split('id="patch-list-heading"')[1].match(/<li/g)).toHaveLength(many.length);
  });

  it("cuts a long Patch on the card with ...", () => {
    const items = Array.from({ length: 60 }, (_, i) => `Item ${i} ${"words ".repeat(14)}`);
    const html = renderToStaticMarkup(<PatchStack patches={[patch(1, "Long", body(...items))]} />);
    expect(text(html)).toContain("...");
    expect(text(html)).not.toContain("Item 59");
  });

  it("says so when there are no Patches, or they couldn't be read", () => {
    expect(text(renderToStaticMarkup(<PatchStack patches={[]} />))).toContain("No Patches yet");
    expect(text(renderToStaticMarkup(<PatchStack patches={null} />))).toContain("Couldn't load Patch Notes");
  });
});

describe("PatchPage", () => {
  const page = (previous: number | null, next: number | null): PatchWithNeighbours => ({
    ...patch(2, "The Franchise update"),
    counts: { new: 3, improved: 2, fixed: 1 },
    previous_number: previous,
    next_number: next,
  });

  it("shows the cover, the counts, the whole text and the neighbours", () => {
    const html = renderToStaticMarkup(<PatchPage patch={page(1, 3)} titles={new Map([[1, "Launch"]])} />);
    const words = text(html);
    expect(words).toContain("Patch 2 / 3 November 2026");
    expect(words).toMatch(/New 3 Improved 2 Fixed 1/);
    expect(words).toContain("Patch 1 · Launch");
    expect(html).toContain('href="/patch-notes/3"');
    expect(words).not.toContain("Newest Patch");
  });

  it("says Newest Patch when there is no next one", () => {
    expect(text(renderToStaticMarkup(<PatchPage patch={page(null, null)} titles={new Map()} />))).toContain("Newest Patch");
  });
});
