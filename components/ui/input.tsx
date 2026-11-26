import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

// What the field is, drawn by each Theme by [data-slot="input"][data-variant]
// (api ADR-0008).
type InputVariant =
  // A field on the page.
  | "default"
  // A field set into a panel that already has the field's ground.
  | "inset"
  // An inset field that arms a destructive action (a typed-word confirm).
  | "destructive"
  // A field on a light object (the yellow panel).
  | "inverse"
  // A field written on paper (the giveaways' donate label): an ink keyline
  // on the paper itself, no ground of its own.
  | "paper"
  // A field in a bar of filters, beside the member pages' selects (the
  // compare page's search): their strong rule.
  | "filter"
  // A file field: a dropped-in file on the page's ground, its button a
  // small control (an import's CSV upload).
  | "upload"
  // A field you write into, with the strong rule and the yellow focus: a
  // page whose work is writing one thing (Suggest something), the journal
  // catalogue's every-entry search.
  | "compose"
  // www#94: a field inside something that already draws it (a scorecard
  // row's rename, the rating's big readout): no rule, no ground of its own.
  | "bare"
  // A number set into a row (a scorecard's score and weight): no field until
  // hover or focus.
  | "readout"
  // www#98: a form's lead field set big in the headline face (a live
  // event's topic): no box, a strong rule under it that turns yellow on
  // focus.
  | "headline"
  // www#100: a field of a journal entry in its open editor (the title): the
  // page's ink, the strong rule and the yellow focus.
  | "entry"
  // www#157: a field holding an edit not saved yet (the Game Edit page's
  // staged changes): the field's look ringed in yellow.
  | "staged"
  // api#451: a field on a paper slip (the shelf forms): a pale field with
  // an ink stroke and an ink focus ring, since yellow on paper fails contrast.
  | "slip"

function Input({
  className,
  type,
  variant = "default",
  ...props
}: React.ComponentProps<"input"> & { variant?: InputVariant }) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      data-variant={variant}
      className={cn(
        "h-9 w-full min-w-0 border px-3 py-1 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:text-sm focus-visible:ring-2 focus-visible:ring-ring/40 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    />
  )
}

export { Input }
