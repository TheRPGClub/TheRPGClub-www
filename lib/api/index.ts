import { apiFetch } from "./client";
import type {
  ApiCollection,
  ApiSingle,
  CastVoteResult,
  Game,
  GameImage,
  GameCollection,
  GameCompletion,
  GameRelations,
  GotmEntry,
  Nomination,
  NominationVote,
  NrGotmEntry,
  Platform,
  PublicReminder,
  Region,
  Review,
  RssFeed,
  Session,
  SocialPlatform,
  StarboardEntry,
  Suggestion,
  Todo,
  TodoSummary,
  User,
  UserBacklog,
  UserFavorite,
  UserNowPlaying,
  UserProfile,
  UserSocial,
  VoteTallyRow,
  VotingCategory,
  VotingInfo,
} from "./types";

// ─── Auth ────────────────────────────────────────────────────────────────────

export const auth = {
  discordLoginUrl: () =>
    `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000"}/auth/discord`,

  logout: () => apiFetch<void>("/auth/logout", { method: "DELETE" }),

  session: () => apiFetch<Session>("/api/v1/session"),
};

// ─── Games ───────────────────────────────────────────────────────────────────

export const games = {
  list: (params?: { q?: string; limit?: number; offset?: number }) => {
    const qs = new URLSearchParams();
    if (params?.q) qs.set("q", params.q);
    if (params?.limit !== undefined) qs.set("limit", String(params.limit));
    if (params?.offset !== undefined) qs.set("offset", String(params.offset));
    return apiFetch<ApiCollection<Game>>(
      `/api/v1/games${qs.size ? `?${qs}` : ""}`,
    );
  },

  get: (id: number) => apiFetch<ApiSingle<Game>>(`/api/v1/games/${id}`),

  images: (id: number) =>
    apiFetch<ApiSingle<GameImage[]>>(`/api/v1/games/${id}/images`),

  relations: (id: number) =>
    apiFetch<ApiSingle<GameRelations>>(`/api/v1/games/${id}/relations`),
};

// ─── Platforms ───────────────────────────────────────────────────────────────

export const platforms = {
  list: (params?: { limit?: number; offset?: number }) => {
    const qs = new URLSearchParams();
    if (params?.limit !== undefined) qs.set("limit", String(params.limit));
    if (params?.offset !== undefined) qs.set("offset", String(params.offset));
    return apiFetch<ApiCollection<Platform>>(
      `/api/v1/platforms${qs.size ? `?${qs}` : ""}`,
    );
  },

  get: (id: number) => apiFetch<ApiSingle<Platform>>(`/api/v1/platforms/${id}`),
};

// ─── Regions ─────────────────────────────────────────────────────────────────

export const regions = {
  list: (params?: { limit?: number; offset?: number }) => {
    const qs = new URLSearchParams();
    if (params?.limit !== undefined) qs.set("limit", String(params.limit));
    if (params?.offset !== undefined) qs.set("offset", String(params.offset));
    return apiFetch<ApiCollection<Region>>(
      `/api/v1/regions${qs.size ? `?${qs}` : ""}`,
    );
  },

  get: (id: number) => apiFetch<ApiSingle<Region>>(`/api/v1/regions/${id}`),
};

// ─── Users ───────────────────────────────────────────────────────────────────

export const users = {
  list: (params?: { q?: string; limit?: number; offset?: number }) => {
    const qs = new URLSearchParams();
    if (params?.q) qs.set("q", params.q);
    if (params?.limit !== undefined) qs.set("limit", String(params.limit));
    if (params?.offset !== undefined) qs.set("offset", String(params.offset));
    return apiFetch<ApiCollection<User>>(
      `/api/v1/users${qs.size ? `?${qs}` : ""}`,
    );
  },

  get: (userId: string) =>
    apiFetch<ApiSingle<User>>(`/api/v1/users/${userId}`),

  // Aggregated profile (preview slices + counts for every list)
  profile: (userId: string) =>
    apiFetch<ApiSingle<UserProfile>>(`/api/v1/users/${userId}`),

  avatarUrl: (userId: string) =>
    `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000"}/api/v1/users/${userId}/avatar`,

  profileImageUrl: (userId: string) =>
    `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000"}/api/v1/users/${userId}/profile-image`,
};

