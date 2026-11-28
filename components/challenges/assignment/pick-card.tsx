import type { PickCard as Card } from "@/lib/challenges/santa-pick";
import { hoursLabel, pickTitle } from "@/lib/challenges/santa-pick";
import { Badge } from "@/components/ui/badge";
import { GameCover } from "@/components/issue/game-cover";
import { cn } from "@/lib/utils";

// The headline steps down with its longest line so it keeps to two lines
// (pickTitle); the comp's 96px for a short one.
const SIZE = {
  xl: "text-[3rem] @4xl:text-[6rem]",
  lg: "text-[2.75rem] @4xl:text-[4.75rem]",
  md: "text-[2.5rem] @4xl:text-[4rem]",
  sm: "text-[2.25rem] @4xl:text-[3.25rem]",
};

// The deal card (surface brief challenges-santa-pick, 6C with 6A's tag): one
// game of the recipient's backlog over its key art (the tint without art)
// under the scrim from the left: where it sits in the backlog, the two-line
// headline, fact chips, HowLongToBeat's time and the actions. At the right
// the cover leans at 3deg with the name tag hanging off it on a tinsel
// string. Narrower than 56rem it stacks: the cover, the tag below it, then
// the words. The card is keyed by game so a new deal fades in.
export function PickCard({
  card,
  position,
  tag,
  actions,
  swipe,
}: {
  card: Card;
  position: string;
  tag: React.ReactNode;
  actions: React.ReactNode;
  swipe: React.HTMLAttributes<HTMLDivElement>;
}) {
  const hours = hoursLabel(card.hours);
  const title = pickTitle(card.title);
  return (
    <div className="@container">
      <article
        aria-roledescription="dealt game"
        aria-label={card.title}
        data-slot="pick-card"
        className="relative overflow-hidden rounded-md bg-(--challenge-tint) @4xl:min-h-[460px]"
        {...swipe}
      >
        {card.artUrl && (
          // eslint-disable-next-line @next/next/no-img-element -- remote game art from the API's image hosts, which next/image isn't configured for
          <img
            key={`art-${card.gameId}`}
            src={card.artUrl}
            alt=""
            className="absolute inset-0 size-full object-cover motion-safe:animate-in motion-safe:fade-in-0 motion-safe:duration-500"
          />
        )}
        <div
          aria-hidden
          data-slot="pick-card-scrim"
          className="absolute inset-0 bg-linear-to-b from-background/45 to-background/95 @4xl:bg-linear-to-r @4xl:from-background/96 @4xl:via-background/85 @4xl:via-42% @4xl:to-background/10"
        />
        <div data-slot="pick-card-media" className="relative flex flex-col items-center gap-6 px-4 pt-6 @4xl:absolute @4xl:inset-y-0 @4xl:right-0 @4xl:block @4xl:w-[490px] @4xl:p-0">
          <GameCover
            key={card.gameId}
            title={card.title}
            coverUrl={card.coverUrl}
            className="w-[160px] @4xl:absolute @4xl:top-[46px] @4xl:right-[250px] @4xl:w-[220px]"
            fallbackClassName="text-[1.6rem] p-4 @4xl:text-[2rem]"
          />
          <svg
            aria-hidden
            data-slot="pick-card-string"
            viewBox="0 0 220 120"
            className="pointer-events-none absolute top-9 right-[120px] z-10 hidden h-[120px] w-[220px] @4xl:block"
          >
            <path d="M8,14 C70,4 120,40 150,96" fill="none" stroke="var(--color-tinsel)" strokeWidth="2.5" />
            <path d="M8,14 C70,4 120,40 150,96" fill="none" stroke="var(--color-background)" strokeWidth="1" strokeDasharray="2 5" opacity=".45" />
          </svg>
          <div className="z-20 @4xl:absolute @4xl:top-[118px] @4xl:right-9">{tag}</div>
        </div>
        <div
          key={`words-${card.gameId}`}
          className="relative z-10 flex flex-col px-4 pt-7 pb-5 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:duration-300 @4xl:min-h-[460px] @4xl:max-w-[calc(100%-470px)] @4xl:p-8 @4xl:pb-[30px] @6xl:max-w-[600px]"
        >
          <p className="font-label text-[0.875rem] font-extrabold tracking-[0.1em] text-dim-foreground">{position}</p>
          <h2
            className={cn("font-headline mt-2 mb-3.5 leading-[0.9] text-balance break-words", SIZE[title.size])}
          >
            {title.lines[0] && <span className="block">{title.lines[0]}</span>}
            <span className="block">{title.lines[1]}</span>
          </h2>
          {(card.year || card.platforms.length > 0) && (
            <div className="flex flex-wrap gap-1.5">
              {card.year && <Badge>{card.year}</Badge>}
              {card.platforms.map((p) => (
                <Badge key={p}>{p}</Badge>
              ))}
            </div>
          )}
          <dl className="mt-[18px] mb-6">
            <div className="flex flex-col-reverse">
              <dt className="font-label text-[0.75rem] leading-[1.3] tracking-[0.08em] text-dim-foreground">
                {hours ? "To beat · HowLongToBeat" : "No HowLongToBeat time yet"}
              </dt>
              {hours && <dd className="font-headline text-[2.125rem] leading-[0.9]">{hours}</dd>}
            </div>
          </dl>
          <div className="mt-auto">{actions}</div>
        </div>
      </article>
    </div>
  );
}
