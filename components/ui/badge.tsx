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
      },
      size: {
        default: "",
        sm: "h-5 px-1.5 text-[0.72rem]",
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
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
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
      size,
    },
  })
}

export { Badge, badgeVariants }
