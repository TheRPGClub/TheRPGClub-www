import { NextRequest } from "next/server";
import { apiFetch } from "@/lib/api";

// The member picker's search (`GET /users?q=`: username, display name, or an
// exact Discord id). Proxied server-side so apiFetch can attach the
// session's bearer token.
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") ?? "").trim();
  const per = url.searchParams.get("per") ?? "8";

  const qs = new URLSearchParams({ per });
  if (q) qs.set("q", q);

  const res = await apiFetch(`/api/v1/users?${qs}`, { cache: "no-store" });
  const body = await res.text();
  return new Response(body, {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}
