"use server";

import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api";
import type { AchievementProvider, LinkedAccount } from "@/lib/api/types";
import { linkedAccountErrorMessage } from "@/lib/linked-accounts";

// Link, unlink, Retry and Sync now for the member's own Linked Accounts.
// Errors come back as copy (the API's 422 reasons mapped by
// `linkedAccountErrorMessage`), ready to show inline on the row.

export interface ActionResult<T> {
  ok: boolean;
  data?: T;
  error?: string;
  // Sync now inside the cooldown: when it is next allowed.
  syncAvailableAt?: string;
}

async function failure<T>(
  provider: AchievementProvider,
  res: Response,
): Promise<ActionResult<T>> {
  let body: { error?: string; message?: string; sync_available_at?: string } = {};
  try {
    body = await res.json();
  } catch {
    // Not JSON: fall back to the status alone.
  }
  return {
    ok: false,
    error: linkedAccountErrorMessage(provider, body.error, res.status, body.message),
    syncAvailableAt: body.sync_available_at,
  };
}

function networkFailure<T>(): ActionResult<T> {
  return { ok: false, error: "Couldn't reach the club's server. Try again." };
}

function revalidateMember(userId: string) {
  revalidatePath(`/members/${userId}`);
  revalidatePath(`/members/${userId}/edit`);
  revalidatePath(`/members/${userId}/achievements`);
  revalidatePath("/achievements");
}

const accountPath = (userId: string, accountId: number) =>
  `/api/v1/users/${encodeURIComponent(userId)}/linked_accounts/${accountId}`;

export async function linkAccountAction(
  userId: string,
  provider: AchievementProvider,
  identifier: string,
): Promise<ActionResult<LinkedAccount>> {
  const trimmed = identifier.trim();
  if (!trimmed) {
    return { ok: false, error: linkedAccountErrorMessage(provider, null, 400) };
  }

  let res: Response;
  try {
    res = await apiFetch(`/api/v1/users/${encodeURIComponent(userId)}/linked_accounts`, {
      method: "POST",
      body: JSON.stringify({ data: { provider, identifier: trimmed } }),
    });
  } catch {
    return networkFailure();
  }
  if (!res.ok) return failure(provider, res);

  const body = (await res.json()) as { data: LinkedAccount };
  revalidateMember(userId);
  return { ok: true, data: body.data };
}

export async function unlinkAccountAction(
  userId: string,
  provider: AchievementProvider,
  accountId: number,
): Promise<ActionResult<null>> {
  let res: Response;
  try {
    res = await apiFetch(accountPath(userId, accountId), { method: "DELETE" });
  } catch {
    return networkFailure();
  }
  if (!res.ok) return failure(provider, res);

  revalidateMember(userId);
  return { ok: true, data: null };
}

async function postAccount(
  userId: string,
  provider: AchievementProvider,
  accountId: number,
  action: "retry" | "sync",
): Promise<ActionResult<LinkedAccount>> {
  let res: Response;
  try {
    res = await apiFetch(`${accountPath(userId, accountId)}/${action}`, { method: "POST" });
  } catch {
    return networkFailure();
  }
  if (!res.ok) return failure(provider, res);

  const body = (await res.json()) as { data: LinkedAccount };
  revalidateMember(userId);
  return { ok: true, data: body.data };
}

export async function retryAccountAction(
  userId: string,
  provider: AchievementProvider,
  accountId: number,
): Promise<ActionResult<LinkedAccount>> {
  return postAccount(userId, provider, accountId, "retry");
}

export async function syncAccountAction(
  userId: string,
  provider: AchievementProvider,
  accountId: number,
): Promise<ActionResult<LinkedAccount>> {
  return postAccount(userId, provider, accountId, "sync");
}
