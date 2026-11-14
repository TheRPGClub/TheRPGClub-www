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
  // A field in a bar of filters, beside the member pages' selects (the
  // compare page's search): their strong rule.
  | "filter"

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
