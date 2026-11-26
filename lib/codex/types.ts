// The Club Codex as the API sends it (spec api#397, `GET /api/v1/codex/...`).
// Client-safe: types only.

export type CodexPart = "history_event" | "lore_entry" | "fun_fact";
export type DatePrecision = "day" | "month" | "year";
// A History Event's Kind (lib/codex/history.ts lists them with their names).
export type HistoryKind = "founding" | "staff" | "platform" | "rules" | "milestone";

// A member on an entry: its author, or a member its text mentions, by the
// name they go by now (their last known one once they have left).
export interface CodexMember {
  user_id: string;
  name: string;
  // Their Discord avatar hash (null if unknown; an older API leaves it out)
  // and the API's avatar path, the fallback.
  discord_avatar?: string | null;
  avatar_url: string;
}

// A "See also" entry, or one result of the entry search: a Fun Fact's
// `title` is its opening words.
export interface CodexEntryLink {
  id: number;
  part: CodexPart;
  title: string;
}

export interface CodexEntry {
  id: number;
  part: CodexPart;
  title: string | null;
  rich_body: unknown[] | null;
  // The Discord text, members mentioned as `<@discord_id>` tokens.
  body: string | null;
  occurred_on: string | null;
  date_precision: DatePrecision | null;
  // A History Event's; null on the other parts, and for a Kind this site
  // doesn't know (lib/api/codex.ts narrows it as it reads).
  kind: HistoryKind | null;
  author: CodexMember;
  // Each known member `body` mentions, keyed by Discord id.
  mentions: Record<string, CodexMember>;
  images: { id: number; url: string; position: number }[];
  links: CodexEntryLink[];
  viewer: { can_edit: boolean; can_delete: boolean };
  created_at: string;
  updated_at: string;
}
