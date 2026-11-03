import { NextRequest } from "next/server";
import { apiFetch } from "@/lib/api";

// The thread link picker's search (`GET /threads?q=`). Proxied server-side so
// apiFetch can attach the session's bearer token; the API gates it to
// Regulars, or Moderator and up.
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q") ?? "";
  const per = url.searchParams.get("per") ?? "8";

  const qs = new URLSearchParams({ per });
  if (q) qs.set("q", q);

  const res = await apiFetch(`/api/v1/threads?${qs}`, { cache: "no-store" });
  const body = await res.text();
  return new Response(body, {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}
