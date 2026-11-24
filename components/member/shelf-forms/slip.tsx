"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// The paper slip every shelf form is written on (spec api#451, 2D): Paper
// stock with ink type, an Anton title over a 2px ink rule, the fields, then
// a foot of actions. The Notice Slip's stock; the host sets any tilt.
export function Slip({
  titleId,
  title,
  tag,
  lede,
  onClose,
  onSubmit,
  foot,
  className,
  children,
}: {
  titleId: string;
  title: string;
  // A small ink tag beside the title ("2nd time").
  tag?: string;
  // A line under the rule ("Your 1st: 14 Mar 2019, Main Story on SNES.").
  lede?: React.ReactNode;
  onClose?: () => void;
  onSubmit: () => void;
  foot: React.ReactNode;
  // Placement only.
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <form
      data-slot="shelf-slip"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className={cn("flex flex-col rounded-xs bg-foreground px-5 pt-4.5 pb-4 text-background", className)}
    >
      <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1 border-b-2 border-background pb-2">
        <h2 id={titleId} className="font-headline text-[1.7rem] leading-[0.95] uppercase">
          {title}
        </h2>
        {tag && (
          <span className="font-label self-center rounded-xs bg-background px-1.5 py-1 text-[0.72rem] leading-none font-extrabold tracking-[0.07em] text-foreground uppercase">
            {tag}
          </span>
        )}
        {onClose && (
          <Button type="button" variant="inverse-ghost" size="icon-sm" className="ml-auto self-center" onClick={onClose} aria-label="Close">
            <X aria-hidden />
          </Button>
        )}
      </div>
      {lede && <p className="mt-2 text-[0.88rem] text-background/75 [&_b]:font-semibold [&_b]:text-background">{lede}</p>}
      <div className="mt-3.5 flex flex-1 flex-col gap-3.5">{children}</div>
      <div className="mt-4 flex flex-wrap items-center justify-end gap-2">{foot}</div>
    </form>
  );
}

// A field's caption on the slip, with "optional" in a lighter hand and the
// refusal under the control.
export function SlipField({
  label,
  htmlFor,
  optional,
  error,
  className,
  children,
}: {
  label: string;
  htmlFor?: string;
  optional?: boolean;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const Caption = htmlFor ? "label" : "span";
  return (
    <div className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <Caption
        {...(htmlFor ? { htmlFor } : {})}
        className="font-label text-[0.75rem] leading-none font-extrabold tracking-[0.08em] text-background/72 uppercase"
      >
        {label}
        {optional && <span className="ml-1.5 font-semibold tracking-[0.04em] normal-case">optional</span>}
      </Caption>
      {children}
      {error && <SlipError>{error}</SlipError>}
    </div>
  );
}

// A refusal on the slip: signal orange with its own dark type, which reads
// on paper where orange type wouldn't.
export function SlipError({ children }: { children: React.ReactNode }) {
  return (
    <p role="alert" className="self-start rounded-xs bg-destructive px-1.5 py-0.5 text-[0.8rem] font-semibold text-destructive-foreground">
      {children}
    </p>
  );
}
