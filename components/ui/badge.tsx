import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// A chip: a fact, a track, a status or a Rarity in the label voice. The tone
// names what the chip is; each Theme draws it by [data-slot="badge"][data-tone]
// (api ADR-0008).
const badgeVariants = cva(
  "group/badge inline-flex h-6 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden border px-2 py-0.5 text-[0.78rem] whitespace-nowrap transition-all focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      tone: {
        // A plain fact (a year, a platform, a studio).
        neutral: "",
        // A counter or a quiet label on the page's second surface.
        secondary: "",
        // The GOTM and NR-GOTM tracks.
        gotm: "",
        nr: "",
        // A call to action or the Member's own pick.
        highlight: "",
        // A winner or a first role: the page's type as the fill.
        inverse: "",
        // A role or a label drawn as a stroke.
        outline: "",
        // Something the Member is about to lose or has lost.
        destructive: "focus-visible:ring-destructive/20",
        // An Achievement's Rarity.
        "rarity-common": "",
        "rarity-uncommon": "",
        "rarity-rare": "",
        "rarity-ultra": "",
        // Platinum, Mastery and Completion.
        foil: "",
        // An Achievement Provider, in its own colour.
        "provider-retroachievements": "",
        "provider-steam": "",
        "provider-psn": "",
        // A giveaway platform, in its ribbon ink: the caller sets
        // --platform-ink.
        platform: "",
        // A filter option that is no Provider (the hub's "All"); the current
        // one carries aria-current.
        option: "",
        // A filter the reader picked, holding its own clear button.
        picked: "",
        // A status beside a heading (not saved yet), drawn as a hairline.
        status: "",
        // What a vague Release date still leaves unknown ("Day TBA", "Month
        // TBA", "No date yet").
        precision: "",
        // A Release's region code beside its date: the three region inks,
        // Worldwide, and any other region. A past Release's is data-past.
        "region-na": "",
        "region-eu": "",
        "region-jp": "",
        "region-ww": "",
        region: "",
        // api#451: where the game already is on the member's lists, beside
        // the game page's split button ("Playing since 9 Nov", "Completed
        // x2"): paper label caps on a translucent ink chip over the art,
        // a figure set in Anton.
        shelf: "",
        // Patch Notes' unseen mark ("NEW", www#238): a 1px paper outline
        // with paper type, on the sidebar, the tab bar and the Stack.
        new: "",
        // The same on a nav row (the Club group's): on the collapsed icon
        // rail it sits over the icon on the sidebar's own fill.
        "new-rail": "",
      },
      size: {
        default: "",
        sm: "h-5 px-1.5 text-[0.72rem]",
        // The sidebar's badge scale, beside a nav item's label.
        nav: "h-auto px-1.5 py-px text-[0.7rem]",
        // A filter chip that is a link (the hub's Provider filter).
        filter: "h-[26px] px-2.5 text-[0.8rem]",
        // A review's pill row (track, then Revisited or Quick take) on the
        // Review Feed's boxes.
        pill: "h-[22px] px-2 text-[0.74rem] [&>svg]:size-3!",
      },
    },
    defaultVariants: {
      tone: "neutral",
      size: "default",
    },
  }
)

function Badge({
  className,
  tone = "neutral",
  size = "default",
  unpicked = false,
  past = false,
  render,
  ...props
}: useRender.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & {
    // A Provider filter chip that is not picked while another one is
    // (data-unpicked).
    unpicked?: boolean
    // A Release's region chip once its date has passed (data-past).
    past?: boolean
  }) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ tone, size }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      tone,
      unpicked,
      past,
      size,
    },
  })
}

export { Badge, badgeVariants }
