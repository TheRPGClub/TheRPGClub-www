import type { PublicWinner, VotingCategory } from "@/lib/api/types";
import { TrackPlate } from "@/components/issue/track-plate";
import { FeatureSlide, type DealtCover } from "@/components/join/feature-slide";
import type { JoinSlide } from "@/components/join/join-slideshow";
import { SlideFrame } from "@/components/join/slide-frame";
import { WinnerSlide } from "@/components/join/winner-slide";

// The six reasons to join, in order: this month's two picks from the public
// winners read (or the flat track plates when it failed or came back empty),
// then four things Members do on the site, dealt recent winners' covers.

const FEATURES: { label: string; lines: [string, string]; body: string }[] = [
  {
    label: "Vote on what's next",
    lines: ["Vote on", "what's next"],
    body: "Members put forward the RPG and the wildcard they want the club to play next, then vote on the ballot. The tally picks the month's games.",
  },
  {
    label: "Your shelf",
    lines: ["Your", "shelf"],
    body: "Log what you're playing and what you've finished, keep a backlog and let the picker choose your next game, and bring a collection over from Steam, a CSV or Completionator.",
  },
  {
    label: "Reviews",
    lines: ["", "Reviews"],
    body: "Write a review with a rating and a scorecard when you finish a game, and read what the rest of the club made of every pick.",
  },
  {
    label: "Achievements",
    lines: ["", "Achievements"],
    body: "Link RetroAchievements, Steam or PlayStation and your Achievements open in a binder on your profile, beside the club's latest Unlocks.",
  },
];

const COVERS_PER_SLIDE = 4;

// This month's pick on a track: the first of the latest round's winners.
function thisMonths(winners: PublicWinner[], kind: VotingCategory): PublicWinner | null {
  const latest = winners[0]?.round_number;
  return winners.find((w) => w.round_number === latest && w.kind === kind) ?? null;
}

// Each feature slide is dealt its own run of recent covers, newest first.
function dealCovers(winners: PublicWinner[]): DealtCover[][] {
  const seen = new Set<number>();
  const pool = winners.flatMap((w) => {
    if (!w.cover_url || seen.has(w.game_id)) return [];
    seen.add(w.game_id);
    return [{ key: String(w.game_id), url: w.cover_url }];
  });
  const count = Math.min(COVERS_PER_SLIDE, pool.length);
  return FEATURES.map((_, slide) =>
    Array.from({ length: count }, (_, i) => pool[(slide * COVERS_PER_SLIDE + i) % pool.length]),
  );
}

function trackSlide(winner: PublicWinner | null, kind: VotingCategory, stamp: boolean) {
  if (winner) return <WinnerSlide winner={winner} stamp={stamp} />;
  return (
    <SlideFrame className="justify-center sm:justify-start">
      <TrackPlate kind={kind} className="max-w-[28rem] sm:mt-6" />
    </SlideFrame>
  );
}

export function joinSlides(winners: PublicWinner[]): JoinSlide[] {
  const covers = dealCovers(winners);
  return [
    { label: "Game of the Month", content: trackSlide(thisMonths(winners, "gotm"), "gotm", true) },
    { label: "Non-RPG pick", content: trackSlide(thisMonths(winners, "nr_gotm"), "nr_gotm", false) },
    ...FEATURES.map((feature, i) => ({
      label: feature.label,
      content: <FeatureSlide lines={feature.lines} body={feature.body} covers={covers[i]} />,
    })),
  ];
}
