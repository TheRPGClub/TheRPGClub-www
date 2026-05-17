"use server";

import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api";
import type { SocialPlatform, UserSocial } from "@/lib/api/types";

export interface ActionResult<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

async function errorMessage(response: Response): Promise<string> {
  try {
    const body = await response.json();
    return body.error ?? body.message ?? `Request failed (HTTP ${response.status}).`;
  } catch {
    return `Request failed (HTTP ${response.status}).`;
  }
}

export async function createSocialPlatformAction(
  label: string,
): Promise<ActionResult<SocialPlatform>> {
  const trimmed = label.trim();
  if (!trimmed) {
    return { ok: false, error: "Platform name can't be blank." };
  }

  const res = await apiFetch("/api/v1/social_platforms", {
    method: "POST",
    body: JSON.stringify({ data: { label: trimmed } }),
  });

  if (!res.ok) {
    return { ok: false, error: await errorMessage(res) };
  }

  const body = (await res.json()) as { data: SocialPlatform };
  return { ok: true, data: body.data };
}

export async function createUserSocialAction(
  userId: string,
  input: { platform_id: number; display_text: string; url: string | null },
): Promise<ActionResult<UserSocial>> {
  const display_text = input.display_text.trim();
  const url = input.url?.trim() || null;
  if (!display_text) {
    return { ok: false, error: "Display text can't be blank." };
  }

  const res = await apiFetch(`/api/v1/users/${userId}/socials`, {
    method: "POST",
    body: JSON.stringify({
      data: { platform_id: input.platform_id, display_text, url },
    }),
  });

  if (!res.ok) {
    return { ok: false, error: await errorMessage(res) };
  }

  const body = (await res.json()) as { data: UserSocial };
  revalidatePath(`/members/${userId}`);
  revalidatePath(`/members/${userId}/edit`);
  return { ok: true, data: body.data };
}

export async function updateUserSocialAction(
  socialId: number,
  userId: string,
  input: { platform_id: number; display_text: string; url: string | null },
): Promise<ActionResult<UserSocial>> {
  const display_text = input.display_text.trim();
  const url = input.url?.trim() || null;
  if (!display_text) {
    return { ok: false, error: "Display text can't be blank." };
  }

  const res = await apiFetch(`/api/v1/user_socials/${socialId}`, {
    method: "PATCH",
    body: JSON.stringify({
      data: { platform_id: input.platform_id, display_text, url },
    }),
  });

  if (!res.ok) {
    return { ok: false, error: await errorMessage(res) };
  }

  const body = (await res.json()) as { data: UserSocial };
  revalidatePath(`/members/${userId}`);
  revalidatePath(`/members/${userId}/edit`);
  return { ok: true, data: body.data };
}

export async function deleteUserSocialAction(
  socialId: number,
  userId: string,
): Promise<ActionResult<null>> {
  const res = await apiFetch(`/api/v1/user_socials/${socialId}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    return { ok: false, error: await errorMessage(res) };
  }

  revalidatePath(`/members/${userId}`);
  revalidatePath(`/members/${userId}/edit`);
  return { ok: true, data: null };
}
