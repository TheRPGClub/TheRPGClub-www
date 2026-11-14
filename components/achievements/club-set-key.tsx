import { RING_COLORS, fadeSteps, holderOpacity, type SetMember } from "@/lib/achievements/game-page";

// The page's key: whose dot sits where on the ring, and what the fade means.
export function ClubSetKey({
  members,
  rest,
  total,
  viewerId,
}: {
  members: SetMember[];
  rest: number;
  total: number;
  viewerId: string | null;
}) {
  if (total === 0) {
    return (
      <p className="mt-5 border-t border-border pt-4 text-[0.86rem] text-faint-foreground">
        No member has unlocked anything here yet.
      </p>
    );
  }
  return (
    <div className="mt-5 flex flex-col gap-3 border-t border-border pt-4 text-[0.84rem] text-dim-foreground md:flex-row md:flex-wrap md:items-center md:gap-x-8">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <span className="font-label basis-full text-[0.78rem] tracking-[0.08em] text-faint-foreground sm:basis-auto">
          Ring, clockwise from top left
        </span>
        {members.map((m, i) => (
          <span key={m.userId} className="inline-flex items-center gap-1.5">
            <span aria-hidden className="size-2.5 rounded-full" style={{ background: RING_COLORS[i] }} />
            {m.name}
            {m.userId === viewerId && <span className="text-faint-foreground">(you)</span>}
          </span>
        ))}
        {rest > 0 && <span className="text-faint-foreground">+{rest} more on hover</span>}
      </div>
      <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1.5">
        <span className="font-label basis-full text-[0.78rem] tracking-[0.08em] text-faint-foreground sm:basis-auto">
          Unlocked by
        </span>
        {fadeSteps(total).map((n, i) => (
          <span key={n} className="inline-flex items-center gap-1.5">
            <span
              aria-hidden
              className="size-4 rounded-[4px] border-[2.5px] border-foreground bg-muted"
              style={{ opacity: holderOpacity(n, total) }}
            />
            {i === 0 ? `${n} of ${total}` : n}
          </span>
        ))}
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden className="size-4 rounded-[4px] border-[1.5px] border-dashed border-border-strong" />
          Nobody
        </span>
      </div>
    </div>
  );
}
