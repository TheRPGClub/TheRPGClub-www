"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// Variants name what the label is; each Theme draws them (api ADR-0008).
// Only `default` keeps shadcn's own layout: the others take their layout
// from the caller, as the hand-made labels they replace did.
const labelVariants = cva("", {
  variants: {
    variant: {
      default:
        "flex items-center gap-2 text-sm leading-none select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
      // Wraps a field's caption and its control (or a choice's box and
      // text): no look of its own.
      frame: "",
      // A field's caption, tied by htmlFor or wrapping the control.
      field: "",
      // The caption that titles a small panel (a flag's reason note).
      title: "",
      // A form's one field, its caption set larger (the import forms).
      lead: "",
      // A caption on a light object (the yellow donate panel).
      inverse: "",
      // A checkbox or radio with its text, lighting on hover.
      option: "",
      // A checkbox row set between rules.
      ruled: "",
      // A choice card around its radio (the import candidate).
      choice: "",
      // A choice tile in a row of them, on the muted ground.
      "choice-tile": "",
      // The settings switch with its state text: draws the switch's focus.
      switch: "",
      // A file picker drawn as a field (the hidden file input inside).
      file: "",
      // www#126: a History Event Kind's tile on the History Event desk,
      // around its (visually hidden) radio, in the ink of --ink: outlined
      // with ink type; the checked one fills, lifts and tilts.
      "kind-tile": "",
    },
  },
  defaultVariants: { variant: "default" },
})

function Label({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"label"> & VariantProps<typeof labelVariants>) {
  return (
    <label
      data-slot="label"
      data-variant={variant}
      className={cn(labelVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Label }
