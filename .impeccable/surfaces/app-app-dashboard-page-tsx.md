---
version: 1
slug: "app-app-dashboard-page-tsx"
primary_target: "app/(app)/dashboard/page.tsx"
related_targets: ["app/page.tsx","components/app-sidebar.tsx"]
---

# Surface: The RPG Club web app (all signed-in pages + landing)

Mode: Operate (app pages); the logged-out landing is Persuade inside the same world.
Scope: replacement visual world for every page, dashboard included, plus the app shell.
Audience/job: club members (dark rooms, evenings, desktop and phone) checking the round, voting, logging games, reading reviews; prospects on the landing.

## Direction contract

THESIS: Every GOTM round is an issue of the club's own 90s game magazine. GOTM is the cover story, NR-GOTM the feature, the archive is back issues. Refuses the default dark game-tracker, with its gradient-faded key-art cards, glow accents and gradient text.

OWN-WORLD: The ground is ink black (#0b0b0d). Masthead red #ff0000 is reserved for GOTM and the active state, violet #7a3cff for NR-GOTM, and highlighter yellow #ffd400 for calls to action, nominations and the starburst. Display type is Anton in caps, labels Barlow Condensed in tracked caps, body Barlow. Hard rectangles, chips with 2px radius, full-bleed key art with black legibility scrims. Starbursts appear only on winners.

STORY: A member lands, sees this month's issue (what the club is playing, who's in it), acts on the yellow nominations or voting panel, and digs into back issues, games and member pages, which all read as magazine departments.

FIRST VIEWPORT: Dashboard. Sidebar on the left; top bar with the current route as a breadcrumb trail (the @crumbs slot) and search. The GOTM cover takes about two thirds of the width: a monumental red round number, the title in Anton (second line yellow), chips, blurb, playing/cleared/reviews counts, View game in red plus outbound links. The starburst is top-right.
- 2 or 3 GOTM winners: the cover splits (a lead panel plus stacked panels).
- The right column holds the NR-GOTM feature card (1 winner) or a ranked list (2-3), with the yellow nominations or voting panel below it.
- 0 NR-GOTM: the right column is the full-height yellow panel.
- 0 GOTM: NR-GOTM is promoted to a violet cover.
- Back-issues strip below.

FORM: Monthly Issue (Impeccable's pick, original single-cover hierarchy, multi-winner rules from the combos round); seed key 9060494c. Signature move: the winner starburst plus the monumental round numeral. Motion: starburst stamps in once on load, art scales gently on hover.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Decisions
- Approved mock: .impeccable/mocks/decision/orig-multi.png and combos/orig-sheet.png. The user changed one thing: with 0 NR-GOTM, omit it entirely and let the yellow nominations panel take the column (no "no NR-GOTM" note), mirroring the 0-GOTM case.
- Mock HTML sources (reference): scratchpad mocks/model-pick, mocks/orig-combos.

## Screen decisions (user, 2026-10-29)
Option letters refer to the captures in .impeccable/mocks/screens/<screen>-<a|b|c|d>-{desktop,mobile}.png. Their HTML sources are under .impeccable/reference/screens-*/.

- **Game page:** A (cover-story hero; reviews and a who's-playing/details rail).
- **Game reviews list:** a mix.
  - Header/banner from A.
  - List from B, with the image on the left.
  - Opinions/pull quotes from C.
  - Clicking a review, or a quote, switches to D's inline reader: the selected review opens and all reviews stay listed on the left.
  - A "Back to reviews" control returns to the list view.
- **Single review:** a mix.
  - The big banner from A.
  - The review body as in B.
  - C's score panel moved to the end of the page as the verdict.
  - D's "More from the club" at the end.
- **Member profile:**
  - A's banner.
  - Now Playing laid out face-on as open books (A), and Reviews as in A.
  - Completed, Favorites, Backlog, Collection etc. as D's bookcase of closed spines.
  - Favorites show a podium for ranks 1–3; ranks 4+ are all at the same level.
- **Completed games list (member list):** C + D. D's spotlight/filmstrip plus a year dial/scrubber (C) to choose the year. On mobile there's no horizontal sliding: a vertical column/grid instead.
- **Compare:** C (overlap diagram plus a sheet of shared covers).
- **Backlog picker:** D's sentence of dropdowns on top, then C's deal-three, pick-one cards.
- **Games index:** A + C.
  - C's wide key-art lead cards ("expanded cards") and the "Newest in GameDB" shelf.
  - A's search, filter and full cover grid with pagination.
  - No GOTM-winners/NR-winners shelves; that's the GOTM history page's job.
- **Members:** C (contributor wall, Everyone/Staff/Regulars switch).
- **GOTM history:** never call it "Back issues".
  - Mix A + B: kind=both uses A's ledger (round rows with GOTM and NR art).
  - kind=gotm or kind=nr_gotm uses B's dedicated per-round cover art.
  - B's sidebar year picker in all modes.
- **Voting/nominations:** B (yellow ballot strip with the days-left clock and your-nomination slots, over a tabbed cover board).
- **Landing (logged out):**
  - A, but the slogan must convey two games a month (GOTM + NR-GOTM), not "One game a month".
  - Add C's footer of every GOTM cover moving (a marquee) at the foot.
- **Edit profile:** B's sidebar section toggling, with C's expanded image shelves (covers with remove/add tiles) in the selected section.
- **Imports:** B. **Import review:** C.
- Top bar (user, 2026-10-29): the running head shows the current route's trail (e.g. GAMES / <TITLE> / REVIEWS), not "Issue N / Month". It replaces every in-page breadcrumb. Phones keep the page and its parent.
