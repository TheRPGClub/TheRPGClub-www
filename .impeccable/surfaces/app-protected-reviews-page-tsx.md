---
version: 1
slug: "app-protected-reviews-page-tsx"
primary_target: "app/(protected)/reviews/page.tsx"
related_targets: ["app/(protected)/reviews/drafts/page.tsx"]
---

# Surface: The Review Feed (/reviews) and Your drafts (/reviews/drafts)

Mode: Read. Monthly Issue world, inherited; no new inks.
Mocks: `.impeccable/mocks/decision/reviews/feed-boxes-r2.html` (picked 2026-11-23; round 1 `feed-boxes.html`), drafts treatment from `drafts.html` option C.

## Owner's picks (2026-11-23)
- The Review Boxes structure over the Roundup and the Running Column.
- "we need an example where its GOTM and Revisited, both pills should be on the same row": the pill row is track pill then state pill (Revisited / Quick take; Draft / Revisiting on the drafts index), never split, its own line on phones.
- "We also need a draft index not just a topbar": `/reviews/drafts`; the feed keeps only a compact drafts row linking to it.
- Drafts everywhere use option C, the pile: a page with its corner turned down showing yellow, edges stacked per extra draft (up to three), a recessed tray on the index, the cut-corner yellow "Your drafts" / "Continue writing", the outlined unprinted score box (dashed with no score), "Last touched …".

## Job
A member scans what the club has been reviewing lately (new Reviews and Revisions, newest first) and opens one to read; the author picks their own Drafts back up.

## Direction contract
THESIS: the feed is a magazine's reviews pages, every Review a ruled box with its verdict and a monumental score, packed two-up in UTC day bands. It refuses the activity timeline and the uniform card grid.
OWN-WORLD: 2px paper-ruled boxes, 3:4 covers, Anton scores in the box corner (solid red block for GOTM, violet for NR-GOTM, paper otherwise), the struck old score beside the new on a Revision, the track + state pill row, Anton day headings on a running rule; drafts as dog-eared pages showing yellow.
STORY: the reader sees what's new today, recognises the club's GOTM picks by ink, spots revisits by the struck score, and opens a box to read the Review.
FIRST VIEWPORT: running head "Reviews"; "REVIEWS" in Anton on the 2px rule with the published count and the Written only toggle at the right; the compact drafts row (dog-eared page, count, Continue …, All drafts →); then the "Today" band and the first two rows of boxes.
FORM: The Review Boxes, position 2 of 7 on the ranked list; seed:b03a12f5713bc952
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
