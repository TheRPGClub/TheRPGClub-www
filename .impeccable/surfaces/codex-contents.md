---
version: 1
slug: "codex-contents"
primary_target: "app/(protected)/codex/page.tsx"
related_targets: ["components/codex/contents/daily-fun-fact-panel.tsx","components/codex/contents/codex-door.tsx","components/codex/contents/lately-list.tsx","components/shell/nav-items.ts"]
---

# Surface: Club Codex contents page (/codex)

Mode: Operate, magazine register. Monthly Issue world (DESIGN.md) plus the Club Codex inks (`codex-inks.md`).
Ticket: www#124 (the page and the "Codex" sidebar item). Members only, gated by the `club_codex` Feature and Feature Preferences like the Release Calendar.
Mock: `.impeccable/mocks/decision/club-codex/index.html#o1c` (option 1C, "Contents page with three doors").

## Owner's pick (2026-11-18)
> "website - 1c"

## Job
A Member lands on the Club Codex, reads today's Daily Fun Fact, sees how big each part is and what is newest in it, and walks through one of three doors. /codex is a contents page; each part has its own page: /codex/history, /codex/lore, /codex/fun-facts.

## Layout (desktop, 1280 mock)
1. **Running head:** "Codex" in the crumb bar (56px), search at the right as on every app page.
2. **Header:** "Club Codex" in Anton at page scale (64px, 0.9 line height, caps) on the 2px `foreground` rule; the total in label type, `faint-foreground` ("60 entries", the three parts summed). Staff in Preview see the Preview chip beside the title.
3. **Intro:** one paragraph in `dim-foreground`, max 70ch, 14px above and 22px below: "The club's story about itself, in three parts. Club History is the record; Club Lore is the stories we still tell; Fun Facts are the small things."
4. **Daily Fun Fact panel:** a `card` panel (3.2px radius, 24px by 28px padding) with a 4px Fun Facts pink top rule, laid out as a 3-column grid (260px, fluid, auto; 32px gap; centred):
   - left: "Daily Fun Fact" in Anton 40px, Fun Facts pink, and under it the date and time in the date label style ("Wed 18 Nov · 15:00");
   - middle: the Fun Fact in Barlow 500 at 26px / 1.32, `foreground`, max 40ch, with mentions as linked current names; under it the author's 22px avatar and "by **Mog Whisperer**" at 14px `faint-foreground`;
   - right, stacked: **Read the story** (outline button, book icon) when the Fun Fact is linked to a Lore Entry, and **Another one** (ghost button, dice icon).
5. **Three doors:** a 3-column grid, 20px gap, 28px below the panel. Each door is a solid part-ink panel (3.2px radius, 24px padding, min height 440px) with `background` ink type, in this order: Club History (parchment), Club Lore (jade), Fun Facts (pink). Top to bottom:
   - the part's count in Anton 120px (line height 0.8);
   - the part's name in Anton 44px caps;
   - one line about the part in 15.5px Barlow at ink 82%, max 34ch (copy as in the mock);
   - at the foot, over a 2px ink rule: a small label in Barlow Condensed 800 12.5px caps at ink 70% ("Latest History Event · 18 November 2026", "Newest Lore Entry · by Mog Whisperer", "Newest Fun Fact · by Grindlord"), the newest item's title (or the Fun Fact's text) in Barlow 600 17px, then the buttons: **Open Club History** (solid ink button with paper type) and, where allowed, **Add** (1.5px ink outline, plus icon).
   - The Club History door alone carries a "Public" tag at its top right (eye icon, 1.5px ink outline, Barlow Condensed 800 12.5px caps), since Visitors can read it.
6. **"Lately in the Codex":** a section heading (Anton 30px on the 2px rule, 36px above), then a two-column list (40px column gap) of the six newest entries across all three parts. Each line: a 10px square in its part ink, the title in Barlow 600 (one line, ellipsis, max 330px), a 2px dotted `border-strong` leader filling the gap, then "Fun Fact · Grindlord · today" in 14px `faint-foreground`. History Events show no author ("History Event · 14 Nov").

## Roles
- **Member (plain):** everything, no Add buttons.
- **Regular, Moderator:** Add on the Club Lore and Fun Facts doors (Add Fun Fact opens the inline add at the top of /codex/fun-facts, see `codex-forms.md`).
- **Admin, Superadmin:** Add on all three doors (Add on Club History opens the History Event desk).
- **Visitor:** never reaches /codex (members only, redirect to sign-in like other member pages). Visitors reach Club History through /codex/history and the front page.
- **Staff in Preview:** the Preview chip beside "Club Codex" and on each part page. Members don't see the page or the sidebar item in Preview.

## States
- **No Daily Fun Fact yet** (none posted, or no Fun Facts): the panel keeps its pink rule and heading and reads "The first Daily Fun Fact goes out at 15:00 New York time." with Add for those allowed; no Another one.
- **A part with nothing in it:** the door keeps its ink, shows "0", and the foot reads "No History Events yet." (or "No Lore Entries yet.", "No Fun Facts yet.") with Add where allowed.
- **Nothing anywhere:** the Lately list is the dashed empty panel "Nothing in the Codex yet."
- **Loading or a failed read:** each door and the panel fall back on their own; a failed list read shows the existing `searchProblem` line, never a broken page.
- **Hover and focus:** a door is one link to its part page (the buttons inside stay their own targets); the yellow focus ring on the door, lines in the Lately list underline on hover.

## Data
- Counts: each list's total. Newest item: the first row of each list (`GET /codex/history_events` takes the latest by date, not the newest written; label it "Latest History Event" with its date at precision).
- Lately: the first page of each of the three lists merged by `created_at` (newest six), which gives the author and date each line needs. The entry search (`GET /codex/entries`) has neither, so don't use it here.
- **Daily Fun Fact (API gap):** the API has no read for today's Daily Fun Fact, and `POST /codex/fun_facts/draw` marks a Fun Fact shown, so the page must not call it. Until a read exists (record it in `notes/decisions.md` as an API follow-up), show the newest Fun Fact under the heading "Fun Fact" with no time, and make **Another one** pick from the loaded page without touching the queue.

## Copy
Club Codex, Club History, History Event, Club Lore, Lore Entry, Fun Fact, Daily Fun Fact, Read the story, Another one, Add, Public. Never "wiki", "archive", "post", "lore" alone for the whole Feature.

## Phone
- Header at 40px; the intro full width.
- The Daily Fun Fact panel stacks: heading and date, the Fun Fact at 20px, then the two buttons side by side, full width.
- Doors stack in one column, min height drops to auto, count at 88px, name at 36px; the foot stays at the bottom of each door.
- Lately becomes one column; the leader and meta stay on the line, the title ellipsises first.
- 16px gutters, no horizontal page scroll.

## Direction contract
THESIS: a magazine department's contents page: three monumental part-ink doors under today's Fun Fact; it refuses tabs and a single long scroll of everything.
OWN-WORLD: Anton numerals at 120px, solid part-ink panels with ink type, the pink-ruled Daily Fun Fact, dot-leader contents lines.
STORY: the member reads today's Fun Fact, sees the size and newest of each part, and opens one.
FIRST VIEWPORT: header, intro, the Daily Fun Fact panel and the tops of the three doors with their counts.
FORM: option 1C as drawn. seed: none (unavailable)
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
