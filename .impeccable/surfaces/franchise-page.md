---
version: 1
slug: "franchise-page"
primary_target: "app/(protected)/franchises/[id]/page.tsx"
related_targets: ["components/franchises/franchise-view.tsx","components/franchises/franchise-games.tsx","components/franchises/franchise-wall.tsx","components/franchises/franchise-tile.tsx","components/franchises/franchise-history.tsx","components/games/edit/franchises-tab.tsx","components/games/edit/franchise-lanes/franchise-role-lane.tsx","components/games/edit/franchise-lanes/lane-franchise.tsx","components/games/edit/franchise-lanes/lane-add-slot.tsx","components/games/game-page/game-details.tsx"]
---

# Surface: Franchise page (/franchises/:id), the Franchises tab on Game Edit, and Series labels

Mode: Operate (editing) over Read (browsing). Monthly Issue world, no new ink.
Ticket: www#169 (spec api#442). Mocks: `.impeccable/mocks/decision/game-lists/franchise.html` (#o6b, #o6c, #o7a); the game page's Details in `profile-game.html` (the 5 mocks).

## Owner's picks (2026-11-24)
> 6: Mix of 6B and 6C. A Games / History tab switch. Games is 6B (Mainline covers with Roman numerals, Add-ons as inserts, Other in the box-set panel, Edit Franchise turns the page into an editor). History is 6C's timeline drawing, with Undo per entry for editors.
> 7: 7A staged rows with Save all, but the container holding the two buttons (Mainline / Other control) must hug the buttons, no wide empty space.

## Job
A member sees which games make up a Franchise, in order. A Regular cleans it up (link, unlink, Mainline, new Franchise) and undoes a mistake; an Admin renames, merges or deletes it. From a game, a Regular sets which Franchises it is in and whether it is Mainline in each, saved with the rest of the Game Edit page.

## Layout
See DESIGN.md "Franchise page (/franchises/:id)" and the Franchises tab under "Game Edit page".

## Roles
- **Member:** Games only (the API's history read is Regulars and above, so there is no switch).
- **Regular, Moderator:** New Franchise, Edit Franchise, the History view with Undo, the Franchises tab on Game Edit.
- **Admin, Superadmin:** also the Admin row (Rename, Merge, Delete) while editing.
Controls come from the API's `viewer` (`can_edit`, `can_admin`), never from roles computed in www.

## States
- Empty Franchise: a dashed note; in edit mode the box set holds only the Link a game tile.
- Unlinked while editing: greyed in place with a plus to link it back, until Done editing.
- A refused save: the API's message in a dashed signal-orange box above the walls (or in the history).
- Merged Franchise: the route redirects to its target. Unknown id: 404.

## Copy
Franchise, Mainline, Other, Add-on, Series, Link a game, Link to a Franchise, Create a Franchise, Edit Franchise, Done editing, Can't undo. Never "collection" for an IGDB collection, never "spin-off" as a label.
