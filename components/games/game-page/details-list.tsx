"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RailHeading } from "@/components/issue/game-rail";

// The facts IGDB keeps on a game shown before "All Details" opens the rest.
const SHOWN = 6;

export interface Fact {
  label: string;
  value: ReactNode;
}

// The row's Details: the first facts as ruled label and value lines, the
// rest behind "All Details" at the heading's right end.
export function DetailsList({ facts }: { facts: Fact[] }) {
  const [open, setOpen] = useState(false);
  const more = facts.length > SHOWN;
  const shown = open || !more ? facts : facts.slice(0, SHOWN);

  return (
    <section aria-labelledby="game-details">
      <RailHeading
        id="game-details"
        title="Details"
        action={
          more && (
            <Button
              variant="rail-link"
              size="bare"
              className="items-center"
              aria-expanded={open}
              aria-controls="game-details-list"
              onClick={() => setOpen(!open)}
            >
              {open ? "Fewer Details" : "All Details"}
              <ChevronDown aria-hidden className={open ? "rotate-180" : undefined} />
            </Button>
          )
        }
      />
      <dl id="game-details-list" className="grid grid-cols-[6.6rem_minmax(0,1fr)] text-[0.88rem]">
        {shown.map((fact) => (
          <div key={fact.label} className="contents">
            <dt className="font-label border-b border-border py-1.5 text-[0.76rem] leading-[1.4] font-extrabold tracking-[0.08em] text-faint-foreground">
              {fact.label}
            </dt>
            <dd className="border-b border-border py-1.5 leading-[1.4] text-foreground">{fact.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
