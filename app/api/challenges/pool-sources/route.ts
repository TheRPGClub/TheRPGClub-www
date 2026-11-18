import { NextRequest } from "next/server";
import { apiFetch } from "@/lib/api";

// The form's franchise and collection search, run server-side so apiFetch can
// attach the session (see app/api/games/search).
export async function GET(req: NextRequest) {
  const q = new URL(req.url).searchParams.get("q")?.trim() ?? "";
  if (!q) return Response.json({ data: [] });
  const res = await apiFetch(`/api/v1/challenges/pool_sources?${new URLSearchParams({ q })}`, { cache: "no-store" });
  return new Response(await res.text(), {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}
