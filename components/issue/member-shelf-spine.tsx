import Link from "next/link";
import type { ReactNode } from "react";
import type { Game } from "@/lib/api/types";
import { cn } from "@/lib/utils";

// A spine on the profile's bookcase: a game, its cover cropped tall under
// the title set sideways.

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
  lift,
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
  // What the paper tag shows when the spine lifts (the profile's hours and
  // a date or platform); a shelf row that hangs tags reads it (SpineLiftRow).
  lift?: { hours: string; sub: string | null };
  className?: string;
}) {
  const src = game?.cover_url ?? game?.art_url ?? null;
  const h = height ?? spineHeight(game?.game_id ?? title.length);
  const body = (
    <>
      {src && (
        // eslint-disable-next-line @next/next/no-img-element -- remote game art from the API's image hosts, which next/image isn't configured for
        <img
          src={src}
          alt=""
          className="absolute inset-0 size-full object-cover opacity-55 saturate-[1.1] transition-opacity duration-300 group-hover/spine:opacity-85 group-data-lifted/spine:opacity-85"
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
          <span className="font-label absolute inset-x-0 top-2 z-10 truncate px-0.5 text-center text-[0.66rem] font-extrabold tracking-[0.06em] text-dim-foreground">
            {tag}
          </span>
        )
      )}
      <span className="font-headline absolute bottom-3 left-1/2 z-10 max-h-[calc(100%-2.75rem)] sm:max-h-[calc(100%-3.25rem)] -translate-x-1/2 rotate-180 overflow-hidden text-base leading-none text-ellipsis whitespace-nowrap [text-shadow:0_1px_6px_rgb(0_0_0/0.8)] [writing-mode:vertical-rl] sm:text-[1.2rem]">
        {title}
      </span>
      {lift && <span className="sr-only">, {lift.hours}</span>}
    </>
  );
  const cls = cn(
    "group/spine relative block w-11 shrink-0 overflow-hidden rounded-t-[2px] bg-muted motion-safe:transition-transform duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] motion-safe:hover:-translate-y-3.5 motion-safe:focus-visible:-translate-y-3.5 motion-safe:data-lifted:-translate-y-3.5 data-lifted:shadow-[0_12px_30px_rgb(0_0_0/0.5)] sm:w-13",
    className,
  );
  const style = { height: `calc(${h}px * var(--spine-scale, 1))` };
  const data = lift
    ? {
        "data-spine": "",
        "data-lift-title": title,
        "data-lift-hours": lift.hours,
        "data-lift-sub": lift.sub ?? undefined,
      }
    : {};
  return href ? (
    <Link
      href={href}
      title={title}
      className={cn(cls, "[--spine-scale:0.92] sm:[--spine-scale:1]")}
      style={style}
      {...data}
    >
      {body}
    </Link>
  ) : (
    <div
      title={title}
      className={cn(cls, "[--spine-scale:0.92] sm:[--spine-scale:1]")}
      style={style}
      {...data}
    >
      {body}
    </div>
  );
}
