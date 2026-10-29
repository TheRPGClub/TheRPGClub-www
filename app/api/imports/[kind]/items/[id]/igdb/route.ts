import { NextRequest } from "next/server";
import { apiFetch } from "@/lib/api";
import { importItemApiPath, isImportKind } from "@/lib/imports/kinds";

// IGDB suggestions for one import row, for any import kind. The review UI is
// a client component and can't send the HttpOnly session token itself, so it
// asks here and apiFetch attaches the bearer header. The API checks that the
// row belongs to the caller.
export async function GET(
  req: NextRequest,
  ctx: RouteContext<"/api/imports/[kind]/items/[id]/igdb">,
) {
  const { kind, id } = await ctx.params;
  const itemId = Number(id);
  if (!isImportKind(kind) || !Number.isInteger(itemId) || itemId <= 0) {
    return Response.json({ error: "not_found" }, { status: 404 });
  }

  const q = req.nextUrl.searchParams.get("q")?.trim().slice(0, 200);
  const qs = q ? `?${new URLSearchParams({ q })}` : "";

  const res = await apiFetch(`${importItemApiPath(kind, itemId)}/igdb_candidates${qs}`, {
    cache: "no-store",
  });
  return new Response(await res.text(), {
    status: res.status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}
