"use client"

import { Switch as SwitchPrimitive } from "@base-ui/react/switch"
import { cn } from "@/lib/utils"

// What the switch is, drawn by each Theme by [data-slot="switch"]
// [data-variant] (api ADR-0008).
type SwitchVariant =
  // A switch on its own.
  | "default"
  // www#100: a settings switch whose state is spelled out beside it, both
  // inside one <label> that draws the focus ring and passes its hover to the
  // track (a Feature Preference, a News Category).
  | "labelled"

function Switch({
  className,
  size = "default",
  variant = "default",
  ...props
}: SwitchPrimitive.Root.Props & {
  // lg is the settings switch (a Feature Flag, a News Category).
  size?: "sm" | "default" | "lg"
  variant?: SwitchVariant
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      data-variant={variant}
      className={cn(
        "peer group/switch relative inline-flex shrink-0 items-center border transition-all outline-none after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-[size=default]:h-[18.4px] data-[size=default]:w-[32px] data-[size=sm]:h-[14px] data-[size=sm]:w-[24px] data-[size=lg]:h-6 data-[size=lg]:w-11 dark:aria-invalid:ring-destructive/40 data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block transition-transform group-data-[size=default]/switch:size-4 group-data-[size=sm]/switch:size-3 group-data-[size=lg]/switch:mx-0.5 group-data-[size=lg]/switch:size-[18px] group-data-[size=lg]/switch:data-checked:translate-x-5 group-data-[size=default]/switch:data-checked:translate-x-[calc(100%-2px)] group-data-[size=sm]/switch:data-checked:translate-x-[calc(100%-2px)] group-data-[size=default]/switch:data-unchecked:translate-x-0 group-data-[size=sm]/switch:data-unchecked:translate-x-0"
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
