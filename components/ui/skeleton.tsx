import { cn } from "@/lib/utils"

// A placeholder in the shape of what it stands in for, drawn by each Theme by
// [data-slot="skeleton"][data-variant] (api ADR-0008).
type SkeletonVariant =
  // A panel or a block of content.
  | "default"
  // A card, a cover or a tile.
  | "card"
  // A control: a field, a button, a filter row.
  | "control"
  // A line of text or a chip.
  | "text"
  // An edge-to-edge plate: a banner or full-bleed art.
  | "plate"

function Skeleton({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"div"> & { variant?: SkeletonVariant }) {
  return (
    <div
      data-slot="skeleton"
      data-variant={variant}
      className={cn("animate-pulse", className)}
      {...props}
    />
  )
}

export { Skeleton }
