---
version: 1
slug: "app-protected-settings-page-tsx"
primary_target: "app/(protected)/settings/page.tsx"
related_targets: ["components/settings/settings-view.tsx","components/settings/settings-tabs.tsx","components/templates/masthead-tabs.tsx","components/feature/feature-preferences-form.tsx","components/feature/feature-switch.tsx","components/feature/news-category-chips.tsx","components/settings/birth-date-editor.tsx","components/admin/birth-dates/member-birth-date-editor.tsx"]
---

# Surface: /settings (member settings, in tabs)

Mode: Operate. Scope: ordinary extension inside the established DESIGN.md world (www#74, spec api#347; News Category switches www#78, spec api#355).
Audience/job: any signed-in member tidying their own view of the site; Admins and Superadmins also previewing it as members see it.

## Direction contract

THESIS: A settings page is one more department of the magazine: the SETTINGS headline on its paper rule, then the page's departments as big Anton tabs, each saying its state before it's opened, over plain switch rows. It refuses the generic settings template of grouped cards, icons per row and a sticky save bar.

OWN-WORLD: Ink ground, Anton headline, tab names and section titles; section titles on 2px paper rules, the tab row on a 1px rule with the open tab over the 3px masthead red you-are-here bar; Barlow Condensed caps for row names, tab state lines and switch state; Barlow dim for the "where it shows up" lines; 1px rule hairlines between rows. The switch is a hard-cornered 44x24 track: highlighter yellow with an ink block when shown (the member's own choice), ink-3 well with a muted block when hidden.

LAYOUT (locked 2026-11-23: "C, big type", `.impeccable/mocks/decision/settings-layout/round2.html` with the Big type tab style; round 1 `index.html` held options A-D). The old single 42rem column (Features with its sub-lists nested, Birth Date last, desktop width unused) is retired. Tabs: You · Features (default, no URL parameter) · Notifications · Your layout · Staff (Moderators and up). Each tab name carries its state line: "15 Mar · shared" / "No date yet", "7 of 9 shown", "DMs on" / "DMs off" / "None", "Your own pins" / "The club's", "Preview on" / "The desk". `?tab=` keeps the open tab (replaceState, no navigation); every panel stays mounted. Content up to 72rem. Phone: the tab row scrolls sideways edge to edge; every two-column panel stacks.
- YOU: Birth Date (heading, one dim line on the optional year and the two-a-month limit, the fields) beside WHO SEES IT (one dim line, the Share my Birthday row, then a ledger: You and staff / Members / On a Run, the Members line following the switch).
- FEATURES: the explanatory line, the switch rows in two columns from lg, then NEWS CATEGORIES and HIDDEN PLATFORMS side by side, each a section title with its count.
- NOTIFICATIONS: BOT DMS, one dim line, the Challenge DMs row; without it a dashed box says why ("Show Challenges on the Features tab to choose its DMs." when the member hid Challenges, else "No DMs to choose right now.").
- YOUR LAYOUT: one dim line, then the Pinned Pages and Dashboard rows, always both.
- STAFF: PREVIEW (the "Show Preview features" switch on its raised ink-2 panel with the Staff chip, Admins and up) beside ON THE DESK (links, by role: Set a Birth Date, Feature Flags, the whole desk).

STORY: The member reads the tabs' state lines, opens the one they want, flips what they don't use, and sees the sidebar follow at once.

FORM: Signature interaction: save on flip; the block slides 200ms (motion-safe), the label reads Saving while the API answers, and a failed save springs back with the reason under the row. Staff: Preview rows carry the highlight Preview chip. No Live hideable Feature: a dashed rule-strong box with one short line replaces the list. No preview column, no Core list.

NEWS CATEGORIES (www#78, restyled 2026-11-23): chips, not switch rows (the `ink` Toggle variant): the category's 16px ink square (Rumours dashed) and its name in label type; on, ringed 2px in yellow; off, on a 1px strong rule in paper-mute, struck through, its square at 45%. Same save-on-press, Saving (dimmed chip, one status line) and spring-back-with-reason behaviour, the reason under the chips naming the category. While the News Hub reads Hidden (optimistic included) the chips stay but go inert (aria-disabled, 45%, not-allowed cursor) with "Show the News Hub to choose its categories." under them, which each chip names as its description. Absent when the API does not list the News Hub. If the read fails, the section says so in one dim line. News inks appear on this page only here.

HIDDEN PLATFORMS (api#427): the list as before (each with Unhide, then the platform picker and Hide), now its own section beside News Categories; inert with "Show the Release Calendar to choose its Hidden Platforms." while the Release Calendar is hidden.

CHALLENGE DMS AND BIRTH DATE (www#108, spec api#376): Challenge DMs is one switch row in the Feature rows' style on the Notifications tab: "Challenge DMs", a dim line on when the bot DMs, the page's switch reading On/Off, saving on flip; staff seeing Challenges in Preview get the Preview chip. BIRTH DATE (never flagged): Day and Month selects and an optional four-digit Year field (captions above, as in the Birthdays mock's pick A), the yellow Save (dimmed until the date changes) and a destructive-ghost Remove while one is set; on a phone the buttons wrap under the fields. Under them one dim line: the changes left this month, or, at the limit, a 14px lock and "You can change it again on <date>" with the fields and buttons disabled. A refusal shows the API's words in destructive type in place of that line; a save confirms in a dim status line ("Saved: 15 March 1988."). A day the month lacks is refused on Save in words, never clamped. SHARE MY BIRTHDAY (Birthdays spec api#396, pick A) is one switch row in the Feature rows' style, On/Off, "Switch it whenever you like; it never counts toward the two a month.", saving on flip and springing back with the reason; without a Birth Date it stays in place dimmed and inert with "Add your Birth Date's day and month first." The limit never holds it, and while the date or the switch is saving the other waits. Staff set another member's on the desk page /admin/birth-dates with its own editor (unchanged).

PINNED PAGES AND DASHBOARD (api#419, api#421): rows in the Feature rows' style on the Your layout tab. Once the member's own: a dim line ("Your own list, top of your sidebar. Reset to follow the club's: Voting, Games, Members and News." / "Your own panels and order, under the issue. Reset to follow the club's default panels.") and an outline Reset with a counter-clockwise arrow where the switches sit, opening the site's ConfirmDialog ("Keep mine" / destructive confirm); a refusal shows in the dialog, which stays open. Otherwise the row reads "Following the club's: …" with how to make it their own (Pin to sidebar / Edit dashboard) and no button.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
