import type { ReviewFacets } from "@/lib/reviews/facets";

// Pagy-backed pagination meta, from ApplicationController#pagy_meta. It is
// page-native, not offset-native: `count` is the total across every page,
// `pages` how many there are, `per` the page size the server actually served
// (it clamps a requested `limit`), and prev/next are page numbers, null at the
// ends. The pre-Pagy shape was {limit, offset, total} — read it through
// paginationOf in ./pagination rather than reaching for fields directly.
export interface CollectionMeta {
  page: number;
  pages: number;
  count: number;
  per: number;
  prev: number | null;
  next: number | null;
  resource?: string;
}

export interface ApiCollection<T> {
  data: T[];
  meta: CollectionMeta;
}

export interface ApiSingle<T> {
  data: T;
}

export interface ApiError {
  error: string;
}

// Auth / Session

export interface Principal {
  discord_id?: string;
  type: string;
}

export interface Membership {
  admin: boolean;
  moderator: boolean;
  regular: boolean;
  member: boolean;
  newcomer: boolean;
  active: boolean;
  dev: boolean;
  longstanding: boolean;
}

export interface Session {
  principal: Principal;
  membership: Membership | null;
}

// Users

export interface User {
  user_id: string;
  username: string | null;
  global_name: string | null;
  is_bot: boolean;
  discord_avatar: string | null;
  server_joined_at: string | null;
  last_seen_at: string | null;
  last_fetched_at: string | null;
  role_admin: boolean;
  role_moderator: boolean;
  role_regular: boolean;
  role_member: boolean;
  role_newcomer: boolean;
  server_left_at: string | null;
  message_count: number;
  profile_image_at: string | null;
  donor_notify_on_claim: boolean;
  created_at: string;
  updated_at: string;
  membership?: Membership;
  socials?: UserSocial[];
}

// Aggregated profile show payload
//
// `previews` carries a small (~5-item) slice per section for the profile page.
// `counts` covers every list so we can render the section headers and the
// reference rows (backlog / collection) without extra round-trips.
// Keys as the API sends them (`completions`, `collections`), not the list
// names the UI uses.
export interface UserProfileCounts {
  favorites: number;
  now_playing: number;
  completions: number;
  backlog: number;
  collections: number;
  reviews: number;
}

export interface UserProfilePreviews {
  favorites: UserFavorite[];
  now_playing: UserNowPlaying[];
  completed: GameCompletion[];
  backlog: UserBacklog[];
  collection: GameCollection[];
  reviews: Review[];
}

export interface UserProfile extends User {
  counts: UserProfileCounts;
  previews: UserProfilePreviews;
}

