import { ArrowRight } from "lucide-react";
import type { Release } from "@/lib/api/types";
import { nextRelease, releasesByPlatform } from "@/lib/games/releases";
import { RELEASES_PATH } from "@/lib/release-calendar";
import { isPast, releaseDateLabel, utcToday } from "@/lib/releases";
import { ButtonLink } from "@/components/ui/button";
import { RailHeading } from "@/components/issue/game-rail";
import { ReleaseLine } from "@/components/games/game-page/release-line";

// The row's Releases (design www#156, round 3): a platform list, each
// platform's name centred against its lines of region chip and date at their
// Date Precision, platforms in the order they first came out and TBA ones
// last. Past dates go grey and the next one is highlighted. It belongs to the
// game index, so it always shows; only "On the Release Calendar", at the
// heading's right end, follows that Feature, while a Release is still to come.
export function GameReleases({
  releases,
  firstReleased,
  calendarShown,
}: {
  // Null when the read failed.
  releases: Release[] | null;
  // The game's first-release date, said when it has no Releases.
  firstReleased: string | null;
  calendarShown: boolean;
}) {
  const today = utcToday();
  const rows = releasesByPlatform(releases ?? []);
  const upcoming = (releases ?? []).some((r) => !isPast(r.release_date, r.date_precision, today));
  const next = nextRelease(releases ?? [], today);

  return (
    <section aria-labelledby="game-releases">
      <RailHeading
        id="game-releases"
        title="Releases"
        action={
          calendarShown &&
          upcoming && (
            <ButtonLink href={RELEASES_PATH} variant="rail-link" size="bare" className="items-center">
              On the Release Calendar
              <ArrowRight aria-hidden />
            </ButtonLink>
          )
        }
      />
      {rows.length === 0 ? (
        <NoReleases failed={releases === null} firstReleased={firstReleased} />
      ) : (
        <ul>
          {rows.map((row) => (
            <li
              key={row.platformId}
              className="grid grid-cols-[8.5rem_minmax(0,1fr)] items-center gap-x-3 border-b border-border py-1.25 first:pt-0"
            >
              <h3 className="font-label text-[0.86rem] leading-[1.15] font-extrabold tracking-[0.06em] text-foreground">
                {row.platformName}
              </h3>
              <ul className="flex flex-col gap-0.5">
                {row.releases.map((release) => (
                  <ReleaseLine
                    key={release.release_id}
                    release={release}
                    today={today}
                    next={release.release_id === next?.release_id}
                  />
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
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
