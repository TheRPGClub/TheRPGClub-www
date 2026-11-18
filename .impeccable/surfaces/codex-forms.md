---
version: 1
slug: "codex-forms"
primary_target: "app/(protected)/codex/lore/new/page.tsx"
related_targets: ["app/(protected)/codex/lore/[id]/edit/page.tsx","app/(protected)/codex/history/new/page.tsx","app/(protected)/codex/history/[id]/edit/page.tsx","components/codex/desk/writing-desk.tsx","components/codex/desk/manuscript-sheet.tsx","components/codex/desk/date-card.tsx","components/codex/desk/images-card.tsx","components/codex/desk/kind-card.tsx","components/codex/see-also/see-also-card.tsx","components/codex/fun-facts/fun-fact-quick-add.tsx","components/rich-text/rich-text-editor.tsx"]
---

# Surface: Add and edit (the writing desk, the Fun Fact inline add, See also)

Mode: Operate. Monthly Issue world plus the part and Kind inks (`codex-inks.md`).
Tickets: the Lore desk is www#125; the History Event desk is www#126; the Fun Fact inline add is www#124; the See also card (and the Fun Fact's See also popover) is www#127. Members only (the History desk for Admins and Superadmins only).
Mock: `.impeccable/mocks/decision/club-codex/index.html#o5d` (option 5D, "The writing desk"), the Lore desk above and "Fun Facts skip the desk; History Events swap its cards" below it.

## Owner's pick (2026-11-18)
> "website - 5d"

## Job
A Regular writes or edits a Lore Entry like a manuscript on a desk, with the date, the photos and See also as cards in a drawer beside it, and places each photo into the story. An Admin does the same for a History Event with Kind. Anyone allowed adds a Fun Fact in one line at the top of the wall, without leaving it.

