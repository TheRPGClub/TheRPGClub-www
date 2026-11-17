---
version: 1
slug: "challenges-index"
primary_target: "app/(protected)/challenges/page.tsx"
related_targets: ["components/challenges/challenge-flyer.tsx","components/challenges/challenge-billboard.tsx"]
---

# Surface: Challenges index (/challenges)

Mode: Operate, in a loud register (Challenges are the club's fun department). Inside the Monthly Issue world (DESIGN.md) plus the proposed Challenges inks (`challenges-inks.md`).
Ticket: 18 (www#106). Route group: `app/(app)` on main; the `feat/challenges-www` worktree still uses `app/(protected)`. Members-only, gated by `featureLayout("challenges")`.
Merged mock: `.impeccable/mocks/decision/challenges-final/index.html#index` (options gallery: `../challenges/index.html`, 1A and 1C).

## Owner's pick (2026-11-17)
> "1A and 1C mixed: the flyer view, with some being more on display like a billboard and the rest also flyers but displayed normally."

## Job
Members see what is running, what is coming back and where they already have a Run, then start a Run or sign up. Regulars and staff also create a Challenge here.

## Layout (desktop)
1. **Header** as every index: "Challenges" in Anton at page scale on the 2px paper rule, the count in label type ("5 Open · 3 Closed"), and the yellow **New Challenge** button at the right (Regulars and staff only).
2. **Filter bar:** a segmented All / Open / Closed control at the left; at the right a "Format" label and three outline chips (Slots, Pool, Assignment), each with its 9px Format-ink square. Filters are URL params.
3. **Billboards:** up to two, side by side in a 2-column row (one billboard spans the full row).
4. **Board:** the remaining Challenges as flyers in a 4-column grid on the dotted pinboard ground (1px paper dots at 6% on a 22px grid), 22px column gap, 30px between rows. Open flyers first (by Run count), then Closed (soonest to open first).

## Components
- **Challenge flyer** (1C): a card filled with the Challenge tint, paper type, at a stable tilt within ±1.4deg taken from the Challenge id, with the soft object shadow. Contents top to bottom:
  - an ink label "■ Format · When" (Format square, then "Always Open" or the Season's dates);
  - the name in Anton (40px, two lines max);
  - the Format picture: Slots = a row of up to 20 small slot squares (filled for the viewer's Cleared years when they have a Run, else outlined) with "+N"; Pool = a fan of three Pool covers; Assignment = a paper name tag "To: you?";
  - the description (Barlow, 3 lines max);
  - a footer rule with the Host's avatar and name, and the Run count (Anton numeral + "Runs");
  - the action: the yellow **Start a Run** / **Sign up**, or, when the viewer has a Run, an ink chip "Your Run · 35 of 39 Cleared".
- **Billboard** (1A's lead card, in flyer language): a straight (untilted) flyer at double width with a heavier shadow. Two columns: left the label, the name at 58px, the description; right the days-left numeral in Anton at about 112px with its caption ("days left", "days to sign up") and the Format picture at a larger size. The footer runs the full width with the Host, Runs and Finished counts, and the action. A viewer's Pool Run shows a three-segment bar in the tint's hi.
- **Closed flyer:** the tint mixed 35% into ink-3, covers desaturated, body in paper-dim, no action, and a paper tape across the top edge with the opening date ("Opens 1 Dec", "Opens 21 Jun 2027").

## Which Challenges become billboards (choice to confirm)
Up to two Open Challenges with a clock running: a Seasonal Challenge inside its Season, or an Assignment Edition in sign-up or picking. Nearest deadline first. When none qualify there are no billboards. This needs no API change; a staff "Feature" switch would need a new field.

## States
- **Empty (no Challenges):** the dashed empty panel "No Challenges yet." with New Challenge for those allowed.
- **Filtered to nothing:** "No Closed Pool Challenges." plus a Clear filters link.
- **Hidden by staff:** not listed for members; staff see the flyer with a "Hidden" paper tape.
- **Preview Feature:** the "Preview" highlight chip beside the title (staff only).
- Hover and focus: the flyer straightens to 0deg (200ms, motion-safe), the yellow focus ring on the whole card link.

## Colour roles
Tint fill = flyer and billboard ground. Tint hi = progress segments on a billboard. Format ink = the 9px square only. Yellow = Start a Run, Sign up, New Challenge, focus. Signal orange: none here. Red: only the nav.

## Copy
Challenge, Host, Run, Start a Run, Sign up, Always Open, Seasonal, Season, Edition, Open, Closed, Cleared, Finished. Never "event", "quest", "type".

## Phone
Billboards stack full width above the board, with the numeral at about 80px under the label. The board becomes one column with tilts halved (±0.7deg). The filter bar wraps: the segmented control on its own row, then the Format chips scrolling horizontally. 16px gutters, no horizontal page scroll.

## Direction contract
THESIS: a pinboard of club flyers where the running Challenges are pasted up as billboards; it refuses the uniform card grid.
OWN-WORLD: Monthly Issue ink, Anton, label caps, plus each Challenge's own tint as a solid flyer; Format colour only as a small square.
STORY: the member sees what is on now and how long is left, spots their own Runs, and starts one.
FIRST VIEWPORT: header and filters, then the billboards with their monumental day counts; the first flyers start below.
FORM: owner's mix of 1A and 1C (merged mock `challenges-final#index`). seed: none (unavailable)
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
