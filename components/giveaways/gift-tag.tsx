"use client";

import Link from "next/link";
import { Lock, Undo2 } from "lucide-react";
import type { GameKey } from "@/lib/api/types";
import { CLAIM_REFUSAL_COPY, shelfAge, type KeyBox } from "@/lib/giveaways";
import { Button, ButtonLink } from "@/components/ui/button";
import { RevokeKeyDialog } from "@/components/giveaways/revoke-key-dialog";

// Under a present: its name, donor and age, and what the viewer can do with
// it (Claim, Manage their own, or why they can't), plus an Admin's revoke. A
// gone box says so.
export function GiftTag({
  box,
  next,
  mine,
  canClaim,
  canRevokeAny,
  donorName,
  busy,
  disabled,
  onClaim,
}: {
  box: KeyBox;
  // The next key the box gives out; undefined once the box is gone.
  next: GameKey | undefined;
  mine: boolean;
  canClaim: boolean;
  canRevokeAny: boolean;
  donorName: string;
  busy: boolean;
  disabled: boolean;
  onClaim: (key: GameKey) => void;
}) {
  return (
    <div className="mt-3.5">
      <div className="flex items-start gap-3 max-sm:flex-col max-sm:items-stretch max-sm:gap-2">
        <div className="min-w-0 flex-1">
          <p className="font-headline text-[1.15rem] leading-[0.95] text-balance">
            {box.gameId ? (
              <Link href={`/games/${box.gameId}`} className="hover:text-highlight">
                {box.title}
              </Link>
            ) : (
              box.title
            )}
          </p>
          {next ? (
            <p className="font-label mt-1 text-[0.74rem] text-faint-foreground">
              {mine ? "Your donation" : `From ${donorName}`} · {shelfAge(next.created_at)}
            </p>
          ) : (
            <p className="mt-1 text-[0.8rem] leading-tight text-destructive">Someone got there first.</p>
          )}
        </div>
        {!next ? (
          <Button variant="claim" size="sm" disabled>
            Gone
          </Button>
        ) : mine ? (
          <ButtonLink href="/giveaways/donate" variant="outline" size="sm">
            Manage
          </ButtonLink>
        ) : canClaim ? (
          <Button
            variant="claim"
            size="sm"
            disabled={disabled}
            onClick={() => onClaim(next)}
            aria-label={`Claim ${box.title} (${box.platform})`}
          >
            {busy ? "Unwrapping…" : "Claim"}
          </Button>
        ) : (
          <Button variant="claim" size="sm" disabled aria-describedby={`why-${box.id}`}>
            <Lock aria-hidden />
            Claim
          </Button>
        )}
      </div>
      {next && !mine && !canClaim && (
        <p id={`why-${box.id}`} className="mt-1.5 text-[0.78rem] leading-tight text-faint-foreground">
          {CLAIM_REFUSAL_COPY.not_member}
        </p>
      )}
      {next && canRevokeAny && !mine && (
        <RevokeKeyDialog
          key={next.key_id}
          gameKey={next}
          title={box.title}
          trigger={
            <Button variant="destructive-ghost" size="xs" className="mt-1.5">
              <Undo2 aria-hidden />
              Revoke (Admin)
            </Button>
          }
        />
      )}
    </div>
  );
}
