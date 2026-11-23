---
version: 1
slug: "app-protected-admin-page-tsx"
primary_target: "app/(protected)/admin/page.tsx"
related_targets: ["components/admin/desk/staff-desk.tsx","components/admin/desk/desk-view.tsx","components/admin/desk/desk-tray.tsx","components/admin/desk/desk-tools.tsx","components/admin/desk/recent-jobs.tsx","components/admin/desk/bot-jobs.tsx","components/admin/desk/bot-jobs-filter.tsx","components/admin/desk/wire-slip.tsx","components/templates/masthead-tabs.tsx","lib/staff.ts","lib/desk-tabs.ts","lib/desk-tray.ts"]
---

# Surface: /admin (the Staff desk)

Mode: Operate. Scope: redesign inside the established DESIGN.md world (the Production desk). Replaces the area-grouped contents page and "the wire" rail.
Audience/job: Moderators, Admins and Superadmins opening the desk to see what's waiting on them, reach a tool, or check what the bot did.

## Direction contract

THESIS: The desk opens on what needs someone, then files every tool by the job it does. It refuses the contents-page-by-permission (areas named after roles, one-tool rows, live notes indistinguishable from fixed hints) and a byline nobody needs.

OWN-WORLD: Desk header (the page name alone on its 2px paper rule: no name, role, tool count or reach line). In-tray cards: `card`, 3px corners, 4px top bar (yellow open business, signal orange failure, `border-strong` plain), Anton numeral, Lucide icon, label-caps title, dim line, ruled foot with the way in. The /settings masthead tabs (MastheadTabs, `masthead` Tabs variant), each with a toned state line. Tool rows in label caps with tier chips, dim line, live note, arrow. Bot job slips and stamps as before.

STORY: A staff member lands, reads the in-tray (round 143 open, 3 Suggestions pending, 1 bot job failed), clicks the failed card, and Bot jobs opens on its failed jobs in place; or they open "The bot" and set the bot's status.

FIRST VIEWPORT: STAFF DESK; the in-tray (or the dashed "Nothing waiting on the desk" line); the tab row; the first tab's tools beside its Recent bot jobs.

FORM: Locked pick `.impeccable/mocks/decision/staff-desk/round2.html` (main checkout; gitignored mocks), user decisions 2026-11-23: in-tray from round 1's option C, the Big type tabs from /settings, one tab per job group (Voting · The bot · Members · GameDB · Feature Flags · Bot jobs), "the wire" renamed Bot jobs, Bot jobs spanning the width with its filter on the LEFT (filters sit on the left across the app), the header's side note removed, and the tool renames (Game synonyms, Game versions, Bot status, Status history, Scheduled posts, Add a Game Completion, Recount members, Missing images, Review Suggestions, Feature Flags).

IN-TRAY: only cards with something in them, only those the viewer's tier can act on. Round (Admins and up; nominating/voting/runoff/tie, with the date the API gives), pending Suggestions (Superadmins; the oldest only when every pending row was read), failed bot jobs (any staff; failures in the last three days among the first page read), live events not yet over (any staff; the next start in the club's zone, or "One is on now"). Phone: two across, smaller numerals, no icon.

TABS: groups the viewer can use (lib/staff.ts STAFF_GROUPS), Bot jobs always last; `?tab=` (first tab bare), `?tab=jobs&show=queued|failed`. Group state line: the round (live), pending Suggestions, last flag change, queued and failed counts (failed wins the tone). Bot jobs: "N failed" (bad), "N queued", "All done", "None yet".

BOT JOBS: filter column 15.5rem left from `lg` ("Show": All/Queued/Failed; "From": each tab, counts over the jobs read; `pick-row` buttons, picked one yellow-ringed); below `lg` an outline "Show" disclosure above the list. Slips use WireSlip `wide` (stamp and who asked in a right column from `sm`). Refresh, auto re-read while queued, "Older jobs", scope all (Admins and up) vs mine (Moderators) unchanged.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md.
