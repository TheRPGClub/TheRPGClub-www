import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { fetchGameReleases } from "@/lib/games/game-page";
import {
  isPastRelease,
  releaseDateLabel,
  releasesByPlatform,
  releasesCount,
  utcToday,
} from "@/lib/games/releases";
import { RailHeading } from "@/components/issue/game-rail";
import { RefreshReleasesButton } from "@/components/igdb/refresh-releases-button";
import { ReleaseLine } from "@/components/games/game-page/release-line";

// The rail's Releases (www#115, layout B): one row per platform, each listing
// its region and date pairs at their Date Precision, platforms in the order
// they first came out and TBA ones last. Past dates go grey. It belongs to
// the game index, so it shows wherever the game page does; only the link to
// the Release Calendar follows that Feature, and only while the game has a
// Release still to come.
export async function GameReleases({
  gameId,
  firstReleased,
  canRefresh,
  calendarShown,
}: {
  gameId: number;
  // The game's first-release date, said when it has no Releases.
  firstReleased: string | null;
  canRefresh: boolean;
  calendarShown: boolean;
}) {
  const releases = await fetchGameReleases(gameId);
  const today = utcToday();
  const rows = releasesByPlatform(releases ?? []);
  const upcoming = (releases ?? []).some((r) => !isPastRelease(r, today));

  return (
    <section>
      <RailHeading
        title="Releases"
        count={rows.length > 0 ? releasesCount(releases!.length, rows.length) : undefined}
      />
      {rows.length === 0 ? (
        <NoReleases failed={releases === null} firstReleased={firstReleased} />
      ) : (
        <ul>
          {rows.map((row) => (
            <li
              key={row.platformId}
              className="grid grid-cols-[8rem_minmax(0,1fr)] gap-2.5 border-b border-border py-2.5"
            >
              <h3 className="font-label pt-[3px] text-sm leading-[1.2] font-extrabold tracking-[0.06em] text-foreground">
                {row.platformName}
              </h3>
              <ul className="flex flex-col gap-1.25">
                {row.releases.map((release) => (
                  <ReleaseLine key={release.release_id} release={release} today={today} />
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
      {calendarShown && upcoming && (
        <Link
          href="/releases"
          className="font-label mt-3.5 inline-flex items-center gap-1.5 text-[0.84rem] font-extrabold tracking-[0.06em] text-foreground underline decoration-gotm decoration-2 underline-offset-4 transition-colors hover:text-highlight"
        >
          On the Release Calendar
          <ArrowRight aria-hidden className="size-3.5" />
        </Link>
      )}
      {canRefresh && <RefreshReleasesButton gameId={gameId} />}
    </section>
  );
}

// No Releases (or none could be read): say so, with the game's first-release
// date when it has one.
function NoReleases({ failed, firstReleased }: { failed: boolean; firstReleased: string | null }) {
  const first = firstReleased ? releaseDateLabel(firstReleased, "day") : null;
  return (
    <p className="text-sm text-faint-foreground">
      {failed ? "The Releases couldn't be read just now." : "No Releases listed yet."}
      {first && (
        <>
          {" "}
          First released <span className="font-semibold text-dim-foreground">{first}</span>.
        </>
      )}
    </p>
  );
}
