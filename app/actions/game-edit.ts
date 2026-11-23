"use server";

import { revalidatePath, updateTag } from "next/cache";
import { apiFetch } from "@/lib/api";
import { apiErrorMessage, readApiError } from "@/lib/api/errors";
import type { GameText, StepResult } from "@/lib/games/game-edit";

// The Game Edit page's steps (spec api#437): each saves one planned call of
// the Game Edit save module and answers { ok } or { ok: false, error }.

const MESSAGES: Record<string, string> = {
  forbidden: "Only Admins can edit a game's description and Featured Video.",
  not_found: "That game is no longer in GameDB.",
};

function validId(id: number): boolean {
  return Number.isInteger(id) && id > 0;
}

// The game page and its edit page show the change at once.
function revalidateGame(gameId: number) {
  revalidatePath(`/games/${gameId}`);
  revalidatePath(`/games/${gameId}/edit`);
  updateTag("games");
}

// One game update carrying only the changed fields (Admins).
export async function updateGameTextAction(gameId: number, fields: Partial<GameText>): Promise<StepResult> {
  if (!validId(gameId)) return { ok: false, error: "That game can't be edited." };
  let res: Response;
  try {
    res = await apiFetch(`/api/v1/games/${gameId}`, {
      method: "PATCH",
      body: JSON.stringify({ data: fields }),
      cache: "no-store",
    });
  } catch {
    return { ok: false, error: "Couldn't reach the club's server. Try again." };
  }
  if (!res.ok) {
    const err = await readApiError(res);
    const code = err.code ?? (res.status === 403 ? "forbidden" : res.status === 404 ? "not_found" : undefined);
    return { ok: false, error: apiErrorMessage({ ...err, code }, MESSAGES) };
  }
  revalidateGame(gameId);
  return { ok: true };
}
