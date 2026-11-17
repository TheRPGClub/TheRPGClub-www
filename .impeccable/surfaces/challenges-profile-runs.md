---
version: 1
slug: "challenges-profile-runs"
primary_target: "components/member/runs-section.tsx"
related_targets: ["app/(protected)/members/[id]/page.tsx","components/challenges/run-stamp.tsx"]
---

# Surface: Runs on a member profile

Mode: Experience-leaning Read: a collectible record. Monthly Issue world plus the Challenges inks (`challenges-inks.md`).
Ticket: 19 (www#107). It is a section of the member page (`DetailTemplate`, gated by the Feature's `shown`), after the bookcase. Route group: `app/(app)` on main, `app/(protected)` on the worktree.
Merged mock: `.impeccable/mocks/decision/challenges-final/index.html#profile` (option 7C, arranged like 7A).

## Owner's pick (2026-11-17)
> "7C, but arranged like 7A with three on top and the others below."

## Job
Anyone viewing a profile sees what Challenges the member is running now and their record of past Runs; the member can delete an Abandoned Run.

## Layout (desktop)
1. **Section heading** "Runs" on the 2px paper rule, the count in label type ("3 current · 5 past"), and a label link "Challenges →" at the right.
2. **Current row** (7A's arrangement): up to three large landscape stamps in a 3-column grid, 26px gap.
3. **Past case** (7A's shelf arrangement): a 170px left column with the monumental count (Anton 92px), "Past Runs" in Anton and "Newest first. 2 Finished."; on the right the past stamps, smaller and portrait (4:5), in a 5-column grid, wrapping to more rows.

## Components
- **Stamp** (7C): a perforated edge (10px, the perforation as ink circles on a 16px repeat) around an inner panel, at a stable tilt within ±1.3deg from the Run id, with the soft object shadow. Each stamp links to the Challenge page (on a Slots Challenge, opening that member's Run).
- **Current stamp** (large): a rule-strong perforated frame; the inner panel ink-2 with a 2px inset edge in the Challenge's tint hi. Left: the Format marker (9px square + name, label type), the Challenge name in Anton 34px in tint hi, the score (Anton 64px, target muted), a segmented bar in tint hi for Pool and Assignment (Slots shows the score only), and the when-line in Barlow paper-dim ("from 1988 · Always Open", "Season 2026 · 33 days left", "Edition 2025 · until 25 Dec · 38 days"). Right: the In Progress cover (dashed paper outline, "In Progress") or the assigned cover ("Assigned"), 78px.
- **Past stamp** (small): a paper perforated frame; the inner panel by outcome:
  - **Finished:** solid tint fill with paper type, postmarked "Finished" (Anton, ink on paper at 88%, -12deg, overlapping the corner).
  - **Expired:** the tint mixed 30% into ink-3 with paper-dim type, postmarked "Expired" in paper outline.
  - **Abandoned:** ink-3 with paper-mute type, postmarked "Abandoned" in mute outline. On the member's own profile only, a small signal-orange outline trash button sits on its top edge (visible on hover and focus, always visible on touch) to delete it, with a confirm dialog.
  Contents: "Format · Season 2026" in label type, the name in Anton 24px, the score (Anton 40px), and the outcome date ("Finished 30 Aug 2026").
- **Caught Up** (Slots that grow each year): a current stamp, with a small "Caught Up" stamp mark in tint hi beside the score.

## Ordering and overflow
- Current: the three with the nearest deadline (Seasonal and Edition ends first, then Always Open by most recent activity). With more than three, a fourth "+N more" stamp-sized ink-2 tile opens the rest in place.
- Past: newest outcome first. Past Runs over 10 show "Show all N" under the grid.

## States
- **No Runs:** the section is hidden on other members' profiles; on your own it shows a dashed panel "No Runs yet." with a "Find a Challenge →" link.
- **Only past Runs:** the current row is replaced by one muted line "Nothing running right now."
- **Feature hidden by preference or Off:** the section is not rendered.
- **Refusal on delete:** a notice slip above the past grid.

## Colour roles
Tint hi = current stamp edge, title and bar. Tint fill = Finished stamp. Format ink = the 9px marker only (7C filled current stamps with the Format ink; that moves to the tint). Paper = perforated frames of past stamps, postmarks. Signal orange = Delete. Yellow = focus only.

## Copy
Run, Runs, Finished, Expired, Abandoned, Caught Up, In Progress, Assigned, Season, Edition, Always Open. Not "completed", "failed", "quit", "badges", "collection".

## Phone
Current stamps stack one per row (still landscape). The past case stacks: the count and title in a row above, then past stamps in 2 columns. Tilts halve.

## Direction contract
THESIS: a member's Runs as a sheet of stamps, the live ones big on top and the record below; it refuses a progress-bar list.
OWN-WORLD: perforated stamps, tint-edged ink for current Runs, solid tint for Finished, postmarks in Anton.
STORY: a visitor sees at a glance what the member is chasing now and what they have finished before.
FIRST VIEWPORT (of the section): heading, the three current stamps, the top of the past case.
FORM: owner's pick 7C arranged like 7A (merged mock `challenges-final#profile`). seed: none (unavailable)
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
