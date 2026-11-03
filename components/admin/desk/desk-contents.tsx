import Link from "next/link";
import { TIER_SHORT, type StaffDeskArea, type StaffSectionKey } from "@/lib/staff";
import { cn } from "@/lib/utils";

// A live note that replaces a tool's fixed hint on the contents page, e.g.
// "Round 143 open", or "Failed 1 h ago" in signal orange.
export interface DeskNote {
  text: string;
  tone?: "live" | "bad";
}

// The desk's contents page: the viewer's tools grouped by area, each line a
// link, a dot leader, and the tool's note where a magazine prints the page
// number. Feed it `staffDeskFor(session.membership)`.
export function DeskContents({
  areas,
  notes,
}: {
  areas: StaffDeskArea[];
  notes?: Partial<Record<StaffSectionKey, DeskNote>>;
}) {
  return (
    <nav aria-label="Staff tools">
      {areas.map((area) => (
        <section
          key={area.key}
          aria-labelledby={`desk-${area.key}`}
          className="grid gap-2 border-b border-rule py-4 first:pt-0 last:border-b-0 sm:grid-cols-[11rem_minmax(0,1fr)] sm:gap-5"
        >
          <div>
            <h2 id={`desk-${area.key}`} className="font-headline text-[1.9rem]">
              {area.label}
            </h2>
            <span className="font-label mt-1.5 block text-[0.72rem] tracking-[0.08em] text-paper-mute">
              {TIER_SHORT[area.tier]}
            </span>
          </div>
          <ul className="grid gap-x-7 gap-y-1 sm:grid-cols-2">
            {area.sections.map((section) => {
              const note = notes?.[section.key];
              return (
                <li
                  key={section.key}
                  className={cn(
                    "flex min-w-0 items-baseline gap-2 py-1",
                    section.wide && "sm:col-span-2",
                  )}
                >
                  <Link
                    href={section.href}
                    className="font-semibold text-paper transition-colors hover:text-highlight sm:whitespace-nowrap"
                  >
                    {section.label}
                  </Link>
                  <span
                    aria-hidden
                    className="min-w-4 flex-1 -translate-y-1 border-b-[1.5px] border-dotted border-rule-strong"
                  />
                  <span
                    className={cn(
                      "font-label text-[0.78rem] whitespace-nowrap text-paper-mute",
                      note?.tone === "live" && "text-paper",
                      note?.tone === "bad" && "text-destructive",
                    )}
                  >
                    {note?.text ?? section.hint}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </nav>
  );
}
