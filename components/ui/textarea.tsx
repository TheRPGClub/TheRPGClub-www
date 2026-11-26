import * as React from "react"
import { cn } from "@/lib/utils"

// What the field is, drawn by each Theme by [data-slot="textarea"]
// [data-variant] (api ADR-0008).
type TextareaVariant =
  // A field on the page.
  | "default"
  // A short optional note in a compact form (the reason on a nomination).
  | "note"
  // A field on a page whose work is writing one thing (Suggest something).
  | "compose"
  // www#98: a field set into a panel that already has the field's ground
  // (a nomination's delete reason, in its card).
  | "inset"
  // www#100: the prose of a journal entry in its open editor: the page's
  // ink, the strong rule and the yellow focus.
  | "entry"
  // www#125: a form's lead field set big in the headline face and free to
  // wrap (a Lore Entry's title on the writing desk): no box, a strong rule
  // under it that turns yellow on focus.
  | "headline"
  // www#157: a field holding an edit not saved yet (the Game Edit page's
  // staged changes): the field's look ringed in yellow.
  | "staged"
  // api#451: a field on a paper slip (the shelf forms): a pale field with
  // an ink stroke and an ink focus ring, since yellow on paper fails contrast.
  | "slip"
  // www#226: a field on the Give feedback dialog, stroked in its kind's ink
  // (--k), with the yellow focus.
  | "kind"

function Textarea({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"textarea"> & { variant?: TextareaVariant }) {
  return (
    <textarea
      data-slot="textarea"
      data-variant={variant}
      className={cn(
        "flex field-sizing-content min-h-16 w-full border px-2.5 py-2 text-base transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
