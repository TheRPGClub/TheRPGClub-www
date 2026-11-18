---
version: 1
slug: "codex-lists"
primary_target: "app/(protected)/codex/lore/page.tsx"
related_targets: ["app/(protected)/codex/fun-facts/page.tsx","components/codex/lore/lore-shelf.tsx","components/codex/lore/lore-spine.tsx","components/codex/lore/lore-slide-out.tsx","components/codex/fun-facts/fun-fact-wall.tsx","components/codex/fun-facts/index-card.tsx","components/issue/member-shelf-spine.tsx"]
---

# Surface: Club Lore shelf (/codex/lore) and Fun Facts wall (/codex/fun-facts)

Mode: Browse, the fun register. Monthly Issue world plus the part inks (`codex-inks.md`).
Tickets: the Fun Facts wall is www#124; the Lore shelf is www#125. Members only. Not found for non-staff in Preview and for everyone when Off.
Mock: `.impeccable/mocks/decision/club-codex/index.html#o4d` (option 4D, "The shelf and the wall"), both pages.

## Owner's pick (2026-11-18)
> "website - 4d"

## Job
A Member browses the club's stories as books on a shelf, pulls one out to see its pictures and opening, and opens it; and reads the Fun Facts as a wall of index cards, jumping to the story behind a linked one. Regulars add to both.

## Club Lore: the shelf (desktop, 1280 mock)
1. **Running head** "Codex / Club Lore". **Header:** "Club Lore" in Anton 64px on the 2px rule, "7 Lore Entries" in label type, the yellow **Add a Lore Entry** at the right (Regulars and above). Preview chip for staff in Preview.
2. **The case** (28px below): a 2-column grid (fluid, 440px; 36px gap; top-aligned).
3. **The shelf** (left): a `card` panel (3.2px radius, 28px by 26px padding, no bottom padding). Spines stand in a row (6px apart, bottom-aligned, row height 540px), newest on the left, then a 16px `border-strong` board across the full panel width with a 0 8px 16px shadow, and under it the hint "Newest on the left. A spine's width is its story's length." in label type, `faint-foreground`.
   - **Spine:** 2.4px top radius, 14px top and 12px bottom padding, 1px paper inset at 12% and a soft right-edge shade. Top to bottom: the title set sideways (vertical, reading bottom to top) in Anton 25px caps, max 360px, clipped; a 1px rule in the spine's type colour at 80% width; the date at its precision in Barlow Condensed 700 11px caps ("12 Aug 2020", "March 2019", "2021", "Undated"); the author's initials in Barlow Condensed 800 12px at 75%.
   - **Width by story length:** 74px for the shortest story up to 112px at 4000 characters of `body`, linear between.
   - **Height:** slightly uneven and stable, 440 to 520px from the entry id, as the profile shelves do (`member-shelf-spine.tsx`).
   - **Colour:** three bindings, chosen stably from the entry id: jade (jade fill, ink type), ink (`muted` fill, `foreground` type, a 6px jade cap inset at the top), paper (`foreground` fill, ink type).
   - **Yours:** the viewer's own Lore Entries carry a yellow "Yours" tag (Barlow Condensed 800 11px caps, ink type) straddling the top, rotated -4deg.
   - **Picked spine:** lifts 22px with a 0 14px 28px shadow and a 2px yellow inset ring (200ms, motion-safe). The newest is picked on load.
4. **The slide-out** (right, 440px): a `card` panel (22px by 24px padding, 0 12px 30px shadow) with a 6px jade tab across its top edge:
   - the date in date label type, then the title in Anton 40px (0.92) caps;
   - the story's opening (the first paragraph of `body`, up to about 240 characters, ending on a whole sentence), `dim-foreground`, 1.55 line height, mentions linked;
   - up to 3 square thumbnails from `images` (upload order) in a 3-column grid, 8px gap;
   - a meta row: 24px avatar and "by **Mog Whisperer**", then a link icon and "See also 2" in `faint-foreground`;
   - **Read it** (outline button with an arrow) to the Lore Entry page; for the author or a Moderator, quiet Edit and Delete after it.
5. Picking a spine (click, Enter, or arrow keys along the shelf, which is a listbox) swaps the slide-out; the URL keeps `?entry=<id>` so a pick survives reload.
6. **Pagination:** a shelf holds one page (up to 12 spines at desktop width); "1 to 12 of 31" and page numbers under the case, as the wall does.

