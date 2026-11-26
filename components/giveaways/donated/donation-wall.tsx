import type { GameKey } from "@/lib/api/types";
import { DonationGift } from "@/components/giveaways/donated/donation-gift";

// The member's donations as a wall like the shelf's, in the order given
// (donationsInOrder): the ones still waiting, tied, first; the ones members
// claimed at the end, greyed out and stamped.
export function DonationWall({ keys, names }: { keys: GameKey[]; names: Record<string, string> }) {
  return (
    <ul className="grid grid-cols-2 gap-x-5 gap-y-9 sm:grid-cols-[repeat(auto-fill,minmax(11.5rem,1fr))]">
      {keys.map((k) => (
        <DonationGift
          key={k.key_id}
          gameKey={k}
          claimerName={k.claimed_by_user_id ? (names[k.claimed_by_user_id] ?? "a member") : ""}
        />
      ))}
    </ul>
  );
}