// ─── Social Platforms ────────────────────────────────────────────────────────

export const socialPlatforms = {
  list: () =>
    apiFetch<ApiCollection<SocialPlatform>>("/api/v1/social_platforms"),

  create: (data: { label: string }) =>
    apiFetch<ApiSingle<SocialPlatform>>("/api/v1/social_platforms", {
      method: "POST",
      body: JSON.stringify({ data }),
    }),
};

// ─── User Socials ────────────────────────────────────────────────────────────

export const userSocials = {
  listForUser: (userId: string) =>
    apiFetch<ApiCollection<UserSocial>>(`/api/v1/users/${userId}/socials`),

  create: (
    userId: string,
    data: { platform_id: number; display_text: string; url?: string | null },
  ) =>
    apiFetch<ApiSingle<UserSocial>>(`/api/v1/users/${userId}/socials`, {
      method: "POST",
      body: JSON.stringify({ data }),
    }),

  get: (id: number) =>
    apiFetch<ApiSingle<UserSocial>>(`/api/v1/user_socials/${id}`),

  update: (
    id: number,
    data: Partial<Pick<UserSocial, "platform_id" | "display_text" | "url">>,
  ) =>
    apiFetch<ApiSingle<UserSocial>>(`/api/v1/user_socials/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ data }),
    }),

  destroy: (id: number) =>
    apiFetch<void>(`/api/v1/user_socials/${id}`, { method: "DELETE" }),
};

// ─── Collections ─────────────────────────────────────────────────────────────

export const collections = {
  listForUser: (userId: string, params?: { limit?: number; offset?: number }) => {
    const qs = new URLSearchParams();
    if (params?.limit !== undefined) qs.set("limit", String(params.limit));
    if (params?.offset !== undefined) qs.set("offset", String(params.offset));
    return apiFetch<ApiCollection<GameCollection>>(
      `/api/v1/users/${userId}/collections${qs.size ? `?${qs}` : ""}`,
    );
  },

  create: (userId: string, data: Partial<GameCollection>) =>
    apiFetch<ApiSingle<GameCollection>>(`/api/v1/users/${userId}/collections`, {
      method: "POST",
      body: JSON.stringify({ data }),
    }),

  get: (id: number) =>
    apiFetch<ApiSingle<GameCollection>>(`/api/v1/collections/${id}`),

  update: (id: number, data: Partial<GameCollection>) =>
    apiFetch<ApiSingle<GameCollection>>(`/api/v1/collections/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ data }),
    }),

  destroy: (id: number) =>
    apiFetch<void>(`/api/v1/collections/${id}`, { method: "DELETE" }),
};

// ─── Completions ─────────────────────────────────────────────────────────────

