---
version: 1
slug: "challenges-slots"
primary_target: "components/challenges/slots/run-matrix.tsx"
related_targets: ["app/(protected)/challenges/[id]/page.tsx","components/challenges/slots/runs-timeline.tsx","components/challenges/challenge-banner.tsx"]
---

# Surface: Challenge page, Slots Format (Years Alive and similar)

Mode: Operate. Monthly Issue world plus the Challenges inks (`challenges-inks.md`).
Ticket: 21 (www#109), on the Challenge page from ticket 18. Route group: `app/(app)` on main, `app/(protected)` on the worktree.
Merged mock: `.impeccable/mocks/decision/challenges-final/index.html#slots` (options 3A and 3B).

## Owner's pick (2026-11-17)
> "3A and 3B: see our run very explicitly, the graph for the other members, and clicking a member shows the same layout as for the user but with that member's games."

## Job
See your own Run year by year, fill open years (pick a past Game Completion, move a game), and compare with everyone else; open any member's Run to see their games.

## Layout (desktop)
1. **Challenge banner** (as in `challenges-pool.md`), 280px. Slots Challenges usually have no key art, so the banner's picture is a slot grid in the tint: 40 small tiles (22×30px), Cleared ones paper at 85%, open ones outlined. Chips: tint chip "Always Open" (or the Season), Format chip, "Counts past play", "Birth year to now". Numerals: Runs (tint hi) and Caught Up.
2. **Rules row:** the rules paragraph and the Host at the right.
3. **Run panel** (3A), ink-2: the header ("Your Run · from 1988", the score "35 / 39" in Anton 72px, "Cleared · 1 In Progress · 4 open years") and the actions at the right: yellow **Pick a past Game Completion** (only with Counts past play) and outline **Move a game**. Then the matrix. Then a legend line for the Past and Moved tags.
4. **Other Runs** (3B): heading "Other Runs 13" on the 2px rule with "Tap a Run to open it" at the right; the year axis; one lane per member; a legend and "Show all 13 Runs".

## Components
- **Run matrix** (3A): a grid of decades × digits: a decade label column ("80s" in Anton, paper-mute) and ten columns ·0 to ·9. Years before the Run's first year are empty; years after this year are ghost tiles (dashed rule, the year in paper-mute). Each year is one of:
  - **Cleared:** the cover tile with the year in Anton at the top left (paper with a soft shadow). Tags at the top right: paper "Past" (picked from before the Run), "Moved" (moved to another release year).
  - **Open:** a dashed rule-strong tile with the year in Anton in tint hi and "Pick a past game".
  - **Open, with a fitting In Progress game:** the dashed outline in tint hi and "Yakuza: Like a Dragon is In Progress and fits here".
  - **This year, just opened:** "Opened 1 Jan".
  Tapping an open year (your own Run) opens the past-play picker filtered to that year; tapping a Cleared tile opens the Move menu (other release years it fits).
- **Runs timeline** (3B): one shared axis from the earliest first year across all Runs to this year, labelled every 5 years. Each lane: avatar, name and "from 1994" (the birth year shows because the member was told it would), then one cell per year: paper = Cleared, outline = open, empty before their first year; the first year carries a 2px ring in tint hi. At the right the score "33 / 33" and "Caught Up" in tint hi; an arrow at the end. Lanes sort by Caught Up / Finished first, then by Cleared share.
  - Hover: ink-3 fill, the arrow goes paper. Focus: the yellow ring. Selected: ink-2 fill with the 2px yellow inset ring and a yellow arrow.
- **Another member's Run** (the clicked state): the Run panel swaps in place to that member's Run in the same matrix: their avatar (56px), "Dice Goblin's Run", "from 1994 · started 3 Mar 2025", the score, a "Caught Up" (or "Finished") stamp in tint hi at -6deg, and an outline **Back to your Run** button. It is read-only: no Pick or Move, and open years read "Open" without the prompt. The URL keeps `?run=<memberId>` so it can be linked. The panel scrolls into view when a lane is tapped.

## States
- **No Run yet:** the Run panel shows the matrix for the viewer's birth year as all-open ghosts with the yellow **Start a Run**. Without a Birth Date, Start asks for it first and says "Your birth year will show on your Run" (ticket 21).
- **Caught Up / Finished:** a stamp beside the score.
- **Abandoned (yours):** panel at 75% with "Abandoned" and Delete (signal orange outline).
- **Refusals** (move to a year that is taken, a game that doesn't fit, a past Completion already used) show in a notice slip at the top of the panel.
- **Many Runs:** the timeline shows 8 lanes, then "Show all".
- A fixed range Slots Challenge (Nineties Kid, 1990-1999) draws one decade row and the axis covers that range only.

## Colour roles
Tint hi = open-year numerals, In Progress outline, birth-year ring, Caught Up label and stamp, banner numeral and second headline line. Tint fill = banner ground. Format ink = only the square on the Format chip (3A/3B used the Slots ink for these marks; it moves to the tint). Paper = Cleared cells and tags. Yellow = your actions, the selected lane, focus.

## Copy
Run, Cleared, In Progress, open year, Caught Up, Finished, Counts past play, "Pick a past Game Completion", "Move a game", "Back to your Run". Not "checklist", "grid", "slot filled".

## Phone
The matrix keeps ten columns but drops covers to their year numbers on tinted tiles at under 480px (tap a tile to see the cover and title in a sheet). The timeline lane drops the name column to the avatar and keeps the cells (each cell min 4px); tapping still opens the Run. Actions go full width under the score.

## Choices to confirm
- Your own lane is not in the timeline (it is the panel above). It can be added as a pinned first lane.
- The Slots page uses the same banner as the Pool page (3A had a plain header), with a slot-grid picture because there is no key art.

## Direction contract
THESIS: your years laid out as an explicit decade matrix of covers, everyone else as one comparable timeline; it refuses a progress bar per member.
OWN-WORLD: cover tiles with Anton years, dashed open years in tint hi, paper-and-outline timeline cells, the yellow selected lane.
STORY: the member sees which years are left, fills one, then compares and peeks into another member's years.
FIRST VIEWPORT: banner, rules, the top of your Run panel with the score and the first decades.
FORM: owner's mix of 3A and 3B (merged mock `challenges-final#slots`). seed: none (unavailable)
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
