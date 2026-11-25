import { NextRequest } from "next/server";
import { apiFetch } from "@/lib/api";

// A Franchise's page read for the context cards on Game Edit's Franchises
// tab (www#208), run server-side so apiFetch can attach the session (see
// app/api/franchises/search).
export async function GET(_req: NextRequest, ctx: RouteContext<"/api/franchises/[id]">) {
  const { id } = await ctx.params;
  if (!/^\d+$/.test(id)) return Response.json({ error: "not_found" }, { status: 404 });
  const res = await apiFetch(`/api/v1/franchises/${id}`, { cache: "no-store" });
  return new Response(await res.text(), {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}