export const completions = {
  listForUser: (userId: string, params?: { limit?: number; offset?: number }) => {
    const qs = new URLSearchParams();
    if (params?.limit !== undefined) qs.set("limit", String(params.limit));
    if (params?.offset !== undefined) qs.set("offset", String(params.offset));
    return apiFetch<ApiCollection<GameCompletion>>(
      `/api/v1/users/${userId}/completions${qs.size ? `?${qs}` : ""}`,
    );
  },

  create: (userId: string, data: Partial<GameCompletion>) =>
    apiFetch<ApiSingle<GameCompletion>>(
      `/api/v1/users/${userId}/completions`,
      { method: "POST", body: JSON.stringify({ data }) },
    ),

  get: (id: number) =>
    apiFetch<ApiSingle<GameCompletion>>(`/api/v1/completions/${id}`),

  update: (id: number, data: Partial<GameCompletion>) =>
    apiFetch<ApiSingle<GameCompletion>>(`/api/v1/completions/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ data }),
    }),

  destroy: (id: number) =>
    apiFetch<void>(`/api/v1/completions/${id}`, { method: "DELETE" }),
};

// ─── Now Playing ─────────────────────────────────────────────────────────────

export const nowPlaying = {
  listForUser: (
    userId: string,
    params?: { limit?: number; offset?: number },
  ) => {
    const qs = new URLSearchParams();
    if (params?.limit !== undefined) qs.set("limit", String(params.limit));
    if (params?.offset !== undefined) qs.set("offset", String(params.offset));
    return apiFetch<ApiCollection<UserNowPlaying>>(
      `/api/v1/users/${userId}/now_playing${qs.size ? `?${qs}` : ""}`,
    );
  },

  create: (userId: string, data: Partial<UserNowPlaying>) =>
    apiFetch<ApiSingle<UserNowPlaying>>(
      `/api/v1/users/${userId}/now_playing`,
      { method: "POST", body: JSON.stringify({ data }) },
    ),

  get: (id: number) =>
    apiFetch<ApiSingle<UserNowPlaying>>(`/api/v1/now_playing/${id}`),

  update: (id: number, data: Partial<UserNowPlaying>) =>
    apiFetch<ApiSingle<UserNowPlaying>>(`/api/v1/now_playing/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ data }),
    }),

  destroy: (id: number) =>
    apiFetch<void>(`/api/v1/now_playing/${id}`, { method: "DELETE" }),
};

// ─── Favorites ───────────────────────────────────────────────────────────────

export const favorites = {
  listForUser: (
    userId: string,
    params?: { limit?: number; offset?: number },
  ) => {
    const qs = new URLSearchParams();
    if (params?.limit !== undefined) qs.set("limit", String(params.limit));
    if (params?.offset !== undefined) qs.set("offset", String(params.offset));
    return apiFetch<ApiCollection<UserFavorite>>(
      `/api/v1/users/${userId}/favorites${qs.size ? `?${qs}` : ""}`,
    );
  },

  create: (userId: string, data: Partial<UserFavorite>) =>
    apiFetch<ApiSingle<UserFavorite>>(`/api/v1/users/${userId}/favorites`, {
      method: "POST",
      body: JSON.stringify({ data }),
    }),

  get: (id: number) =>
    apiFetch<ApiSingle<UserFavorite>>(`/api/v1/favorites/${id}`),

  update: (id: number, data: Partial<UserFavorite>) =>
    apiFetch<ApiSingle<UserFavorite>>(`/api/v1/favorites/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ data }),
    }),

  destroy: (id: number) =>
    apiFetch<void>(`/api/v1/favorites/${id}`, { method: "DELETE" }),
};

// ─── Backlog ─────────────────────────────────────────────────────────────────

export const backlog = {
  listForUser: (
    userId: string,
    params?: { limit?: number; offset?: number },
  ) => {
    const qs = new URLSearchParams();
    if (params?.limit !== undefined) qs.set("limit", String(params.limit));
    if (params?.offset !== undefined) qs.set("offset", String(params.offset));
    return apiFetch<ApiCollection<UserBacklog>>(
      `/api/v1/users/${userId}/backlog${qs.size ? `?${qs}` : ""}`,
    );
  },

  create: (userId: string, data: Partial<UserBacklog>) =>
    apiFetch<ApiSingle<UserBacklog>>(`/api/v1/users/${userId}/backlog`, {
      method: "POST",
      body: JSON.stringify({ data }),
    }),

  get: (id: number) =>
    apiFetch<ApiSingle<UserBacklog>>(`/api/v1/backlog/${id}`),

  update: (id: number, data: Partial<UserBacklog>) =>
    apiFetch<ApiSingle<UserBacklog>>(`/api/v1/backlog/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ data }),
    }),

  destroy: (id: number) =>
    apiFetch<void>(`/api/v1/backlog/${id}`, { method: "DELETE" }),
};

// ─── Reviews ─────────────────────────────────────────────────────────────────

