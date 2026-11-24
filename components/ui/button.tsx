import Link from "next/link"
import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center border text-[0.95rem] whitespace-nowrap transition-all outline-none select-none focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px motion-reduce:active:not-aria-[haspopup]:translate-y-0 disabled:pointer-events-none disabled:opacity-50 aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      // What the button is, never how it looks: each Theme draws every
      // variant by [data-slot="button"][data-variant] (api ADR-0008;
      // themes/<name>/primitives.css). Only the focus ring colour stays here.
      variant: {
        // The track's own action: GOTM.
        default: "",
        // Calls to action: nominate, vote, the club's open business.
        highlight: "",
        // The NR-GOTM track's own action.
        nr: "",
        // A second action beside the main one.
        outline: "",
        // An outline button sitting on art (a banner, a cover reel).
        overlay: "",
        // The chosen one of a set of outline buttons (aria-pressed).
        selected: "",
        secondary: "",
        // A quiet action that only shows its ground on hover.
        ghost: "",
        // A ghost action that removes something (delete, remove, discard).
        "destructive-ghost": "",
        // A small tool on a piece of content (the pencil on your own
        // review): a ghost that stays quiet until hover.
        tool: "",
        destructive:
          "focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
        // The confirmed destructive action (after a typed-word confirm).
        "destructive-solid": "focus-visible:ring-destructive/40",
        // A destructive action that opens its confirm.
        "destructive-outline": "",
        // The main action on a light object (the yellow panel, a notice
        // slip).
        inverse: "focus-visible:ring-background/45",
        // The second action beside it, on the same light object.
        "inverse-outline": "focus-visible:ring-current/35",
        link: "underline decoration-2 underline-offset-4",
        // www#89: the app shell and the root components.
        // The sidebar's own collapse and expand controls.
        "sidebar-toggle": "",
        // A small icon action in the sidebar's footer (sign out).
        "sidebar-action": "",
        // The back link out of a sidebar group's view ("All sections").
        "sidebar-back": "",
        // www#164: a nested page's way back to its parent, small above its
        // title (BackLink): its name in label caps on desktop, the arrow
        // alone on phones. back-on-art sits on a key-art banner.
        back: "",
        "back-on-art": "",
        // A tab in the phone's tab bar: an icon over its name. The current
        // one carries data-current. Pair with size="bare".
        tab: "",
        // The round button at the tab bar's middle: its burst is its look,
        // drawn by the caller; the Theme sets its focus. Pair with
        // size="bare".
        round: "",
        // An empty slot at the end of a list that adds one more to it
        // (Link another account).
        add: "",
        // www#94: the Member editors.
        // A small secondary tool in a dense editor (rename, save a name, add
        // your own row), quieter than a tool on content.
        "editor-tool": "",
        // Its counterpart that throws something away (discard a rename).
        "destructive-editor-tool": "",
        // A quiet dotted link that opens an explainer ("What's this?").
        help: "",
        // A round action sitting on a cover (remove the game from a list).
        "cover-remove": "",
        // api#442: a square ink token on a Franchise page cover in edit mode
        // (the Mainline star, Unlink); pressed, a paper block.
        "cover-token": "",
        // api#442: an Add-on's paper insert clipped under its parent's cover;
        // open (aria-expanded), it turns yellow.
        insert: "",
        // www#91: the rest of the Monthly Issue editorial components.
        // Previous or next through a set, sitting on art (the completed
        // reel's spotlight).
        step: "",
        // A picture that is the button: the look is its content's (a frame
        // in the completed reel's filmstrip).
        frame: "",
        // www#96: a whole item that is picked from a set (an Achievement in
        // a set page's views, aria-pressed). Pass size="bare" and lay the
        // item out yourself. pick: the selection ring alone; pick-row: a
        // list row that lights on hover and fills while picked; pick-tile:
        // a rounded tile that lights on hover; pick-card: a filled card that
        // lights on hover.
        pick: "",
        "pick-row": "",
        "pick-tile": "",
        "pick-card": "",
        // Closes a card lying on the muted ground (the picked Achievement's
        // details).
        dismiss: "",
        // www#97: voting, GOTM history and suggestions.
        // The small x that clears something in place: a notice (a failed
        // vote), a field's text (the journal catalogue's search).
        clear: "",
        // A quiet action in a card's footer (Keep).
        "card-action": "",
        // A card footer action that withdraws or turns something down.
        "card-action-destructive": "",
        // A page search bar's own submit, beside the bar (GOTM history).
        search: "",
        // www#98: the staff desks.
        // A list row's own tools (move a game up or down): a ghost resting
        // in the dim ink, a step louder than a tool on content.
        row: "",
        // Its counterpart that removes the row (remove a game, delete a
        // nomination).
        "destructive-row": "",
        // Opens or closes a note on a row (a Feature Flag's reason): rests
        // in the faint ink and lifts onto the muted ground on hover and
        // while open (aria-expanded); data-filled marks a note holding text.
        note: "",
        // An action inside running text ("Drag, or type a date"): the
        // text's own face and ink, underlined in GOTM red. Pair with
        // size="inline".
        "inline-link": "",
        // An action printed on a poster proof (open the live event's
        // thread): a paper block on the art, yellow on hover.
        poster: "",
        // www#148: the review desk's Draft.
        // A pencilled line that is also an action (the Draft strip's
        // missing score, its Retry now): the desk's yellow pencil, in its
        // own italic hand, underlined on hover. Pair with size="inline".
        pencil: "",
        // www#151: Your drafts. The yellow call to action with its corner
        // cut away, the dog-ear the drafts pile carries (Continue writing,
        // Your drafts).
        "dog-ear": "",
        // www#100: journals, giveaways and the Feature switches.
        // An icon tool on the yellow panel (show the key being donated).
        "inverse-ghost": "focus-visible:ring-background/30",
        // A small tool inside a field's picked value (change the picked
        // game): a ghost resting in the dim ink.
        "field-tool": "",
        // The main action on a light object that the viewer can't take yet
        // (Claim without the Members role): greyed into the object, and
        // always disabled.
        "inverse-locked": "disabled:opacity-100",
        // A quiet text action on a light object (an Admin's revoke on a
        // gift tag): the object's ink, softened until hovered.
        "inverse-link": "focus-visible:ring-background/30",
        // A filter chip beside a search (the journal catalogue's Any game):
        // the label voice on ink-2 with a strong hairline.
        chip: "",
        // A field's picked value as a chip that reopens its picker (the
        // journal editor's game).
        picked: "disabled:opacity-100",
        // A quiet text action under a control that backs out of a change
        // (Keep the game).
        "quiet-link": "",
        // A row's own label that picks the row (a chronology line's member):
        // no look of its own, the focus ring kept.
        "row-label": "",
        // A data mark on a chart, in the ink its row sets (--ink): an entry
        // on the chronology plate, and a Game Completion's diamond.
        mark: "",
        "mark-completion": "",
        // A dashed offer under a list to look further (Not listed? Search
        // IGDB).
        offer: "focus-visible:ring-2 focus-visible:ring-highlight/50",
        // www#99: the staff desks, part B.
        // Removes one chip from a field of chips (a term in the synonyms
        // editor): the chip's own small x.
        "chip-remove": "",
        // www#101: the News Hub.
        // One choice in a list of filters that toggles it in or out of the
        // view (a News Category on the News page's rail, aria-pressed): the
        // label voice and no ground; the row's parts carry its ink.
        "filter-option": "",
        // www#106: Challenges.
        // A setting written as a word in a sentence (the Challenge form's
        // rules): underlined, yellow while its control is open
        // (aria-expanded), signal orange when invalid (aria-invalid), and
        // plain once the rules are locked (disabled). Pair with
        // size="inline".
        "rule-word": "",
        // A dashed "+ Franchise or Series" that adds a source.
        "rule-add": "",
        // A cover on the form's Pool wall that is tapped to leave its game
        // out or put it back: the cover is the look, the focus ring kept.
        "pool-tile": "",
        // www#170: a segment of the switch under a Pool editor cover (Core,
        // Optional, Leave out), pressed for the game's place: the Core
        // segment fills with the Challenge tint's hi, Optional with paper.
        "pool-switch": "",
        "pool-switch-core": "",
        // www#107: the stamp-sized ink-2 tile ("+2 more") that opens the
        // rest of a profile's current Runs in place. Pair with size="bare"
        // and lay it out as a stamp.
        "stamp-more": "",
        // www#111: an action already taken, standing where its button was
        // (the Santa's "Picked"): the outline's look, at full strength
        // though it can't be pressed. Pair with disabled.
        done: "disabled:opacity-100",
        // www#126: Club History.
        // A History Event Kind in the timeline's filter (a link, its ink
        // from --ink): outlined in the ink with ink type; the current one
        // (aria-current) fills with it. "All" takes the paper as its ink.
        "kind-chip": "",
        // A quiet Delete beside a quiet Edit (a History Event's date line):
        // the label voice in signal orange, no ground.
        "quiet-delete": "",
        // www#145: the action on a section's heading rule beside its title
        // (the dashboard's Edit dashboard), in the "Full history" link's
        // voice: label caps in paper with a red icon, yellow on hover.
        "heading-action": "",
        // www#163: a link or toggle at the right end of a game page section's
        // heading ("On the Release Calendar", "All Details"): label caps in
        // the dim ink underlined in GOTM red, yellow on hover. Pair with
        // size="bare".
        "rail-link": "",
        // www#149: a two-state filter that is a link to its other state (the
        // Review Feed's Written only), role="switch" with aria-checked. It
        // holds a small switch drawn by the Theme: a span[data-part=
        // "switch-track"] around a span[data-part="switch-knob"].
        "filter-switch": "",
        // api#451: the game page's split button (1A). split is its main side
        // (the next step for the game, in highlight), split-caret the caret
        // that opens all the member's lists, joined to it by an ink hairline
        // and ringed in yellow while open (aria-expanded).
        split: "",
        "split-caret": "",
      },
      size: {
        default:
          "h-9 gap-2 px-3.5 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        xs: "h-6 gap-1 px-2 text-xs has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1 px-2.5 text-[0.8rem] has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-10 gap-2 px-4 text-base has-data-[icon=inline-end]:pr-3.5 has-data-[icon=inline-start]:pl-3.5",
        icon: "size-8",
        "icon-xs": "size-6 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-7",
        "icon-lg": "size-9",
        // www#94: a slot shaped like the covers in a shelf beside it.
        tile: "flex aspect-[3/4] h-auto w-full flex-col gap-2 text-[0.85rem] whitespace-normal [&_svg:not([class*='size-'])]:size-5",
        // www#96: no box of its own. The caller lays out a whole item (a
        // row, a tile, a card) that is the control: the type, wrapping and
        // alignment it inherits stay as they are, and a press doesn't nudge.
        bare: "shrink border-0 text-[length:inherit] whitespace-normal select-auto items-stretch justify-normal active:not-aria-[haspopup]:translate-y-0",
        // www#98: no box of its own, sitting in a line of text and taking
        // its type; a press doesn't nudge it.
        inline:
          "inline-block h-auto border-0 p-0 text-[length:inherit] active:not-aria-[haspopup]:translate-y-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

type ButtonLinkProps = useRender.ComponentProps<"a"> &
  VariantProps<typeof buttonVariants> & { href?: string }

// A link that looks like a Button. Base UI's Button enforces button
// semantics, so a link keeps its own element (next/link by default, or any
// element through render, such as <a download>) and takes the Button's slot,
// variant and size for the Theme to draw.
function ButtonLink({
  className,
  variant = "default",
  size = "default",
  href,
  render,
  ...props
}: ButtonLinkProps) {
  return useRender({
    render: render ?? <Link href={href ?? ""} />,
    props: mergeProps<"a">(
      { className: cn(buttonVariants({ variant, size, className })) },
      href && render ? { ...props, href } : props
    ),
    state: { slot: "button", variant, size },
  })
}

export { Button, ButtonLink, buttonVariants }
