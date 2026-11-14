import * as React from "react"
import { cn } from "@/lib/utils"

// What the field is, drawn by each Theme by [data-slot="textarea"]
// [data-variant] (api ADR-0008).
type TextareaVariant =
  // A field on the page.
  | "default"
  // www#100: the prose of a journal entry in its open editor: the page's
  // ink, the strong rule and the yellow focus.
  | "entry"

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
