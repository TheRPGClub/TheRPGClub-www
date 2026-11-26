import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type { Patch, PatchWithNeighbours } from "@/lib/patch-notes/types";
import type { Versions } from "@/lib/patch-notes/versions";
import { PatchPage } from "./patch-page";
import { PatchStack } from "./patch-stack";

const patch = (number: number): Patch => ({
  id: number,
  number,
  title: `Patch title ${number}`,
  status: "published",
  published_at: "2026-11-20T15:00:00Z",
  rich_body: [{ type: "p", children: [{ text: "Intro line." }] }],
  body: "",
  cut_body: "",
  counts: { new: 0, improved: 0, fixed: 0 },
  created_at: "",
  updated_at: "",
});
const page: PatchWithNeighbours = { ...patch(2), previous_number: 1, next_number: null };

const VERSIONS: Versions = { www: "1.4.2", api: "1.12.0", bot: "2.9.1" };
const text = (html: string) => html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");

describe("Versions on Patch Notes", () => {
  it("shows the Versions block and the site and api line on the Stack", () => {
    const html = renderToStaticMarkup(<PatchStack patches={[patch(2), patch(1)]} versions={VERSIONS} />);
    expect(text(html)).toMatch(/Versions Site 1\.4\.2 API 1\.12\.0 Bot 2\.9\.1/);
    const foot = html.split("<footer")[1];
    expect(text(foot)).toContain("site 1.4.2 · api 1.12.0");
    expect(text(foot)).not.toContain("bot");
    expect(foot).toContain('href="/patch-notes"');
  });

  it("shows only the versions that are set", () => {
    const html = renderToStaticMarkup(
      <PatchStack patches={[patch(1)]} versions={{ www: null, api: "1.0.0", bot: null }} />,
    );
    expect(text(html)).toMatch(/Versions API 1\.0\.0 Patches/);
    expect(text(html.split("<footer")[1])).toContain("api 1.0.0");
  });

  it("hides every version while there are none", () => {
    const html = renderToStaticMarkup(<PatchStack patches={[patch(1)]} versions={null} />);
    expect(text(html)).not.toContain("Versions");
    expect(html).not.toContain("<footer");
    expect(text(renderToStaticMarkup(<PatchPage patch={page} titles={new Map()} />))).not.toContain("site");
  });

  it("names every version in the Patch page's running foot", () => {
    const html = renderToStaticMarkup(<PatchPage patch={page} titles={new Map()} versions={VERSIONS} />);
    expect(text(html.split('aria-label="More Patches"')[1])).toContain("site 1.4.2 · api 1.12.0 · bot 2.9.1");
  });
});
