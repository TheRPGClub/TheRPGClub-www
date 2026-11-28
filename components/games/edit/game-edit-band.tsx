import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { GameCover, GameHeadline } from "@/components/issue/game-cover";

// The Game Edit page's band (design www#156, round 3): the game's key art
// under an ink scrim, the way back to the game page, then the cover beside
// the title, and the tab row on the band's foot. On a phone the way back is
// the arrow alone. It bleeds to the content column's edges like the hero.
export function GameEditBand({
  gameId,
  title,
  coverUrl,
  artUrl,
  children,
}: {
  gameId: number;
  title: string;
  coverUrl: string | null;
  artUrl: string | null;
  // The tab row; without one (a Regular) the band closes under the title.
  children?: ReactNode;
}) {
  return (
    <header data-slot="game-edit-band" className="relative isolate bleed -mt-6 overflow-hidden border-b border-border-strong bg-background px-4 pt-3.5 sm:px-7">
      {artUrl && (
        // eslint-disable-next-line @next/next/no-img-element -- remote game art from the API's image hosts, which next/image isn't configured for
        <img src={artUrl} alt="" className="absolute inset-0 -z-20 size-full object-cover object-[60%_30%]" />
      )}
      <div
        aria-hidden
        data-slot="game-edit-band-scrim"
        className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,color-mix(in_oklab,var(--color-background)_96%,transparent)_0%,color-mix(in_oklab,var(--color-background)_80%,transparent)_40%,color-mix(in_oklab,var(--color-background)_20%,transparent)_80%),linear-gradient(0deg,color-mix(in_oklab,var(--color-background)_90%,transparent),transparent_60%)]"
      />
      <Link
        href={`/games/${gameId}`}
        aria-label="Back to the game page"
        className="font-label -ml-1.5 inline-grid size-8 place-items-center text-foreground underline decoration-gotm decoration-2 underline-offset-4 transition-colors hover:text-highlight sm:ml-0 sm:inline-flex sm:size-auto sm:gap-1.5 sm:text-[0.84rem] sm:font-extrabold sm:tracking-[0.07em] [&_svg]:size-5 sm:[&_svg]:size-3.5"
      >
        <ArrowLeft aria-hidden />
        <span className="hidden sm:inline">Game page</span>
      </Link>
      <div className="mt-1.5 grid grid-cols-[auto_minmax(0,1fr)] items-end gap-3 sm:mt-3 sm:gap-4">
        <GameCover
          title={title}
          coverUrl={coverUrl}
          className="w-[46px] shadow-[0_12px_30px_rgb(0_0_0/0.5)] sm:w-16"
          fallbackClassName="text-[0.5rem]"
        />
        <GameHeadline title={title} className="text-[1.75rem] leading-[0.94] sm:text-[2.6rem]" />
      </div>
      <div className={children ? "mt-3 sm:mt-4" : "pb-5"}>{children}</div>
    </header>
  );
}
