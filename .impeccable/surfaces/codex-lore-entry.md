---
version: 1
slug: "codex-lore-entry"
primary_target: "app/(protected)/codex/lore/[id]/page.tsx"
related_targets: ["components/codex/lore/lore-spread.tsx","components/codex/lore/taped-photo.tsx","components/codex/lore/see-also-band.tsx","components/rich-text/static-kit.tsx"]
---

# Surface: Lore Entry page (/codex/lore/[id])

Mode: Read, magazine-feature register. Monthly Issue world plus Club Lore jade (`codex-inks.md`).
Ticket: www#125. Members only (Visitors can't reach Lore pages). Not found for non-staff in Preview and for everyone when Off.
Mock: `.impeccable/mocks/decision/club-codex/index.html#o3d` (option 3D, "Feature spread with pinned photos").

## Owner's pick (2026-11-18)
> "website - 3d"

## Job
A Member reads one Lore Entry as a magazine feature: the story with its screenshots placed where they belong, who told it and when it happened, then follows See also. They can share its link.

## Layout (desktop, 1280 mock)
The page sets `--codex-ink` to Club Lore jade. Page padding 34px top, 28px sides.
1. **Running head:** "Codex / Club Lore / The Night the Bot Wiped #general" (red slashes, the last crumb in `foreground`).
2. **Masthead:** a 2-column grid (fluid, auto; 28px gap; bottom-aligned) on a 2px `foreground` bottom rule, 18px below:
   - the title in Anton 96px (0.86), caps. A two-line title sets its second line in jade; break at the last word boundary that keeps the second line about a third of the title. A one-line title stays `foreground`.
   - the **date stamp** at the right: the date at its precision in Anton 26px caps, jade, in a 2px jade inset outline (2px radius, 10px by 14px padding), rotated -6deg, centred, line height 0.95. Day: "12 Aug" over "2020"; month: "Mar" over "2019"; year: "2021". Under it a 12px Barlow Condensed 800 caps line, "The night of" for a day, "That month" for a month, "That year" for a year. An undated Lore Entry has no stamp.
3. **Byline row** (12px above): the author's 28px avatar, "Told by **Mog Whisperer**" (15px, `dim-foreground`, name in `foreground` 600, linking to their profile), and at the right in `faint-foreground` "Club Lore · added 14 Nov 2026". Edit and Delete sit after it (see Roles).
4. **The spread** (40px above): a 3-column grid (250px, 600px, fluid; 44px column gap). The story runs in the middle column; images sit in the margins beside the paragraph they follow.
   - **Opening paragraph:** 22px / 1.55, `foreground`, with a jade Anton drop cap at 96px (0.8), floated, 12px right margin.
   - **Paragraphs:** 18px / 1.65, `dim-foreground`, 18px apart; bold in `foreground`; mentions as linked current names; spoilers hidden as in Reviews until tapped.
   - **Headings:** Anton 32px (0.9) caps, `foreground`, 34px above and 14px below, with a 44px by 3px jade bar under each.
   - **Quote** (a blockquote in the story) becomes the **pull quote**: it spans the middle and right columns, between 2px jade rules (22px above, 20px below), the text in Anton 54px (0.92) caps, jade, max 17ch; a line in the quote that starts with a dash, or the quote's last line, becomes the cite under it in label caps 14px, `dim-foreground`.
   - **End mark:** a 12px jade square after the story's last word.
