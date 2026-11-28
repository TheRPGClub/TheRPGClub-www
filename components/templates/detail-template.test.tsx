import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import {
  DetailSection,
  DetailTemplate,
  SectionLink,
} from "@/components/templates/detail-template";

describe("DetailTemplate", () => {
  it("opens on the hero and follows it with the sections in order", () => {
    const html = renderToStaticMarkup(
      <DetailTemplate hero={<header>hero</header>} className="pb-8">
        <p>first</p>
        <p>second</p>
      </DetailTemplate>,
    );
    expect(html).toBe('<div class="pb-8"><header>hero</header><p>first</p><p>second</p></div>');
  });
});

describe("DetailSection", () => {
  it("is a section named by its own heading", () => {
    const html = renderToStaticMarkup(
      <DetailSection id="game-reviews" title="Reviews" count="3 reviews">
        <p>body</p>
      </DetailSection>,
    );
    expect(html).toMatch(/^<section [^>]*aria-labelledby="game-reviews"[^>]*>/);
    expect(html).toMatch(/<h2[^>]*><span id="game-reviews">Reviews<\/span><\/h2>/);
    expect(html).toContain("3 reviews");
    expect(html).toMatch(/<p>body<\/p><\/section>$/);
  });

  it("can open a department one level down", () => {
    const html = renderToStaticMarkup(
      <DetailSection id="x" title="Removed" as="h3">
        body
      </DetailSection>,
    );
    expect(html).toMatch(/<h3[^>]*><span id="x">Removed<\/span><\/h3>/);
  });
});

describe("SectionLink", () => {
  it("is a link with a decorative arrow", () => {
    const html = renderToStaticMarkup(<SectionLink href="/games/1/reviews">See all</SectionLink>);
    expect(html).toMatch(/^<a [^>]*href="\/games\/1\/reviews"[^>]*>See all<svg[^>]*aria-hidden="true"/);
  });
});
