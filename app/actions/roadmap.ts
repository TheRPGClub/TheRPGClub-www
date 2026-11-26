"use server";

import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api";
import { apiErrorMessage, readApiError } from "@/lib/api/errors";
import { itemPayload, milestonePayload, type ItemDraft, type MilestoneDraft } from "@/lib/roadmap/edit";
import { ROADMAP_PATH } from "@/lib/roadmap/tree";
import type { Roadmap, RoadmapItem, RoadmapMilestone } from "@/lib/roadmap/types";

// Staff editing of the Roadmap (spec api#505, www#232). The API lets only
// Admins and Superadmins in; its refusals (422 `{ error, message }`) carry a
// message staff can read, shown as it is. Order, move and Reach answer
// with the whole Roadmap, since several Milestones change at once.

export type RoadmapResult<T = undefined> = { ok: true; data: T } | { ok: false; error: string };

const UNREACHABLE = "Couldn't reach the club's server. Try again.";
const MESSAGES: Record<string, string> = {
  forbidden: "Only Admins and Superadmins can edit the Roadmap.",
};

const validId = (id: number) => Number.isInteger(id) && id > 0;

async function send<T>(path: string, method: string, data?: unknown): Promise<RoadmapResult<T>> {
  let res: Response;
  try {
    res = await apiFetch(`/api/v1/roadmap${path}`, {
      method,
      cache: "no-store",
      ...(data === undefined ? {} : { body: JSON.stringify({ data }) }),
    });
  } catch {
    return { ok: false, error: UNREACHABLE };
  }
  if (!res.ok) {
    const err = await readApiError(res);
    if (err.status === 404) return { ok: false, error: "That's gone from the Roadmap. Reload to see it as it is." };
    if (err.status === 403) return { ok: false, error: MESSAGES.forbidden };
    return { ok: false, error: apiErrorMessage(err, MESSAGES) };
  }
  revalidatePath(ROADMAP_PATH);
  try {
    const body = (await res.json()) as { data: T };
    return { ok: true, data: body.data };
  } catch {
    return { ok: false, error: UNREACHABLE };
  }
}

const badId = { ok: false as const, error: "That's gone from the Roadmap. Reload to see it as it is." };

// Roadmap Items.

export async function createRoadmapItemAction(milestoneId: number, draft: ItemDraft): Promise<RoadmapResult<RoadmapItem>> {
  if (!validId(milestoneId)) return badId;
  const body = itemPayload(draft);
  if ("error" in body) return { ok: false, error: body.error };
  return send("/items", "POST", { ...body.data, milestone_id: milestoneId });
}

export async function updateRoadmapItemAction(id: number, draft: ItemDraft): Promise<RoadmapResult<RoadmapItem>> {
  if (!validId(id)) return badId;
  const body = itemPayload(draft);
  if ("error" in body) return { ok: false, error: body.error };
  return send(`/items/${id}`, "PATCH", body.data);
}

export async function deleteRoadmapItemAction(id: number): Promise<RoadmapResult<unknown>> {
  if (!validId(id)) return badId;
  return send(`/items/${id}`, "DELETE");
}

// Ship (true) or un-ship (false).
export async function shipRoadmapItemAction(id: number, shipped: boolean): Promise<RoadmapResult<RoadmapItem>> {
  if (!validId(id)) return badId;
  return send(`/items/${id}/ship`, shipped ? "POST" : "DELETE");
}

// Into another open Milestone, at `position` (from 1).
export async function moveRoadmapItemAction(id: number, milestoneId: number, position: number): Promise<RoadmapResult<Roadmap>> {
  if (!validId(id) || !validId(milestoneId) || !validId(position)) return badId;
  return send(`/items/${id}/move`, "PUT", { milestone_id: milestoneId, position });
}

// A Milestone's items in a new order: every one of its item ids.
export async function orderRoadmapItemsAction(milestoneId: number, itemIds: number[]): Promise<RoadmapResult<Roadmap>> {
  if (!validId(milestoneId) || !itemIds.every(validId)) return badId;
  return send(`/milestones/${milestoneId}/items/order`, "PUT", { item_ids: itemIds });
}

// Milestones.

export async function createMilestoneAction(draft: MilestoneDraft): Promise<RoadmapResult<RoadmapMilestone>> {
  const body = milestonePayload(draft);
  if ("error" in body) return { ok: false, error: body.error };
  return send("/milestones", "POST", body.data);
}

export async function updateMilestoneAction(id: number, draft: MilestoneDraft): Promise<RoadmapResult<RoadmapMilestone>> {
  if (!validId(id)) return badId;
  const body = milestonePayload(draft);
  if ("error" in body) return { ok: false, error: body.error };
  return send(`/milestones/${id}`, "PATCH", body.data);
}

// Refused (`milestone_has_items`) while it still has Roadmap Items.
export async function deleteMilestoneAction(id: number): Promise<RoadmapResult<unknown>> {
  if (!validId(id)) return badId;
  return send(`/milestones/${id}`, "DELETE");
}

// The open Milestones in a new order: every open Milestone's id.
export async function orderMilestonesAction(milestoneIds: number[]): Promise<RoadmapResult<Roadmap>> {
  if (!milestoneIds.every(validId)) return badId;
  return send("/milestones/order", "PUT", { milestone_ids: milestoneIds });
}

// Reach: its unshipped items move to `destinationId` (null: the API's
// default, the next open Milestone).
export async function reachMilestoneAction(id: number, destinationId: number | null): Promise<RoadmapResult<Roadmap>> {
  if (!validId(id) || (destinationId !== null && !validId(destinationId))) return badId;
  return send(`/milestones/${id}/reach`, "POST", destinationId === null ? undefined : { destination_milestone_id: destinationId });
}

export async function unreachMilestoneAction(id: number): Promise<RoadmapResult<Roadmap>> {
  if (!validId(id)) return badId;
  return send(`/milestones/${id}/reach`, "DELETE");
}
