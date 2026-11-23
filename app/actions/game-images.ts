"use server";

import { revalidatePath, updateTag } from "next/cache";
import { apiFetch } from "@/lib/api";
import { apiErrorMessage, readApiError } from "@/lib/api/errors";
import type { GameImage } from "@/lib/api/types";
import type { GameImageEntry, StepResult } from "@/lib/games/game-edit";

// The Game Edit page's Images steps (spec api#437, www#158): upload, update
// (primary, position) and delete one image (Admins), plus the section's
// reload and Refresh from IGDB.

const UNREACHABLE = "Couldn't reach the club's server. Try again.";
const MESSAGES: Record<string, string> = {
  forbidden: "Only Admins can change a game's images.",
  not_found: "That image or game is no longer in GameDB.",
  backblaze_not_configured: "Image storage isn't set up on the club's server.",
  backblaze_request_failed: "Image storage didn't answer. Try again.",
  missing_igdb_id: "This game isn't linked to IGDB.",
  igdb_game_not_found: "IGDB doesn't know this game any more.",
  igdb_not_configured: "IGDB isn't set up on the club's server.",
  igdb_request_failed: "IGDB didn't answer. Try again.",
  image_import_failed: "An IGDB image couldn't be imported. Try again.",
};

const validId = (id: number) => Number.isInteger(id) && id > 0;

function revalidateGame(gameId: number) {
  revalidatePath(`/games/${gameId}`);
  revalidatePath(`/games/${gameId}/edit`);
  revalidatePath("/dashboard");
  updateTag("games");
}

async function send(gameId: number, path: string, init: RequestInit): Promise<StepResult> {
  let res: Response;
  try {
    res = await apiFetch(`/api/v1/games/${gameId}${path}`, { ...init, cache: "no-store" });
  } catch {
    return { ok: false, error: UNREACHABLE };
  }
  if (!res.ok) {
    const err = await readApiError(res);
    const code = err.code ?? (res.status === 403 ? "forbidden" : res.status === 404 ? "not_found" : undefined);
    return { ok: false, error: apiErrorMessage({ ...err, code }, MESSAGES) };
  }
  revalidateGame(gameId);
  return { ok: true };
}

// `form` carries `file`, `kind` and `is_primary`; the API wants them under
// `image[...]`.
export async function uploadGameImageAction(gameId: number, form: FormData): Promise<StepResult> {
  if (!validId(gameId)) return { ok: false, error: "That game can't be edited." };
  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) return { ok: false, error: "Choose an image file." };
  const body = new FormData();
  body.append("image[file]", file);
  body.append("image[kind]", String(form.get("kind") ?? ""));
  body.append("image[is_primary]", String(form.get("is_primary") ?? "false"));
  return send(gameId, "/images", { method: "POST", body });
}

export async function updateGameImageAction(
  gameId: number,
  imageId: number,
  fields: { is_primary?: true; position?: number },
): Promise<StepResult> {
  if (!validId(gameId) || !validId(imageId)) return { ok: false, error: "That image can't be edited." };
  return send(gameId, `/images/${imageId}`, { method: "PATCH", body: JSON.stringify({ data: fields }) });
}

export async function deleteGameImageAction(gameId: number, imageId: number): Promise<StepResult> {
  if (!validId(gameId) || !validId(imageId)) return { ok: false, error: "That image can't be removed." };
  return send(gameId, `/images/${imageId}`, { method: "DELETE" });
}

// Runs at once, not staged; the tab reloads the section after.
export async function refreshGameImagesAction(gameId: number): Promise<StepResult> {
  if (!validId(gameId)) return { ok: false, error: "That game can't be refreshed." };
  return send(gameId, "/refresh-images", { method: "POST" });
}

// The section's record, or null when the API couldn't be read.
export async function listGameImagesAction(gameId: number): Promise<GameImageEntry[] | null> {
  if (!validId(gameId)) return null;
  try {
    const res = await apiFetch(`/api/v1/games/${gameId}/images`, { cache: "no-store" });
    if (!res.ok) return null;
    const { data }: { data: GameImage[] } = await res.json();
    return data.map(toEntry);
  } catch {
    return null;
  }
}

function toEntry(i: GameImage): GameImageEntry {
  return { image_id: i.image_id, kind: i.kind, url: i.url, is_primary: i.is_primary, position: i.position };
}