## Fun Facts: the wall (desktop)
1. **Running head** "Codex / Fun Facts". **Header:** "Fun Facts" in Anton 64px, the count "42" in label type; at the right **Shuffle the wall** (outline, shuffle icon) and the yellow **Add a Fun Fact** (Regulars and above), which focuses the inline add at the top of the wall (`codex-forms.md`).
2. **The inline add** (5D) sits between the header and the wall for Regulars and above.
3. **The wall** (38px below): a 4-column grid, 34px row gap, 26px column gap, 6px side padding. Eight cards a page, newest first.
4. **Index card:** Fun Facts pink fill (every third card pale pink), ink type, 2px radius, 20px by 18px padding (14px foot), min height 230px, ruled like an index card (a 1px ink line at 13% every 28px, starting 46px down), a 0 10px 22px shadow, rotated by a stable tilt from the id within plus or minus 2.2deg. A paper tape strip (84px by 22px, paper at 72%) across the top centre, counter-rotated.
   - **Head:** "No. 42" in Anton 24px caps at the left and the date added in Barlow Condensed 700 12px caps at the right, over a 2px ink rule.
   - **Text:** Barlow 500 17px on the 28px ruling, mentions as linked current names in ink with a 55% ink underline.
   - **Foot** (pushed to the bottom; Barlow Condensed 700 13px caps): "by Grindlord"; under it **Read the story** (ink chip, paper type, book icon) when linked to a Lore Entry; for the author or a Moderator, underlined **Edit** and **Delete** text buttons.
   - The mock sets the credit after a dash; use "by" to match the other Codex surfaces.
5. **Shuffle the wall** re-deals the tilts and the order of the current page only (client-side, motion-safe); it never touches the Daily Fun Fact queue.
6. **Pagination:** "1 to 8 of 42" in label type, `faint-foreground`, and page numbers (the current one filled paper) with a next arrow; `?page=` in the URL.

## Roles
- **Member (plain):** reads; no Add, no Edit or Delete.
- **Regular:** Add on both pages; Edit and Delete on their own (Yours tag on their spines).
- **Moderator and above:** Edit and Delete on anyone's, from `viewer` flags.
- **Visitor:** can't reach either page.
- **Staff in Preview:** the Preview chip beside each title.

## States
- **No Lore Entries:** the shelf shows its empty board and the dashed empty slide-out "No Lore Entries yet. Tell the first story." with Add for those allowed.
- **No Fun Facts:** the dashed empty panel "No Fun Facts yet." under the inline add.
- **A Lore Entry without images:** the slide-out leaves out the thumbnail row.
- **Undated:** the spine reads "Undated"; the slide-out shows no date.
- **Author left the club:** credited under their last known name, unlinked. The mock's ", left the club" note needs a flag the API doesn't send; leave it out until it does (API follow-up).
- **Fun Fact numbering:** "No. N" counts from the oldest (the list total minus the card's place, newest first), so numbers shift after a delete. Choice to confirm; if unwanted, drop the number and keep the date.

## Copy
Club Lore, Lore Entry, Fun Fact, Add a Lore Entry, Add a Fun Fact, Read it, Read the story, Shuffle the wall, Yours, Undated, See also. Never "book", "card", "note" as names for entries.

## Phone
- **Shelf:** the shelf scrolls horizontally inside its panel (spines at 70% scale, heights 300 to 360px); the slide-out drops under the shelf at full width. Picking a spine scrolls the slide-out into view.
- **Wall:** one column of cards, tilts halved, 28px apart; the header's buttons go under the title, Add full width.
- 16px gutters, no horizontal page scroll (the shelf's own scroll is inside its panel).

## Direction contract
THESIS: Club Lore is a bookcase of stories and Fun Facts are index cards taped to a wall; it refuses plain rows and uniform card grids.
OWN-WORLD: sideways Anton titles on jade, ink and paper spines sized by story length, the lifted yellow-ringed pick, the jade-tabbed slide-out, ruled pink index cards with tape at stable tilts.
STORY: the member scans the shelf, pulls out a story, reads its opening and opens it; on the wall they read Fun Facts and follow Read the story.
FIRST VIEWPORT: header and the full shelf with the newest story slid out; on Fun Facts, the inline add and the first row of cards.
FORM: option 4D as drawn. seed: none (unavailable)
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
