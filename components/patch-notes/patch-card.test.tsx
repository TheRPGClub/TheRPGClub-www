import { renderToStaticMarkup } from "react-dom/server";
import type { Value } from "platejs";
import { describe, expect, it } from "vitest";

import { patchText } from "@/lib/patch-notes/patch-text";
import { PatchCard } from "./patch-card";

const t = (text: string) => ({ text });
const p = (...children: unknown[]) => ({ type: "p", children });
const link = (url: string, text: string) => ({ type: "a", url, children: [t(text)] });
const words = (n: number) => "abcdefghi ".repeat(Math.ceil(n / 10)).slice(0, n).replace(/ $/, "z");

const card = (value: unknown[], props: { siteUrl?: string | null; href?: string | null } = {}) =>
  renderToStaticMarkup(
    <PatchCard number={4} title="Patch 4" date="" value={value as Value} href={props.href === undefined ? "/patch-notes/4" : props.href} siteUrl={props.siteUrl} />,
  );

describe("PatchCard", () => {
  it("cuts as the save does when given the site's origin", () => {
    // A site link made whole is longer, so the card must count it whole to
    // end where cut_body ends.
    const value = [p(t(words(3960))), p(link("/patch-notes/4", "Patch 4")), p(t("tail"))];
    const siteUrl = "https://a-rather-long-club-origin.example";
    expect(patchText(value as Value).cut).toBe(false);
    expect(patchText(value as Value, { siteUrl }).cut).toBe(true);

    expect(card(value, { siteUrl })).not.toContain("tail");
    expect(card(value)).toContain("tail");
  });

  it("shows Read the full Patch disabled when there is no page yet", () => {
    const html = card([p(t("Hello"))], { href: null });
    expect(html).not.toContain('href="/patch-notes/4"');
    expect(html).toMatch(/<button[^>]*disabled/);
    expect(html).toContain("Read the full Patch");
  });
});
