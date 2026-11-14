import * as React from "react"
import { cn } from "@/lib/utils"

// What the panel is, drawn by each Theme by [data-slot="card"][data-variant]
// (api ADR-0008).
type CardVariant =
  // A panel on the page, with its rule.
  | "default"
  // A panel with no rule: paper laid on the page.
  | "paper"
  // The panel being edited or picked right now.
  | "active"
  // A panel over art: put a CardCover (and a CardScrim over it) inside.
  | "cover"

function Card({
  className,
  size = "default",
  variant = "default",
  ...props
}: React.ComponentProps<"div"> & {
  size?: "default" | "sm"
  variant?: CardVariant
}) {
  return (
    <div
      data-slot="card"
      data-size={size}
      data-variant={variant}
      className={cn(
        "group/card flex flex-col gap-(--card-spacing) overflow-hidden border py-(--card-spacing) data-[variant=cover]:relative data-[variant=cover]:isolate text-sm [--card-spacing:--spacing(4)] has-data-[slot=card-footer]:pb-0 has-[>img:first-child]:pt-0 data-[size=sm]:[--card-spacing:--spacing(3)] data-[size=sm]:has-data-[slot=card-footer]:pb-0",
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "group/card-header @container/card-header grid auto-rows-min items-start gap-1 px-(--card-spacing) has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto] [.border-b]:pb-(--card-spacing)",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn(
        "text-base leading-snug group-data-[size=sm]/card:text-sm",
        className
      )}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-sm", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-(--card-spacing)", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex items-center border-t p-(--card-spacing)",
        className
      )}
      {...props}
    />
  )
}

// The art behind a cover card, filling it: put the image (next/image with
// fill, or an <img>) inside.
function CardCover({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-cover"
      className={cn(
        "absolute inset-0 -z-20 *:size-full *:object-cover",
        className
      )}
      {...props}
    />
  )
}

// A decorative scrim between a cover card's art and its type, so the type
// reads. The Theme draws it.
function CardScrim({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-scrim"
      aria-hidden
      className={cn("absolute inset-0 -z-10", className)}
      {...props}
    />
  )
}

export {
  Card,
  CardCover,
  CardScrim,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
