"use client"

import { Collapsible as CollapsiblePrimitive } from "@base-ui/react/collapsible"

// What the collapsible is, drawn by each Theme by
// [data-slot="collapsible"][data-variant] (api ADR-0008).
type CollapsibleVariant =
  // A bare disclosure: the Theme leaves it alone.
  | "default"
  // A card that opens in place, its trigger the card's title (an import's
  // other ways to find a game).
  | "card"

function Collapsible({
  variant = "default",
  ...props
}: CollapsiblePrimitive.Root.Props & { variant?: CollapsibleVariant }) {
  return (
    <CollapsiblePrimitive.Root
      data-slot="collapsible"
      data-variant={variant}
      {...props}
    />
  )
}

function CollapsibleTrigger({ ...props }: CollapsiblePrimitive.Trigger.Props) {
  return (
    <CollapsiblePrimitive.Trigger data-slot="collapsible-trigger" {...props} />
  )
}

function CollapsibleContent({ ...props }: CollapsiblePrimitive.Panel.Props) {
  return (
    <CollapsiblePrimitive.Panel data-slot="collapsible-content" {...props} />
  )
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
