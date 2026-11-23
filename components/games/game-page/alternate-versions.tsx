import Link from "next/link";
import type { Game } from "@/lib/api/types";
import { GameCover } from "@/components/issue/game-cover";
import { RailHeading } from "@/components/issue/game-rail";

// The game's other versions, the row's last column, shown only when it has
// some: a small cover beside each title, its year and platforms under it.
// Admins link and unlink them on the Game Edit page.
export function AlternateVersions({ alternates }: { alternates: Game[] }) {
  if (alternates.length === 0) return null;

  return (
    <section aria-labelledby="alternate-versions">
      <RailHeading id="alternate-versions" title="Alternate versions" />
      <ul className="flex flex-col gap-2">
        {alternates.map((alt) => {
          const year = alt.initial_release_date?.slice(0, 4);
          const platforms = alt.platforms?.map((p) => p.platform_abbreviation ?? p.platform_name).join(", ");
          const note = [year, platforms].filter(Boolean).join(" · ");
          return (
            <li key={alt.game_id}>
              <Link
                href={`/games/${alt.game_id}`}
                className="group grid grid-cols-[34px_minmax(0,1fr)] items-center gap-3 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-highlight"
              >
                <GameCover title={alt.title} coverUrl={alt.cover_url} className="w-8.5" fallbackClassName="p-0.5 text-[0.6875rem]" />
                <span className="min-w-0">
                  <b className="block text-[0.9rem] leading-tight font-semibold text-foreground transition-colors group-hover:text-highlight">
                    {alt.title}
                  </b>
                  {note && <small className="text-[0.8rem] text-faint-foreground">{note}</small>}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
