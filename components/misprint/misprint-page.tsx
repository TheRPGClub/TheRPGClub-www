import type { ReactNode } from "react";
import type { JumpLine } from "@/lib/misprint";
import { JumpLines } from "./jump-lines";
import { TornStub } from "./torn-stub";

// A misprinted page of the issue: the torn stub down its gutter, a running
// head, the page's own folio set huge and faint behind it, the headline,
// the "Continued on" rows and the letters page's note pinned beside them.
// The not-found and error pages fill it.
export function MisprintPage({
  folio,
  runningHead,
  headline,
  jumps,
  note,
}: {
  folio: string;
  runningHead: string;
  headline: string;
  jumps: readonly JumpLine[];
  note: ReactNode;
}) {
  return (
    <div data-slot="misprint" className="relative flex min-h-[calc(100svh-3rem)] overflow-hidden">
      <TornStub />
      <div className="relative min-w-0 flex-1 pt-2 pl-5 sm:pl-10 lg:pl-14">
        <p
          aria-hidden
          data-slot="misprint-folio"
          className="font-headline pointer-events-none absolute -top-6 right-0 text-[11rem] leading-[0.8] text-muted select-none sm:text-[18rem] xl:text-[25rem]"
        >
          {folio}
        </p>
        <p className="font-label relative flex items-center gap-2.5 text-[0.78rem] font-extrabold tracking-[0.08em] text-faint-foreground uppercase">
          <span>The RPG Club</span>
          <span aria-hidden className="text-gotm">
            /
          </span>
          <span>{runningHead}</span>
        </p>
        <div className="relative mt-14 grid gap-x-14 gap-y-12 pb-10 lg:mt-24 xl:grid-cols-[minmax(0,1fr)_minmax(0,27rem)]">
          <h1 data-slot="misprint-headline" className="font-headline max-w-[9ch] text-[3.75rem] leading-[0.9] uppercase sm:text-[5.75rem] xl:col-start-1">
            {headline}
          </h1>
          <div className="max-w-[30rem] xl:col-start-2 xl:row-span-2 xl:row-start-1 xl:mt-28">{note}</div>
          <div className="max-w-[45rem] xl:col-start-1">
            <JumpLines lines={jumps} />
          </div>
        </div>
      </div>
    </div>
  );
}
