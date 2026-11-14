"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

// What the table is, drawn by each Theme by [data-slot="table"][data-variant]
// (api ADR-0008).
type TableVariant =
  // A ledger on the page.
  | "default"
  // A small table set into a card: a comparison or a short list, its rows
  // not interactive.
  | "inset"
  // The problems inside a destructive notice (a rejected file's rows).
  | "destructive"
  // www#98: a staff desk's ledger whose rows are worked in place (the
  // Feature Flags): rows never light, heads sit on their own rules.
  | "ledger"

function Table({
  className,
  containerClassName,
  variant = "default",
  ...props
}: React.ComponentProps<"table"> & {
  variant?: TableVariant
  // www#98: layout for the scroll container (overflow-visible lets a
  // control's focus ring at the table's edge show).
  containerClassName?: string
}) {
  return (
    <div
      data-slot="table-container"
      className={cn("relative w-full overflow-x-auto", containerClassName)}
    >
      <table
        data-slot="table"
        data-variant={variant}
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </div>
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn("[&_tr]:border-b", className)}
      {...props}
    />
  )
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  )
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "border-t [&>tr]:last:border-b-0",
        className
      )}
      {...props}
    />
  )
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "border-b transition-colors",
        className
      )}
      {...props}
    />
  )
}

// www#98: a column that belongs to a group set apart from the rest of the
// row (the Feature Flags' coverage columns), drawn by each Theme by
// [data-slot="table-head" | "table-cell"][data-variant="grouped"].
type TableColumnVariant = "default" | "grouped"

function TableHead({
  className,
  variant,
  ...props
}: React.ComponentProps<"th"> & { variant?: TableColumnVariant }) {
  return (
    <th
      data-slot="table-head"
      data-variant={variant}
      className={cn(
        "h-10 px-2 text-left align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0",
        className
      )}
      {...props}
    />
  )
}

function TableCell({
  className,
  variant,
  ...props
}: React.ComponentProps<"td"> & { variant?: TableColumnVariant }) {
  return (
    <td
      data-slot="table-cell"
      data-variant={variant}
      className={cn(
        "p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0",
        className
      )}
      {...props}
    />
  )
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("mt-4 text-sm", className)}
      {...props}
    />
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
