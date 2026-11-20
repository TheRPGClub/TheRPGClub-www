"use server";

import { refresh } from "next/cache";
import { apiFetch } from "@/lib/api";
import { getSession } from "@/lib/session";
import { PANEL_KEYS, isPanelKey } from "@/lib/dashboard/panels";

export interface DashboardPanelsResult {
  ok: boolean;
}

// The member's own `/users/:id/dashboard_panels` route.
async function panelsPath(suffix = ""): Promise<string | null> {
  const session = await getSession();
  if (!session) return null;
  return `/api/v1/users/${encodeURIComponent(session.principal.discord_id)}/dashboard_panels${suffix}`;
}

async function send(path: string | null, init: RequestInit): Promise<boolean> {
  if (!path) return false;
  try {
    const res = await apiFetch(path, init);
    return res.ok;
  } catch {
    return false;
  }
}

// Save the member's whole shown list, in order (spec api#421, www#145): show,
// hide and reorder all send it. The API keeps the panels they can't see right
// now. `rerender` asks for the dashboard again, for a panel just switched on
// whose items the page hasn't read yet; a move or a hide changes nothing the
// server draws, so it skips the round trip.
export async function saveDashboardPanelsAction(
  panels: string[],
  rerender: boolean,
): Promise<DashboardPanelsResult> {
  const valid =
    Array.isArray(panels) &&
    panels.length <= PANEL_KEYS.length &&
    panels.every(isPanelKey) &&
    new Set(panels).size === panels.length;
  if (!valid) return { ok: false };
  const ok = await send(await panelsPath(), { method: "PUT", body: JSON.stringify({ data: { panels } }) });
  if (ok && rerender) refresh();
  return { ok };
}

// The member opened edit mode: nothing is new to them any more. Nothing on
// the page changes until their next visit, so no refresh.
export async function markDashboardPanelsSeenAction(): Promise<DashboardPanelsResult> {
  return { ok: await send(await panelsPath("/seen"), { method: "POST" }) };
}

// Reset to the club default from /settings: the API drops the saved list, so
// the member follows the default again, later changes to it included.
export async function resetDashboardPanelsAction(): Promise<DashboardPanelsResult> {
  const ok = await send(await panelsPath(), { method: "DELETE" });
  // Settings' reset row reads `customised`; the dashboard reads no-store.
  if (ok) refresh();
  return { ok };
}
