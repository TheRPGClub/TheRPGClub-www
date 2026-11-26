import type { Tier } from "@/lib/members/members-wall";
import { MemberDot } from "./member-dot";

// One tier: its name and count on the left (above on phones), then its
// members as a wrapping row of avatars, every one drawn alike.

export function TierRow({ tier }: { tier: Tier }) {
  const n = tier.members.length;
  const id = `tier-${tier.key}`;

  return (
    <section
      aria-labelledby={id}
      className="grid gap-3 border-b border-border py-5 md:grid-cols-[11rem_1fr] md:gap-6 md:py-6"
    >
      <div className="flex items-baseline gap-3 md:block">
        <h2 id={id} className="font-headline text-3xl leading-none">
          {tier.title}
        </h2>
        <p className="font-label text-[0.8rem] text-faint-foreground md:mt-2">
          {n} {n === 1 ? "member" : "members"}
        </p>
      </div>
      <ul className="flex flex-wrap gap-2 sm:gap-2.5">
        {tier.members.map((member) => (
          <li key={member.userId}>
            <MemberDot member={member} />
          </li>
        ))}
      </ul>
    </section>
  );
}
