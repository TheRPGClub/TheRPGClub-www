import { NextRequest } from "next/server";
import { apiFetch } from "@/lib/api";

// The Franchise search behind "Link to a Franchise" and Merge, run
// server-side so apiFetch can attach the session (see app/api/games/search).
// Merged Franchises are off the API's list.
export async function GET(req: NextRequest) {
  const q = new URL(req.url).searchParams.get("q")?.trim() ?? "";
  if (!q) return Response.json({ data: [] });
  const res = await apiFetch(`/api/v1/franchises?${new URLSearchParams({ q, per: "10" })}`, { cache: "no-store" });
  return new Response(await res.text(), {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}
