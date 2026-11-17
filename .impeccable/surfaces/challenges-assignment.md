---
version: 1
slug: "challenges-assignment"
primary_target: "components/challenges/assignment/edition-view.tsx"
related_targets: ["app/(protected)/challenges/[id]/page.tsx","components/challenges/assignment/advent-doors.tsx","components/challenges/assignment/santa-circle.tsx"]
---

# Surface: Challenge page, Assignment Format (Secret Santa Edition)

Mode: Operate, Christmassy. Monthly Issue world plus the Challenges inks (holly and tinsel are Secret Santa's).
Tickets: 22 (www#110, sign-up and Edition page), 23 (www#111, reveal and Santas). Route group: `app/(app)` on main, `app/(protected)` on the worktree.
Merged mock: `.impeccable/mocks/decision/challenges-final/index.html#assignment` (option 4A, with 4D as an accent).

## Owner's pick (2026-11-17)
> "4A and 4D: the circle is very cute but I like the 4A layout much more."
picks.md: 4D's ring is secondary, used as an accent (the end-of-Edition Santa reveal).

## Job
Follow one Edition through its four phases: sign up (or leave) before the cutoff, know you are a Santa and go pick, see every revealed game and its Run, then see who was whose Santa.

## Layout (desktop)
1. **Challenge banner** (as in `challenges-pool.md`), 280px, holly fill (#1c6545) with a picture of 12 small doors (dark holly with tinsel edges, the last one open). Chips: tint chip "Edition 2026", the Assignment Format chip, "Hosted by the club". Numerals follow the phase (sign-up: days to sign up, signed up; picking: days to pick, picked; revealed: Finished, In Progress; ended: Finished, Expired).
2. **Rules paragraph** (paper-dim, about 95ch).
3. **December strip:** 25 day tiles (ink-2, Anton day numbers). The 1st, 15th and 25th are holly with ink type and holly captions below: "Draw", "Picks due", "Reveal". During picking, days already gone are holly at 18% and today has a 2px paper ring.
4. **Doors and side panel:** a 6-column grid of doors (3:4) beside a 300px side panel (ink-2), 24px gap.

## Components
- **Door** (4A), by phase:
  - **Sign-up:** one door per member signed up, dark holly with a 2px tinsel edge, the number in Anton tinsel and the name in label type. Your empty seat is the yellow door "Your door: sign up" (with a soft yellow halo) until you join.
  - **Picking:** every member drawn; a tinsel seal with a check when their Santa has picked ("Picked for"), a dimmer door with a faint edge while "Waiting". Who picks for whom is never shown.
  - **Revealed:** each door opens to the member's assigned cover, with the name, the game and "Santa revealed when the Edition ends" (or "Random pick") in a foot scrim; a small paper tag at the top right: "Finished" (paper) or "In Progress" (ink with paper outline).
  - **Ended:** the same, signed "From Lore Keeper"; tags "Finished" or "Expired" (muted).
- **Side panel** (by phase): a label line with the date; a monumental numeral in holly; its caption; then the yellow panel for your own business (sign-up: "You have 23 games in your backlog / Sign up for Secret Santa / Sign up"; picking: "You are a Santa / Pick for Loot Hoarder / Open your pick page →"; revealed: "Your game / Star Ocean: The Second Story R / See your Run"); then one muted line of context ("Couch Co-op was left out: under 5 games in their backlog at the draw.").
- **Santa circle** (4D, accent, Ended phase only, in the side panel): a 260px ring with every member's avatar (26px) seated in draw order, yours with the yellow ring; inside, arrows from each Santa to the member they picked for, holly where that Run Finished, paper-mute where it Expired, dashed for a random pick; the centre reads "12 Santas revealed". A key under it, then "Your Santa was Lore Keeper." and **Go to Edition 2027 →**. Arrows draw in once on first view (motion-safe, 600ms ease-out); otherwise static.

## States
- Not enough backlog: the yellow panel becomes a dashed panel "You need at least 5 games in your backlog to sign up (you have 3)." with a link to the backlog.
- Signed up: your door turns into a normal door with your name, and the panel offers **Leave** (outline) until the cutoff.
- Left out of the draw (yours): a notice slip on the picking phase: "You weren't drawn: under 5 games in your backlog on 1 Dec."
- Missed pick: after the deadline the door shows "Random pick" after the reveal.
- Previous Editions: an Edition switcher (outline select "Edition 2026") at the right of the rules row.
- Refusals from join and leave show in a notice slip in the side panel.

## Colour roles
Holly (tint hi #3fbf8a, fill #1c6545) = banner, key days, numerals, Finished arrows. Tinsel #e9c46a = door edges, numbers and seals. Yellow = your door, your panel, your seat in the circle, focus. Paper ring = today. No red anywhere in the page body.

## Copy
Edition, Santa, sign up, draw, pick, reveal, Run, Finished, Expired, In Progress, "Random pick". Not "gift", "present", "giftee"; never "round" for an Edition.

## Phone
Banner 240px. The December strip scrolls horizontally with today (or the next key day) scrolled into view. Doors go 3 columns; the side panel moves above the doors (your business first). The circle stays 260px, centred.

## Choices to confirm
- Today on the strip is a paper ring (4A used red, which is reserved for GOTM and "you are here").
- This page opens with the shared Challenge banner in holly (4A had a plain header).
- The circle appears only when the Edition ends.

## Direction contract
THESIS: an advent calendar of member doors that opens as the Edition moves on; it refuses a roster table with phase badges.
OWN-WORLD: dark holly doors with tinsel edges and Anton numbers, holly key days, the yellow door for you, the small Santa circle at the end.
STORY: the member sees the phase and the next date, does their part (sign up, pick), then enjoys the reveal and finally the Santas.
FIRST VIEWPORT: banner, rules, the December strip and the first row of doors beside the yellow panel.
FORM: owner's pick 4A with 4D as accent (merged mock `challenges-final#assignment`). seed: none (unavailable)
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
