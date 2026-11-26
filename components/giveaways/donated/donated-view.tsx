import Link from "next/link";
import type { GameKey } from "@/lib/api/types";
import { DonationWall } from "@/components/giveaways/donated/donation-wall";

// Under the Donated tab: the wall of the member's donations, or why there's
// none (null when they couldn't be read).
export function DonatedView({ keys, names }: { keys: GameKey[] | null; names: Record<string, string> }) {
  return (
    <div className="mt-8">
      {keys === null ? (
        <p role="alert" className="text-destructive">
          {"Couldn't load your donations. Refresh to try again."}
        </p>
      ) : keys.length === 0 ? (
        <p className="text-faint-foreground">
          {"You haven't donated a key yet. "}
          <Link
            href="/giveaways/donate"
            className="text-foreground underline decoration-gotm decoration-2 underline-offset-4 hover:text-highlight"
          >
            Wrap one for the shelf
          </Link>
          .
        </p>
      ) : (
        <DonationWall keys={keys} names={names} />
      )}
    </div>
  );
}
