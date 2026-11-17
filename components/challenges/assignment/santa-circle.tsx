import { memberAvatar, memberName } from "@/lib/challenges/runs";
import { RING, santaCircle, yourSanta } from "@/lib/challenges/santa-circle";
import type { EditionAssignment } from "@/lib/challenges/types";
import { cn } from "@/lib/utils";
import { MemberMark } from "@/components/challenges/host-badge";

const STROKE = {
  finished: "stroke-holly",
  expired: "stroke-faint-foreground",
  other: "stroke-faint-foreground",
};

// The Santa circle (surface brief challenges-assignment, 4D as an accent),
// shown once the Edition ends: every member's mark seated round a 260px ring
// in draw order, the viewer's with the yellow ring; inside, an arrow from
// each Santa to the member they picked for, holly where that Run Finished,
// mute paper otherwise, dashed for a random pick. The arrows draw in once.
export function SantaCircle({ assignments, viewerId }: { assignments: EditionAssignment[]; viewerId: string }) {
  const { seats, arrows, seatSize } = santaCircle(assignments, viewerId);
  const santa = yourSanta(assignments, viewerId);
  return (
    <figure className="m-0 space-y-3">
      <div className="relative mx-auto" style={{ width: RING, height: RING }}>
        <svg width={RING} height={RING} viewBox={`0 0 ${RING} ${RING}`} aria-hidden className="absolute inset-0">
          <defs>
            {(["finished", "other"] as const).map((tone) => (
              <marker
                key={tone}
                id={`santa-arrow-${tone}`}
                viewBox="0 0 10 10"
                refX="7"
                refY="5"
                markerWidth="5"
                markerHeight="5"
                orient="auto"
              >
                <path d="M0,0 L10,5 L0,10z" className={tone === "finished" ? "fill-holly" : "fill-faint-foreground"} />
              </marker>
            ))}
          </defs>
          <circle cx={RING / 2} cy={RING / 2} r={104} fill="none" strokeWidth={1.5} className="stroke-border" />
          {arrows.map((arrow) => (
            <path
              key={arrow.from}
              d={arrow.d}
              fill="none"
              strokeWidth={2.5}
              pathLength={arrow.dashed ? undefined : 1}
              strokeDasharray={arrow.dashed ? "2 2" : 1}
              markerEnd={`url(#santa-arrow-${arrow.tone === "finished" ? "finished" : "other"})`}
              className={cn(
                STROKE[arrow.tone],
                arrow.dashed
                  ? "motion-safe:animate-[arrow-fade_600ms_ease-out_both]"
                  : "motion-safe:animate-[arrow-draw_600ms_ease-out_both]",
              )}
            />
          ))}
        </svg>
        {seats.map((seat) => (
          <span
            key={seat.member.user_id}
            title={memberName(seat.member)}
            className={cn(
              "absolute -translate-x-1/2 -translate-y-1/2 rounded-full",
              seat.mine
                ? "shadow-[0_0_0_2px_var(--color-card),0_0_0_4px_var(--color-highlight)]"
                : "shadow-[0_0_0_2px_var(--color-card)]",
            )}
            style={{ left: seat.x, top: seat.y }}
          >
            <MemberMark name={memberName(seat.member)} src={memberAvatar(seat.member)} size={seatSize} />
          </span>
        ))}
        <p className="absolute top-1/2 left-1/2 m-0 -translate-1/2 text-center">
          <b className="font-headline block text-[2.875rem] leading-[0.8] font-normal text-(--challenge-tint-hi)">
            {seats.length}
          </b>
          <span className="font-label text-[0.72rem] leading-[1.25] tracking-[0.08em] text-dim-foreground">
            Santas
            <br />
            revealed
          </span>
        </p>
      </div>
      <figcaption className="space-y-2.5">
        <span className="flex flex-wrap gap-x-3 gap-y-1.5 text-[0.8rem] text-dim-foreground">
          <Key className="border-holly">Finished</Key>
          <Key className="border-faint-foreground">Expired</Key>
          <Key className="border-dashed border-faint-foreground">Random pick</Key>
        </span>
        <span className="block text-[0.92rem] leading-[1.45] text-dim-foreground">
          Each arrow runs from a Santa to the member they picked for.
          {santa && ` Your Santa was ${memberName(santa)}.`}
        </span>
      </figcaption>
    </figure>
  );
}

function Key({ children, className }: { children: React.ReactNode; className: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <i aria-hidden className={cn("inline-block w-4 border-t-[3px]", className)} />
      {children}
    </span>
  );
}
