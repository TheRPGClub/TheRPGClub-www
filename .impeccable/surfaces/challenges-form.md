---
version: 1
slug: "challenges-form"
primary_target: "app/(protected)/challenges/new/page.tsx"
related_targets: ["app/(protected)/challenges/[id]/edit/page.tsx","components/challenges/form/rule-sentence.tsx","components/challenges/form/pool-builder.tsx","components/challenges/form/year-ruler.tsx"]
---

# Surface: Create and edit a Challenge (/challenges/new, /challenges/[id]/edit)

Mode: Operate. Monthly Issue world plus the Challenges inks (`challenges-inks.md`).
Tickets: 18 (Pool and schedule), 21 (Slots settings), 22 (Assignment calendar). Route group: `app/(app)` on main, `app/(protected)` on the worktree.
Merged mock: `.impeccable/mocks/decision/challenges-final/index.html#form` (options 5C and 5D).

## Owner's pick (2026-11-17)
> "5D's idea with 5C's visual aspect."

## Job
A Regular (or staff, for club-hosted and Assignment Challenges) sets up a Challenge in plain words, sees exactly which games or years it covers, and creates it. The Host edits it later, with the rules locked once a Run exists.

## Layout (desktop)
1. **Header:** "New Challenge" (or "Edit Challenge") at page scale; Cancel (ghost) and the yellow **Create Challenge** / **Save** at the right.
2. **Format cards:** three cards in a row (Slots "One game for every year in a range", Pool "Clear games from a set you choose", Assignment "Members pick for each other", the last shown only to staff). Name in Anton with the 9px Format square; the chosen card carries the 2px yellow inset ring. It is a radio group.
3. **The rule sentence** (5D) in an ink-2 panel, Barlow 500 at about 38px, paper-dim, with the settings as underlined words in paper 600 (3px rule-strong underline, a muted chevron, calendar or × icon). The word being edited takes a yellow underline and a 10% yellow wash. Its control opens directly beneath the panel (a popover anchored to the word: the franchise and collection search with result counts, a number stepper, a date picker, or a choice list), with a muted help line beside it.
4. **The Format's visual** (5C) under the sentence:
   - **Pool:** heading "The Pool 41 games" on the 2px rule with "Tap a cover to leave it out. New franchise games join by themselves." at the right; a "Built from" row of source chips (Final Fantasy · Franchise · 44 ×) and the tally "44 from Final Fantasy · 1 added · 4 left out"; then the cover wall in 10 columns.
   - **Slots:** the year ruler (1970 to now, ticks every 2 years, labels every 10) in an ink-2 panel, with the range as a paper-outlined band and two handles, each labelled with its sentence word; the handle being dragged turns yellow. Below: "For a member born 1988 that's 39 slots, plus one every 1 January."
   - **Assignment:** a December preview strip (31 days; the draw, pick deadline and reveal in holly with captions) and the backlog rule line.
5. **Name, Description, Host** in a row (Name field, a three-line Description, Host segmented "You / The club (staff)" for Moderators and above).

## The sentences
- Pool: "Clear [3] games from [Final Fantasy ×] [+ franchise or collection], played between [22 Sep] and [20 Dec], [every year]." "every year" ↔ "any time" switches Seasonal and Always Open; "any time" adds "until [no end date]". "Clear [3]" offers a number or "every game".
- Slots: "One game from every year, from [each member's birth year | a fixed year] to [the current year | a fixed year], open [any time | every year], [counting past play | not counting past play]." Counting past play is offered only when open any time.
- Assignment: "Members sign up until [1 Dec], pick by [15 Dec] and see their game on [25 Dec]. They have until [the next 25 Dec] to Clear it." The 5-game backlog minimum is fixed copy, not a word.

## Components
- **Pool cover tile** (5C): 3:4 cover with a small × square at the top right (ink 75%). Tapped, it greys to 28% and grayscale, the × flips to a paper +, and a paper "Left out" tag sits at the bottom left. A game added by hand has a paper outline and a paper "Added" tag. The last tile is the dashed "+ Add a game by hand", opening the game picker (W4 `game-picker`).
- **Rule word:** a button with the underline; keyboard reachable in reading order; Enter opens its popover; Escape closes it.

## States
- **Locked rules (edit, a Run exists):** the words lose their underline and show a small lock icon in paper-dim; under the sentence a dashed notice: "The rules are locked because 7 Runs have started. The name, description and end date can still change." The Pool wall shows read-only.
- **Duplicate name:** the API warns after creating, so the warning is shown on the new Challenge's page as a notice slip ("There's already a Challenge called Fall of Final Fantasy. Join it instead?" with a link, and Delete this one), not on the form.
- **Validation:** an invalid word (end before start, target above the Pool size) gets a signal-orange underline and its message in the popover.
- **Search:** loading row, "No franchises or collections match", and the network problem line from `searchProblem`.
- **Saving:** the button shows a spinner and stays the same width.

## Colour roles
Yellow = the chosen Format card, the word being edited, the active ruler handle, Create. Paper = Added tags and outlines, the ruler band. Format ink = the 9px squares on the Format cards only (5C's Pool-ink "Added" outline and 5D's Pool-ink underlines move to paper/rule-strong). Holly = the Assignment preview's key days. Signal orange = validation errors.

## Copy
Challenge, Format, Slots, Pool, Assignment, Host, Always Open, Seasonal, Season, Counts past play, Pool, left out, added, "Clear 3", Run. Not "type", "mode", "include/exclude".

## Phone
The Format cards stack. The sentence drops to 24px and wraps naturally; a word's control opens as a bottom sheet. The Pool wall goes 4 columns. The ruler keeps two handles with 44px hit areas and labels above the band. Name, Description and Host stack.

## Choices to confirm
- An Assignment version of the sentence and a December preview were added (ticket 22 needs it; 5C and 5D drew only Pool and Slots).
- The duplicate warning is on the new Challenge's page, not the form, because the API warns after creating.
- (www#110 build) "the next 25 Dec" is plain sentence text, not a word: the year to Clear always ends at the next reveal, so there is nothing to set. On phones the December preview wraps into rows so all three key days show.

## Direction contract
THESIS: the rules are a sentence you edit word by word, and the result is shown as the covers or years it covers; it refuses a long stacked form.
OWN-WORLD: big Barlow sentence with paper underlined words, yellow for the word being edited, the cover wall with Left out tags, the two-handle year ruler.
STORY: the Host says what the Challenge is in one line, sees the games or years it means, adjusts, and creates it.
FIRST VIEWPORT: header with Create, the Format cards, the sentence and the open word's control.
FORM: owner's mix of 5C and 5D (merged mock `challenges-final#form`). seed: none (unavailable)
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
