"use client";

import { usePathname } from "next/navigation";
import { ButtonLink } from "@/components/ui/button";
import type { VotingPhase } from "@/lib/api/voting-round";
import { BURST_POINTS } from "@/components/issue/starburst";
import { isCurrent } from "@/components/shell/nav-items";
import { votingOpen } from "@/components/shell/sidebar-page";

// The round button at the middle of the phone's tab bar: a yellow burst
// standing proud of the bar. While nominations or the vote are open it says
// so and goes straight to the round; between rounds it opens GOTM history.
export function TabRound({ phase }: { phase: VotingPhase | null }) {
  const pathname = usePathname();
  const open = votingOpen(phase);
  const href = open ? "/voting" : "/gotm";
  const [over, word] = open
    ? ["Round open", phase === "nominating" ? "Nominate" : "Vote"]
    : ["This month", "GOTM"];

  return (
    <ButtonLink
      href={href}
      variant="round"
      size="bare"
      aria-current={isCurrent(pathname, href) ? "page" : undefined}
      className="relative -mt-7 grid size-21 place-items-center"
    >
      <svg aria-hidden viewBox="0 0 100 100" className="absolute inset-0 size-full -rotate-6 fill-highlight drop-shadow-[0_6px_12px_rgba(0,0,0,0.5)]">
        <polygon points={BURST_POINTS} />
      </svg>
      <span className="relative grid content-center gap-0.5 text-center text-highlight-foreground">
        <span className="font-label text-[0.58rem] leading-none font-extrabold tracking-[0.08em] uppercase">{over}</span>
        <span className="font-headline text-[1.05rem] leading-none uppercase">{word}</span>
      </span>
    </ButtonLink>
  );
}
