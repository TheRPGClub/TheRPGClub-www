"use client";

import { useState, useTransition, type ReactNode } from "react";
import { claimKeyAction } from "@/app/actions/giveaways";
import type { GameKey } from "@/lib/api/types";
import type { KeyBox, PlatformShelf } from "@/lib/giveaways";
import { UnwrappedKey } from "@/components/giveaways/unwrapped-key";
import { ShelfNotice, ShelfRow } from "@/components/giveaways/shelf-row";
import { GiftBox } from "@/components/giveaways/gift-box";

export interface GiveawayShelfProps {
  shelves: PlatformShelf[];
  viewerId: string;
  // The Members role: the API lets only its holders claim.
  canClaim: boolean;
  // Admin or Superadmin: may revoke any key.
  canRevokeAny: boolean;
  // user_id -> display name.
  names: Record<string, string>;
  // The page header and platform tabs, replaced by the key panel on a claim.
  header: ReactNode;
  // The right-hand rail (donate panel, claimed keys, donations).
  rail: ReactNode;
  // Shown when the filter leaves no shelves.
  emptyCopy: string;
}

interface Claimed {
  key: GameKey;
  jobId: number | null;
  donorName: string;
}

// The prize shelf: each box is a gift-wrapped cover tied in its platform's
// ribbon, with a paper tag carrying its title, donor and Claim. A claim
// unwraps the box into the key panel in place, at once.
export function GiveawayShelf({
  shelves,
  viewerId,
  canClaim,
  canRevokeAny,
  names,
  header,
  rail,
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
        justClaimed
        onBack={() => setClaimed(null)}
      />
    );
  }

  return (
    <div className="space-y-5">
      {header}
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20.5rem]">
        <div className="min-w-0 space-y-9">
          {shelves.length === 0 && (
            <p className="rounded-md border border-dashed border-border-strong px-5 py-8 text-faint-foreground">
              {emptyCopy}
            </p>
          )}
          {shelves.map((shelf) => (
            <ShelfRow key={shelf.family.key} shelf={shelf}>
              {shelf.boxes.map((box) => {
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
            </ShelfRow>
          ))}
        </div>
        <aside className="space-y-6">
          {notice && <ShelfNotice title={notice.title} text={notice.text} />}
          {rail}
        </aside>
      </div>
    </div>
  );
}
