import type { ReactNode, Ref } from "react";
import type { GameCompletion } from "@/lib/api/types";
import { MemberCover } from "@/components/issue/member-cover";
import { reelFacts } from "@/components/issue/member-completed-reel-entries";
import { cn } from "@/lib/utils";

// The reel's spotlight: the selected completion over its key art, with
// everything the list knows about it. `controls` fills its corner.
export function ReelSpotlight({
  ref,
  current,
  ownerName,
  controls,
}: {
  ref: Ref<HTMLElement>;
  current: GameCompletion;
  ownerName: string;
  controls: ReactNode;
}) {
  const game = current.game;
  const title = game?.title ?? "Unknown game";
  const art = game?.art_url ?? game?.cover_url ?? null;
  const facts = reelFacts(current);

  return (
    <section
      ref={ref}
      aria-label="Selected completion"
      aria-live="polite"
      className="relative isolate grid scroll-mt-20 items-end gap-4 overflow-hidden rounded-md bg-black p-4.5 sm:min-h-[23.75rem] sm:grid-cols-[11rem_1fr] sm:gap-7.5 sm:p-7.5 xl:grid-cols-[14.375rem_1fr_auto]"
    >
      {art && (
        // eslint-disable-next-line @next/next/no-img-element -- remote game art from the API's image hosts, which next/image isn't configured for
        <img
          key={art}
          src={art}
          alt=""
          className="absolute inset-0 -z-20 size-full object-cover object-[50%_30%] motion-safe:animate-in motion-safe:zoom-in-105 motion-safe:duration-700 motion-safe:ease-[cubic-bezier(0.16,1,0.3,1)]"
        />
      )}
      <div
        aria-hidden
        className={cn(
          "absolute inset-0 -z-10",
          art
            ? "bg-[linear-gradient(90deg,color-mix(in_oklab,var(--color-background)_94%,transparent)_0%,color-mix(in_oklab,var(--color-background)_80%,transparent)_45%,color-mix(in_oklab,var(--color-background)_35%,transparent)_100%),linear-gradient(0deg,color-mix(in_oklab,var(--color-background)_85%,transparent),transparent_55%)]"
            : "bg-card",
        )}
      />
      <MemberCover
        game={game}
        title={title}
        className="w-30 shadow-[0_14px_34px_rgb(0_0_0/0.55)] sm:w-full"
        fallbackClassName="text-2xl"
      />
      <div className="min-w-0">
        <h2 className="font-headline max-w-[14ch] text-[2.75rem] leading-[0.88] text-balance break-words sm:text-6xl xl:text-[5.25rem]">
          {title}
        </h2>
        {facts.length > 0 && (
          <dl className="mt-5 flex flex-wrap gap-x-6.5 gap-y-3.5">
            {facts.map((fact) => (
              <div key={fact.small} className="flex flex-col-reverse gap-1">
                <dt className="font-label text-[0.8rem] font-extrabold tracking-[0.08em] text-dim-foreground">
                  {fact.small}
                </dt>
                <dd className="font-headline text-[1.9rem] leading-[0.85] sm:text-[2.5rem]">
                  {fact.big}
                </dd>
              </div>
            ))}
          </dl>
        )}
        {current.note && (
          <blockquote className="mt-4.5 max-w-[52ch] text-base text-foreground italic">
            &ldquo;{current.note}&rdquo;
            <footer className="font-label mt-1 text-xs font-extrabold tracking-[0.1em] text-faint-foreground not-italic">
              {ownerName}&apos;s note
            </footer>
          </blockquote>
        )}
      </div>
      {controls}
    </section>
  );
}
