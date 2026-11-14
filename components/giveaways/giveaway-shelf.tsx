"use client";

import {
  useState,
  useTransition,
  type ComponentProps,
  type CSSProperties,
  type ReactNode,
} from "react";
import Link from "next/link";
import { AlertCircle, Gift, Lock, Undo2 } from "lucide-react";
import { claimKeyAction, revokeKeyAction } from "@/app/actions/giveaways";
import type { GameKey } from "@/lib/api/types";
import {
  CLAIM_REFUSAL_COPY,
  shelfAge,
  tagTilt,
  type KeyBox,
  type PlatformShelf,
} from "@/lib/giveaways";
import { GameCover } from "@/components/issue/game-cover";
import { UnwrappedKey } from "@/components/giveaways/unwrapped-key";
import { PlatformChip } from "@/components/giveaways/platform-chip";
import { cn } from "@/lib/utils";

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
  const [notice, setNotice] = useState<{ title: string; text: string } | null>(
    null,
  );
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

  const revoke = (key: GameKey) => {
    startTransition(async () => {
      const result = await revokeKeyAction(key.key_id);
      if (!result.ok) {
        setNotice({
          title: key.game_title,
          text: result.error ?? "Couldn't take that key off the shelf.",
        });
        return;
      }
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
            <section
              key={shelf.family.key}
              aria-labelledby={`shelf-${shelf.family.key}`}
            >
              <div className="mb-3 flex items-center gap-2.5">
                <h2
                  id={`shelf-${shelf.family.key}`}
                  className="font-headline text-2xl"
                >
                  {shelf.family.label}
                </h2>
                <PlatformChip ink={shelf.family.ink}>
                  {shelf.count} {shelf.count === 1 ? "key" : "keys"}
                </PlatformChip>
              </div>
              <ul
                className="relative flex snap-x gap-[18px] overflow-x-auto border-b-[6px] border-border-strong px-1.5 pt-2.5 [scrollbar-width:thin]"
                style={{ "--p": shelf.family.ink } as CSSProperties}
              >
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
                      onRevoke={revoke}
                    />
                  );
                })}
              </ul>
              <div aria-hidden className="mt-1 h-2 bg-muted" />
            </section>
          ))}
        </div>
        <aside className="space-y-6">
          {notice && (
            <div
              role="alert"
              className="flex items-start gap-2.5 rounded-sm bg-foreground/6 px-3 py-2.5 text-sm text-foreground shadow-[inset_0_0_0_1px_var(--color-border-strong)]"
            >
              <AlertCircle
                aria-hidden
                className="mt-0.5 size-4 shrink-0 text-highlight"
              />
              <p>
                <b>{notice.title}:</b> {notice.text}
              </p>
            </div>
          )}
          {rail}
        </aside>
      </div>
    </div>
  );
}

