export interface ApiCollection<T> {
  data: T[];
  meta: {
    limit: number;
    offset: number;
    total?: number;
    resource?: string;
  };
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
export interface UserProfileCounts {
  favorites: number;
  now_playing: number;
  completed: number;
  backlog: number;
  collection: number;
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

export interface Platform {
  platform_id: number;
  platform_code: string;
  platform_name: string;
  created_at: string;
  updated_at: string;
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

export interface GameCompletion {
  entry_id?: number;
  completion_id?: number;
  user_id: string;
  gamedb_game_id: number;
  platform_id: number | null;
  completion_date: string | null;
  note: string | null;
  is_shared: boolean;
  created_at: string;
  updated_at: string;
  user?: User | null;
  game?: Game | null;
  platform?: Platform | null;
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

// Reviews

// Backend stores rating as integer 0..100 (CHECK constraint), and it's
// NOT NULL. The UI works in 1..5 stars and maps 1 -> 20, 5 -> 100.
export type ReviewRating = number;

export interface Review {
  review_id: number;
  user_id: string;
  gamedb_game_id: number;
  rating: number;
  // `text` column on the backend — currently rendered as plain text. The
  // longer-term plan is rich text JSON (Plate.js) so the column can outgrow
  // markdown-style escaping.
  body: string | null;
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
  game_title: string;
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
  game_title: string;
  gamedb_game_id: number | null;
  reddit_url: string | null;
  voting_results_message_id: string | null;
  game?: Game | null;
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

// Voting Info

export interface VotingInfo {
  voting_id: number;
  title: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
