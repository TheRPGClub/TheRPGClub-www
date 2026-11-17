import { Slider as SliderPrimitive } from "@base-ui/react/slider"

import { cn } from "@/lib/utils"

// What the slider rates, drawn by each Theme by [data-slot="slider"][data-tone]
// and [data-size] (api ADR-0008). A toned slider is a rating: its track and
// fill read as a ramp in the track's ink.
type SliderTone = "default" | "gotm" | "nr" | "neutral" | "year-ruler"

function Slider({
  className,
  tone = "default",
  size = "default",
  controlClassName,
  trackClassName,
  indicatorClassName,
  thumbClassName,
  defaultValue,
  value,
  min = 0,
  max = 100,
  getAriaLabel,
  getAriaValueText,
  ...props
}: SliderPrimitive.Root.Props &
  Pick<SliderPrimitive.Thumb.Props, "getAriaLabel" | "getAriaValueText"> & {
    // Per-slot layout overrides (sizes, motion), the same escape hatch
    // `progress.tsx` gives its indicator. The look is the tone.
    controlClassName?: string
    trackClassName?: string
    indicatorClassName?: string
    thumbClassName?: string
    tone?: SliderTone
    // A smaller slider (a facet in a scorecard) beside the default one.
    size?: "default" | "sm"
  }) {
  // One thumb per value. A single-value slider is given a number rather than
  // an array, which the registry's version treated as "no value" and rendered
  // two thumbs for.
  const thumbCount = Array.isArray(value)
    ? value.length
    : Array.isArray(defaultValue)
      ? defaultValue.length
      : 1

  return (
    <SliderPrimitive.Root
      className={cn("data-horizontal:w-full data-vertical:h-full", className)}
      data-slot="slider"
      data-tone={tone}
      data-size={size}
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      thumbAlignment="edge"
      {...props}
    >
      <SliderPrimitive.Control
        className={cn(
          "relative flex w-full touch-none items-center select-none data-disabled:opacity-50 data-vertical:h-full data-vertical:min-h-40 data-vertical:w-auto data-vertical:flex-col",
          controlClassName
        )}
      >
        <SliderPrimitive.Track
          data-slot="slider-track"
          className={cn(
            "relative grow overflow-hidden select-none data-horizontal:h-1 data-horizontal:w-full data-vertical:h-full data-vertical:w-1",
            trackClassName
          )}
        >
          <SliderPrimitive.Indicator
            data-slot="slider-range"
            className={cn(
              "select-none data-horizontal:h-full data-vertical:w-full",
              indicatorClassName
            )}
          />
        </SliderPrimitive.Track>
        {Array.from({ length: thumbCount }, (_, index) => (
          <SliderPrimitive.Thumb
            data-slot="slider-thumb"
            key={index}
            // The thumb owns the focusable input, so the accessible name has
            // to reach it rather than the root.
            getAriaLabel={getAriaLabel}
            getAriaValueText={getAriaValueText}
            className={cn(
              "relative block size-3 shrink-0 border transition-[color,box-shadow] select-none after:absolute after:-inset-2 focus-visible:ring-3 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50",
              thumbClassName
            )}
          />
        ))}
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  )
}

export { Slider }
