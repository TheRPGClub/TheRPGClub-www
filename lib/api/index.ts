import { apiFetch } from "./client";
import type {
  ApiCollection,
  ApiSingle,
  Game,
  GameImage,
  GameCollection,
  GameCompletion,
  GameRelations,
  GotmEntry,
  NrGotmEntry,
  Platform,
  PublicReminder,
  Region,
  RssFeed,
  Session,
  SocialPlatform,
  StarboardEntry,
  Suggestion,
  Todo,
  TodoSummary,
  User,
  UserSocial,
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

  get: (id: number) =>
    apiFetch<ApiSingle<VotingInfo>>(`/api/v1/voting_info/${id}`),

  create: (data: Partial<VotingInfo>) =>
    apiFetch<ApiSingle<VotingInfo>>("/api/v1/voting_info", {
      method: "POST",
      body: JSON.stringify({ data }),
    }),

  update: (id: number, data: Partial<VotingInfo>) =>
    apiFetch<ApiSingle<VotingInfo>>(`/api/v1/voting_info/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ data }),
    }),

  destroy: (id: number) =>
    apiFetch<void>(`/api/v1/voting_info/${id}`, { method: "DELETE" }),
};
