import type { TrackedNomination } from "@/components/issue/round-panel";
import { cn } from "@/lib/utils";

// The tall round panel's latest nominations: cover, game, nominator and the
// track's tag.
export function RoundPanelNominations({
  nominations,
}: {
  nominations: TrackedNomination[];
}) {
  return (
    <div className="mt-3 flex-1 border-t-2 border-background">
      <h3 className="font-label pt-2 pb-1 text-[0.8rem] font-extrabold tracking-[0.1em]">
        Latest nominations
      </h3>
      <ol>
        {nominations.slice(0, 5).map((nomination) => {
          const cover =
            nomination.game?.cover_url ?? nomination.game?.art_url;
          return (
            <li
              key={`${nomination.category}-${nomination.nomination_id}`}
              className="grid grid-cols-[1.9rem_1fr_auto] items-center gap-2.5 border-t border-background/20 py-1.5 first:border-t-0"
            >
              <span className="block h-10 w-[1.9rem] overflow-hidden rounded-[2px] bg-background/15">
                {cover && (
                  // eslint-disable-next-line @next/next/no-img-element -- remote game art from the API's image hosts, which next/image isn't configured for
                  <img
                    src={cover}
                    alt=""
                    className="size-full object-cover"
                  />
                )}
              </span>
              <span className="min-w-0">
                <b className="font-label block truncate text-[0.95rem] leading-tight font-extrabold tracking-[0.02em]">
                  {nomination.game?.title ?? "Unknown game"}
                </b>
                <small className="block truncate text-xs text-highlight-muted-foreground">
                  by{" "}
                  {nomination.user?.global_name ??
                    nomination.user?.username ??
                    "a member"}
                </small>
              </span>
              <span
                className={cn(
                  "font-label rounded-[2px] px-1.5 py-px text-[0.68rem] font-extrabold tracking-[0.08em] text-white",
                  nomination.category === "gotm" ? "bg-gotm" : "bg-nr",
                )}
              >
                {nomination.category === "gotm" ? "GOTM" : "NR"}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
