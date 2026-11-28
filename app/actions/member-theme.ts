"use server";

import { refresh } from "next/cache";
import { apiFetch } from "@/lib/api";
import { getSession } from "@/lib/session";
import { themeChoiceBody } from "@/lib/theme-picker";

export interface ChooseThemeResult {
  ok: boolean;
  // A sentence for the picker when the Theme wasn't saved.
  error?: string;
}

const NOT_SAVED = "Your Theme wasn't saved. Try again.";

// Store the signed-in Member's Theme (spec api#523, `PUT /api/v1/me/theme`).
// Monthly Issue, the club default, is sent as null. The API refuses an
// unknown key (422) and a Theme this Member may not choose (403).
export async function chooseThemeAction(key: string): Promise<ChooseThemeResult> {
  if (typeof key !== "string" || !key.trim()) return { ok: false, error: NOT_SAVED };
  const session = await getSession();
  if (!session) return { ok: false, error: "Sign in again to change your Theme." };

  let res: Response;
  try {
    res = await apiFetch("/api/v1/me/theme", { method: "PUT", body: JSON.stringify(themeChoiceBody(key)) });
  } catch {
    return { ok: false, error: "Couldn't reach the club's server. Nothing changed." };
  }
  if (!res.ok) {
    if (res.status === 401) return { ok: false, error: "Sign in again to change your Theme." };
    if (res.status === 403) return { ok: false, error: "That Theme isn't open to you right now." };
    if (res.status === 422) return { ok: false, error: "The club has no Theme by that name." };
    return { ok: false, error: NOT_SAVED };
  }
  // The root layout reads the Theme from the session, which every render
  // reads fresh (no-store): refreshing re-renders it, <html data-theme> and
  // theme-color included, with no sign-in loop.
  refresh();
  return { ok: true };
}
