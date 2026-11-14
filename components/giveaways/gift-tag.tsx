"use client";

import Link from "next/link";
import { Gift, Lock, Undo2 } from "lucide-react";
import type { GameKey } from "@/lib/api/types";
import { CLAIM_REFUSAL_COPY, shelfAge, type KeyBox } from "@/lib/giveaways";
import { Button, ButtonLink } from "@/components/ui/button";
import { RevokeKeyDialog } from "@/components/giveaways/revoke-key-dialog";

const TAG_ACTION = "mt-[7px] flex h-[26px] w-full gap-1.5 px-0 text-[0.8rem]";

// The paper tag tied to a gift box: its title, donor and age, and what the
// viewer can do with it (Claim, Manage their own, or why they can't), plus
// an Admin's revoke. A gone box says so.
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
  const region = box.region !== "Global" ? ` · ${box.region}` : "";
  return (
    <>
      <p className="font-headline text-[0.95rem] leading-[0.95]">
        {box.gameId ? (
          <Link href={`/games/${box.gameId}`} className="hover:underline">
            {box.title}
          </Link>
        ) : (
          box.title
        )}
      </p>
      {!next ? (
        <p className="mt-[3px] text-[0.74rem] leading-tight text-destructive">
          Already claimed. Someone got there first.
        </p>
      ) : (
        <p className="mt-[3px] text-[0.74rem] leading-tight text-background/70">
          {mine ? "Your donation" : `From ${donorName}`} · {shelfAge(next.created_at)}
          {region}
        </p>
      )}
      {!next ? (
        <Button variant="inverse" disabled className={TAG_ACTION}>
          Gone
        </Button>
      ) : mine ? (
        <ButtonLink href="/giveaways/donate" variant="inverse" className={TAG_ACTION}>
          Manage
        </ButtonLink>
      ) : canClaim ? (
        <Button
          variant="inverse"
          disabled={disabled}
          onClick={() => onClaim(next)}
          aria-label={`Claim ${box.title} (${box.platform})`}
          className={TAG_ACTION}
        >
          <Gift aria-hidden className="size-3.5" />
          {busy ? "Unwrapping…" : "Claim"}
        </Button>
      ) : (
        <>
          <Button variant="inverse-locked" disabled aria-describedby={`why-${box.id}`} className={TAG_ACTION}>
            <Lock aria-hidden className="size-3.5" />
            Claim
          </Button>
          <p id={`why-${box.id}`} className="mt-[7px] text-[0.74rem] leading-tight text-background/75">
            {CLAIM_REFUSAL_COPY.not_member}
          </p>
        </>
      )}
      {next && canRevokeAny && !mine && (
        <div className="mt-1.5 text-[0.74rem]">
          <RevokeKeyDialog
            key={next.key_id}
            gameKey={next}
            title={box.title}
            trigger={
              <Button variant="inverse-link" className="h-auto gap-1 p-0 text-[length:inherit] whitespace-normal">
                <Undo2 aria-hidden className="size-3" />
                Revoke (Admin)
              </Button>
            }
          />
        </div>
      )}
    </>
  );
}
