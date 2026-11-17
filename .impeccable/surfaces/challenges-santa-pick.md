---
version: 1
slug: "challenges-santa-pick"
primary_target: "app/(protected)/challenges/[id]/pick/page.tsx"
related_targets: ["components/challenges/assignment/pick-deal.tsx","components/challenges/assignment/name-tag.tsx"]
---

# Surface: Santa pick page (private)

Mode: Experience-leaning Operate: one ceremonial choice. Monthly Issue world plus Secret Santa's holly and tinsel.
Ticket: 23 (www#111). Reachable only by the Santa, only during picking. Route group: `app/(app)` on main, `app/(protected)` on the worktree.
Merged mock: `.impeccable/mocks/decision/challenges-final/index.html#santa-pick` (options 6C and 6A).

## Owner's pick (2026-11-17)
> "6C but with a Christmassy aspect like 6A."

## Job
The Santa looks through their recipient's eligible backlog one game at a time, picks one, and can change it until the deadline, knowing the page and the pick are private.

## Layout (desktop)
1. **Header:** chips (holly tint chip "Secret Santa 2026", neutral "Private" with a lock); the title "Pick for Loot Hoarder" at page scale; at the right the days-left numeral in holly (Anton 72px) over "days · picks due Tue 15 Dec". Under the rule: an eye-off icon and "Only you can see this page. Loot Hoarder finds out on 25 December, and who picked stays secret until the Edition ends."
2. **The deal card** (6C), 460px, full content width: the game's key art under the left scrim. Left column: the position in label type ("04 / 14 · from Loot Hoarder's backlog"), the two-line headline in Anton (96px), fact chips (year, platform, genre, "In their backlog since Mar 2024"), three numerals (HowLongToBeat "62h to beat", "4 members Cleared it", "8.6 club rating"), and the actions: yellow **Pick this one**, outline **Next game →**, ghost **Shuffle**.
   Right: the cover (220px) at 3deg, and hanging from its corner on a tinsel string, **the name tag** (6A).
3. **The reel** under a tinsel rule (2px at 60%): every eligible game as a small cover; seen ones at 85%, unseen at 55%, the current one larger with the yellow ring; the picked one carries a holly dot above it.
4. One muted line: "14 games: Loot Hoarder's backlog, without the 3 they've Cleared. Shuffle deals a random one; the reel jumps anywhere."

## Components
- **Name tag** (6A): a paper luggage tag (clipped top corners, an ink eyelet ringed in tinsel) at 4deg, 250px wide. "To" in label type, the recipient in Anton 34px, a dashed-ruled slot, and a gift icon (lucide, in holly) with "From: your secret Santa".
  - Before picking, the slot reads "Your pick goes here" in italic paper-mute ink.
  - After **Pick this one**, the slot shows the small cover and the title, and a holly "Picked" stamp presses on at -10deg (one stamp motion, 400ms, motion-safe).
- **Deal actions after a pick:** on the picked game, "Picked" with a check icon (outline, inert) and "Keep looking →"; on any other game, **Pick this one instead** (yellow), which moves the stamp.
- Keyboard: ← → move through the backlog, S shuffles, Enter picks; the reel is a listbox.

## States
- **Picked:** as above, plus the note "You can change your pick until Tue 15 Dec. If you don't pick, Loot Hoarder gets a random game from this list."
- **After the deadline / not your Edition / not a Santa:** the page is not reachable (404 for non-Santas; after the deadline a slip "Picks closed on 15 Dec. Your pick is in." with a link back to the Edition).
- **Game without key art:** the card falls back to the tint fill under the scrim with the cover alone.
- **Small backlog (5-6 games):** the reel shows them all without scrolling.
- **Refusal on pick** (deadline passed, game no longer eligible): a notice slip above the card.

## Colour roles
Holly = tint chip, days numeral, Picked stamp, picked dot, the gift icon. Tinsel = the string, the eyelet ring, the reel rule. Paper = the tag. Yellow = Pick this one, the current reel item, focus. No red, no snow, no Christmas emoji.

## Copy
Santa, pick, backlog, Edition, Cleared, "Pick this one", "Next game", "Shuffle", "Picked". Not "gift", "present" (the Assignment glossary avoids "gift"), not "giftee".

## Phone
The card becomes a stack: cover with its tag (tag below the cover, not overlapping), then the headline at 48px, chips, numerals, actions full width. The reel scrolls horizontally. Swiping the card left is Next game.

## Choices to confirm
- 6A's Confirm button moves out of the tag onto the card (Pick this one); the tag only shows the result.

## Direction contract
THESIS: dealing one game at a time and writing the choice on a gift tag; it refuses a table of the backlog.
OWN-WORLD: key-art cover story with the paper name tag on a tinsel string, holly stamp, tinsel reel rule.
STORY: the Santa browses, picks with one tap, sees the tag filled in, and knows it stays secret and changeable.
FIRST VIEWPORT: the header with the deadline, then the whole deal card with tag and actions.
FORM: owner's mix of 6C and 6A (merged mock `challenges-final#santa-pick`). seed: none (unavailable)
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