export const reviews = {
  listForUser: (
    userId: string,
    params?: { limit?: number; offset?: number },
  ) => {
    const qs = new URLSearchParams();
    if (params?.limit !== undefined) qs.set("limit", String(params.limit));
    if (params?.offset !== undefined) qs.set("offset", String(params.offset));
    return apiFetch<ApiCollection<Review>>(
      `/api/v1/users/${userId}/reviews${qs.size ? `?${qs}` : ""}`,
    );
  },

  listForGame: (gameId: number, params?: { limit?: number; offset?: number }) => {
    const qs = new URLSearchParams();
    if (params?.limit !== undefined) qs.set("limit", String(params.limit));
    if (params?.offset !== undefined) qs.set("offset", String(params.offset));
    return apiFetch<ApiCollection<Review>>(
      `/api/v1/games/${gameId}/reviews${qs.size ? `?${qs}` : ""}`,
    );
  },

  // Reviews are owned by a user, so create lives under the user-nested route
  // (require_owner! authorizes against :user_id in the URL). The game-nested
  // /games/:id/reviews route is read-only.
  create: (userId: string, data: Partial<Review>) =>
    apiFetch<ApiSingle<Review>>(`/api/v1/users/${userId}/reviews`, {
      method: "POST",
      body: JSON.stringify({ data }),
    }),

  get: (id: number) => apiFetch<ApiSingle<Review>>(`/api/v1/reviews/${id}`),

  update: (id: number, data: Partial<Review>) =>
    apiFetch<ApiSingle<Review>>(`/api/v1/reviews/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ data }),
    }),

  destroy: (id: number) =>
    apiFetch<void>(`/api/v1/reviews/${id}`, { method: "DELETE" }),
};

// ─── GOTM ─────────────────────────────────────────────────────────────────────

export const gotmEntries = {
  list: (params?: { limit?: number; offset?: number }) => {
    const qs = new URLSearchParams();
    if (params?.limit !== undefined) qs.set("limit", String(params.limit));
    if (params?.offset !== undefined) qs.set("offset", String(params.offset));
    return apiFetch<ApiCollection<GotmEntry>>(
      `/api/v1/gotm_entries${qs.size ? `?${qs}` : ""}`,
    );
  },

  get: (id: number) =>
    apiFetch<ApiSingle<GotmEntry>>(`/api/v1/gotm_entries/${id}`),
};

export const nrGotmEntries = {
  list: (params?: { limit?: number; offset?: number }) => {
    const qs = new URLSearchParams();
    if (params?.limit !== undefined) qs.set("limit", String(params.limit));
    if (params?.offset !== undefined) qs.set("offset", String(params.offset));
    return apiFetch<ApiCollection<NrGotmEntry>>(
      `/api/v1/nr_gotm_entries${qs.size ? `?${qs}` : ""}`,
    );
  },

  get: (id: number) =>
    apiFetch<ApiSingle<NrGotmEntry>>(`/api/v1/nr_gotm_entries/${id}`),
};

// ─── Suggestions ─────────────────────────────────────────────────────────────

export const suggestions = {
  list: (params?: { limit?: number; offset?: number }) => {
    const qs = new URLSearchParams();
    if (params?.limit !== undefined) qs.set("limit", String(params.limit));
    if (params?.offset !== undefined) qs.set("offset", String(params.offset));
    return apiFetch<ApiCollection<Suggestion>>(
      `/api/v1/suggestions${qs.size ? `?${qs}` : ""}`,
    );
  },

  get: (id: number) =>
    apiFetch<ApiSingle<Suggestion>>(`/api/v1/suggestions/${id}`),

  create: (data: Partial<Suggestion>) =>
    apiFetch<ApiSingle<Suggestion>>("/api/v1/suggestions", {
      method: "POST",
      body: JSON.stringify({ data }),
    }),

  destroy: (id: number) =>
    apiFetch<void>(`/api/v1/suggestions/${id}`, { method: "DELETE" }),
};

// ─── Todos ───────────────────────────────────────────────────────────────────

export const todos = {
  list: (params?: { limit?: number; offset?: number }) => {
    const qs = new URLSearchParams();
    if (params?.limit !== undefined) qs.set("limit", String(params.limit));
    if (params?.offset !== undefined) qs.set("offset", String(params.offset));
    return apiFetch<ApiCollection<Todo>>(
      `/api/v1/todos${qs.size ? `?${qs}` : ""}`,
    );
  },

  summary: () => apiFetch<{ data: TodoSummary }>("/api/v1/todos/summary"),

  get: (id: number) => apiFetch<ApiSingle<Todo>>(`/api/v1/todos/${id}`),

  create: (data: Partial<Todo>) =>
    apiFetch<ApiSingle<Todo>>("/api/v1/todos", {
      method: "POST",
      body: JSON.stringify({ data }),
    }),

  update: (id: number, data: Partial<Todo>) =>
    apiFetch<ApiSingle<Todo>>(`/api/v1/todos/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ data }),
    }),

  destroy: (id: number) =>
    apiFetch<void>(`/api/v1/todos/${id}`, { method: "DELETE" }),
};

