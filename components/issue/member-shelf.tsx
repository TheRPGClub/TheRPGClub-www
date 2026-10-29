import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import type { Game } from "@/lib/api/types";
import { cn } from "@/lib/utils";

// The profile's bookcase: every list that isn't being read right now is a
// shelf of closed books. A shelf's label is its link; a spine is a game, its
// cover cropped tall under the title set sideways. Now Playing is the open
// books above the case.

const SPINE_LINK =
  "font-label inline-flex items-center gap-1.5 text-[0.84rem] font-extrabold tracking-[0.08em] text-paper-dim transition-colors hover:text-highlight [&_svg]:size-3.5 [&_svg]:transition-transform hover:[&_svg]:translate-x-0.5";

export function MemberShelf({
  label,
  count,
  blurb,
  links,
  more,
  empty,
  children,
}: {
  label: string;
  count: number;
  blurb?: ReactNode;
  // The shelf's own links ("Open list", "Compare", "Pick one at random").
  links: { href: string; label: string; icon?: ReactNode }[];
  // Remaining items past the spines shown, with where to see them.
  more?: { count: number; href: string };
  empty: string;
  children?: ReactNode;
}) {
  const id = `shelf-${label.toLowerCase().replace(/\W+/g, "-")}`;
  return (
    <section
      aria-labelledby={id}
      className="grid gap-3 border-b-[6px] border-ink-3 pt-5 shadow-[0_1px_0_var(--color-rule)] sm:grid-cols-[10.5rem_1fr] sm:gap-6"
    >
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 sm:flex-col sm:flex-nowrap sm:items-start sm:gap-1.5 sm:pb-4">
        <p className="font-headline text-[2.5rem] leading-[0.82] sm:text-[3.9rem]">
          {count}
        </p>
        <h2 id={id} className="font-headline text-2xl sm:text-[1.65rem]">
          {label}
        </h2>
        {blurb && (
          <p className="hidden text-[0.82rem] leading-snug text-paper-mute sm:block">
            {blurb}
          </p>
        )}
        <div className="ml-auto flex flex-wrap gap-x-4 gap-y-1.5 sm:mt-1 sm:ml-0 sm:flex-col">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className={SPINE_LINK}>
              {link.label}
              {link.icon ?? <ArrowRight aria-hidden />}
            </Link>
          ))}
        </div>
      </div>

      {count > 0 && children ? (
        <div className="flex min-h-0 items-end gap-1 overflow-hidden pt-4 sm:min-h-[15.5rem] sm:pt-0">
          {children}
          {more && more.count > 0 && (
            <div className="flex shrink-0 self-stretch items-end pb-3.5 pl-3 max-sm:hidden">
              <Link href={more.href} className={SPINE_LINK}>
                +{more.count} more
                <ArrowRight aria-hidden />
              </Link>
            </div>
          )}
        </div>
      ) : (
        <p className="self-center pb-5 text-sm text-paper-mute sm:pb-4">
          {empty}
        </p>
      )}
    </section>
  );
}

// A stable, slightly uneven height per game so a shelf doesn't read as a bar
// chart of identical blocks. Decorative only; it encodes nothing.
export function spineHeight(seed: number): number {
  return 218 + ((seed * 37) % 27);
}

export function Spine({
  href,
  game,
  title,
  tag,
  numeral,
  height,
  className,
}: {
  href: string | null;
  game: Game | null | undefined;
  title: string;
  // Small caps at the head of the spine: a month, a platform.
  tag?: string | null;
  // A big numeral at the head instead: a rank.
  numeral?: ReactNode;
  height?: number;
  className?: string;
}) {
  const src = game?.cover_url ?? game?.art_url ?? null;
  const h = height ?? spineHeight(game?.game_id ?? title.length);
  const body = (
    <>
      {src && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          className="absolute inset-0 size-full object-cover opacity-55 saturate-[1.1] transition-opacity duration-300 group-hover/spine:opacity-85"
        />
      )}
      <span
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(90deg,rgb(0_0_0/0.45),transparent_30%,transparent_70%,rgb(0_0_0/0.5))]"
      />
      {numeral != null ? (
        <span className="font-headline absolute inset-x-0 top-2 z-10 text-center text-2xl leading-none">
          {numeral}
        </span>
      ) : (
        tag && (
          <span className="font-label absolute inset-x-0 top-2 z-10 truncate px-0.5 text-center text-[0.66rem] font-extrabold tracking-[0.06em] text-paper-dim">
            {tag}
          </span>
        )
      )}
      <span className="font-headline absolute bottom-3 left-1/2 z-10 max-h-[calc(100%-2.75rem)] sm:max-h-[calc(100%-3.25rem)] -translate-x-1/2 rotate-180 overflow-hidden text-base leading-none text-ellipsis whitespace-nowrap [text-shadow:0_1px_6px_rgb(0_0_0/0.8)] [writing-mode:vertical-rl] sm:text-[1.2rem]">
        {title}
      </span>
    </>
  );
  const cls = cn(
    "group/spine relative block w-11 shrink-0 overflow-hidden rounded-t-[2px] bg-ink-3 transition-transform duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:-translate-y-3.5 focus-visible:-translate-y-3.5 sm:w-13",
    className,
  );
  const style = { height: `calc(${h}px * var(--spine-scale, 1))` };
  return href ? (
    <Link
      href={href}
      title={title}
      className={cn(cls, "[--spine-scale:0.92] sm:[--spine-scale:1]")}
      style={style}
    >
      {body}
    </Link>
  ) : (
    <div
      title={title}
      className={cn(cls, "[--spine-scale:0.92] sm:[--spine-scale:1]")}
      style={style}
    >
      {body}
    </div>
  );
}

// Favorites' top three stand on a podium: first in the middle and highest,
// second and third either side. Everything after sits on the shelf itself.
const PODIUM_ORDER = [1, 0, 2];
const STEP = ["h-14", "h-10", "h-7"];

export function PodiumSpines({
  items,
}: {
  items: { href: string | null; game: Game | null | undefined; title: string }[];
}) {
  return (
    <ol className="contents" aria-label="Top three">
      {PODIUM_ORDER.filter((i) => i < items.length).map((i) => {
        const item = items[i];
        return (
          <li
            key={i}
            className="flex shrink-0 flex-col items-stretch"
          >
            <Spine
              href={item.href}
              game={item.game}
              title={item.title}
              height={206}
            />
            <span
              className={cn(
                "font-headline grid place-items-center border-t-2 border-paper bg-ink-3 text-paper leading-none",
                STEP[i],
                i === 0 ? "text-[1.9rem]" : "text-2xl",
              )}
            >
              <span className="sr-only">Rank </span>
              {i + 1}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
