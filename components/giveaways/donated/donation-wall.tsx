import type { GameKey } from "@/lib/api/types";
import { DonationGift } from "@/components/giveaways/donated/donation-gift";

const WALL = "grid grid-cols-2 gap-x-5 gap-y-9 sm:grid-cols-[repeat(auto-fill,minmax(11.5rem,1fr))]";

// The member's donations as a wall like the shelf's: the ones still waiting,
// tied, first; then, past a rule, the ones members claimed, ribbon cut and
// greyed out. Keys come in that order (donationsInOrder).
export function DonationWall({ keys, names }: { keys: GameKey[]; names: Record<string, string> }) {
  const waiting = keys.filter((k) => !k.claimed_by_user_id);
  const given = keys.filter((k) => k.claimed_by_user_id);
  return (
    <div className="space-y-12">
      {waiting.length > 0 ? (
        <ul className={WALL}>
          {waiting.map((k) => (
            <DonationGift key={k.key_id} gameKey={k} claimerName="" />
          ))}
        </ul>
      ) : (
        <p className="text-faint-foreground">Every key you donated has been claimed. Nothing of yours is waiting.</p>
      )}
      {given.length > 0 && (
        <section aria-labelledby="donated-claimed">
          <h2
            id="donated-claimed"
            className="font-label mb-6 flex items-center gap-3 text-[0.82rem] font-extrabold text-faint-foreground"
          >
            Already claimed · {given.length}
            <i aria-hidden className="h-px flex-1 bg-border-strong" />
          </h2>
          <ul className={WALL}>
            {given.map((k) => (
              <DonationGift
                key={k.key_id}
                gameKey={k}
                claimerName={names[k.claimed_by_user_id ?? ""] ?? "a member"}
              />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