## The Lore desk (desktop, 1280 mock)
Routes: /codex/lore/new and /codex/lore/[id]/edit. Crumbs "Codex / Club Lore / <title> / Edit" (new: "Codex / Club Lore / New").
1. **Top bar** (18px above the desk): ghost **Back to the Lore Entry** (small, left arrow); "Changes go live when you save" in label type, `faint-foreground`; at the right **Delete** (signal-orange outline, edit only, from `viewer.can_delete`), **Cancel**, and the yellow **Save changes** (new: **Publish**).
2. **The desk:** a 2-column grid (fluid, 360px; 34px gap; top-aligned).
3. **Manuscript sheet** (left): a `card` sheet, 4px radius, a 1px `border` inset and a 0 18px 40px shadow, 26px foot padding.
   - **Toolbar,** sticky at the top of the sheet: a `muted` strip (8px by 48px padding) with the shared editor's 30px buttons in groups split by 1px `border-strong` ticks: Bold, Italic, Strikethrough | Heading 1, 2, 3 | Bulleted list, Numbered list, Quote | Spoiler, Link, **Mention a member** (@). An active button takes a `muted` fill, yellow icon and a yellow inset at 50%.
   - **Counter** at the sheet's top right: the plain-text count in Anton 24px ("812") and "of 4000" in label caps, `faint-foreground`. Past 4000 the number turns signal orange and Save is disabled with the reason beside the button.
   - **Title:** written in place in Anton 66px (0.92) caps, 34px from the top, 56px side margins, on a 2px `foreground` rule. The caret is the 3px yellow bar.
   - **Byline:** 22px avatar and "by **Mog Whisperer**" (14.5px `dim-foreground`), the author, not the editor.
   - **Story:** the shared rich-text editor (www#123) at 17.5px / 1.65, 56px side padding, max 70ch: headings in Barlow italic 600 19px while writing, the quote with a 2px `border-strong` left bar in `dim-foreground` italic, spoilers on `muted` with a 1px dashed `border-strong` outline, mentions as chips (16px avatar, current name, paper at 10% fill, 2px radius).
   - **Mention picker:** typing @ underlines the query in yellow and opens a 310px `muted` popover (3.2px radius, 0 14px 34px shadow): "Mention a member" header in label caps, rows with a 26px avatar, the name with the typed letters in `foreground` bold, and the role at the right in label caps ("Admin", "Regular"); the active row has a `card` fill and a yellow inset; footer "Arrow keys to move · Enter to mention · shows their current name". It inserts a mention node with the Discord id.
4. **The drawer** (right, 22px between cards, 6px top padding): cards on `muted` (3.2px radius, 16px by 18px padding, 0 10px 24px shadow), each resting at a slight tilt (-1deg, 0.8deg, -0.6deg). Card headings in Anton 24px caps with a small label-caps note at the right.
   - **Date** ("Optional"): the date set big in Anton 46px caps ("12 Aug 2020"), three parts each editable in place (day, month, year). Under it a full-width segmented control **No date | Year | Month | Day**. Choosing a coarser precision greys the parts it drops (`faint-foreground` at 45%, a 4px strike-through) rather than hiding them, so switching back restores them. "No date" greys all three. Help under it: "Pick Month or Year when nobody remembers the day."
   - **Images** ("3 of 4"): a 2-column grid of 4:3 pinned photos (12px by 14px gaps), tilted -2deg, 1.5deg, 1deg, each with a 0 6px 14px shadow, a number tag at the top left (Anton 15px on ink at 85%), and a remove × at the top right (24px). Under each photo, where it sits in the story: "After paragraph 3" in label caps, or "Not in the story" in signal orange. The last slot is the dashed **Add an image** ("1 of 4 left"); at 4 it is gone.
   - **See also** (below).
5. **Placing photos** (inline images, picks.md): a photo is placed by dragging it from the drawer onto the sheet (a yellow insertion line shows between paragraphs), or with its **Place at the caret** action (keyboard and phone), which puts the image node after the paragraph holding the caret. A placed image shows in the sheet as a small taped thumbnail block between paragraphs with an optional caption field ("Add a caption"); removing that block returns the photo to "Not in the story". A photo left out of the story when saving is not kept: Save asks first ("1 photo isn't in the story and will be removed.").
6. **Saving** (a www server action, picks.md): a new Lore Entry is created first, then its pending images are uploaded, then `rich_body` is updated with the returned ids and urls, then the See also links are saved. On edit, new images upload, `rich_body` is saved with their ids and urls, and images no longer in the story are deleted, so `images` always matches the story. While saving, each pending photo shows the upload overlay (ink at 84%: "Uploading", the percent in Anton 26px, a 4px paper bar) and Save keeps its width with a spinner. The action sanitizes `rich_body`, enforces 4000 plain-text characters and sends `body` (Discord markdown, image nodes dropped) with it.

## The History Event desk (www#126)
Routes: /codex/history/new and /codex/history/[id]/edit; Admins and Superadmins only. The same desk, with these swaps (5D, lower right):
- The sheet holds the title and an optional **description** in the shared editor (same mention plugin and Discord conversion); the counter still shows 4000.
- The drawer's first card is **Kind** ("History Event"): five 64px tiles in a 5-column grid (6px gap), each outlined 1.5px in its Kind ink with its name in Barlow Condensed 800 12px caps in that ink, bottom-left. The chosen tile fills in its ink with ink type, lifts 4px, tilts -2deg and takes a 0 6px 14px shadow. It is a radio group.
- **Date** is "Required" and its control loses "No date": **Year | Month | Day**.
- **Images** stay a plain gallery: the same pinned photos without "Place at the caret" or the story line (History Events keep `images` as their gallery, and the timeline pins them per chapter).
- **See also** as on the Lore desk.
- Delete's confirmation: "Delete this History Event? Its images and See also links go too."

## The Fun Fact inline add (www#124)
Fun Facts skip the desk. On /codex/fun-facts, between the header and the wall, for Regulars and above:
- A `card` panel (3.2px radius, 16px padding, 14px foot) with a 3px Fun Facts pink top rule; "Add a Fun Fact" in label type, pink.
- The field on `background` with a 1px `border-strong` outline (yellow outline and a 3px yellow glow at 16% when focused): plain text, 16px / 1.55, min 76px. The same @ mention picker (footer "Enter to mention · nobody is pinged").
- Its foot, over a 1px `border` rule: "Plain text, no images." at the left and the counter at the right ("74 / 300", the count in `foreground`); past 300 it turns signal orange and Add is disabled.
- Actions row (12px above): ghost **See also** (link icon, opens the See also picker as a popover), then "Goes out next as the Daily Fun Fact" in 13px `faint-foreground`, then the yellow **Add** (small).
- On Add the new Fun Fact appears first on the wall with a pink outlined tag "Next Daily Fun Fact" (Barlow Condensed 700 11.5px caps, 1.5px pink inset); the tag shows only in the session that added it, since the API doesn't say which Fun Fact is next.
- **Edit** on a card turns that card into the same field in place (pink panel kept, text, counter, See also, **Save** and **Cancel**). **Delete** asks for confirmation.

## The See also card (www#127)
- Heading "See also" with "2 linked" at the right.
- Linked entries as full-width chips (32px, `card` fill, 1px `border-strong` inset, 2.4px radius): the part in its part ink (Barlow Condensed 700 11.5px caps: "History Event", "Lore Entry", "Fun Fact"), the title or the Fun Fact's opening words (ellipsis), and a 24px remove ×.
- A search field (36px, search icon; yellow outline when focused) over `GET /codex/entries?q=`, leaving out the entry being edited. Results drop under it in a `muted` panel (3.2px radius, 0 12px 30px shadow): each row the part label in its ink over the title; the first row is active (yellow inset, `card` fill). Enter links it; Escape closes.
- Saved with the entry through `PUT /codex/entries/:id/links` (after create for a new entry). Removing a link from either side removes it from both.

## Roles
- **Member (plain):** no desk, no inline add.
- **Regular:** the Lore desk and the inline add for their own; Edit and Delete their own.
- **Moderator and above:** edit and delete anyone's Lore Entries and Fun Facts; the byline still names the author.
- **Admin, Superadmin:** the History Event desk.
- **Staff in Preview:** the Preview chip at the right of the top bar's label.

## States
- **Validation:** an empty title, an empty story, a History Event with no Kind or date, or a count over the limit: the field takes a signal-orange underline or outline and the reason, and Save says what is missing.
- **Upload problems:** a refused or failed image keeps its slot with a signal-orange outline, the reason (the API's message: JPEG, PNG, WebP or GIF up to 10 MB, at most 4 per entry), and Retry or Remove; nothing else on the desk is lost.
- **Leaving with changes:** Cancel and Back ask "Leave without saving?"
- **Fun Fact queue:** none of these forms touches the queue except by adding a Fun Fact, which the API puts next.

## Copy
Lore Entry, History Event, History Event Kind, Fun Fact, Daily Fun Fact, See also, Publish, Save changes, Add, Delete, Cancel, No date, Year, Month, Day, "Place at the caret", "Not in the story", Mention a member. Never "post", "submit", "tag", "type".

## Phone
- The desk stacks: the sheet full width (title 40px, 16px side padding, the toolbar scrolling sideways and sticky), then the drawer cards untilted at full width.
- The top bar's Cancel and Save stick to the bottom of the screen; Delete moves to the foot of the page.
- Photos are placed with **Place at the caret** only (no drag).
- The mention and See also pickers open as bottom sheets.
- The Fun Fact inline add keeps its place above the wall at full width; its action row wraps with Add full width.
- 16px gutters, no horizontal page scroll.

## Direction contract
THESIS: writing club history is sitting at a desk: a manuscript sheet with the story, a drawer of tilted cards for date, photos and links; Fun Facts are jotted on the wall itself. It refuses a long stacked form.
OWN-WORLD: the Anton title written in place, the big Anton date that greys out dropped parts, pinned numbered photos, Kind tiles that lift when chosen, the pink-ruled inline add.
STORY: the author writes, drops each screenshot into the story where it happened, dates it as well as anyone remembers, links what it relates to, and saves.
FIRST VIEWPORT: top bar with Save, the sheet's toolbar, title and opening lines, and the Date and Images cards.
FORM: option 5D as drawn, plus the photo placement picks.md asks for. seed: none (unavailable)
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
