import Link from "next/link"
import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center border text-[0.95rem] whitespace-nowrap transition-all outline-none select-none focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
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
        // An empty slot at the end of a list that adds one more to it
        // (Link another account).
        add: "",
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
