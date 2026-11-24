"use client"

import * as React from "react"
import { DayPicker, type DayButtonProps } from "react-day-picker"
import { ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon } from "lucide-react"

import { cn } from "@/lib/utils"

// The shadcn calendar (react-day-picker), one month at day precision (spec
// api#451). Its look is the Theme's (api ADR-0008): every part carries a
// data-slot, and a day button carries a data attribute for each modifier it
// has (data-selected, data-today, data-outside, data-disabled, and any
// custom modifier the caller passes, such as data-span for the days between
// two picked ones, or data-anchor for the other end of that span).

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  heading,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  // A small line above the month's name (what is being picked: "Started").
  heading?: React.ReactNode
}) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      weekStartsOn={1}
      className={cn("group/calendar w-full", className)}
      classNames={{
        root: "w-full",
        months: "relative flex flex-col",
        month: "flex w-full flex-col gap-1.5",
        nav: "absolute top-0 right-0 flex items-center gap-0.5",
        month_caption: "flex min-h-10 w-full items-end pr-18",
        month_grid: "w-full border-collapse",
        weekdays: "grid grid-cols-7 gap-0.5",
        week: "mt-0.5 grid grid-cols-7 gap-0.5",
        day: "relative p-0 text-center",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Root: ({ className, rootRef, ...props }) => (
          <div data-slot="calendar" ref={rootRef} className={className} {...props} />
        ),
        MonthCaption: ({ calendarMonth, displayIndex, children, ...props }) => {
          // Day-picker's own props, not the element's.
          void calendarMonth
          void displayIndex
          return (
            <div data-slot="calendar-caption" {...props}>
              <div className="flex min-w-0 flex-col gap-1">
                {heading && <span data-slot="calendar-heading">{heading}</span>}
                {children}
              </div>
            </div>
          )
        },
        CaptionLabel: (props) => <span data-slot="calendar-caption-label" {...props} />,
        PreviousMonthButton: (props) => <CalendarNavButton {...props} />,
        NextMonthButton: (props) => <CalendarNavButton {...props} />,
        Chevron: ({ className, orientation }) => {
          const Icon =
            orientation === "left" ? ChevronLeftIcon : orientation === "right" ? ChevronRightIcon : ChevronDownIcon
          return <Icon aria-hidden className={cn("size-4", className)} />
        },
        Weekday: (props) => <th data-slot="calendar-weekday" {...props} className="py-1" />,
        DayButton: CalendarDayButton,
        ...components,
      }}
      {...props}
    />
  )
}

function CalendarNavButton({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      data-slot="calendar-nav"
      className={cn(
        "inline-flex size-8 items-center justify-center outline-none focus-visible:ring-3 focus-visible:ring-ring/50 aria-disabled:pointer-events-none",
        className
      )}
      {...props}
    />
  )
}

function CalendarDayButton({ className, day, modifiers, ...props }: DayButtonProps) {
  void day
  const ref = React.useRef<HTMLButtonElement>(null)
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])

  // data-selected, data-today, data-span... for each modifier the day has.
  const flags = Object.fromEntries(
    Object.entries(modifiers)
      .filter(([name, on]) => on && name !== "focused")
      .map(([name]) => [`data-${name.replaceAll("_", "-")}`, ""])
  )

  return (
    <button
      ref={ref}
      type="button"
      data-slot="calendar-day"
      {...flags}
      className={cn(
        "relative flex h-9 w-full items-center justify-center outline-none focus-visible:z-10 focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none",
        className
      )}
      {...props}
    />
  )
}

export { Calendar, CalendarDayButton }
