---
version: 1
slug: "codex-history"
primary_target: "app/(public)/codex/history/page.tsx"
related_targets: ["components/codex/history/year-chapter.tsx","components/codex/history/history-event.tsx","components/codex/history/kind-filter.tsx","components/landing/front-page.tsx","components/codex/history/est-band.tsx"]
---

# Surface: Club History timeline (/codex/history) and the front-page "2016" piece

Mode: Read, anniversary-issue register. Monthly Issue world plus the History Event Kind inks (`codex-inks.md`).
Ticket: www#126. Public: Visitors read it while the Feature is Live; Members read it through the app shell (the route must serve both shells, as the front page does; www#126 decides where it lives). Not found for non-staff in Preview and for everyone when Off.
Mock: `.impeccable/mocks/decision/club-codex/index.html#o2b` (option 2B, "Year chapters"), both the page and its "Front page" strip.

## Owner's pick (2026-11-18)
> "website - 2b"

## Job
Anyone, a Visitor included, follows how the club got here, year by year, filters to one History Event Kind (every staff change, say), and sees each History Event dated only as exactly as the club remembers it.

## Layout (desktop, 1280 mock)
1. **Shell:** Visitors get the public top bar (64px: wordmark, Home / History nav with the active red underline, **Sign in with Discord** and the yellow **Join the Discord**). Members get the app shell with crumbs "Codex / Club History".
2. **Header:** "Club History" in Anton 64px on the 2px `foreground` rule, the count in label type ("11 History Events"); at the right, for Admins and Superadmins only, the yellow **Add a History Event**. Preview chip for staff in Preview.
3. **Intro:** `dim-foreground`, max 70ch: "How the club got here, from a subreddit in 2016 to the server today. The staff keep this record, and every date is as exact as the club remembers it."
4. **Tools row** (22px above, space-between): at the left a filter icon then the Kind chips (26px high, 13px label type): "All 11" (paper fill when selected), then one outlined chip per History Event Kind in its ink with its count ("Founding 1", "Staff 2", "Platform 2", "Rules 2", "Milestone 4"); a selected Kind fills in its ink with ink type. At the right a segmented control "Oldest first | Newest first" (oldest first by default). Both are URL params (`kind`, `order`).
5. **The book** (26px below): one **chapter** per year that has History Events, as a 3-column grid (250px, fluid, 250px; 32px gap) on a 2px `foreground` top rule, 18px above and 26px below:
   - **Year column:** the year in Anton 120px (line height 0.78), and under it "2 History Events" in label type, `faint-foreground`.
   - **History Events column** (20px between events), each:
     - a line of the 10px round Kind dot, the date, and the Kind name in Kind-ink label type (12.5px, 0.08em, caps);
     - the date inside a chapter drops the year: "14 March" or "June" in label type, 14px, `foreground`; a year-only History Event reads "Some time in 2016" in Barlow italic 500 15px, `dim-foreground`, sentence case, so it reads quieter;
     - the title in Anton 34px (0.95), caps, max 30ch, balanced;
     - the description in `dim-foreground`, max 60ch, mentions as linked current names;
     - **See also:** a "See also" label (12.5px label caps, `faint-foreground`) then each link as 14.5px Barlow 600 `foreground` with a 2px red underline (offset 4px) and an arrow icon.
   - **Photos column:** the chapter's images pinned up, 18px apart: each on a paper mount (8px padding, 10px at the foot, 2px radius, 0 12px 30px shadow), tilted (first -2.2deg, second 1.6deg, then alternating), with a 12px paper pin at the top centre ringed in `muted`. A photo's caption sits on the image over the bottom scrim (600 12px Barlow).
   - A chapter whose History Events have no images drops the photos column (250px, fluid).
6. **Empty years:** between the first and last chapter, each year with nothing in it stays as a one-line gap on a 1px `border` top rule: the year in Anton 40px in `border-strong`, then "Nothing recorded" in label caps, `faint-foreground`. With a Kind filter on, gaps are years with nothing of that Kind.

## Front page piece (2B "Front page" strip)
On the public front page (`components/landing/front-page.tsx`), under the hero, a band: a 2px `foreground` top rule (18px above, 16px margin), then a 2-column grid (auto, fluid; 36px gap; bottom-aligned):
- left: "2016" in Anton 168px (0.78), in Founding rose;
- right: two sentences at 20px / 1.4, max 42ch: "The club started as a subreddit in 2016 and moved to Discord in March 2018. Ten years, one game a month, and a lot of stories." then the outline **Read the Club History** button with an arrow, linking to /codex/history.
- The numeral is the year of the earliest History Event (oldest first, first page). The sentences are fixed copy in the component; staff update them by hand.
- Shown only while the Feature is Live; for a signed-in Member it also respects their Feature Preference, as the winners do. Hidden when there are no History Events.

## Roles
- **Visitor:** reads everything public. See also shows only History Event links (the API leaves the rest out). No controls.
- **Member, Regular, Moderator:** read; no controls (Club History is written by Admins only). Their See also links include Lore Entries and Fun Facts.
- **Admin, Superadmin:** **Add a History Event** in the header; on hover or focus of a History Event, quiet **Edit** and **Delete** text buttons (13px label caps, `faint-foreground`, Delete in signal orange) at the right of its date line, from the entry's `viewer` flags. Edit opens the History Event desk (`codex-forms.md`); Delete asks for confirmation.

## States
- **No History Events:** the dashed empty panel "The Club History is still to be written." with Add for Admins; the front-page band is hidden.
- **Filtered to nothing:** "No Staff History Events." with a Clear filter link.
- **Many History Events:** chapters keep coming in date order; paginate by a fixed page of History Events (the API's pagination), never splitting a year across pages without repeating its numeral at the top of the next page.
- **Newest first:** chapters and the events inside each run newest first; gaps still show.
- **Images:** up to 4 per History Event; a chapter shows all of its events' images in event order.

## Copy
Club History, History Event, History Event Kind, Founding, Staff, Platform, Rules, Milestone, See also, "Some time in 2016", "Nothing recorded", Oldest first, Newest first. Never "timeline entry", "post", "tag", "type".

## Phone
- The chapter becomes one column: the year at 72px with its count beside it on one line, then the History Events, then the photos as a horizontal row of mounts (about 60% width each, scrolling inside the chapter, tilts halved).
- Kind chips scroll horizontally on their own row; the order control sits under them.
- Gaps keep one line with the year at 28px.
- Front-page band: the numeral at 104px above the sentences, the button full width.
- 16px gutters, no horizontal page scroll.

## Direction contract
THESIS: an anniversary issue where every year is a chapter under a giant numeral, with its photos pinned up beside it; it refuses a thin vertical spine of dots.
OWN-WORLD: Anton year numerals at 120px, Kind-ink dots and labels, pinned paper photo mounts, quiet italic year-only dates, one-line empty years.
STORY: the reader moves from 2016 to now chapter by chapter, filters by Kind, and follows See also into the stories behind an event.
FIRST VIEWPORT: header, intro, the Kind chips and the first chapter's numeral with its events and photo.
FORM: option 2B as drawn. seed: none (unavailable)
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
