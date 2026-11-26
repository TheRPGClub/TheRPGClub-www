import { apiFetch } from "@/lib/api";
import { readPatchMarkAnswer, type PatchMarkMoved } from "@/lib/patch-notes/patch-mark";

// Moves a member's Patch Mark (api#512, `PUT /users/:id/patch_mark`) to a
// Patch number. The API only moves it forward and clamps it to the newest
// published Patch. Answers where the mark is now and whether a published
// Patch is still past it, or null on any failure (the mark stays put).
export async function putPatchMark(userId: string, number: number): Promise<PatchMarkMoved | null> {
  try {
    const res = await apiFetch(`/api/v1/users/${encodeURIComponent(userId)}/patch_mark`, {
      method: "PUT",
      body: JSON.stringify({ data: { patch_mark: number } }),
      cache: "no-store",
    });
    if (!res.ok) return null;
    return readPatchMarkAnswer(await res.json());
  } catch {
    return null;
  }
}
