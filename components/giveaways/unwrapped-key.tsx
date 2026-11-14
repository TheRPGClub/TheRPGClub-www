"use client";

import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import type { GameKey } from "@/lib/api/types";
import { platformFamily, redeemLink, shortDate } from "@/lib/giveaways";
import { GameCover, GameHeadline } from "@/components/issue/game-cover";
import { Chip } from "@/components/issue/chip";
import { BotJobStatus } from "@/components/bot-job-status";
import { Button, buttonVariants } from "@/components/ui/button";
import { PlatformChip } from "@/components/giveaways/platform-chip";
import { CopyKeyButton } from "@/components/giveaways/copy-key-button";

// A claimed key, unwrapped: the box's lid knocked off, the cover standing
// beside the game's headline and the key in a dashed well, with the bot's DM
// status under it.
export function UnwrappedKey({
  gameKey,
  jobId,
  donorName,
  justClaimed,
  onBack,
}: {
  gameKey: GameKey;
  jobId: number | null;
  donorName: string;
  justClaimed?: boolean;
  onBack?: () => void;
}) {
  const family = platformFamily(gameKey.platform);
  const title = gameKey.game?.title ?? gameKey.game_title;
  const value = gameKey.key_value ?? "";
  const redeem = value ? redeemLink(gameKey.platform, value) : null;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end gap-x-5 gap-y-3 border-b-2 border-foreground pb-3">
        <h1 className="font-headline text-5xl sm:text-6xl">Unwrapped</h1>
        <p className="font-label pb-1 text-sm text-faint-foreground">
          {justClaimed ? "Claimed just now" : `Claimed ${shortDate(gameKey.claimed_at)}`}
        </p>
        <div className="ml-auto pb-1">
          {onBack ? (
            <Button type="button" variant="outline" onClick={onBack}>
              <ArrowLeft data-icon="inline-start" />
              Back to the shelf
            </Button>
          ) : (
            <Link href="/giveaways" className={buttonVariants({ variant: "outline" })}>
              <ArrowLeft data-icon="inline-start" />
              Back to the shelf
            </Link>
          )}
        </div>
      </header>

      <section
        aria-label={`Your key for ${title}`}
        className="grid gap-8 rounded-md border-t-4 bg-card px-5 py-7 sm:px-9 md:grid-cols-[18rem_minmax(0,1fr)] md:gap-10"
        style={{ borderTopColor: family.ink }}
      >
        <div aria-hidden className="relative mx-auto h-[300px] w-[18rem] max-w-full">
          <i
            className="absolute top-1 left-1 h-[46px] w-[15.5rem] -rotate-[14deg] rounded-[3px] shadow-[0_10px_22px_rgb(0_0_0/0.5)] after:absolute after:inset-y-0 after:left-[70%] after:w-3.5 after:bg-background/25"
            style={{ background: family.ink }}
          />
          <GameCover
            title={title}
            coverUrl={gameKey.game?.cover_url}
            className="absolute bottom-0 left-7 w-[200px] shadow-[0_18px_40px_rgb(0_0_0/0.55)]"
            fallbackClassName="text-xl"
          />
          <i
            className="absolute right-0 bottom-2.5 h-3.5 w-[90px] rotate-[28deg] rounded-[2px] shadow-[0_3px_6px_rgb(0_0_0/0.45)]"
            style={{ background: family.ink }}
          />
        </div>

        <div className="min-w-0">
          <GameHeadline title={title} as="h2" className="text-5xl leading-[0.9] sm:text-6xl" />
          <div className="mt-3.5 mb-5 flex flex-wrap items-center gap-2">
            <PlatformChip ink={family.ink}>{gameKey.platform}</PlatformChip>
            {gameKey.region !== "Global" && <Chip>{gameKey.region}</Chip>}
            <Chip>From {donorName}</Chip>
            {gameKey.claimed_at && <Chip>Claimed {shortDate(gameKey.claimed_at)}</Chip>}
          </div>

          <p className="font-label mb-1.5 text-sm text-faint-foreground">Your key</p>
          {value ? (
            <div className="flex flex-wrap items-center gap-3 rounded-md border-[1.5px] border-dashed border-border-strong bg-background px-5 py-4">
              <code className="font-label mr-auto text-2xl leading-none tracking-[0.1em] break-all text-foreground normal-case sm:text-[2.1rem]">
                {value}
              </code>
              <CopyKeyButton value={value} />
              {redeem && (
                <a
                  href={redeem.href}
                  target="_blank"
                  rel="noreferrer"
                  className={buttonVariants({ variant: "outline" })}
                >
                  <ExternalLink data-icon="inline-start" />
                  {redeem.label}
                </a>
              )}
            </div>
          ) : (
            <p className="rounded-md border-[1.5px] border-dashed border-border-strong px-5 py-4 text-dim-foreground">
              {"Couldn't read the key just now. It is still yours: find it under Your claimed keys."}
            </p>
          )}

          {jobId != null && (
            <BotJobStatus jobId={jobId} what="The DM with your key" className="mt-4" />
          )}
          <p className="mt-3 text-sm text-faint-foreground">
            The bot also sends this key to your Discord DMs. It stays under{" "}
            <Link href="/giveaways/claimed" className="text-foreground underline decoration-gotm decoration-2 underline-offset-4 hover:text-highlight">
              Your claimed keys
            </Link>
            , so you can come back for it.
          </p>
        </div>
      </section>
    </div>
  );
}
