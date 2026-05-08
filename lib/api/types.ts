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
  completionator_url: string | null;
  psn_username: string | null;
  xbl_username: string | null;
  nsw_friend_code: string | null;
  steam_url: string | null;
  profile_image_at: string | null;
  donor_notify_on_claim: boolean;
  created_at: string;
  updated_at: string;
  membership?: Membership;
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

export interface Release {
  release_id: number;
  game_id: number;
  platform_id: number;
  region_id: number;
  release_date: string | null;
  platform_code: string;
  platform_name: string;
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
  releases: Release[];
  companies: Company[];
  franchises: Franchise[];
  genres: Genre[];
  modes: GameMode[];
  perspectives: Perspective[];
  themes: Theme[];
  alternates: Game[];
}

// Collections, Now Playing & Completions

export interface UserNowPlaying {
  entry_id: number;
  user_id: string;
  gamedb_game_id: number | null;
  platform_id: number | null;
  added_at: string;
  note: string | null;
  sort_order: number | null;
  note_updated_at: string | null;
  user?: User | null;
}

export interface GameCollection {
  entry_id: number;
  user_id: string;
  gamedb_game_id: number;
  platform_id: number | null;
  ownership_type: string;
  note: string | null;
  is_shared: boolean;
  created_at: string;
  updated_at: string;
}

export interface GameCompletion {
  entry_id: number;
  user_id: string;
  gamedb_game_id: number;
  platform_id: number | null;
  completion_date: string | null;
  note: string | null;
  is_shared: boolean;
  created_at: string;
  updated_at: string;
  user?: User | null;
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
