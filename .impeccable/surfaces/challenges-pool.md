---
version: 1
slug: "challenges-pool"
primary_target: "app/(protected)/challenges/[id]/page.tsx"
related_targets: ["components/challenges/challenge-banner.tsx","components/challenges/pool/run-cards.tsx","components/challenges/pool/pool-wall.tsx"]
---

# Surface: Challenge page, Pool Format (/challenges/[id])

Mode: Operate. Monthly Issue world plus the Challenges inks (`challenges-inks.md`).
Tickets: 18 (page), 19 (Runs and actions). Route group: `app/(app)` on main, `app/(protected)` on the `feat/challenges-www` worktree.
Merged mock: `.impeccable/mocks/decision/challenges-final/index.html#pool` (options 2B and 2D).

## Owner's pick (2026-11-17)
> "2B and 2D: the feature image as a banner, the runs with the members, and a switch to see The Pool."

## Job
See the rules, how long the Season has left and how every member's Run is doing; start, abandon or delete your own Run; browse the Pool to choose what to play next.

## Layout (desktop)
1. **Challenge banner** (shared by every Challenge page; see below), 330px, full bleed.
2. **Rules row:** the rules paragraph (paper-dim, about 75ch) on the left; a fact list on the right (label-type terms: Host with avatar, Season "22 Sep – 20 Dec, every year", Finish "Clear 3 games from the Pool", Pool "Final Fantasy franchise · 41 games").
3. **View switch heading** in place of a section heading: two Anton words at 30px, "Runs 7" and "The Pool 41", on the 2px paper rule. The active word is paper with a 4px underline in the tint hi; the other is paper-mute. Your Run action sits at the right of the rule (Start a Run in yellow, or the signal-orange outline **Abandon your Run**). It is a tab list; the view is kept in `?view=pool`. Runs is the default.
4. **Runs view** (2D): Run cards in a 3-column grid, 20px gap.
5. **The Pool view** (2B): a filter (All 41 / Played by the club 14 / Not played yet 27) and a legend at the right, then the cover wall in 10 columns, then "Left out by the Host: …".

## Components
- **Challenge banner:** key art (from the Challenge, else the first Pool game's art) over the tint fill, under the standard black legibility scrim from the left. Chips: the tint chip with the Season ("Season 2026 · 22 Sep – 20 Dec") or "Always Open", and a neutral chip with the Format square and name. The two-line headline in Anton at 86px: first line paper, second line tint hi. Numerals at the right on an ink plate (ink at 80%): days left in tint hi, then Runs and Finished in paper, label captions under each. Without art the banner shows the tint with the Format's picture (see the Slots and Assignment briefs).
- **Run card** (2D): ink-2 panel. Avatar (34px) and the member's name in Anton; "You" highlight chip on your own card, whose panel carries the 2px yellow inset ring. The score at the top right ("2 / 3", Anton 48px with the target muted). Cleared covers (66px) then In Progress covers with the dashed paper outline. A segmented bar (one segment per target game, filled in tint hi). Footer: "Started 23 Sep" / "Finished 6 Nov", and "1 In Progress". Finished cards carry a "Finished" stamp in tint hi at -5deg. Abandoned cards drop to 75% and carry an outline "Abandoned" chip; they list last.
- **Pool wall** (2B): covers at 3:4. Under each, the avatars (20px) of members who Cleared it (solid) and who have it In Progress (paper ring). Covers in your Run carry the yellow ring; games nobody has played are at 50%. A game the Host added by hand carries a small paper "Added" tag. Tapping a cover goes to the game page.

## States
- No Runs yet: "No Runs yet. Be the first." with Start a Run.
- Season Closed: banner chip "Closed · opens 22 Sep 2027", no days-left numeral (show the Runs and Finished of the last Season), Start a Run disabled with that reason.
- Your Run Expired / Finished: your card keeps the ring; the action becomes Start a new Run when the Challenge allows another.
- Refusals from the API (start, abandon, delete) show in a notice slip at the switch rule.
- Abandon and Delete confirm in a dialog; Delete is signal orange solid after the confirm.
- Staff: Hide / Unhide and Change Host live in an outline "Staff" menu at the right of the rules row.
- Pool view with many games: 40 per page with "Show all", the filter tabs keep counts.

## Colour roles
Tint hi = second headline line, days-left numeral, switch underline, Run bars, Finished stamp. Tint fill = banner ground under the art, tint chip. Format ink = the square on the Format chip only (2B's Pool-ink "Added by the Host" outline is replaced by the paper tag). Yellow = your card's ring, your covers' ring, Start a Run, focus. Signal orange = Abandon, Delete.

## Copy
Run, Runs, Host, Season, Pool, Cleared, In Progress, Finished, Abandoned, Expired, "Clear 3 to Finish", "The Pool". Not "entries", "participants", "series list".

## Phone
Banner 260px; headline 48px; numerals move under the headline in a row on the ink plate. Rules row stacks (fact list under the paragraph). The switch stays one row (30px words). Run cards one column; the Pool wall 3 columns; the filter scrolls horizontally.

## Choices to confirm
- The Season ink in 2D's banner is replaced by the Challenge's tint.
- 2B's ranked Runs rail is dropped in The Pool view (Runs are the other tab).

## Direction contract
THESIS: the Challenge as a cover story with its members' Runs beneath and the Pool one switch away; it refuses a stats header over a progress table.
OWN-WORLD: key art under the scrim, two-line Anton headline with the tint hi line, ink-2 Run cards with tint bars, avatar-tagged cover wall.
STORY: the member sees the time left and who is ahead, finds their own card, then browses the Pool for their next game.
FIRST VIEWPORT: the banner with the headline and days left, the rules row, the top of the switch.
FORM: owner's mix of 2B and 2D (merged mock `challenges-final#pool`). seed: none (unavailable)
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
