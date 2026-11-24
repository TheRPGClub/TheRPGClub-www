---
version: 1
slug: "app-protected-achievements-page-tsx"
primary_target: "app/(protected)/achievements/page.tsx"
related_targets: ["app/(protected)/games/[id]/page.tsx","components/dashboard/panels/achievement-bodies.tsx"]
---

# Achievements remake (hub, game page section, dashboard panels)

**Scope:** the community hub at `/achievements`, the Achievements section at the end of the game page, and the two Latest Achievements Dashboard Panels (Club, Mine). Mode: Operate leaning Experience. The member binder and set pages keep the earlier album direction for now.

**Audience and job:** signed-in members. On the hub they see what the club unlocked, day by day; on a game page they see the game's Achievements per service and where they and the club stand; on the dashboard they glance at the latest club Unlocks and their own sets closest to done. Glossary terms only; the metaphor is never named in copy.

**Unresolved:** the feed caps a card at 8 Unlocks (api `Achievements::Feed::CARD_UNLOCKS`); the hub wants every icon, so the cap is raised in the API. Mine panel ticks are proportional (the sets read carries counts, not per-Achievement state).

## Direction contract

THESIS: A photographer's contact sheet: every Achievement is an equal frame, and nothing is singled out on the page; detail lives one hover away. It refuses the busy feed of fanned icons, tapes, foils and rarity borders, and the "who did it first" leaderboard.

OWN-WORLD: The Monthly Issue, unchanged: ink ground, Anton titles, Barlow Condensed labels, Provider colours on chips. Frames are plain squares (2-3px corners, 1px rule edge) holding the icon art; a missing one is a dark empty frame with its art faded. The only selection mark is the theme's yellow inset ring; hover is a yellow outline. No tilts, no foil, no rarity borders, no hand-drawn marks.

STORY: On the hub a member scans each day's rows (member, game, every icon they unlocked, time) and hovers an icon for its name, description, the service's own terms (trophy grade, points) and Rarity. On a game page they see their own progress against the set and the club's, filter to what they're missing, and hover a frame to see which members have it. On the dashboard they see the same rows small, and their sets closest to done.

FIRST VIEWPORT: Hub: PageHeader, Provider chips on their own line, News-style day bands (Anton day, date and count, 2px strong rule), rows on hairlines with icon frames wrapping; pagination and "Days and times in UTC" at the foot. Game page: the last section; SectionHeading with Provider chips and Club / Me in the action slot; "You: x of y · %" over a tick strip, the members line, a filter row, a capped grid of frames, "Show all N →". Dashboard: both panels wide, in the PanelFrame/PanelItem grammar, icon frames or a tick strip under each row.

FORM: Contact sheet (dealt lead, position 3 of 7 on the ordered list), mixed with the passport progress display and the toast row layout at the owner's request. seed:328fb6a38d963831

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
