import type {
  AchievementProvider,
  AchievementProviderTotals,
  LinkedAccount,
  LinkedAccountSyncStatus,
  UserSocial,
} from "@/lib/api/types";
import { PROVIDER_LABEL } from "@/lib/achievements";

// Pure helpers behind the Linked Accounts editor on the member edit page: the
// Provider rows, what each identifier looks like, the status copy, which
// actions a status allows, the Sync now countdown and the API's error reasons
// as copy. No React and no server imports, so the server action and the
// client editor share them.

export interface IdentifierField {
  // The input's accessible name.
  label: string;
  placeholder: string;
  help: string;
}

export const IDENTIFIER_FIELD: Record<AchievementProvider, IdentifierField> = {
  retroachievements: {
    label: "RetroAchievements username",
    placeholder: "Username",
    help: "Your RetroAchievements username, as it appears on your profile.",
  },
  steam: {
    label: "Steam profile",
    placeholder: "steamcommunity.com/id/… or SteamID64",
    help: "Your Steam profile URL, your custom URL name or your SteamID64. Steam Game details must be Public.",
  },
  psn: {
    label: "PSN online ID",
    placeholder: "Online ID",
    help: "Your PSN online ID. Your trophies must be visible to Anyone.",
  },
};

// The Provider-specific fix for a `private` account.
export const PRIVATE_FIX: Record<AchievementProvider, string> = {
  retroachievements: "Check your RetroAchievements username",
  steam: "Set Steam Game details to Public",
  psn: "Set PSN trophies to Anyone",
};

const NOT_FOUND_COPY: Record<AchievementProvider, string> = {
  retroachievements: "RetroAchievements has no user by that name. Check your username.",
  steam: "We couldn't find that Steam profile. Paste your profile URL, your custom URL name or your SteamID64.",
  psn: "PSN has no account with that online ID.",
};

// Social platform labels the socials editor names these Providers by.
const SOCIAL_LABEL: Partial<Record<AchievementProvider, RegExp>> = {
  steam: /\bsteam\b/,
  psn: /\b(playstation|psn)\b/,
};

// What to pre-fill a link input with: the member's Steam social (its URL,
// else its text) or PSN social (its text, the online ID). Empty otherwise.
export function identifierFromSocials(
  provider: AchievementProvider,
  socials: UserSocial[],
): string {
  const match = SOCIAL_LABEL[provider];
  if (!match) return "";
  const social = socials.find((s) =>
    match.test((s.social_platform?.label ?? "").trim().toLowerCase()),
  );
  if (!social) return "";
  if (provider === "steam") {
    return social.url?.trim() || social.display_text.trim();
  }
  return social.display_text.trim();
}

// Retry restarts syncing that stopped; Sync now is for a healthy account.
export function canRetry(status: LinkedAccountSyncStatus): boolean {
  return status === "private" || status === "not_found" || status === "error";
}

export function canSyncNow(status: LinkedAccountSyncStatus): boolean {
  return status === "ok";
}

const STATUS_LABEL: Record<LinkedAccountSyncStatus, string> = {
  pending: "Importing",
  ok: "Synced",
  private: "Private",
  not_found: "Not found",
  error: "Sync failed",
};

// A pending account is importing its history only on its first (backfill)
// sync; after a Retry it is back to pending but only catching up.
function isImporting(account: Pick<LinkedAccount, "sync_status" | "sync_mode">): boolean {
  return account.sync_status === "pending" && account.sync_mode === "backfill";
}

// The status chip's label.
export function statusLabel(
  account: Pick<LinkedAccount, "sync_status" | "sync_mode">,
): string {
  if (account.sync_status === "pending" && !isImporting(account)) return "Syncing";
  return STATUS_LABEL[account.sync_status];
}

// Times in UTC, so the server render and the client agree.
const DATE_TIME = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
  timeZone: "UTC",
});

export function formatSyncedAt(iso: string): string {
  return `${DATE_TIME.format(new Date(iso))} UTC`;
}

// The line under a Linked Account's name: what its status means to the
// member, and for a stopped account what to do about it.
export function statusLine(account: LinkedAccount): string {
  switch (account.sync_status) {
    case "pending":
      return isImporting(account) ? "Importing your history…" : "Syncing…";
    case "ok":
      return account.last_synced_at
        ? `Last synced ${formatSyncedAt(account.last_synced_at)}`
        : "Synced";
    case "private":
      return `${PRIVATE_FIX[account.provider]}, then press Retry.`;
    case "not_found":
      return account.sync_error?.trim() || NOT_FOUND_COPY[account.provider];
    case "error":
      return (
        account.sync_error?.trim() ||
        `${PROVIDER_LABEL[account.provider]} didn't answer the last sync.`
      );
  }
}

// Seconds until Sync now is allowed again; 0 when it is allowed.
export function syncCooldownSeconds(syncAvailableAt: string, nowMs: number): number {
  const available = Date.parse(syncAvailableAt);
  if (Number.isNaN(available)) return 0;
  return Math.max(0, Math.ceil((available - nowMs) / 1000));
}

// "14:05" style countdown for the Sync now label.
export function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

// The member's Unlocks on a Provider, from the summary's per-Provider totals.
// Null when the summary couldn't be read, so the copy can stay vague.
export function unlockCount(
  provider: AchievementProvider,
  totals: AchievementProviderTotals[] | null,
): number | null {
  if (!totals) return null;
  return totals.find((t) => t.provider === provider)?.unlocks ?? 0;
}

export function unlinkWarning(provider: AchievementProvider, count: number | null): string {
  if (count === null) {
    return `This removes your ${PROVIDER_LABEL[provider]} Unlocks from the hub.`;
  }
  return `This removes your ${count.toLocaleString("en-US")} ${count === 1 ? "Unlock" : "Unlocks"} from the hub.`;
}

// An API error as copy. `reason` is the body's `error`, `status` the HTTP
// status; `message` the body's own message, used when nothing better fits.
export function linkedAccountErrorMessage(
  provider: AchievementProvider,
  reason: string | null | undefined,
  status: number,
  message?: string | null,
): string {
  const label = PROVIDER_LABEL[provider];
  switch (reason) {
    case "provider_already_linked":
      return `You already have a ${label} Linked Account.`;
    case "identity_claimed":
      return `Another member has already linked this ${label} account.`;
    case "not_found":
      return NOT_FOUND_COPY[provider];
    case "private":
      return `That ${label} account is private. ${PRIVATE_FIX[provider]}, then try again.`;
    case "invalid_provider":
      return `${label} can't be linked here.`;
    case "provider_unavailable":
      return `${label} can't be reached right now. Try again later.`;
    case "retry_not_allowed":
      return "This account is already syncing.";
    case "retry_required":
      return "Syncing has stopped for this account. Press Retry instead.";
    case "sync_cooldown":
      return "Sync now is cooling down. Try again when the timer runs out.";
  }
  if (status === 400) return `Enter your ${IDENTIFIER_FIELD[provider].label}.`;
  if (status === 403) return "You can only change your own Linked Accounts.";
  if (status === 404) return "That Linked Account is gone. Reload the page.";
  if (status === 503) return `${label} can't be reached right now. Try again later.`;
  return message?.trim() || `Request failed (HTTP ${status}).`;
}
