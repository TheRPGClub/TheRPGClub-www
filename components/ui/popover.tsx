"use client"

import { Popover as PopoverPrimitive } from "@base-ui/react/popover"
import { ChevronDownIcon } from "lucide-react"
import { cn } from "@/lib/utils"

// The shadcn popover (base-nova). Its look (the card, the field trigger) is
// the Theme's, by data-slot and data-variant (api ADR-0008).

function Popover({ ...props }: PopoverPrimitive.Root.Props) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />
}

// `variant="field"` draws the trigger as a select field (the Theme gives it
// the select trigger's look), with the chevron at its end.
function PopoverTrigger({
  className,
  variant = "default",
  children,
  ...props
}: PopoverPrimitive.Trigger.Props & { variant?: "default" | "field" }) {
  return (
    <PopoverPrimitive.Trigger
      data-slot="popover-trigger"
      data-variant={variant}
      className={cn(
        variant === "field" &&
          "flex items-center justify-between gap-1.5 border py-2 pr-2 pl-2.5 text-sm whitespace-nowrap transition-colors outline-none select-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      {children}
      {variant === "field" && (
        <ChevronDownIcon data-slot="popover-trigger-icon" aria-hidden className="pointer-events-none ml-auto size-4" />
      )}
    </PopoverPrimitive.Trigger>
  )
}

function PopoverContent({
  className,
  align = "center",
  alignOffset = 0,
  side = "bottom",
  sideOffset = 4,
  ...props
}: PopoverPrimitive.Popup.Props &
  Pick<
    PopoverPrimitive.Positioner.Props,
    "align" | "alignOffset" | "side" | "sideOffset"
  >) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Positioner
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
        className="isolate z-50"
      >
        <PopoverPrimitive.Popup
          data-slot="popover-content"
          className={cn(
            "z-50 flex w-72 max-w-(--available-width) origin-(--transform-origin) flex-col gap-2.5 border p-2.5 text-sm outline-hidden duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
            className
          )}
          {...props}
        />
      </PopoverPrimitive.Positioner>
    </PopoverPrimitive.Portal>
  )
}

function PopoverTitle({ className, ...props }: PopoverPrimitive.Title.Props) {
  return (
    <PopoverPrimitive.Title
      data-slot="popover-title"
      className={cn("text-xs", className)}
      {...props}
    />
  )
}

function PopoverDescription({
  className,
  ...props
}: PopoverPrimitive.Description.Props) {
  return (
    <PopoverPrimitive.Description
      data-slot="popover-description"
      className={cn("text-xs", className)}
      {...props}
    />
  )
}

export { Popover, PopoverContent, PopoverDescription, PopoverTitle, PopoverTrigger }
