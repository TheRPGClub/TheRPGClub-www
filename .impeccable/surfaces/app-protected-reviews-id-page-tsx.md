---
version: 1
slug: "app-protected-reviews-id-page-tsx"
primary_target: "app/(protected)/reviews/[id]/page.tsx"
related_targets: ["components/member/review-form.tsx","components/member/review-desk/review-desk.tsx","components/member/review-desk/quick-sheet.tsx","components/member/rating-input.tsx"]
---

# Surface: The review desk (writing a review)

Mode: Operate. Monthly Issue world; the review desk is a proofing sheet, never named as such on the page.
Mock: `.impeccable/mocks/decision/review-editor/index.html` (round 5: B "galley" with icons, notes on the side, key-art banner).

## Owner's picks (2026-11-20)
- Round 2 pick B (the galley proof), with the usual toolbar icons instead of proofreader marks, the yellow pencil circle kept on the active tool.
- "remove what says galley proof on top, thats just the styling i dont want that mentioned on the website."
- "I like the first with the things on the side" (Overall and Scorecard notes in the margin, sticky; the sheet stretches beside a short review).
- "on the review writting, I'd like the game image as a banner"; the track pill centred on the game's name; NR-GOTM in violet, any other game in paper with a neutral pill.
- While editing, the page's own banner steps aside so the art shows once.

## Owner's picks (2026-11-23): Drafts and Revisions
Mocks: `.impeccable/mocks/decision/reviews/page.html` (A), `editor.html` (A + C's foot strip), `drafts.html` (C).
- The page moves to `/reviews/:id`; running head Games › Game › Reviews › Review.
- Review page, option A "The score line": one reading column, newest take first; each take hangs off a dated stop on a spine in the left margin with its score box and the change ("−5 from 85") and its own scorecard in the right margin; the banner shows the current score with the score row under it (72 +13 85 −5 80); Edit and Delete revision on each stop, a yellow Revisit stop waiting at the top of the spine, Delete review at the foot; a Draft Revision (author only) is a dashed yellow stop in the Revisit stop's place; the first take reads in full at the foot. "Edited <date>" by the byline is public.
- Editor, option A "Pencilled in" with option C's foot strip: anything unpublished is written in the desk's yellow pencil ("Draft · only you can see it" above the sheet, dashed crop marks); the sticky strip along the desk's foot carries autosave (hollow / half / solid square, dashed offline), the checklist Title · Story · Overall score (the missing score the one yellow item), Discard draft and Publish. Publish greys with no score and the Overall note shows an empty dashed ring. A Revision tapes a faded "Your take · <date> · 72" note above Overall. Editing a Published Review: explicit Save, no pencil, the ruler dimmed and locked after 7 days with the reason and "Revisit instead". The draft sheet carries a small turned-down yellow corner, tying it to the drafts pile (confirmed 2026-11-23).

## Job
A member writes, drafts, revises or edits their Review of a game, and every Member reads it with its Revisions: title, overall score, an optional scorecard, and the story, seen exactly as it will be published.

## Direction contract
THESIS: the review is a sheet being proofed on a board, with the scores as notes taped in its margin; once published, its takes hang in date order off one score line. It refuses the boxed form field and the version-history table.
OWN-WORLD: the key-art banner with the title written in Anton over it, the printer's-ruler sliders, the yellow pencil ring on the score and on a pressed tool, the taped tilted notes, crop marks; yellow pencil for anything unpublished; the dated spine with score boxes for Revisions.
FIRST VIEWPORT: reading: the banner with the current score and the score row, then the newest take at its stop. Writing: the banner with the title, the toolbar, the opening of the story, the Overall note, the foot strip.
