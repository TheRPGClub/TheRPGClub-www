import { LoaderCircle } from "lucide-react";
import { hltbBars, hltbLookedUpLabel, hltbNotSavedNote, type Hltb } from "@/lib/hltb";
import { Bar, Foot, labelClass, SourceLink } from "@/components/issue/game-hltb-card-parts";
import { cn } from "@/lib/utils";

// The "Time to beat" card's times: one bar per play style and where they
// came from, or placeholder bars while the lookup runs.

export function Times({
  hltb,
  saved,
  fresh,
  releaseDate,
}: {
  hltb: Hltb;
  saved: boolean;
  fresh: boolean;
  releaseDate: string | null;
}) {
  const bars = hltbBars(hltb);
  const lookedUp = fresh ? "Looked up just now" : hltbLookedUpLabel(hltb);
  return (
    <>
      {bars.length > 0 ? (
        <ul>
          {bars.map((bar) => (
            <Bar
              key={bar.key}
              label={bar.label}
              figure={bar.figure}
              unit={bar.unit}
              percent={bar.percent}
            />
          ))}
        </ul>
      ) : (
        <p className="text-[0.9rem] text-dim-foreground">
          HowLongToBeat lists no times for this game yet.
        </p>
      )}
      {saved ? (
        <Foot>
          {hltb.url ? (
            <SourceLink href={hltb.url}>HowLongToBeat</SourceLink>
          ) : (
            <span className={labelClass}>HowLongToBeat</span>
          )}
          {lookedUp && <span className={labelClass}>{lookedUp}</span>}
        </Foot>
      ) : (
        <Foot className="block">
          <p className="text-[0.82rem] leading-snug text-dim-foreground">
            {hltbNotSavedNote(releaseDate)}
          </p>
        </Foot>
      )}
    </>
  );
}

// The card while the lookup runs: placeholder bars in the rule colour.
export function LookingUp() {
  return (
    <>
      <ul>
        <Bar label="Main Story" figure="" unit="" percent={32} placeholder />
        <Bar label="Main + Sides" figure="" unit="" percent={48} placeholder />
        <Bar label="Completionist" figure="" unit="" percent={72} placeholder />
      </ul>
      <Foot>
        <span className={cn(labelClass, "inline-flex items-center gap-1.5")}>
          <LoaderCircle aria-hidden className="size-3.25 motion-safe:animate-spin" />
          Looking up on HowLongToBeat…
        </span>
      </Foot>
    </>
  );
}
