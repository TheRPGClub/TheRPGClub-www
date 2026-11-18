"use server";

import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api";
import { apiErrorMessage, readApiError } from "@/lib/api/errors";
import { FUN_FACT_MAX } from "@/lib/codex/fun-fact-text";
import { CODEX_PATH, FUN_FACTS_PATH } from "@/lib/codex/paths";

// Adding, editing and deleting a Fun Fact from the wall (www#124). The API
// decides who may: Regulars and staff add, the author or a Moderator and above
// edit and delete. Its refusals are already written for members.

export interface FunFactActionResult {
  ok: boolean;
  error?: string;
}

type Action = "add" | "edit" | "delete";

const NOT_FOUND: Record<Action, string> = {
  add: "The Club Codex isn't open to you right now.",
  edit: "That Fun Fact is gone. Someone may have deleted it.",
  delete: "That Fun Fact is gone already.",
};

function revalidate() {
  revalidatePath(CODEX_PATH);
  revalidatePath(FUN_FACTS_PATH);
}

// The text as the API takes it, or why not.
function checkBody(body: unknown): string | { error: string } {
  if (typeof body !== "string") return { error: "Write the Fun Fact first." };
  const text = body.trim();
  if (!text) return { error: "Write the Fun Fact first." };
  if (text.length > FUN_FACT_MAX) return { error: `A Fun Fact fits in ${FUN_FACT_MAX} characters, mentions included.` };
  return text;
}

function validId(id: unknown): id is number {
  return typeof id === "number" && Number.isInteger(id) && id > 0;
}

async function send(path: string, init: RequestInit, action: Action): Promise<FunFactActionResult> {
  try {
    const res = await apiFetch(path, { ...init, cache: "no-store" });
    if (res.ok) {
      revalidate();
      return { ok: true };
    }
    if (res.status === 401) return { ok: false, error: "Your session has ended. Sign in again." };
    if (res.status === 404) return { ok: false, error: NOT_FOUND[action] };
    return { ok: false, error: apiErrorMessage(await readApiError(res)) };
  } catch {
    return { ok: false, error: "Couldn't reach the club's server. Try again." };
  }
}

export async function addFunFactAction(body: string): Promise<FunFactActionResult> {
  const text = checkBody(body);
  if (typeof text !== "string") return { ok: false, ...text };
  return send("/api/v1/codex/fun_facts", { method: "POST", body: JSON.stringify({ data: { body: text } }) }, "add");
}

export async function editFunFactAction(id: number, body: string): Promise<FunFactActionResult> {
  if (!validId(id)) return { ok: false, error: NOT_FOUND.edit };
  const text = checkBody(body);
  if (typeof text !== "string") return { ok: false, ...text };
  return send(
    `/api/v1/codex/fun_facts/${id}`,
    { method: "PATCH", body: JSON.stringify({ data: { body: text } }) },
    "edit",
  );
}

export async function deleteFunFactAction(id: number): Promise<FunFactActionResult> {
  if (!validId(id)) return { ok: false, error: NOT_FOUND.delete };
  return send(`/api/v1/codex/fun_facts/${id}`, { method: "DELETE" }, "delete");
}
