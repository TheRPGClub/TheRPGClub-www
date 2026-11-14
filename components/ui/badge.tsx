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
      },
      size: {
        default: "",
        sm: "h-5 px-1.5 text-[0.72rem]",
        // The sidebar's badge scale, beside a nav item's label.
        nav: "h-auto px-1.5 py-px text-[0.7rem]",
        // A filter chip that is a link (the hub's Provider filter).
        filter: "h-[26px] px-2.5 text-[0.8rem]",
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
  render,
  ...props
}: useRender.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & {
    // A Provider filter chip that is not picked while another one is
    // (data-unpicked).
    unpicked?: boolean
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
      size,
    },
  })
}

export { Badge, badgeVariants }
