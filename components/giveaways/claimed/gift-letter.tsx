import type { CSSProperties } from "react";
import type { GameKey } from "@/lib/api/types";
import { platformFamily, shortDate } from "@/lib/giveaways";
import { GameHeadline } from "@/components/issue/game-cover";
import { BotJobStatus } from "@/components/bot-job-status";
import { WrappedCover } from "@/components/giveaways/wrap/wrapped-cover";
import { LetterKey } from "@/components/giveaways/claimed/letter-key";

const FACT = "font-label text-[0.7rem] font-extrabold text-slip-muted-foreground";

// A claimed key as the unwrapped gift: a paper letter with a torn strip of
// its platform's gift paper across the top, the cover with its ribbon cut,
// the game's headline, the key in a dashed well and a claim stamp.
export function GiftLetter({
  gameKey,
  donorName,
  viewerName,
  jobId,
  justClaimed = false,
}: {
  gameKey: GameKey;
  donorName: string;
  viewerName: string;
  jobId?: number | null;
  justClaimed?: boolean;
}) {
  const ink = platformFamily(gameKey.platform).ink;
  const title = gameKey.game?.title ?? gameKey.game_title;
  const claimedOn = shortDate(gameKey.claimed_at);
  const facts: [string, string][] = [
    ["Platform", gameKey.platform],
    ["Region", gameKey.region],
    ["From", donorName],
    ["Claimed", justClaimed ? "Just now" : claimedOn],
  ];

  return (
    <article
      aria-label={`Your key for ${title}`}
      style={{ "--p": ink } as CSSProperties}
      className="relative overflow-hidden rounded-md bg-foreground pb-8 text-background shadow-[0_24px_60px_rgb(0_0_0/0.6)]"
    >
      <i aria-hidden className="gift-paper block h-11 [clip-path:polygon(0_0,100%_0,100%_60%,96%_95%,91%_62%,85%_92%,79%_58%,72%_96%,65%_60%,58%_90%,51%_62%,44%_94%,37%_58%,30%_88%,23%_60%,16%_96%,9%_62%,4%_90%,0_64%)]" />
      <p className="font-label mx-6 mt-3 border-b-2 border-background pb-2 text-[0.75rem] font-extrabold sm:mx-9">
        The RPG Club bot · to {viewerName}
      </p>
      <div className="mx-6 mt-6 grid gap-7 sm:mx-9 md:grid-cols-[minmax(0,15rem)_minmax(0,1fr)]">
        <WrappedCover title={title} coverUrl={gameKey.game?.cover_url} ink={ink} tied={false} className="w-44 md:w-full" />
        <div className="min-w-0 md:pr-24">
          <GameHeadline title={title} as="h2" className="text-5xl leading-[0.88] sm:text-6xl" />
          <p className="mt-3 max-w-[48ch] text-[0.98rem] text-slip-muted-foreground">
            {`${donorName} donated this key to the club and you claimed it. It's yours to keep.`}
          </p>
          <dl className="mt-5 flex flex-wrap gap-x-7 gap-y-3">
            {facts.map(([label, value]) => (
              <div key={label}>
                <dt className={FACT}>{label}</dt>
                <dd className="font-label text-[1.05rem] font-extrabold">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
      <div className="mx-6 mt-7 sm:mx-9">
        <LetterKey value={gameKey.key_value} platform={gameKey.platform} title={title} revealed={justClaimed} />
        {jobId != null && <BotJobStatus jobId={jobId} what="The DM with your key" className="mt-3" />}
        <p className="mt-4 max-w-[60ch] text-sm text-slip-muted-foreground">
          P.S. The bot also sent this key to your Discord DMs, and it stays here under Your claimed keys.
        </p>
      </div>
      {claimedOn && (
        <span aria-hidden className="absolute top-[5.5rem] right-7 hidden size-24 -rotate-8 place-content-center rounded-full border-[3px] border-background text-center leading-none opacity-85 md:grid">
          <span className="font-label text-[0.7rem] font-extrabold">Claimed</span>
          <span className="font-headline text-[1.6rem]">{claimedOn}</span>
        </span>
      )}
    </article>
  );
}
