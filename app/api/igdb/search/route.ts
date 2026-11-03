import { NextRequest } from "next/server";
import { apiFetch } from "@/lib/api";

const MAX_PER = 20;

// The IGDB fallback's search (see components/igdb/igdb-fallback.tsx). Like
// /api/games/search, it runs server-side so apiFetch can attach the session
// bearer from the HttpOnly cookie. One title only: no bulk search.
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") ?? "").trim();
  if (!q) {
    return Response.json({ data: [] });
  }
  const per = Math.min(
    MAX_PER,
    Math.max(1, parseInt(url.searchParams.get("per") ?? "8", 10) || 8),
  );

  const qs = new URLSearchParams({ q, per: String(per) });
  const res = await apiFetch(`/api/v1/igdb/search?${qs}`, { cache: "no-store" });
  const body = await res.text();
  return new Response(body, {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}
