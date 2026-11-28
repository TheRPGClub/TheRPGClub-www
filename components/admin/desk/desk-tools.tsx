import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { TIER_SHORT, type StaffSection } from "@/lib/staff";
import type { DeskNotes } from "@/lib/staff-desk";
import { cn } from "@/lib/utils";

// A desk tab's tools: each a row with its name, a chip naming who can use
// it (Admins, Superadmins) when that isn't every staff member, one line on
// what it does, and its live note ("Round 143 open", "Failed 1 h ago" in
// signal orange) before the arrow.
export function DeskTools({ sections, notes }: { sections: StaffSection[]; notes: DeskNotes }) {
  return (
    <ul data-slot="desk-tools" className="border-t-2 border-foreground">
      {sections.map((s) => {
        const note = notes[s.key];
        return (
          <li key={s.key} data-slot="desk-tool" className="border-b border-border">
            <Link
              href={s.href}
              className="group/tool grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-5 gap-y-1 py-3.5 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-highlight"
            >
              <span className="font-label flex flex-wrap items-center gap-2 text-[1.05rem] font-bold tracking-[0.06em] transition-colors group-hover/tool:text-highlight">
                {s.label}
                {s.tier !== "moderator" && (
                  <span data-slot="desk-tool-tier" className="px-1 pt-0.5 text-[0.64rem] tracking-[0.08em] text-faint-foreground">
                    {TIER_SHORT[s.tier]}
                  </span>
                )}
              </span>
              <span className="col-start-2 row-span-2 row-start-1 flex items-center gap-3.5">
                {note && (
                  <span
                    className={cn(
                      "font-label text-[0.8rem] font-bold tracking-[0.06em] whitespace-nowrap text-faint-foreground",
                      note.tone === "live" && "text-foreground",
                      note.tone === "bad" && "text-destructive",
                    )}
                  >
                    {note.text}
                  </span>
                )}
                <ArrowRight
                  aria-hidden
                  className="size-4.5 text-faint-foreground transition-[color,translate] group-hover/tool:translate-x-0.5 group-hover/tool:text-foreground motion-reduce:transition-none"
                />
              </span>
              <span className="text-[0.9rem] text-dim-foreground">{s.line}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
