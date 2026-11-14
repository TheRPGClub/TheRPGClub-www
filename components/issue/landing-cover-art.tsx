import type { PublicWinner } from "@/lib/api/types";

// The cover's art: the winner's key art full-bleed (or, without key art, its
// name set huge in the art's place) under the legibility scrim.
export function LandingCoverArt({ lead }: { lead: PublicWinner }) {
  const art = lead.art_url;
  return (
    <>
      {art ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={art}
          alt=""
          className="absolute inset-x-0 top-0 -z-20 h-[32.5rem] w-full object-cover object-[70%_20%] md:h-full md:object-[62%_30%]"
        />
      ) : (
        // No key art: the winner's name, set huge in the art's place.
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 -z-20 flex h-[32.5rem] items-center justify-end overflow-hidden bg-card md:inset-y-0 md:left-[40%] md:h-full"
        >
          <span className="font-headline -mr-[0.06em] max-w-[9ch] text-right text-[7rem] leading-[0.85] text-balance text-muted md:text-[11rem] xl:text-[14rem]">
            {lead.title}
          </span>
        </div>
      )}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 -z-10 h-[32.5rem] bg-[linear-gradient(0deg,var(--color-background)_0%,color-mix(in_oklab,var(--color-background)_92%,transparent)_40%,color-mix(in_oklab,var(--color-background)_10%,transparent)_70%,color-mix(in_oklab,var(--color-background)_50%,transparent)_100%)] md:h-full md:bg-[linear-gradient(90deg,color-mix(in_oklab,var(--color-background)_97%,transparent)_0%,color-mix(in_oklab,var(--color-background)_86%,transparent)_36%,color-mix(in_oklab,var(--color-background)_12%,transparent)_70%,color-mix(in_oklab,var(--color-background)_30%,transparent)_100%),linear-gradient(0deg,var(--color-background)_0%,transparent_34%),linear-gradient(180deg,color-mix(in_oklab,var(--color-background)_70%,transparent)_0%,transparent_22%)]"
      />
    </>
  );
}
