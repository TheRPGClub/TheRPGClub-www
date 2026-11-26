"use client";

import { useState, useTransition, type ReactNode } from "react";
import { claimKeyAction } from "@/app/actions/giveaways";
import type { GameKey } from "@/lib/api/types";
import type { KeyBox } from "@/lib/giveaways";
import { UnwrappedKey } from "@/components/giveaways/unwrapped-key";
import { ShelfNotice } from "@/components/giveaways/shelf-notice";
import { GiftBox } from "@/components/giveaways/gift-box";

export interface GiveawayShelfProps {
  // Every box on show, in platform order.
  boxes: KeyBox[];
  viewerId: string;
  // The Members role: the API lets only its holders claim.
  canClaim: boolean;
  // Admin or Superadmin: may revoke any key.
  canRevokeAny: boolean;
  // user_id -> display name.
  names: Record<string, string>;
  // The page header and platform tabs, replaced by the key panel on a claim.
  header: ReactNode;
  // The counter along the foot (your keys, your donations, Donate).
  counter: ReactNode;
  // Shown when the filter leaves no boxes.
  emptyCopy: string;
}

interface Claimed {
  key: GameKey;
  jobId: number | null;
  donorName: string;
}

// The shelf: a wall of presents, each game's whole cover tied in its
// platform's ribbon, over the counter. A claim unwraps the box into the
// letter with the key, in place, at once.
export function GiveawayShelf({
  boxes,
  viewerId,
  canClaim,
  canRevokeAny,
  names,
  header,
  counter,
  emptyCopy,
}: GiveawayShelfProps) {
  const [claimed, setClaimed] = useState<Claimed | null>(null);
  // Keys lost in a race (or gone) since the page loaded.
  const [lost, setLost] = useState<ReadonlySet<number>>(new Set());
  const [notice, setNotice] = useState<{ title: string; text: string } | null>(null);
  const [pendingBox, setPendingBox] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const nameOf = (id: string) => names[id] ?? "a member";

  const claim = (box: KeyBox, key: GameKey) => {
    setPendingBox(box.id);
    setNotice(null);
    startTransition(async () => {
      const result = await claimKeyAction(key.key_id);
      setPendingBox(null);
      if (result.ok && result.key) {
        setClaimed({
          key: result.key,
          jobId: result.jobId ?? null,
          donorName: nameOf(result.key.donor_user_id),
        });
        window.scrollTo({ top: 0 });
        return;
      }
      if (result.refusal === "already_claimed" || result.refusal === "gone") {
        setLost((prev) => new Set(prev).add(key.key_id));
      }
      setNotice({
        title: box.title,
        text: result.error ?? "Couldn't claim that key. Try again.",
      });
    });
  };

  if (claimed) {
    return (
      <UnwrappedKey
        gameKey={claimed.key}
        jobId={claimed.jobId}
        donorName={claimed.donorName}
        viewerName={nameOf(viewerId)}
        onBack={() => setClaimed(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {header}
      {notice && <ShelfNotice title={notice.title} text={notice.text} />}
      {boxes.length === 0 ? (
        <p className="rounded-md border border-dashed border-border-strong px-5 py-8 text-faint-foreground">{emptyCopy}</p>
      ) : (
        <ul className="grid grid-cols-2 gap-x-5 gap-y-9 pt-3 sm:grid-cols-[repeat(auto-fill,minmax(11.5rem,1fr))]">
          {boxes.map((box) => {
            const open = box.keys.filter((k) => !lost.has(k.key_id));
            return (
              <GiftBox
                key={box.id}
                box={box}
                open={open}
                viewerId={viewerId}
                canClaim={canClaim}
                canRevokeAny={canRevokeAny}
                donorName={open[0] ? nameOf(open[0].donor_user_id) : ""}
                busy={isPending && pendingBox === box.id}
                disabled={isPending}
                onClaim={(key) => claim(box, key)}
              />
            );
          })}
        </ul>
      )}
      {counter}
    </div>
  );
}
