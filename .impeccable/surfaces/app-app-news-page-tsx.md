---
version: 1
slug: "app-app-news-page-tsx"
primary_target: "app/(app)/news/page.tsx"
related_targets: ["components/news/news-card.tsx","components/news/news-category-rail.tsx"]
---

# Surface: /news (the News Hub)

Mode: Read (scanning news to decide what to open). Scope: whole new surface inside the established DESIGN.md world (www#76, www#77; spec api#355). Adds the news inks role (news surfaces only), approved by the owner.
Audience/job: signed-in members catching up on game news the club posted in Discord, narrowing it to the News Categories they follow, and opening the outside page.

## Direction contract

THESIS: The club's news as a contact sheet: every News Item is a frame of its art, marked in its News Category's ink, laid out by day. It refuses the default news-site list of headline rows and the dashboard card wall with stats on top.

OWN-WORLD: Ink ground, ink-2 cards at rounded.md, 16:9 art with a 4px foot bar and a corner tag in the category's news ink (magenta, lime, teal, blue, tan, dashed cool grey for Rumours, paper-mute for General), Anton day titles and page title on 2px paper rules, Barlow 600 headlines, Barlow italic dim comments, Barlow Condensed tracked caps for meta. Yellow only for focus, hover and the selected state.

STORY: The member sees today's news as pictures first, ticks the categories they want in the rail (or leaves the default, which already drops the ones they switched off), searches a title, and opens a story in a new tab.

FIRST VIEWPORT: NEWS headline with the count note on its rule; a 250px left rail (search, then the News Categories checklist with ink squares and counts, "hidden by you" on switched-off ones, "Show all categories"); the main column opens on the TODAY heading over a three-column card grid. Below lg the rail becomes a Filter disclosure above the grid.

FORM: Contact Sheet, dealt option 2 (zero-based) of my ordered list; seed:195fd021b8ff8d54. Signature interaction: choosing a category in the rail re-filters through the page address (server-rendered), the chosen ink square fills, and the grid keeps its day bands; art scales 1.03 on hover (motion-safe).

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