// ─── RSS Feeds ───────────────────────────────────────────────────────────────

export const rssFeeds = {
  list: (params?: { limit?: number; offset?: number }) => {
    const qs = new URLSearchParams();
    if (params?.limit !== undefined) qs.set("limit", String(params.limit));
    if (params?.offset !== undefined) qs.set("offset", String(params.offset));
    return apiFetch<ApiCollection<RssFeed>>(
      `/api/v1/rss_feeds${qs.size ? `?${qs}` : ""}`,
    );
  },

  get: (id: number) => apiFetch<ApiSingle<RssFeed>>(`/api/v1/rss_feeds/${id}`),

  create: (data: Partial<RssFeed>) =>
    apiFetch<ApiSingle<RssFeed>>("/api/v1/rss_feeds", {
      method: "POST",
      body: JSON.stringify({ data }),
    }),

  update: (id: number, data: Partial<RssFeed>) =>
    apiFetch<ApiSingle<RssFeed>>(`/api/v1/rss_feeds/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ data }),
    }),

  destroy: (id: number) =>
    apiFetch<void>(`/api/v1/rss_feeds/${id}`, { method: "DELETE" }),
};

// ─── Public Reminders ────────────────────────────────────────────────────────

export const publicReminders = {
  list: (params?: { limit?: number; offset?: number }) => {
    const qs = new URLSearchParams();
    if (params?.limit !== undefined) qs.set("limit", String(params.limit));
    if (params?.offset !== undefined) qs.set("offset", String(params.offset));
    return apiFetch<ApiCollection<PublicReminder>>(
      `/api/v1/public_reminders${qs.size ? `?${qs}` : ""}`,
    );
  },

  get: (id: number) =>
    apiFetch<ApiSingle<PublicReminder>>(`/api/v1/public_reminders/${id}`),

  create: (data: Partial<PublicReminder>) =>
    apiFetch<ApiSingle<PublicReminder>>("/api/v1/public_reminders", {
      method: "POST",
      body: JSON.stringify({ data }),
    }),

  update: (id: number, data: Partial<PublicReminder>) =>
    apiFetch<ApiSingle<PublicReminder>>(`/api/v1/public_reminders/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ data }),
    }),

  destroy: (id: number) =>
    apiFetch<void>(`/api/v1/public_reminders/${id}`, { method: "DELETE" }),
};

// ─── Starboard ───────────────────────────────────────────────────────────────

export const starboard = {
  list: (params?: { limit?: number; offset?: number }) => {
    const qs = new URLSearchParams();
    if (params?.limit !== undefined) qs.set("limit", String(params.limit));
    if (params?.offset !== undefined) qs.set("offset", String(params.offset));
    return apiFetch<ApiCollection<StarboardEntry>>(
      `/api/v1/starboard${qs.size ? `?${qs}` : ""}`,
    );
  },

  get: (messageId: string) =>
    apiFetch<ApiSingle<StarboardEntry>>(`/api/v1/starboard/${messageId}`),

  create: (data: Partial<StarboardEntry>) =>
    apiFetch<ApiSingle<StarboardEntry>>("/api/v1/starboard", {
      method: "POST",
      body: JSON.stringify({ data }),
    }),

  update: (messageId: string, data: Partial<StarboardEntry>) =>
    apiFetch<ApiSingle<StarboardEntry>>(`/api/v1/starboard/${messageId}`, {
      method: "PATCH",
      body: JSON.stringify({ data }),
    }),

  destroy: (messageId: string) =>
    apiFetch<void>(`/api/v1/starboard/${messageId}`, { method: "DELETE" }),
};

