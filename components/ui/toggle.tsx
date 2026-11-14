"use client"

import { Toggle as TogglePrimitive } from "@base-ui/react/toggle"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const toggleVariants = cva(
  "group/toggle inline-flex items-center justify-center gap-1 text-sm whitespace-nowrap transition-all outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "",
        outline: "border",
        // www#94: a formatting button in an editor's toolbar (bold, a
        // heading): quiet until hovered or pressed.
        toolbar: "",
        // www#96: a switch between alternatives in place (the game page's
        // set switcher): each segment rests quiet until hovered or pressed.
        switcher: "",
        // www#97: a tag picked onto something (a Suggestion's types), drawn
        // in its own ink: the caller sets --tag-ink.
        tag: "",
        // www#98: the staff desks.
        // A thing's state, picked in place (a Feature Flag's Off / Preview /
        // Live): each pressed segment wears its state's ink (tone).
        state: "",
        // The voting track a form is for (GOTM or NR-GOTM): the pressed one
        // is filled in its track's colour (tone).
        track: "",
        // www#100: one of a set of choices on the yellow panel (the donated
        // key's platform).
        inverse: "focus-visible:ring-background/30",
      },
      size: {
        default:
          "h-8 min-w-8 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        sm: "h-7 min-w-7 px-2.5 text-[0.8rem] has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-9 min-w-9 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Toggle({
  className,
  variant = "default",
  size = "default",
  ...props
}: TogglePrimitive.Props & VariantProps<typeof toggleVariants>) {
  return (
    <TogglePrimitive
      data-slot="toggle"
      data-variant={variant}
      className={cn(toggleVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Toggle, toggleVariants }
