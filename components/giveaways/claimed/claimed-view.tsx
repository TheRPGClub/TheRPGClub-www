import Link from "next/link";
import type { GameKey } from "@/lib/api/types";
import { EnvelopeStack } from "@/components/giveaways/claimed/envelope-stack";
import { GiftLetter } from "@/components/giveaways/claimed/gift-letter";

// Under the Claimed tab: the envelope stack beside the open letter for the picked
// key (the newest when none is picked). On phones the letter comes first.
export function ClaimedView({
  keys,
  pickedId,
  names,
  viewerName,
}: {
  keys: GameKey[] | null;
  pickedId: number | null;
  names: Map<string, string>;
  viewerName: string;
}) {
  const picked = keys?.find((k) => k.key_id === pickedId) ?? keys?.[0];
  return (
    <div className="mt-8">
      {keys === null ? (
        <p role="alert" className="text-destructive">
          {"Couldn't load your claimed keys. Refresh to try again."}
        </p>
      ) : !picked ? (
        <p className="text-faint-foreground">
          {"You haven't claimed a key yet. "}
          <Link href="/giveaways" className="text-foreground underline decoration-gotm decoration-2 underline-offset-4 hover:text-highlight">
            See the shelf
          </Link>
          .
        </p>
      ) : (
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:gap-10">
          <div className="lg:order-2 lg:sticky lg:top-6">
            <GiftLetter
              key={picked.key_id}
              gameKey={picked}
              donorName={names.get(picked.donor_user_id) ?? "A member"}
              viewerName={viewerName}
            />
          </div>
          <div className="lg:order-1">
            <EnvelopeStack keys={keys} pickedId={picked.key_id} names={names} />
          </div>
        </div>
      )}
    </div>
  );
}
