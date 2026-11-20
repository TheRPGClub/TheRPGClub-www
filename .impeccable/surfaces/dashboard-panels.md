---
version: 1
slug: "dashboard-panels"
primary_target: "app/(protected)/dashboard/page.tsx"
related_targets: ["components/dashboard","app/(protected)/settings/page.tsx","app/(protected)/releases/page.tsx","DESIGN.md"]
---

# Surface: Dashboard Panels (spec api#421)

Mode: Operate. The dashboard becomes each member's homepage: the club's current issue on top, unchanged, then the recent club and personal activity the member follows, as Dashboard Panels.

Status: chosen by the owner on 2026-11-20 (`specs/dashboard-panels/design/picks.md`, ticket www#143). Galleries (local, not committed): `.impeccable/mocks/decision/dashboard-panels/` (first round, options A-D per surface), `dashboard-panels-final/` (merged states for sign-off) and `dashboard-panels-unify/` (the unify round; **option B** is the pick and supersedes the first round's C panel styling).

## Direction contract

THESIS: the panels are the issue's back half. They continue the cover/rail grid and the ruled departments of the Monthly Issue, so the page reads as one magazine, not a magazine with a widget board bolted under it.

OWN-WORLD: the Monthly Issue (DESIGN.md). Panels are dark `card` blocks like the NR-GOTM feature card, each topped by a 4px rule in its own panel ink. No coloured tabs, no paper tilt on the panel itself, no glow.

## Picks

### Panel family (unify B)
- An "Around the club" Anton heading on the 2px paper rule, the same `SectionHeading` as Previous rounds. "Edit dashboard" sits at its right (edit mode is www#145).
- The cover/rail grid continues below it: from `lg`, wide panels fill the flexible main column (their items two across) and compact panels the 23rem rail.
- Placement rule: panels flow in the member's order and each lands in the column that fits its kind. Compact (rail): `now_playing_mine`, `challenge_runs_mine`, `backlog_pick`, `codex`, `birthdays`. Wide (main): everything else. Phone: one column in the member's order.
- Each panel: a `card` block, 3px corners, a 4px inset top rule in the panel ink, 20px padding. Head: the panel's name in Anton (about 1.9rem), a scope chip ("Club" in label type; "Mine" as a pill carrying the member's avatar), and "See all" with an arrow in the panel ink at the right.
- Item rows: a media column (cover, news frame, die-cut icon, avatar, date block), a two-line Barlow 600 title over one label-type meta line, and a right column (relative time, rarity chip, date). Rows are split by 1px `border` hairlines.
- About 5 items per panel.
- Panel inks: Latest News pink #f58ac0, Now Playing sky #86d3f6, Upcoming Releases lime #c4e36a, Latest Achievements periwinkle #9ab8f2, Challenge Activity and Challenge Runs teal #52d6c4, Recent Completions mint #8fe0a6, Latest Reviews steel #c0c4d6, Game Journals coral #f0a9a0, Open Giveaways aqua #7fd0e8, Suggestion Board wheat #d4c48a, Backlog Pick umber #e0b56e, Codex fact pink #ff8ad8, Upcoming Birthdays parchment #eadcb8.
- Inside panels, News Category inks may mark news thumbnails and Challenge tints may mark Challenge events (owner default).

### Empty panel (C, owner default)
A dashed `border-strong` slip inside the panel: "All quiet. Nothing new yet." The panel stays, so the member knows their setting works.

### Load error
A ruled box inside the panel only: a warning icon, "Couldn't load <Panel>." and "The rest of your dashboard is fine.", with an outline "Try again" button.

### Voting & GOTM hidden
The panels take the issue's place: "Around the club" heads the page. The sidebar and tab bar are outside this spec.

### Edit mode (www#145)
D's mechanics in B's styling: panels stay in place, each gets a control strip (grip, "1 of 6", Move up / Move down, a Shown switch), hidden panels wait in a dashed Hidden tray below, a mint NEW stamp marks new panels. Save failure: a "Not saved · Couldn't save your dashboard." notice and an orange ring on the panel. Drawn in `dashboard-panels-unify/png/b-edit-*.png`.

### Hidden Platforms (A)
/releases: a "Hide for good" section in the platform filter and a ruled note with the hidden count and "Show all". /settings: a Hidden Platforms list under the Release Calendar row, and "Reset dashboard" beside "Reset Pinned Pages".
