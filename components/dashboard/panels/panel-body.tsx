import type { PanelKey, PanelViewer } from "@/lib/dashboard/panels";
import { AchievementsClubBody, AchievementsMineBody } from "./achievement-bodies";
import { BacklogPickBody } from "./backlog-body";
import { BirthdaysBody } from "./birthdays-body";
import { ChallengeActivityBody, ChallengeRunsBody } from "./challenge-bodies";
import { CodexBody } from "./codex-body";
import { CompletionsClubBody, CompletionsMineBody } from "./completion-bodies";
import { GiveawaysBody } from "./giveaways-body";
import { JournalsBody } from "./journals-body";
import { NewsBody } from "./news-body";
import { NowPlayingClubBody, NowPlayingMineBody } from "./now-playing-bodies";
import { ReleasesBody } from "./releases-body";
import { ReviewsBody } from "./reviews-body";
import { SuggestionsBody } from "./suggestions-body";

// Each panel key's items. Every body reads its own source and draws its
// items, its empty note, or a short error when the read failed.
export interface BodyProps {
  viewer: PanelViewer;
  wide: boolean;
}

const BODIES: Record<PanelKey, (props: BodyProps) => Promise<React.ReactNode>> = {
  news: NewsBody,
  now_playing_club: NowPlayingClubBody,
  now_playing_mine: NowPlayingMineBody,
  releases: ReleasesBody,
  achievements_club: AchievementsClubBody,
  achievements_mine: AchievementsMineBody,
  challenges_club: ChallengeActivityBody,
  challenge_runs_mine: ChallengeRunsBody,
  completions_club: CompletionsClubBody,
  completions_mine: CompletionsMineBody,
  backlog_pick: BacklogPickBody,
  reviews: ReviewsBody,
  journals: JournalsBody,
  giveaways: GiveawaysBody,
  suggestions: SuggestionsBody,
  codex: CodexBody,
  birthdays: BirthdaysBody,
};

export function PanelBody({ panelKey, ...props }: BodyProps & { panelKey: PanelKey }) {
  const Body = BODIES[panelKey];
  return <Body {...props} />;
}
