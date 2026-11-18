---
version: 1
slug: "challenges-inks"
primary_target: "DESIGN.md"
related_targets: []
---

# Proposal: "Challenges inks" colour group for DESIGN.md

Status: proposed with the merged mocks (`.impeccable/mocks/decision/challenges-final/index.html`), waiting on the owner's sign-off. Fold it into DESIGN.md's Colors section, after "Journal member inks", when the first Challenges surface is built (ticket 18). Owner's rule (picks.md): "per-Challenge tint (1C flyers / 2D Season-ink banner) as the main colour role; Format inks only for small markers."

## Challenges inks (Challenges surfaces only)

Challenges are the magazine's fun department, so they bring their own colour, and it stays on Challenges surfaces: the index, the Challenge page (Pool, Slots, Assignment), the create and edit form, the Santa pick page and the Runs section of a profile.

- **Challenge tint** (sampled, not a token): the main role. Each Challenge has one tint, used as a pair:
  - **fill**: the flyer, the billboard, the banner's ground behind its art, a Finished stamp, the tint chip. Paper type on it must clear 4.5:1 (all type on a fill is paper, body copy included; never paper-dim).
  - **hi**: the same hue lifted for type and marks on ink: the banner's second headline line and first numeral, the view-switch underline, open-year numbers and birth-year rings on a Slots Run, Run bars, the Finished stamp outline on ink, current-Run stamp edges and titles. It must clear 4.5:1 on ink and ink-2.
  - **Source:** sampled from the Challenge's art like the Achievement game tint (the vivid dominant hue of the banner art, or of the first Pool covers), clamped to a mid-lightness range. A Challenge without usable art gets a hashed tint from a curated list (below). The API stores the pair on the Challenge so the bot and the site agree; staff may override it.
  - **Curated fallback list** (fill / hi): teal #1f6b67 / #6fd6cc, cobalt #2c4f8e / #9ab8f2, holly #1c6545 / #3fbf8a, umber #7a531c / #e0b56e, moss #3b5a2b / #a9cf86, azure #2a5ea6 / #9cc2f5, slate #3a3a52 / #b4b4d6, ochre #8a6417 / #e6c36a. Measured: paper on fill 4.9-10:1, hi on ink 9.8-11.6:1.
  - **Muted (Closed / Expired):** the fill mixed 35% (Closed flyer) or 30% (Expired stamp) into ink-3, with paper title and paper-dim body.
- **Format inks** (format-slots #46cbe6, format-pool #93a3ff, format-assignment #52cf98): small markers only, never fills behind more than a word. A 9px square beside the Format name in a flyer's label, in the Format filter, on the banner's Format chip and on a profile stamp. They never colour a card, a bar or a heading.
- **Holly and tinsel** (Secret Santa only): holly #3fbf8a is Secret Santa's tint hi (its fill is #1c6545). Tinsel #e9c46a is the door edge, the name-tag string and the reel rule. Neither appears on another Challenge.

**The Tint Is the Challenge Rule.** A Challenge tint means that Challenge and nothing else. Like a game tint it is content, so a red or violet sample never means GOTM or NR-GOTM, but the curated fallbacks stay off masthead red, feature violet, highlighter yellow and signal orange. Yellow still means your own business (your Run's ring, Start a Run, Sign up, Pick this one, the selected lane), signal orange still means Abandon and Delete, and red is still only "you are here".

**The Tint Carries Its Type Rule** (shared with the Achievement Hub) applies: a tint fill always travels with paper type, and a tint is always solid. The only gradient is the existing black legibility scrim over banner art.

## Tokens to add

`format-slots`, `format-pool`, `format-assignment`, `holly`, `tinsel` as tokens. The tint pair is data (`tint_fill`, `tint_hi` on the Challenge), exposed to CSS as `--challenge-tint` and `--challenge-tint-hi` on the page or card root.