// ─── Voting Info ─────────────────────────────────────────────────────────────

export const votingInfo = {
  list: (params?: { limit?: number; offset?: number }) => {
    const qs = new URLSearchParams();
    if (params?.limit !== undefined) qs.set("limit", String(params.limit));
    if (params?.offset !== undefined) qs.set("offset", String(params.offset));
    return apiFetch<ApiCollection<VotingInfo>>(
      `/api/v1/voting_info${qs.size ? `?${qs}` : ""}`,
    );
  },

  // The current (highest round_number) round, 404 when none exist.
  current: () =>
    apiFetch<ApiSingle<VotingInfo>>("/api/v1/voting_info/current"),

  get: (round: number) =>
    apiFetch<ApiSingle<VotingInfo>>(`/api/v1/voting_info/${round}`),

  create: (data: Partial<VotingInfo>) =>
    apiFetch<ApiSingle<VotingInfo>>("/api/v1/voting_info", {
      method: "POST",
      body: JSON.stringify({ data }),
    }),

  update: (round: number, data: Partial<VotingInfo>) =>
    apiFetch<ApiSingle<VotingInfo>>(`/api/v1/voting_info/${round}`, {
      method: "PATCH",
      body: JSON.stringify({ data }),
    }),

  destroy: (round: number) =>
    apiFetch<void>(`/api/v1/voting_info/${round}`, { method: "DELETE" }),
};

// ─── Nominations & Votes (GOTM / NR-GOTM rounds) ─────────────────────────────

const votingCategoryPath: Record<VotingCategory, string> = {
  gotm: "gotm_entries",
  nr_gotm: "nr_gotm_entries",
};

export const nominations = {
  list: (
    category: VotingCategory,
    round: number,
    params?: { limit?: number; offset?: number },
  ) => {
    const qs = new URLSearchParams();
    if (params?.limit !== undefined) qs.set("limit", String(params.limit));
    if (params?.offset !== undefined) qs.set("offset", String(params.offset));
    return apiFetch<ApiCollection<Nomination>>(
      `/api/v1/${votingCategoryPath[category]}/${round}/nominations${qs.size ? `?${qs}` : ""}`,
    );
  },

  get: (category: VotingCategory, round: number, userId: string) =>
    apiFetch<ApiSingle<Nomination>>(
      `/api/v1/${votingCategoryPath[category]}/${round}/nominations/${userId}`,
    ),
};

export const votes = {
  // Anonymous per-nomination counts; `meta.cap` is the round's per-user cap.
  tally: (category: VotingCategory, round: number) =>
    apiFetch<{ data: VoteTallyRow[]; meta: { cap: number } }>(
      `/api/v1/${votingCategoryPath[category]}/${round}/votes/tally`,
    ),

  // A single voter's votes for the round (own votes only until voting ends).
  forUser: (category: VotingCategory, round: number, userId: string) =>
    apiFetch<ApiSingle<NominationVote[]>>(
      `/api/v1/${votingCategoryPath[category]}/${round}/votes/${userId}`,
    ),

  // Cast or toggle the caller's vote on a nomination.
  cast: (
    category: VotingCategory,
    round: number,
    data: { user_id: string; nomination_id: number },
  ) =>
    apiFetch<ApiSingle<CastVoteResult>>(
      `/api/v1/${votingCategoryPath[category]}/${round}/votes`,
      { method: "POST", body: JSON.stringify({ data }) },
    ),
};
