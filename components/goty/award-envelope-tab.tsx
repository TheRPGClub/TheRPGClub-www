import type { CSSProperties } from "react";
import type { Envelope } from "@/lib/goty/awards";
import { AWARD_INK } from "@/lib/goty/awards";
import type { GotyAward } from "@/lib/goty/types";
import { TabsTrigger } from "@/components/ui/tabs";

// One Award envelope (the Tabs `envelope` variant): the Award's name in
// Anton, its figure ("2/6", the "/6" faded) and its status in label caps,
// topped by the Award's ink.
export function AwardEnvelopeTab({ award, env }: { award: GotyAward; env: Envelope }) {
  return (
    <TabsTrigger
      value={award.award}
      style={{ "--tab-ink": AWARD_INK[award.award] } as CSSProperties}
      className="grid h-auto grid-cols-1 content-start items-start justify-items-start gap-1.5 px-2 py-2.5 text-left whitespace-normal sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-x-3 sm:gap-y-1.5 sm:px-4 sm:py-3.5"
    >
      <span className="font-headline text-base leading-[0.9] sm:text-2xl">{award.name}</span>
      {env.figure && (
        <span className="font-headline text-[1.7rem] leading-[0.8] sm:col-start-2 sm:row-span-2 sm:row-start-1 sm:self-center sm:text-[2.6rem]">
          {env.figure}
          {env.of && <span className="opacity-55">{env.of}</span>}
        </span>
      )}
      <span className="font-label text-[0.7rem] font-extrabold tracking-[0.08em] uppercase sm:text-[0.82rem]">{env.status}</span>
    </TabsTrigger>
  );
}
