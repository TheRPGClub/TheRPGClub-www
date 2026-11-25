---
version: 1
slug: "app-protected-gotm-page-tsx"
primary_target: "app/(protected)/gotm/page.tsx"
related_targets: ["app/(protected)/gotm/[round]/page.tsx","components/gotm/gotm-history.tsx"]
---

# GOTM History + Round Page

Mode: Experience (/gotm, the art leads) with a Read Round Page. Spec api#483, design pick www#201. Reference mock: `.impeccable/mocks/diptych-full.html`.

## Direction contract

THESIS: Every round is a hinged diptych, with GOTM's key art left and NR-GOTM's right, joined by the Anton round numeral as the hinge. It refuses the dense ledger table and the equal-card grid.
OWN-WORLD: The Monthly Issue world unchanged: ink ground, key art under black scrims, Anton two-line headlines (2nd line yellow for GOTM, soft violet for NR), red and violet 3-4px foot bars, the winner starburst only on winners, 2px paper rules, hard 2-4px corners.
STORY: Members browse the club's years as pairs of art, open a round, and see every game that was in the running, who put it forward and why, and how close the vote was.
FIRST VIEWPORT: /gotm has the page title, Category filter (Both/GOTM/NR-GOTM, no search), the year rail at left, and full-width diptych rows newest first with a 5.75rem hinge numeral and an "N nominated" tag. The Round Page has a back link and prev/next, then the hero diptych of winners, then two Category columns of nominees with cover, "by" nominator, full reason, vote count over a thin bar in the Category ink, and a runoff line.
FORM: grounded structure, dealt lead (THE ROLL), seed: seed:c3e94744aa35700b
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
