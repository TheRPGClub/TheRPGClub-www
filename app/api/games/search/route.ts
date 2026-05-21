import { NextRequest } from "next/server";
import { apiFetch } from "@/lib/api";

// Client components can't reach the backend directly: the session cookie is
// HttpOnly, and the backend authenticates via a bearer header it can't see.
// This route runs server-side, so apiFetch reads the cookie and attaches the
// Authorization header for us.
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q") ?? "";
  const limit = url.searchParams.get("limit") ?? "8";

  const qs = new URLSearchParams({ limit });
  if (q) qs.set("q", q);

  const res = await apiFetch(`/api/v1/games?${qs}`, { cache: "no-store" });
  const body = await res.text();
  return new Response(body, {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}
