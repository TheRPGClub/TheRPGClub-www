import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { JumpLine } from "@/lib/misprint";

// "Continued on": the magazine's jump lines, one ruled row per page a
// reader can pick up from.
export function JumpLines({ lines }: { lines: readonly JumpLine[] }) {
  return (
    <nav aria-labelledby="continued-on">
      <h2
        id="continued-on"
        className="font-label border-b-2 border-foreground pb-2 text-[0.82rem] font-extrabold tracking-[0.08em] text-faint-foreground uppercase"
      >
        Continued on
      </h2>
      <ul>
        {lines.map((line) => (
          <li key={line.href} className="border-b border-border">
            <Link
              href={line.href}
              className="group/jump grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-4 py-3.5 sm:grid-cols-[11.5rem_minmax(0,1fr)_auto]"
            >
              <span className="font-label text-[1.05rem] font-extrabold tracking-[0.07em] uppercase transition-colors group-hover/jump:text-highlight">
                {line.label}
              </span>
              <span className="col-span-2 row-start-2 text-sm text-faint-foreground sm:col-span-1 sm:row-start-auto">{line.note}</span>
              <ArrowRight
                aria-hidden
                className="col-start-2 row-start-1 size-4.5 self-center text-gotm motion-safe:transition-transform motion-safe:group-hover/jump:translate-x-0.5 sm:col-start-3"
              />
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
