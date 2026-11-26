---
version: 1
slug: "app-protected-news-page-tsx"
primary_target: "app/(protected)/news/page.tsx"
related_targets: ["app/(protected)/news/shelves/page.tsx","components/news/news-body.tsx","components/news/news-hero-band.tsx","components/news/news-mosaic.tsx","components/news/news-tile.tsx","components/news/news-seen.tsx","components/news/shelves/news-shelves-view.tsx","components/news/shelves/news-shelf.tsx"]
---

# Surface: /news (the News Hub)

Mode: Read (catching up on game news, then scanning by category to decide what to open). Scope: replacement composition inside the established DESIGN.md world; news inks role kept (news surfaces only). Spec: specs/news-remake/spec.md (owner pick 2026-11-26, replaces the 2026-11 Contact Sheet). Tabs: Catch-up (/news, first view) and Shelves (/news/shelves).
Audience/job: signed-in members coming back to see what's new since their News Mark, opening items in a new tab, then browsing the categories they follow.

## Direction contract

THESIS: The News Hub opens on what you missed: a count of new News Items since your News Mark, the newest one as a full-art hero, the rest in a mosaic sized by what each carries; a Shelves tab gives each followed News Category its own sideways row. It refuses the equal-card grid in day bands and the headline ledger.

OWN-WORLD: Ink ground, Anton count and NEWS title, Barlow 600 headlines on black scrims over key art, Barlow italic dim comments, Barlow Condensed tracked caps for meta and tags; each item marked in its News Category's ink (tag, ink bar, quote edge; Rumours dashed or hatched); yellow only for the new dot, focus, hover and selection; hard rectangles at rounded.sm–md.

STORY: The member sees "23 NEW since Tuesday, 21:40" and the ink bar of what kind, reads the hero, scans the mosaic, opens items in new tabs, and leaves; the News Mark moves on leaving. Later they switch to Shelves to browse a category.

FIRST VIEWPORT: Masthead row: NEWS + Updated note, Catch-up/Shelves tabs, search, Categories, Mark all seen. Hero band: left ~300px count block (Anton count, since line, ink bar + legend); right the newest new item as art hero with headline on a scrim. Below: the mosaic (large, normal, quote and ink-panel tiles, new dots), then the Seen rule and compact rows. Shelves: lead row of three wide art cards, then category shelves of 16:9 cards cut at the right edge.

FORM: Catch-up (dealt structure, position 6 of my ordered list) merged with Category Shelves (the roll, position 3) as a second tab, owner's mix; seed:328fce118c3f6f33. Signature interaction: the hero band's count and ink bar tell what's new at a glance; leaving the page quietly moves the News Mark so the next visit's count is honest; shelves scroll sideways with snap.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
