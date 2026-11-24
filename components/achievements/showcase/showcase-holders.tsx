import type { SetMember } from "@/lib/achievements/game-page";
import { ReviewerAvatar } from "@/components/issue/review-meta";

const SHOWN = 8;

// The foot of a frame's hover card: how many of the set's club members have
// this Achievement, who they are, and, faded, who is still missing it.
export function ShowcaseHolders({ holders, members }: { holders: string[]; members: SetMember[] }) {
  if (members.length === 0) return null;
  const held = new Set(holders);
  const have = members.filter((m) => held.has(m.userId));
  const missing = members.filter((m) => !held.has(m.userId));
  return (
    <div className="flex flex-col gap-2.5 border-t border-border px-3.5 py-3">
      <p className="text-[0.85rem] text-dim-foreground">
        <b className="font-semibold text-foreground">
          {have.length} of {members.length}
        </b>{" "}
        club {members.length === 1 ? "member" : "members"} with this set {have.length === 1 ? "has" : "have"} it
      </p>
      {have.length > 0 && <Names members={have} />}
      {missing.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <span className="font-label text-[0.72rem] tracking-[0.08em] text-faint-foreground">Still missing</span>
          <Names members={missing} faded />
        </div>
      )}
    </div>
  );
}

function Names({ members, faded = false }: { members: SetMember[]; faded?: boolean }) {
  const rest = members.length - SHOWN;
  return (
    <ul className={faded ? "flex flex-wrap gap-x-3 gap-y-1.5 opacity-55" : "flex flex-wrap gap-x-3 gap-y-1.5"}>
      {members.slice(0, SHOWN).map((m) => (
        <li key={m.userId} className="font-label inline-flex items-center gap-1.5 text-[0.78rem] text-foreground">
          <ReviewerAvatar userId={m.userId} name={m.name} size="xs" />
          {m.name}
        </li>
      ))}
      {rest > 0 && <li className="font-label text-[0.78rem] text-faint-foreground">+{rest}</li>}
    </ul>
  );
}
