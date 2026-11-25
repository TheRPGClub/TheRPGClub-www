import Link from "next/link";
import type { VotingCategory } from "@/lib/api/types";
import type { RoundRow } from "@/lib/gotm-round";
import type { GotmCardLink } from "@/lib/gotm-links";
import { WinnerMark } from "@/components/issue/browse-winner-mark";
import { OutboundLinks, TRACK_LABEL, UNKNOWN_GAME_TITLE } from "@/components/issue/gotm-shared";
import { cn } from "@/lib/utils";
import { Nominator } from "./round-nominator";

// One winner's half of the Round Page's diptych: key art under a scrim, the
// Category chip, the two-line Anton title and who put it forward. GOTM's
// caption sits left, NR-GOTM's right (`mirrored`), so the pair faces the
// hinge; a Category spanning the row sets every caption left.
export function RoundHeroPanel({
  kind,
  row,
  meta,
  compact,
  links,
  mirrored = kind === "nr_gotm",
}: {
  kind: VotingCategory;
  row: RoundRow;
  // "9 votes · won runoff 6–5", or null without a vote.
  meta: string | null;
  // Co-winners share the half, so the title steps down.
  compact: boolean;
  // Reddit / Thread / Voting results, raised above the panel's link.
  links: GotmCardLink[];
  // Caption and starburst flush right.
  mirrored?: boolean;
}) {
  const title = row.game?.title ?? UNKNOWN_GAME_TITLE;
  // A subtitle takes the second line in the Category's accent; a title
  // without one stays a single line.
  const colon = title.indexOf(":");
  const [lead, tail] = colon > 0 ? [title.slice(0, colon + 1), title.slice(colon + 1).trim()] : [title, ""];
  const art = row.game?.art_url ?? row.game?.cover_url;
  const nr = kind === "nr_gotm";

  return (
    <article
      className={cn(
        "group/panel relative isolate flex min-h-56 flex-1 overflow-hidden rounded-sm bg-muted after:absolute after:inset-x-0 after:bottom-0 after:z-10 after:h-1",
        nr ? "after:bg-nr" : "after:bg-gotm",
      )}
    >
      {art && (
        // eslint-disable-next-line @next/next/no-img-element -- remote game art from the API's image hosts, which next/image isn't configured for
        <img src={art} alt="" className="absolute inset-0 -z-20 size-full object-cover" />
      )}
      <span
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(0deg,color-mix(in_oklab,var(--color-background)_94%,transparent)_0%,color-mix(in_oklab,var(--color-background)_62%,transparent)_45%,color-mix(in_oklab,var(--color-background)_8%,transparent)_85%)]"
      />
      <WinnerMark
        track={kind}
        className={cn("absolute top-3 size-14 md:size-16", mirrored ? "right-3" : "left-3")}
      />
      {row.gameId && (
        <Link
          href={`/games/${row.gameId}`}
          aria-label={`View ${title}`}
          className="absolute inset-0 z-10 focus-visible:ring-2 focus-visible:ring-foreground focus-visible:outline-none focus-visible:ring-inset"
        />
      )}
      <div className={cn("mt-auto w-full px-3 pt-20 pb-4 md:px-5 md:pb-5", mirrored && "text-right")}>
        <span
          className={cn(
            "font-label mb-2 inline-block rounded-xs px-1.75 py-0.5 text-[0.75rem] font-extrabold tracking-[0.14em] uppercase",
            nr ? "bg-nr text-nr-foreground" : "bg-gotm text-gotm-foreground",
          )}
        >
          {TRACK_LABEL[kind]}
          <span className="max-md:hidden"> winner</span>
        </span>
        <h2
          className={cn(
            "font-headline leading-[1.02] uppercase text-balance",
            compact ? "text-[1.25rem] md:text-[1.75rem]" : "text-[1.25rem] md:text-[2.5rem]",
          )}
        >
          <span className="block">{lead}</span>
          {tail && <span className={cn("block", nr ? "text-nr-soft" : "text-highlight")}>{tail}</span>}
        </h2>
        <RoundHeroCredit row={row} meta={meta} mirrored={mirrored} />
        <OutboundLinks links={links} className={cn("mt-2", mirrored && "-mr-1 ml-0 justify-end")} />
      </div>
    </article>
  );
}

function RoundHeroCredit({ row, meta, mirrored }: { row: RoundRow; meta: string | null; mirrored: boolean }) {
  const reason = row.nomination?.reason?.trim();
  return (
    <>
      {(row.nomination || meta) && (
        <p className="font-label relative z-20 mt-2.5 text-[0.8rem] font-semibold tracking-[0.1em] text-dim-foreground uppercase">
          {row.nomination && (
            <span className="max-md:hidden">
              Nominated by <Nominator user={row.nomination.user} strong />
            </span>
          )}
          {row.nomination && meta && <span className="max-md:hidden"> · </span>}
          {meta && <span className="text-foreground">{meta}</span>}
        </p>
      )}
      {reason && (
        <p
          className={cn(
            "mt-1.5 line-clamp-2 max-w-[26rem] text-[0.875rem] leading-snug text-dim-foreground max-md:hidden",
            mirrored && "ml-auto",
          )}
        >
          {reason}
        </p>
      )}
    </>
  );
}