function GiftBox({
  box,
  open,
  viewerId,
  canClaim,
  canRevokeAny,
  donorName,
  busy,
  disabled,
  onClaim,
  onRevoke,
}: {
  box: KeyBox;
  open: GameKey[];
  viewerId: string;
  canClaim: boolean;
  canRevokeAny: boolean;
  donorName: string;
  busy: boolean;
  disabled: boolean;
  onClaim: (key: GameKey) => void;
  onRevoke: (key: GameKey) => void;
}) {
  // The key the Admin asked to revoke. Keyed by key_id, so once that key is
  // gone the next one in the box asks again.
  const [confirmingKey, setConfirmingKey] = useState<number | null>(null);
  const next = open[0];
  const confirming = next !== undefined && confirmingKey === next.key_id;
  const gone = !next;
  const mine = next?.donor_user_id === viewerId;
  const tilt = tagTilt(box.keys[0].key_id);
  const region = box.region !== "Global" ? ` · ${box.region}` : "";

  return (
    <li className="w-32 shrink-0 snap-start">
      <div className="relative">
        <div className={cn("relative", gone && "brightness-50 grayscale")}>
          <GameCover
            title={box.title}
            coverUrl={box.coverUrl}
            className="w-32"
            fallbackClassName="text-base"
          />
          <i
            aria-hidden
            className="absolute inset-y-0 left-[72%] w-3.5 bg-(--p)"
          />
          <i
            aria-hidden
            className="absolute inset-x-0 top-[62%] h-3.5 bg-(--p)"
          />
          <i
            aria-hidden
            className="absolute top-[calc(62%+7px)] left-[calc(72%+7px)] -mt-[15px] -ml-[15px] size-[30px] rotate-45 rounded-[3px] bg-(--p) shadow-[0_3px_6px_rgb(0_0_0/0.45)] after:absolute after:inset-[9px] after:rounded-[2px] after:bg-background/25"
          />
        </div>
        {open.length > 1 && (
          <span className="font-headline absolute -top-2 -right-1.5 rotate-6 rounded-xs bg-foreground px-1.5 py-px text-[0.95rem] text-background shadow-[0_3px_6px_rgb(0_0_0/0.45)]">
            ×{open.length}
          </span>
        )}
      </div>
      <div
        className={cn(
          "relative mt-2.5 mb-[22px] rounded-sm px-[9px] pt-2 pb-[9px] shadow-[0_3px_8px_rgb(0_0_0/0.45)] before:absolute before:-top-1.5 before:left-1/2 before:-ml-1 before:size-2 before:rounded-full before:bg-background before:shadow-[0_0_0_2px_var(--color-foreground)]",
          gone
            ? "bg-muted text-foreground shadow-[inset_0_0_0_1px_var(--color-destructive)]"
            : "bg-foreground text-background",
        )}
        style={{ transform: `rotate(${tilt}deg)` }}
      >
        <p className="font-headline text-[0.95rem] leading-[0.95]">
          {box.gameId ? (
            <Link href={`/games/${box.gameId}`} className="hover:underline">
              {box.title}
            </Link>
          ) : (
            box.title
          )}
        </p>
        {gone ? (
          <p className="mt-[3px] text-[0.74rem] leading-tight text-destructive">
            Already claimed. Someone got there first.
          </p>
        ) : (
          <p className="mt-[3px] text-[0.74rem] leading-tight text-background/70">
            {mine ? "Your donation" : `From ${donorName}`} ·{" "}
            {shelfAge(next.created_at)}
            {region}
          </p>
        )}
        {gone ? (
          <TagButton disabled className="opacity-50">
            Gone
          </TagButton>
        ) : mine ? (
          <Link
            href="/giveaways/donate"
            className="font-label mt-[7px] flex h-[26px] w-full items-center justify-center gap-1.5 rounded-sm bg-background text-[0.8rem] font-extrabold text-foreground hover:bg-muted"
          >
            Manage
          </Link>
        ) : canClaim ? (
          <TagButton
            disabled={disabled}
            onClick={() => onClaim(next)}
            aria-label={`Claim ${box.title} (${box.platform})`}
          >
            <Gift aria-hidden className="size-3.5" />
            {busy ? "Unwrapping…" : "Claim"}
          </TagButton>
        ) : (
          <>
            <TagButton
              disabled
              className="bg-[#d6d6cf] text-[#55554f]"
              aria-describedby={`why-${box.id}`}
            >
              <Lock aria-hidden className="size-3.5" />
              Claim
            </TagButton>
            <p
              id={`why-${box.id}`}
              className="mt-[7px] text-[0.74rem] leading-tight text-background/75"
            >
              {CLAIM_REFUSAL_COPY.not_member}
            </p>
          </>
        )}
        {!gone && canRevokeAny && !mine && (
          <div className="mt-1.5 text-[0.74rem]">
            {confirming ? (
              <span className="flex flex-wrap items-center gap-x-2">
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => onRevoke(next)}
                  className="font-label font-extrabold text-[oklch(0.55_0.17_52)] hover:underline"
                >
                  Revoke key
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmingKey(null)}
                  className="font-label text-background/70 hover:underline"
                >
                  Keep it
                </button>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmingKey(next.key_id)}
                className="font-label inline-flex items-center gap-1 text-background/70 hover:text-background hover:underline"
              >
                <Undo2 aria-hidden className="size-3" />
                Revoke (Admin)
              </button>
            )}
          </div>
        )}
      </div>
    </li>
  );
}

function TagButton({
  className,
  children,
  ...props
}: ComponentProps<"button">) {
  return (
    <button
      type="button"
      className={cn(
        "font-label mt-[7px] flex h-[26px] w-full items-center justify-center gap-1.5 rounded-sm bg-background text-[0.8rem] font-extrabold text-foreground transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-highlight/50 focus-visible:outline-none disabled:cursor-not-allowed",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
