---
version: 1
slug: "components-shell-app-sidebar-tsx"
primary_target: "components/shell/app-sidebar.tsx"
related_targets: ["components/shell/sidebar-browse.tsx","components/shell/sidebar-rail-panel.tsx","components/shell/sidebar-main.tsx","components/shell/sidebar-group-view.tsx","components/issue/top-bar.tsx"]
---

# Surface: the signed-in sidebar (components/shell)

Mode: Operate. Scope: regrouping inside the established DESIGN.md world (spec api#416, Pinned Pages; www#133 expanded state and top bar search removal; www#135 the icon rail). Approved prototype: `.impeccable/mocks/decision/sidebar/ac-prototype.html` ("Pinned and Browse", the /impeccable round of 2026-11-19).
Audience/job: every signed-in member finding the page they want; staff reaching their tools. The pages a member uses daily are one click away; everything else is two, and every page carries a one-line note so newer pages explain themselves.

## Direction contract

THESIS: A magazine's contents page folded into the sidebar: a short list of the member's own pages up top, then sections ("Play", "Games", "Club", "Staff") that open into their own contents with a note per page. It refuses the long flat list of every page, and the accordion that pushes the list down.

OWN-WORLD: Ink 2 rail on a 1px rule. Label-type rows at 40px with 18px line icons in paper-dim, muted on hover; masthead red only for where you are (the active row or entry, the 3px marker beside a group's row on an unpinned page). Yellow only for open business (Open badge, the Play dot) and staff Preview badges. The group view's name in Anton on the 2px paper rule.

STORY: The member opens the site on the main view: Dashboard, Pinned (club default: Voting, Games, Members, News), Browse with four group rows. They click Games; the sidebar slides sideways to Games' contents with notes; they move between Releases and Achievements without the sidebar moving; "All sections" or Esc slides back. On an unpinned page the group row names it on the right with the red marker, so they know where they are without opening the group.

FIRST VIEWPORT: Wordmark and collapse control; Dashboard; PINNED heading and its rows; BROWSE heading and the group rows with chevrons; Settings and the account in the foot. No search in the top bar: its trail takes the full width.

FORM: Pinned and Browse (option A+C of the round). Signature interaction: the 320ms sideways slide (`cubic-bezier(0.2,0.8,0.2,1)`) between the main view and a group's view, with the hidden view faded and inert; reduced motion snaps.

## Rules

- Nothing shifts between the collapsed and expanded sidebar: icons, headings, rows and the footer keep their positions. The rail is 3.5rem; icons center 28px from the edge in both states; rows keep 40px and clip their labels on the rail; headings keep 38px as a 1px rule; the account row is a fixed 48px.
- On the rail a group opens a slide-out panel (the group's view without the back link) over a scrim; picking a page, Esc, the group's icon or a click/focus outside closes it.
- No auto-drill: a page load always shows the main view; client navigation inside the open group keeps it open, anywhere else returns to the main view.
- Groups leave out pages for Features the viewer isn't shown; an empty group is dropped; Staff follows `lib/staff.ts` nav sections by tier.
- Pin controls (api#418, www#136) appear only on hover or keyboard focus; not on the rail.
- Page keys, groups and notes live in `lib/sidebar.ts`; icons in `components/shell/nav-items.ts`.

## Verdict

Built in www#133 against stub session data (staff and member, round open and closed) at 1440 and 390 wide. Matches the prototype's rows, headings, group rows, drill-in and entries; uses the site's uppercase label voice for entry names where the prototype used sentence case, to stay one voice with the rest of the nav.

The icon rail (www#135) was checked the same way: element positions measured in both states match (logo, every row icon, both headings, Settings, avatar), the two screenshots overlaid line up, and the slide-out panel follows the prototype's flyout (no back link, scrim, soft shadow) with its pin controls left out per the spec.

api#418: hover pin and unpin built per the prototype's `.entry .pin` and `.it .unpin` (SidebarMenuAction variant `pin`, both Themes); the full-list message is the disabled pin's tooltip; a failed save shows a Notice Slip over the sidebar content's foot. Verified against a local API at 1440 and 390 wide, expanded and on the rail.
