---
version: 1
slug: "app-public-join-page-tsx"
primary_target: "app/(public)/join/page.tsx"
related_targets: ["app/(public)/page.tsx","components/issue/landing-cover.tsx"]
---

# Surface: /join (Visitor not in the club's server) + the front page's sign-in-failed slip

Mode: Persuade. Inside the established Monthly Issue world (DESIGN.md); no new palette or type.
Spec: TheRPGClub-www#80, ticket www#83. Seed: seed:2e772bd92548127d.

## Job and audience
A Visitor who signed in with Discord but is not in the club's Discord server, mostly a prospect who pressed Sign in on the front page, sometimes someone who followed a shared link to a Members' page. They are still deciding: the page pitches the club, then gets them into the server and back.

## Outcome
Open the club's invite (opens Discord, where they press Accept Invite), then Continue: sign-in restarts with the same return-to, and they land where they were going (the dashboard by default). Success is a Member on their destination page.

## Selected direction (user picks, 2026-11-14)
- **/join: Cover Slideshow** (`.impeccable/mocks/decision/join-merge-slides.html`). A mix of option 4's full-bleed cover with option 3's two steps, with option 1's reasons to join as the slideshow's content.
  - **Left:** the slide.
  - **Right, pinned:** the yellow panel.
    - The heading "Pull up a chair."
    - One line saying they are signed in with Discord but not in the server yet.
    - Two side-by-side steps with monumental Anton numerals:
      - **1 Join the server.** Text: "The invite opens Discord. Press Accept Invite there." Button: an ink "Open the invite" with an external icon; it opens in a new tab or the Discord app.
      - **2 Come back in.** Text: "We'll check the server and take you where you were going." Button: an outline "Continue".
    - The small line for removed members.
- **Slides (six, in order):**
  - this month's Game of the Month (key art, red round numeral, two-line headline, GOTM starburst);
  - the Non-RPG pick (violet numeral, NR burst);
  - Vote on what's next;
  - Your shelf;
  - Reviews;
  - Achievements.

  Slides 1–2 use the public winners read. Slides 3–6 are type-led on the ink ground, with recent winners' real covers as their art, and carry no invented member data or stats.
- **Front page sign-in failure: Slip on the Cover** (`fail-slip.html`).
  - A paper slip at -2deg with object lift, pinned over the cover art.
  - It reads "Sign-in didn't go through." in Anton, then one line: "It's usually a hiccup on the way back from Discord. Try again; if it keeps happening, let the staff know."
  - It has an ink "Try again" button that restarts sign-in, and a dismiss control that clears the error from the URL.
- **/join second try: Slip on the Panel** (`retry-slip.html`).
  - The same slip lands on the panel's top edge, reading "Not in the server yet." plus the Accept Invite directions and "It can take a moment to show up."
  - The steps stay unchanged.
- **The slip is one new shared component** (a notice slip) for every "that didn't work" moment. Record it in DESIGN.md when built.

## Copy rules
No "issue" or "edition" vocabulary on these surfaces (the Monthly Issue is the look, not the words). Glossary terms: Member, Visitor. No invented counts or testimonials.

## States and ranges
- **First visit:** as above.
- **Second try:** `/join` knows it's a second try from a short-lived cookie that its Continue action sets (a www route sets it, then redirects to sign-in with the return-to); the API does not change. The slip shows, and the cookie clears on a successful sign-in.
- **No public winners** (the read failed or came back empty): slides 1–2 become the front page's flat track plates, and slides 3–6 are unchanged.
- **Return-to present or absent:** the copy says "where you were going" either way. The page never resolves the destination's title (it can't without a session).
- **The invite environment setting is required:** fail the build or start-up without it rather than render a dead button.

## Interaction, motion and layout
- **Slideshow motion:** crossfade about every 7s. A labelled tick per slide sits at the foot and fills as its slide runs; ticks are also jump links.
- **Pausing:**
  - Hover or focus pauses the slideshow.
  - A visible pause/play control comes first in the slideshow's tab order (WCAG 2.2.2).
  - Under reduced motion there is no auto-advance: the first slide shows and the ticks act as tabs.
- **Screen readers:** the slideshow is a labelled carousel region; each slide is "n of 6"; it is not announced as it advances.
- **The panel never moves.** Its actions are always visible and reachable without waiting for a slide.
- **Phone:**
  - The slide comes first at about 60svh, with the panel stacked below it.
  - Ticks collapse to the current slide's label plus position.
  - Buttons go full width.
  - The 16px side gutter is kept.
- **The front-page slip on a phone** sits above the pitch at the same tilt; with the flat hero it pins to the track plates.
- **Implementation:** use shadcn primitives (Carousel with fade and autoplay for the slideshow, Button and Badge), per api ADR-0008. Feature code passes layout classes only.

## Boundaries
Not in scope: greeting the person by Discord name or avatar; adding them to the server automatically; any change to the protected pages.

## Direction contract
- THESIS: /join is the club's cover still running, with the way in pinned beside it. It refuses the access-denied dead end and the generic centred sign-up card.
- OWN-WORLD: the Monthly Issue. Ink ground; full-bleed key art under a left ink scrim; Anton caps headlines and monumental numerals; Barlow Condensed tracked-caps furniture; red GOTM numeral, violet NR numeral, the stamped starbursts; a highlighter-yellow panel with ink actions; a paper notice slip at -2deg with object lift for every "that didn't work".
- STORY: the Visitor learns they are one step short (signed in, not in the server), sees what the club does while they decide, opens the invite, accepts in Discord, presses Continue and lands where they were going.
- FIRST VIEWPORT: at 1440x900, a 60px top bar (logo, wordmark); left, the slide (9rem red round numeral, two-line headline up to 6rem, 50ch blurb) over its key art; the GOTM burst between slide and panel; right, the yellow panel (36rem, pinned 96px down): "Pull up a chair.", one line, two side-by-side steps with 6rem Anton numerals, "Open the invite" (ink) and "Continue" (outline); at the foot, six labelled ticks and the pause control.
- FORM: Cover Slideshow, the user's pick (options 4 + 3 + 1 merged), first on the list. seed:2e772bd92548127d
- FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
