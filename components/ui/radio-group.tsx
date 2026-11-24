"use client"

import { Radio as RadioPrimitive } from "@base-ui/react/radio"
import { RadioGroup as RadioGroupPrimitive } from "@base-ui/react/radio-group"
import { cn } from "@/lib/utils"

function RadioGroup({ className, ...props }: RadioGroupPrimitive.Props) {
  return (
    <RadioGroupPrimitive
      data-slot="radio-group"
      className={cn("grid w-full gap-2", className)}
      {...props}
    />
  )
}

// What the radio is, drawn by each Theme by
// [data-slot="radio-group-item"][data-variant] (api ADR-0008).
type RadioGroupItemVariant =
  // A radio beside its label.
  | "default"
  // The radio of a choice card: the whole card is its label and carries
  // the focus (an import's candidate match).
  | "choice"
  // api#451: the radio of a choice box on a paper slip: an ink ring that
  // fills to a paper dot on the checked (ink) box.
  | "slip"

function RadioGroupItem({
  className,
  variant = "default",
  ...props
}: RadioPrimitive.Root.Props & { variant?: RadioGroupItemVariant }) {
  return (
    <RadioPrimitive.Root
      data-slot="radio-group-item"
      data-variant={variant}
      className={cn(
        "group/radio-group-item peer relative flex aspect-square size-4 shrink-0 border outline-none after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
        variant === "choice" && "size-5",
        className
      )}
      {...props}
    >
      <RadioPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="flex size-4 items-center justify-center"
      >
        <span
          data-slot="radio-group-dot"
          className="absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2"
        />
      </RadioPrimitive.Indicator>
    </RadioPrimitive.Root>
  )
}

export { RadioGroup, RadioGroupItem }
