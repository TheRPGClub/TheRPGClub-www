"use server";

import { refresh, revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api";
import { apiErrorMessage, readApiError } from "@/lib/api/errors";
import { NOTE_MAX } from "@/lib/game-lists/types";

// Pool Proposals and list notices on a Pool Challenge, as the signed-in
// member (api#447, api#448): propose a game, accept one as Core or Optional
// (and add it to the linked Game List), decline one, and Remove or Keep a
// Core Game that left the linked list. The API decides who may; its
// refusals are written for members and shown as given.

export interface ProposalActionResult {
  ok: boolean;
  error?: string;
  // 409 already_in_pool / already_proposed: shown as a slip, not a line.
  refusal?: { code: string; message: string };
}

const UNREACHABLE = "Couldn't reach the club's server. Try again.";

const MESSAGES: Record<string, string> = {
  already_decided: "Someone decided on this proposal a moment ago.",
  list_full: "The Game List holds 500 games already, so the game went nowhere. Accept it without adding it to the list.",
};

const validId = (id: number) => Number.isInteger(id) && id > 0;

async function send(path: string, data: Record<string, unknown>): Promise<ProposalActionResult> {
  let res: Response;
  try {
    res = await apiFetch(path, { method: "POST", body: JSON.stringify({ data }), cache: "no-store" });
  } catch {
    return { ok: false, error: UNREACHABLE };
  }
  if (!res.ok) {
    if (res.status === 401) return { ok: false, error: "Your session has ended. Sign in again." };
    if (res.status === 404) return { ok: false, error: "That Challenge, or that proposal, no longer exists." };
    const err = await readApiError(res);
    if (err.code === "already_in_pool" || err.code === "already_proposed")
      return { ok: false, refusal: { code: err.code, message: err.message ?? apiErrorMessage(err) } };
    if (res.status === 403 && !err.message) return { ok: false, error: "You can't decide on this Challenge's proposals." };
    return { ok: false, error: apiErrorMessage(err, MESSAGES) };
  }
  revalidatePath("/challenges", "layout");
  refresh();
  return { ok: true };
}

export async function proposeGameAction(challengeId: number, gameId: number, note: string): Promise<ProposalActionResult> {
  if (!validId(challengeId) || !validId(gameId)) return { ok: false, error: "Pick a game to propose." };
  const text = note.trim();
  if (text.length > NOTE_MAX) return { ok: false, error: `Keep the note to ${NOTE_MAX} characters.` };
  return send(`/api/v1/challenges/${challengeId}/pool_proposals`, { game_id: gameId, note: text || null });
}

export async function acceptProposalAction(
  challengeId: number,
  proposalId: number,
  as: "core" | "optional",
  addToList: boolean,
): Promise<ProposalActionResult> {
  if (!validId(challengeId) || !validId(proposalId)) return { ok: false, error: "That proposal no longer exists." };
  return send(`/api/v1/challenges/${challengeId}/pool_proposals/${proposalId}/accept`, {
    as,
    ...(addToList ? { add_to_list: true } : {}),
  });
}

export async function declineProposalAction(challengeId: number, proposalId: number): Promise<ProposalActionResult> {
  if (!validId(challengeId) || !validId(proposalId)) return { ok: false, error: "That proposal no longer exists." };
  return send(`/api/v1/challenges/${challengeId}/pool_proposals/${proposalId}/decline`, {});
}

// A list notice: take the Core Game out of the Pool, or keep it.
export async function settleListNoticeAction(
  challengeId: number,
  noticeId: number,
  choice: "remove" | "keep",
): Promise<ProposalActionResult> {
  if (!validId(challengeId) || !validId(noticeId)) return { ok: false, error: "That notice is already settled." };
  return send(`/api/v1/challenges/${challengeId}/list_notices/${noticeId}/${choice}`, {});
}
