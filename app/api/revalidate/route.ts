import { revalidateTag } from "next/cache";
import { checkRevalidateAuth } from "@/lib/revalidate-auth";

// The API's call when a round is decided (spec api#518): refreshes the
// `gotm` tag, which covers the public winners reads, so the landing, the
// site's Share Card metadata and its image pick up the new round. Marked
// stale ("max", stale-while-revalidate) rather than expired: the next read
// still answers at once with the old round and refetches in the background
// (the API is awake, having just sent this), so the read after it has the
// new round, and no page ever waits on the API here. The old round's image
// URL stays valid meanwhile (its card is keyed on what it draws).
export async function POST(request: Request) {
  const auth = checkRevalidateAuth(request.headers.get("authorization"), process.env.REVALIDATE_SECRET);
  if (auth === "unconfigured") {
    return Response.json({ error: "unconfigured" }, { status: 503 });
  }
  if (auth === "unauthorized") {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  revalidateTag("gotm", "max");
  return Response.json({ revalidated: true });
}
