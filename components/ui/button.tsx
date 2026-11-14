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
        // www#94: the Member editors.
        // A small secondary tool in a dense editor (rename, save a name, add
        // your own row): a ghost resting in the muted ink.
        subtle: "",
        // Its counterpart that throws something away (discard a rename).
        "destructive-subtle": "",
        // A quiet dotted link that opens an explainer ("What's this?").
        help: "",
        // A round action sitting on a cover (remove the game from a list).
        "cover-remove": "",
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
