import type { Tier } from "@/lib/members/member-tiers";
import { TierRow } from "./tier-row";

// The tiers, highest first, each a row of its members' avatars.

export function MemberTiers({ tiers }: { tiers: Tier[] }) {
  return (
    <div data-slot="member-tiers" className="border-t border-border">
      {tiers.map((tier) => (
        <TierRow key={tier.key} tier={tier} />
      ))}
    </div>
  );
}