export interface SocialPlatform {
  id: number;
  label: string;
  position: number;
  created_by_user_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserSocial {
  id: number;
  user_id: string;
  platform_id: number;
  display_text: string;
  url: string | null;
  social_platform?: SocialPlatform;
  created_at: string;
  updated_at: string;
}

// Games

export interface Game {
  game_id: number;
  title: string;
  description: string | null;
  igdb_id: number | null;
  slug: string | null;
  igdb_url: string | null;
  cover_url: string | null;
  art_url: string | null;
  logo_url: string | null;
  featured_video_url: string | null;
  collection_id: number | null;
  parent_igdb_id: number | null;
  parent_game_name: string | null;
  initial_release_date: string | null;
  thumbnail_bad: boolean;
  thumbnail_approved: boolean;
  gotm_won?: boolean;
  nr_gotm_won?: boolean;
  // Optional because the embedded game shape (GameSummaryResource) only
  // carries platforms where a controller preloads them; a game read that
  // doesn't simply renders no pills.
  platforms?: Platform[];
  gotm_month_year?: string | null;
  nr_gotm_month_year?: string | null;
  now_playing?: UserNowPlaying[];
  completions?: GameCompletion[];
  reviews?: Review[];
  reviews_count?: number;
  created_at: string;
  updated_at: string;
}

export interface GameImage {
  image_id: number;
  game_id: number;
  kind: "cover" | "artwork" | "logo";
  object_key: string;
  uploaded_by_user_id: string | null;
  is_primary: boolean;
  position: number;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  url: string | null;
}

// Mirrors PlatformResource's allowlist. `created_at`/`updated_at` are not on
// it — they were in this type but never sent, and nothing read them.
// `platform_abbreviation` is the display label ("PS5"); it is nullable, so
// platformLabel in @/components/platform-pills falls back through code to name.
export interface Platform {
  platform_id: number;
  platform_code: string;
  platform_name: string;
  platform_abbreviation: string | null;
  igdb_platform_id: number | null;
}

export interface Region {
  region_id: number;
  region_code: string;
  region_name: string;
  created_at: string;
  updated_at: string;
}

export interface Company {
  company_id: number;
  name: string;
  role: string | null;
  created_at: string;
  updated_at: string;
}

export interface Franchise {
  franchise_id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Genre {
  genre_id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface GameMode {
  mode_id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Perspective {
  perspective_id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Theme {
  theme_id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface GameRelations {
  platforms: Platform[];
  companies: Company[];
  franchises: Franchise[];
  genres: Genre[];
  modes: GameMode[];
  perspectives: Perspective[];
  themes: Theme[];
  alternates: Game[];
}

// Collections, Now Playing, Backlog, Favorites & Completions

// The five user-scoped game lists each use Rails-style resource-specific PKs
// (e.g. `completion_id` for completions). We accept any of the plausible names
// so per-list resolvers stay defensive against schema drift.

export interface UserNowPlaying {
  entry_id?: number;
  now_playing_id?: number;
  user_id: string;
  gamedb_game_id: number | null;
  platform_id: number | null;
  added_at: string;
  note: string | null;
  sort_order: number | null;
  note_updated_at: string | null;
  user?: User | null;
  game?: Game | null;
  platform?: Platform | null;
}

export interface GameCollection {
  entry_id?: number;
  collection_id?: number;
  user_id: string;
  gamedb_game_id: number;
  platform_id: number | null;
  ownership_type: string;
  note: string | null;
  is_shared: boolean;
  created_at: string;
  updated_at: string;
  user?: User | null;
  game?: Game | null;
  platform?: Platform | null;
}

// One row of GET /users/:id/collections/platform_summary. Entries with no
// platform collapse into a single row whose platform fields are all null.
export interface CollectionPlatformCount {
  platform_id: number | null;
  platform_name: string | null;
  platform_abbreviation: string | null;
  count: number;
}

export interface CollectionPlatformSummary {
  total_count: number;
  // Ordered by count desc, then platform name.
  platform_counts?: CollectionPlatformCount[];
}

// Matches the API's `CompletionEntry` schema (completion_fields.rb). Unlike the
// other lists it has no `updated_at`/`is_shared`.
export interface GameCompletion {
  completion_id: number;
  user_id: string;
  gamedb_game_id: number;
  platform_id: number | null;
  note: string | null;
  // Main Story | Main Story + Side Content | Completionist
  completion_type: string;
  completed_at: string | null;
  // Serialised as a decimal string ("20.0"); see playtimeHours().
  final_playtime_hrs: string | number | null;
  created_at: string;
  user?: User | null;
  game?: Game | null;
  platform?: Platform | null;
}

// One row of GET /users/:id/completions/common: a game both members completed,
// with each member's latest entry for it (a full CompletionEntry) and how many
// times they completed it. `latest_shared_date` is the later of the two latest
// dates, null when both are undated.
export interface CommonCompletionSide {
  latest: GameCompletion;
  count: number;
}

export interface CommonCompletion {
  gamedb_game_id: number;
  latest_shared_date: string | null;
  game: Game;
  left: CommonCompletionSide;
  right: CommonCompletionSide;
}

export interface CommonCompletionMeta extends CollectionMeta {
  left_user_id: string;
  right_user_id: string;
}

export interface UserFavorite {
  entry_id?: number;
  favorite_id?: number;
  user_id: string;
  gamedb_game_id: number;
  platform_id: number | null;
  sort_order: number | null;
  note: string | null;
  created_at: string;
  updated_at: string;
  user?: User | null;
  game?: Game | null;
  platform?: Platform | null;
}

export interface UserBacklog {
  entry_id?: number;
  backlog_id?: number;
  user_id: string;
  gamedb_game_id: number;
  platform_id: number | null;
  note: string | null;
  created_at: string;
  updated_at: string;
  user?: User | null;
  game?: Game | null;
  platform?: Platform | null;
}

// Backlog pick (GET /users/:id/backlog/pick)

// HltbResource. The times are the scraped display strings ("12½ Hours"), not
// numbers; the pick's own `hours` is the parsed figure the filter used.
export interface Hltb {
  name: string | null;
  url: string | null;
  image_url: string | null;
  main: string | null;
  main_sides: string | null;
  completionist: string | null;
  single_player: string | null;
  co_op: string | null;
  vs: string | null;
  source_query: string | null;
  scraped_at: string | null;
  updated_at: string | null;
}

export type BacklogPickSource = "backlog" | "collection" | "both";

export interface BacklogPick {
  kind: "backlog" | "collection";
  entry_id: number;
  gamedb_game_id: number;
  platform_id: number | null;
  note: string | null;
  hours: number | null;
  // GameSummary: no embedded platforms.
  game: Game;
  platform: Platform | null;
  hltb: Hltb | null;
}

export interface BacklogPickPlatform {
  platform_id: number;
  platform_name: string | null;
  platform_abbreviation: string | null;
  count: number;
}

export interface BacklogPickMeta {
  seed: number;
  // Both null when there is no pick.
  position: number | null;
  next_position: number | null;
  wrapped: boolean;
  // Candidates after the source and platform filters, before max_hours.
  total: number;
  platforms: BacklogPickPlatform[];
}

export interface BacklogPickResponse {
  data: BacklogPick | null;
  meta: BacklogPickMeta;
}

// Imports (collection CSV, Steam, Completionator). Every kind shares the job,
// item and review shapes below; each kind's item adds its own raw fields.

export type ImportStatus = "active" | "paused" | "completed" | "canceled";

export type ImportItemStatus = "pending" | "added" | "updated" | "skipped" | "failed";

export type ImportMatchConfidence = "exact" | "fuzzy" | "manual";

export interface ImportJob {
  import_id: number;
  user_id: string;
  status: ImportStatus;
  current_index: number;
  total_count: number;
  test_mode: boolean;
  created_at: string;
  updated_at: string;
}

// The fields every kind's item has.
export interface ImportItem {
  item_id: number;
  import_id: number;
  row_index: number;
  status: ImportItemStatus;
  gamedb_game_id: number | null;
  error_text: string | null;
}

// The collection kinds' items (CSV, Steam) also record how they matched.
// Completionator's don't.
export interface CollectionImportItem extends ImportItem {
  match_confidence: string | null;
  match_candidate_json: string | null;
  result_reason: string | null;
}

export interface CollectionCsvImport extends ImportJob {
  source_file_name: string | null;
  source_file_size: number | null;
  template_version: string | null;
}

export interface CollectionCsvImportItem extends CollectionImportItem {
  raw_title: string | null;
  raw_platform: string | null;
  raw_ownership_type: string | null;
  raw_note: string | null;
  raw_gamedb_id: number | null;
  raw_igdb_id: number | null;
  platform_id: number | null;
  ownership_type: string | null;
  note: string | null;
  collection_entry_id: number | null;
}

export interface SteamCollectionImport extends ImportJob {
  steam_id64: string;
  steam_profile_ref: string | null;
  source_profile_name: string | null;
}

export interface SteamCollectionImportItem extends CollectionImportItem {
  steam_app_id: number;
  steam_app_name: string;
  playtime_forever_min: number | null;
  playtime_windows_min: number | null;
  playtime_mac_min: number | null;
  playtime_linux_min: number | null;
  playtime_deck_min: number | null;
  last_played_at: string | null;
  collection_entry_id: number | null;
}

// Also the shape of Steam's `items/counts`, which stands in for `summary`.
export interface ImportSummary {
  import_id: number;
  by_status: Partial<Record<ImportItemStatus, number>>;
  // `null` result reasons (pending rows) come back keyed "null"/"".
  // Completionator's summary has no reasons, only statuses.
  by_result_reason?: Record<string, number>;
}

// A GameDB match the server found for a row.
export interface ImportCandidate {
  game_id: number;
  title: string;
  cover_url: string | null;
}

export interface ImportIgdbCandidate {
  igdb_id: number;
  name: string;
  slug: string | null;
  summary: string | null;
  url: string | null;
  total_rating: number | null;
  first_release_date: string | null;
  cover_url: string | null;
  // Already in GameDB: applying it won't create a new game.
  already_imported: boolean;
}

// What `advance` and `remap` return. `item: null` with an active import means
// the server stopped after its per-call auto-apply cap: call advance again.
export interface ImportReview<
  J extends ImportJob = ImportJob,
  I extends ImportItem = ImportItem,
> {
  import: J;
  item: I | null;
  candidates: ImportCandidate[];
  match_confidence: ImportMatchConfidence | null;
  counts: ImportSummary;
}

// One row problem from a rejected CSV (422 `invalid_csv`). row_index is the
// 1-based CSV record, so the header is 1. A whole-file problem has column
// "file" and row_index 1 (null from older Completionator APIs).
export interface InvalidCsvRowError {
  row_index: number | null;
  column: string;
  message: string;
}

// Completionator import (www#31). Its review adds the completion step on top
// of the shared match step.

export interface CompletionatorImport extends ImportJob {
  source_filename: string | null;
}

export interface CompletionatorImportItem extends ImportItem {
  game_title: string | null;
  platform_name: string | null;
  region_name: string | null;
  // The export's own type ("Core Game", "+ a few extras", ...).
  source_type: string | null;
  time_text: string | null;
  completed_at: string | null;
  completion_type: string | null;
  playtime_hrs: number | null;
  completion_id: number | null;
}

// What the row needs from the member. `auto_added` / `auto_skipped` only come
// back from `match`: the row is done and the loop moves on.
export type CompletionatorNextStep =
  | "choose_game"
  | "add_completion"
  | "confirm_same"
  | "update_completion"
  | "auto_added"
  | "auto_skipped";

export type CompletionatorUpdateField = "type" | "date" | "playtime";

export interface CompletionatorDiff {
  // Row values that differ from the existing completion.
  fields: CompletionatorUpdateField[];
  // Both dates are set and differ: ask whether it's the same completion.
  confirm_same: boolean;
}

// The add form's defaults.
export interface CompletionatorForm {
  completion_type: string;
  platform_id: number | null;
  // Adding with this platform_id creates the game's missing release.
  creates_release: boolean;
  platforms: Platform[];
  date_choice: "csv" | "unknown";
  completed_at: string | null;
  final_playtime_hours: number | null;
}

export interface CompletionatorImportReview
  extends ImportReview<CompletionatorImport, CompletionatorImportItem> {
  next_step: CompletionatorNextStep | null;
  // The embedded GameSummary shape, not a full Game.
  game: (Pick<Game, "game_id" | "title"> & Partial<Pick<Game, "cover_url" | "initial_release_date">>) | null;
  existing_completion: GameCompletion | null;
  diff: CompletionatorDiff | null;
  form: CompletionatorForm | null;
  auto_processed: number;
}

// Reviews

// The scorecard shape, re-exported from the module that owns the facet
// catalogue and the sanitizer. It lives there rather than here because the
// labels, the templates and the validation are one thing, and splitting the
// type off from them is how the two drift.
export type { ReviewFacets };

// Backend stores rating as integer 0..100 (CHECK constraint), and it's
// NOT NULL. The UI works in 1..5 stars and maps 1 -> 20, 5 -> 100.
export type ReviewRating = number;

// A Plate value (array of nodes) for anything written since the editor
// landed, a bare string or `{"summary": ...}` for older rows. `unknown[]`
// rather than `Value` because this is unvalidated JSON off the wire —
// `sanitizeReviewValue` is what turns it into a value worth trusting.
export type ReviewBody = string | Record<string, unknown> | unknown[] | null;

export interface Review {
  review_id: number;
  user_id: string;
  gamedb_game_id: number;
  // Optional — most reviews don't have one. `?` rather than `| null`: the
  // backend doesn't send the key at all until it grows a `title` column, so
  // this stays truthful about what a response can actually look like today.
  title?: string | null;
  rating: number;
  // The per-category scorecard (story, music, combat...), or null for a review
  // written without one — which is every review from before it existed, and
  // still a first-class choice ("quick take"). Never read it directly:
  // `sanitizeReviewFacets` in @/lib/reviews/facets normalizes it, and
  // `facetAverage` derives the suggestion the composer shows. The overall
  // `rating` above stays authored and is allowed to disagree with it.
  facets: ReviewFacets | null;
  // `body` is a jsonb column holding rich text: a Plate value for rows written
  // since the editor landed, a bare JSON string or `{"summary": ...}` for
  // older ones. Never render it directly — `reviewBodyValue` in
  // ./review-body.ts normalizes all three for display, `reviewBodyText` gives
  // plain text for previews and clamps.
  body: ReviewBody;
  is_shared: boolean;
  created_at: string;
  updated_at: string;
  user?: User | null;
  game?: Game | null;
}

// GOTM

export interface GotmEntry {
  gotm_id: number;
  round_number: number;
  month_year: string;
  game_index: number;
  gamedb_game_id: number | null;
  reddit_url: string | null;
  voting_results_message_id: string | null;
  game?: Game | null;
}

export interface NrGotmEntry {
  nr_gotm_id: number;
  round_number: number;
  month_year: string;
  game_index: number;
  gamedb_game_id: number | null;
  reddit_url: string | null;
  voting_results_message_id: string | null;
  game?: Game | null;
}

// GOTM history grouped by round (GET /api/v1/gotm_rounds and
// /gotm_rounds/current). A kind's block is null when the round has no entries
// of that kind (or none matched the filters); a block made only of NR-GOTM
// "N/A" placeholders comes back with `games: []`.

export interface GotmRoundGame {
  game_index: number;
  gamedb_game_id: number | null;
  reddit_url: string | null;
  // The game's newest linked Discord thread.
  thread_id: string | null;
  game?: Game | null;
}

export interface GotmRoundBlock {
  month_year: string;
  voting_results_message_id: string | null;
  games: GotmRoundGame[];
}

export interface GotmRound {
  round_number: number;
  gotm: GotmRoundBlock | null;
  nr_gotm: GotmRoundBlock | null;
}

// Every year with entries for the selected kind(s), newest first, regardless
// of the `year` and `q` filters.
export interface GotmRoundsMeta extends CollectionMeta {
  years: number[];
}

export interface DashboardData {
  gotm: GotmEntry[];
  nr_gotm: NrGotmEntry[];
}

export interface DashboardResponse {
  data: DashboardData;
  meta: { limit: number };
}

// Suggestions

export interface Suggestion {
  suggestion_id: number;
  user_id: string;
  gamedb_game_id: number | null;
  suggestion_text: string;
  created_at: string;
  updated_at: string;
}

// Todos

export interface Todo {
  todo_id: number;
  title: string;
  description: string | null;
  status: string;
  priority: number;
  created_at: string;
  updated_at: string;
}

export interface TodoSummary {
  total: number;
  by_status: Record<string, number>;
}

// RSS Feeds

export interface RssFeed {
  feed_id: number;
  feed_url: string;
  feed_name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Public Reminders

export interface PublicReminder {
  reminder_id: number;
  message: string;
  scheduled_at: string;
  is_sent: boolean;
  created_at: string;
  updated_at: string;
}

// Starboard

export interface StarboardEntry {
  message_id: string;
  channel_id: string;
  author_id: string;
  content: string;
  star_count: number;
  created_at: string;
  updated_at: string;
}

// Voting rounds (GOTM / NR-GOTM nominations & votes)

// Where a round is in its lifecycle, as the backend decides it: members
// nominate until the vote opens, vote until it closes, then the tally decides
// the winners — or leaves a tie for the admins — and the round is decided.
export type VotingPhase = "nominating" | "voting" | "closed" | "tie" | "decided";

// Mirrors VotingRoundResource. `round_number` is the round being nominated
// for, voted on and won; nominations close and voting opens at
// `voting_opens_at`. `phase` and the booleans are the server's verdict at
// render time — trust them over re-deriving from the timestamps client-side.
export interface VotingRound {
  round_number: number;
  month_year: string;
  voting_opens_at: string;
  voting_closes_at: string;
  closed_at: string | null;
  decided_at: string | null;
  phase: VotingPhase;
  nominations_open: boolean;
  voting_open: boolean;
  voting_ended: boolean;
  // Tied games per category, awaiting an admin pick; `{}` when none.
  pending_ties: Partial<Record<VotingCategory, Game[]>>;
}

// The GOTM and NR-GOTM tables share identical shapes, so one type serves
// both categories of nominations and votes.

export type VotingCategory = "gotm" | "nr_gotm";

export interface Nomination {
  nomination_id: number;
  round_number: number;
  user_id: string;
  gamedb_game_id: number | null;
  reason: string | null;
  nominated_at: string;
  user?: User | null;
  game?: Game | null;
}

export interface NominationVote {
  vote_id: number;
  round_number: number;
  user_id: string;
  nomination_id: number;
  gamedb_game_id: number | null;
  voted_at: string;
  user?: User | null;
  game?: Game | null;
}

// One row of the anonymous per-nomination tally. Nominations with zero votes
// have no row — merge against the round's nominations list.
export interface VoteTallyRow {
  nomination_id: number;
  gamedb_game_id: number | null;
  vote_count: number;
}

// Result of casting a vote: `voted` placed one, `unvoted` toggled an existing
// vote off. `removed_votes` carries toggled-off or cap-evicted votes and
// `warning` a human-readable note about them.
export interface CastVoteResult {
  action: "voted" | "unvoted";
  vote: NominationVote | null;
  removed_votes: NominationVote[];
  cap: number;
  warning: string | null;
}
