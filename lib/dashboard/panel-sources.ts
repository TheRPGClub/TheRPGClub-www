import { apiFetch } from "@/lib/api";
import type {
  AchievementFeedCard,
  AchievementUnlock,
  BacklogPickResponse,
  GameSummary,
  Suggestion,
  UpcomingRelease,
  UserSummary,
} from "@/lib/api/types";
import type { ChallengeMember, ChallengeRun, ChallengeTint } from "@/lib/challenges/types";
import type { NewsItem } from "@/lib/news";
import { PANEL_ITEMS } from "@/lib/dashboard/panels";

// Each Dashboard Panel's read (spec api#421, "Panel data"): one endpoint a
// member can call, the newest few items. Every read is null when it failed,
// so a panel can tell an outage (a short error inside it) from nothing new
// (its empty note). Server-only: they read the session cookie.

// A minute of Data Cache: a panel is a glance, and the member's own Data
// Cache key (their Authorization) keeps one member's view from another's.
const FETCH: RequestInit = { next: { revalidate: 60 } };
// Reads that change with the member's own actions are never cached.
const FRESH: RequestInit = { cache: "no-store" };

async function readData<T>(path: string, init: RequestInit = FETCH): Promise<T | null> {
  try {
    const res = await apiFetch(path, init);
    if (!res.ok) return null;
    const body = (await res.json()) as { data?: T };
    return body.data ?? null;
  } catch {
    return null;
  }
}

const per = `per=${PANEL_ITEMS}`;
const user = (id: string) => `/api/v1/users/${encodeURIComponent(id)}`;

// The platform an entry was logged on (Platform, or null).
export interface PanelPlatform {
  platform_name: string | null;
  platform_abbreviation: string | null;
}

export interface PanelNowPlaying {
  entry_id: number;
  user_id: string;
  added_at: string;
  game: GameSummary | null;
  platform: PanelPlatform | null;
  // Club list only (NowPlayingMemberEntry).
  user?: UserSummary;
}

export interface PanelCompletion {
  completion_id: number;
  user_id: string;
  completion_type: string;
  completed_at: string | null;
  created_at: string;
  final_playtime_hrs: number | null;
  game: GameSummary;
  platform: PanelPlatform | null;
  // Club list only (CompletionMemberEntry).
  user?: UserSummary;
}

export interface PanelReview {
  review_id: number;
  rating: number;
  title: string | null;
  created_at: string;
  game: GameSummary;
  user: UserSummary;
}

export interface PanelJournalEntry {
  entry_id: number;
  entry_title: string | null;
  entry_body: string;
  created_at: string;
  game: GameSummary;
  user: UserSummary;
}

export interface PanelGameKey {
  key_id: number;
  game_title: string;
  platform: string;
  region: string;
  created_at: string;
  game: GameSummary | null;
}

export type PanelSuggestion = Suggestion & { last_activity_at?: string };

export type ChallengeEventKind = "run_started" | "game_cleared" | "run_finished" | "signups_opened" | "edition_revealed";

export interface ChallengeEvent {
  kind: ChallengeEventKind;
  occurred_on: string;
  occurred_at: string | null;
  challenge: { id: number; name: string; challenge_format: "slots" | "pool" | "assignment"; tint?: ChallengeTint | null };
  user: ChallengeMember | null;
  game: GameSummary | null;
  run_id: number | null;
  edition: { id: number; year: number } | null;
}

// News in the member's saved categories (no `category`: the API applies them).
export const readNews = () => readData<NewsItem[]>(`/api/v1/news_items?${per}`);
export const readClubNowPlaying = () => readData<PanelNowPlaying[]>(`/api/v1/now_playing?${per}`);
export const readMyNowPlaying = (id: string) => readData<PanelNowPlaying[]>(`${user(id)}/now_playing?${per}`, FRESH);
// The API leaves out the member's Hidden Platforms by itself.
export const readReleases = () => readData<UpcomingRelease[]>(`/api/v1/upcoming_releases?per_game=next&${per}`);
export const readClubAchievements = () => readData<AchievementFeedCard[]>(`/api/v1/achievements/feed?view=latest&${per}`);
export const readMyUnlocks = (id: string) => readData<AchievementUnlock[]>(`${user(id)}/achievements/unlocks?${per}`);
export const readChallengeActivity = () => readData<ChallengeEvent[]>(`/api/v1/challenge_activity?${per}`);
export const readMyRuns = (id: string) => readData<ChallengeRun[]>(`${user(id)}/challenge_runs?status=active&${per}`, FRESH);
export const readClubCompletions = () => readData<PanelCompletion[]>(`/api/v1/completions/recent?${per}`);
export const readMyCompletions = (id: string) => readData<PanelCompletion[]>(`${user(id)}/completions?${per}`, FRESH);
export const readReviews = () => readData<PanelReview[]>(`/api/v1/reviews?${per}`);
export const readJournals = () => readData<PanelJournalEntry[]>(`/api/v1/journal_entries?${per}`);
export const readGiveaways = () => readData<PanelGameKey[]>(`/api/v1/game_keys?sort=recent&${per}`, FRESH);
export const readSuggestions = () =>
  readData<PanelSuggestion[]>(`/api/v1/suggestions?sort=recent&status=pending,approved&${per}`, FRESH);

// The member's Backlog Pick: the pick and how many games it was drawn from
// (`data` is null when the backlog is empty). Null when the read failed.
export async function readBacklogPick(id: string): Promise<BacklogPickResponse | null> {
  try {
    const res = await apiFetch(`${user(id)}/backlog/pick?source=backlog`, FRESH);
    if (!res.ok) return null;
    return (await res.json()) as BacklogPickResponse;
  } catch {
    return null;
  }
}
