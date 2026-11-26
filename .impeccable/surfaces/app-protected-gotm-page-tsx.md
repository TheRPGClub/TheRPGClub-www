---
version: 1
slug: "app-protected-gotm-page-tsx"
primary_target: "app/(protected)/gotm/page.tsx"
related_targets: ["app/(protected)/gotm/[round]/page.tsx","components/gotm/gotm-history.tsx"]
---

# GOTM History + Round Page

Mode: Experience (/gotm, the art leads) with a Read Round Page. Spec api#483, design pick www#201. Reference mock: `.impeccable/mocks/diptych-full.html`.

## Direction contract

THESIS: Every round is its winners' key art under an Anton round numeral set on the banners' corner like a page number, GOTM left and NR-GOTM right when both won. It refuses the dense ledger table and the equal-card grid.
OWN-WORLD: The Monthly Issue world unchanged: ink ground, key art under black scrims, Anton two-line headlines (2nd line yellow for GOTM, soft violet for NR), red and violet 3-4px foot bars, the winner starburst only on winners (top right of its banner, clear of the numeral tab), 2px paper rules, hard 2-4px corners. Each /gotm row carries its Anton round numeral on an ink tab over the top-left corner of its first banner, like a magazine page number; the numeral never moves, whatever the round's shape (owner decision 2026-11-26, mock `.impeccable/mocks/span-options.html` Option C2).
STORY: Members browse the club's years as pairs of art, open a round, and see every game that was in the running, who put it forward and why, and how close the vote was.
FIRST VIEWPORT: /gotm has the page title, Category filter (Both/GOTM/NR-GOTM, no search), the year rail at left (a horizontal strip on a phone, the switch full width), and full-width rows newest first (the newest slightly taller): a 5.75rem numeral tab (about 3.75rem on a phone) on the banners' corner, the month and a yellow-outlined "N nominated" tag (plus "Deciding" for an undecided round) beside it above the art. A mixed round is GOTM's half and NR-GOTM's with a thin rule between, co-winners on a "+ Title" line; a single-Category round, or a filter view, gives each winner its own banner across the width; a phone stacks the banners. The Round Page has a back link, the "Round N · Month Year" heading (number over month on a phone) with prev/next steps beside it (under it on a phone), then the hinge-less hero of winners (no numeral or month block: mixed = two halves with a thin rule, single Category = one panel per winner across the width, stacked on a phone), then two Category columns of nominees with cover, "by" nominator, full reason, vote count over a thin bar in the Category ink, and a runoff line.
FORM: grounded structure, dealt lead (THE ROLL), seed: seed:c3e94744aa35700b
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