5. **Taped photos** (inline images, below): each image is a photo on a paper mount (10px padding, no bottom padding; 2px radius; 0 14px 30px shadow), tilted, with a strip of parchment tape (92px by 24px, `codex-history` at 72%) across the top, counter-rotated at twice the tilt. Under the image, the caption in Barlow italic 500 14.5px, ink; its first words can be a label in Barlow Condensed 800 12px caps in `codex-lore-print` ("23:12 The command."). Widths 250 to 300px; tilts from the list 2.5deg, -3deg, 3.5deg, -2deg by image position.
6. **See also band:** 56px below the story, a full-bleed solid jade band (22px by 28px padding, 26px foot) with ink type, a 3-column grid (250px, fluid, fluid; 28px gap): "See also" in Anton 44px, then each link as a block on a 2px ink top rule:
   - a label row in Barlow Condensed 800 13px caps: a small chip (ink fill, jade type) with the History Event Kind or "Fun Fact" or "Lore Entry", then the part and date ("History Event · 9 August 2020");
   - a History Event or Lore Entry title in Anton 26px caps; a Fun Fact's text in Barlow 500 16.5px, with "Added by Mog Whisperer" under it in 13.5px 600 `codex-lore-deep`.
   - More than two links wrap onto further rows of the same grid.

## Inline images (decided in picks.md)
- Images are Plate image nodes in `rich_body`, each carrying the uploaded image's `id` and `url`; at most 4 per Lore Entry.
- A caption is optional text on the image node (written on the desk, see `codex-forms.md`), so it needs no API change; without one the mount keeps its paper foot and shows no text. The Discord `body` drops image nodes and their captions.
- The page reads placement from `rich_body`: an image block renders taped into the margin beside the paragraph before it. Alternate sides starting right (right, left, right, left); the photo's top lines up with that paragraph's top, offset 8 to 130px down as in the mock so photos never touch. An image placed before the first paragraph sits right of the opening paragraph.
- Two images after the same paragraph stack in that margin, 24px apart.
- The entry's `images` list stays the set of uploaded images by upload order; the shelf's slide-out and the bot read that list, not this page.
- An image in `images` that the story no longer places is not shown here (saving keeps the two in step, see `codex-forms.md`).
- Each photo opens full size in a lightbox on click or Enter, with its caption.

## Roles
- **Member:** reads; no controls.
- **Author (a Regular):** **Edit** (outline, pencil) and **Delete** (signal-orange outline, trash) at the right of the byline row, from `viewer.can_edit` and `viewer.can_delete`.
- **Moderator and above:** the same controls on anyone's Lore Entry.
- **Staff in Preview:** the Preview chip at the top right of the running head's row, above the masthead.
- Delete asks for confirmation ("Delete this Lore Entry? Its images and See also links go too.") and returns to /codex/lore.

## States
- **No images:** the margins stay empty and the story keeps its 600px column; the spread does not re-centre.
- **Undated:** no stamp; the title takes the full width.
- **Short story** (one paragraph): drop cap and end mark still show; no pull quote unless the story has a quote.
- **No See also:** the jade band is left out; the story ends on its end mark and 56px of space.
- **Author left the club:** the byline keeps their last known name with no profile link.
- **Not found** (deleted, or hidden by the Feature): the shared not-found page.

## Copy
Lore Entry, Club Lore, Told by, added, See also, History Event, Fun Fact, "Added by". Never "article", "post", "wiki page".

## Phone
- Title at 48px with its jade second line; the stamp sits under the title at 20px, left-aligned, still rotated.
- The spread is one column: the story at full width (opening 19px, body 17px), the drop cap at 64px.
- Each taped photo stacks under the paragraph it follows, centred, at most 86% width, tilt halved.
- The pull quote at 34px, still between jade rules.
- See also band: one column, "See also" at 32px, links stacked.
- 16px gutters, no horizontal page scroll.

## Direction contract
THESIS: a club story set as a magazine feature, its screenshots taped into the margins where they happened; it refuses a reading column with a gallery bolted on.
OWN-WORLD: 96px Anton headline with a jade second line, the rotated date stamp, jade drop cap and pull quote, tilted taped photos, the solid jade See also band.
STORY: the member reads the story with its evidence beside each beat, laughs at the pull quote, and follows See also to the History Event.
FIRST VIEWPORT: masthead with stamp, byline, the drop-cap opening and the first taped photo.
FORM: option 3D as drawn. seed: none (unavailable)
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
