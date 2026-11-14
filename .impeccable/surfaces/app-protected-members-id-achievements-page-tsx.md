---
version: 1
slug: "app-protected-members-id-achievements-page-tsx"
primary_target: "app/(protected)/members/[id]/achievements/page.tsx"
related_targets: ["app/(protected)/members/[id]/achievements/[setId]/page.tsx","app/(protected)/achievements/page.tsx","app/(protected)/games/[id]/page.tsx"]
---

# Achievement Hub surfaces

**Scope:** the member achievements page (primary), the member set page, the community hub at `/achievements`, and the achievements section of the game page. Mode: Experience leaning Operate. The pages are a showcase first and a progress tracker second.

**Audience and job:** signed-in club members, who come to admire each other's Unlocks and to track their own progress. Content comes from the api-09 reads. The copy uses the glossary terms (Achievement, Unlock, Highlight, Completion, Mastery, Platinum) and never "sticker", "album", "pack" or "pull".

**Unresolved:**
- The game-art tint needs a stored colour per Achievement Set from the API.
- The game page's per-achievement holders need an API extension.
- Hub club totals panel (sketch hub-a) omitted: the API has no weekly/monthly club aggregates; follow-up if wanted.
- Member page 'Unlocks' view kept beside Index (not in sketch): flat Unlock list, carried over from the previous page.

## Direction contract

**THESIS:** Each member's achievements live in a binder opened on one gutter, and each set is a spread inside it. The page refuses the category default of a stats header over a grid of progress cards.

**OWN-WORLD:** The Monthly Issue's ink ground, Anton and Barlow, carry the new roles (detailed in `.impeccable/mocks/decision/album-system.md`):
- the game tint as page spines, header bands and index tabs;
- rarity inks as a 3px die-cut border on unlocked icons: paper, `#5fd08a`, `#4aa8ff`, `#ff4fa3`;
- a holographic foil edge, used only on Platinum, Mastery and Completion;
- Provider colours on chips and tabs: RetroAchievements `#2ec4b6`, Steam `#66c0f4`, PlayStation `#3b6fe0`.

Locked achievements are dashed numbered slots. Hidden ones are sealed tiles with a blurred name.

**STORY:** A visitor reads the member at a glance: who they are, their totals and their four rarest Unlocks. They then scan the index to see which games are done and which are in progress, and open a set to see exactly what is left.

**FIRST VIEWPORT:**
- **Member page:** the open binder. The left page holds the identity, the totals and the four rarest Unlocks. The right page holds the index, with one row per set, a game-tint tab past the edge, a slot-dot strip, the count and a foil stamp. Filter tabs sit on the binder's top edge.
- **Set page:** a two-page spread with the view tabs CHECKLIST (default), RARITY and TIMELINE. The checklist puts the headline Achievement on top: the PSN Platinum, the RetroAchievements highest-points Achievement, or the Steam rarest.
- **Hub:** day bands. Each day holds member-plus-game cards with fanned icons, beside a wall of individual Highlights at double size.
- **Game page:** one composite page per Provider behind tabs. Member dots ring each icon, and the members who completed the set sign the margin.

**FORM:** The Sticker Album (structure 2 of 7, steered toward colour, with member page B, a combined set page, a hub that mixes A and B, and game page C). seed:ea16e2868d55e2da

**FINISH:** unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
