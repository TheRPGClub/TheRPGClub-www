"use client"

import { Progress as ProgressPrimitive } from "@base-ui/react/progress"
import { cn } from "@/lib/utils"

// What the bar measures, drawn by each Theme by [data-slot="progress"][data-tone]
// (api ADR-0008).
type ProgressTone =
  | "default"
  // A track's own count (votes, nominations).
  | "gotm"
  | "nr"
  // The Member's own progress toward a call to action (an import).
  | "highlight"
  // A plain count (an Achievement Set, a review score).
  | "neutral"
  // Failures or lost items.
  | "destructive"
  // www#96: a fill the caller sets with --progress-ink (an Achievement
  // Set's game tint, a Rarity tier's ink).
  | "tint"

function Progress({
  className,
  children,
  value,
  tone = "default",
  size = "default",
  indicatorClassName,
  trackClassName,
  ...props
}: ProgressPrimitive.Root.Props & {
  tone?: ProgressTone
  // lg: the thicker bar (an Achievement Set's progress).
  size?: "default" | "lg"
  indicatorClassName?: string
  trackClassName?: string
}) {
  return (
    <ProgressPrimitive.Root
      value={value}
      data-slot="progress"
      data-tone={tone}
      data-size={size}
      className={cn("flex flex-wrap gap-3", className)}
      {...props}
    >
      {children}
      <ProgressTrack className={cn(size === "lg" && "h-2", trackClassName)}>
        <ProgressIndicator className={indicatorClassName} />
      </ProgressTrack>
    </ProgressPrimitive.Root>
  )
}

function ProgressTrack({ className, ...props }: ProgressPrimitive.Track.Props) {
  return (
    <ProgressPrimitive.Track
      className={cn(
        "relative flex h-1 w-full items-center overflow-x-hidden",
        className
      )}
      data-slot="progress-track"
      {...props}
    />
  )
}

function ProgressIndicator({
  className,
  ...props
}: ProgressPrimitive.Indicator.Props) {
  return (
    <ProgressPrimitive.Indicator
      data-slot="progress-indicator"
      className={cn("h-full transition-all", className)}
      {...props}
    />
  )
}

function ProgressLabel({ className, ...props }: ProgressPrimitive.Label.Props) {
  return (
    <ProgressPrimitive.Label
      className={cn("text-sm", className)}
      data-slot="progress-label"
      {...props}
    />
  )
}

function ProgressValue({ className, ...props }: ProgressPrimitive.Value.Props) {
  return (
    <ProgressPrimitive.Value
      className={cn(
        "ml-auto text-sm tabular-nums",
        className
      )}
      data-slot="progress-value"
      {...props}
    />
  )
}

export {
  Progress,
  ProgressTrack,
  ProgressIndicator,
  ProgressLabel,
  ProgressValue,
}
