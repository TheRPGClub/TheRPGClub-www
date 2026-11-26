import { revalidateTag } from "next/cache";
import { checkRevalidateAuth } from "@/lib/revalidate-auth";

// The API's call when a round is decided (spec api#518): refreshes the
// `gotm` tag, which covers the public winners reads, so the landing, the
// site's Share Card metadata and its image pick up the new round. Expired at
// once rather than served stale: the next link-preview crawl must see the new
// round's image URL.
export async function POST(request: Request) {
  const auth = checkRevalidateAuth(request.headers.get("authorization"), process.env.REVALIDATE_SECRET);
  if (auth === "unconfigured") {
    return Response.json({ error: "unconfigured" }, { status: 503 });
  }
  if (auth === "unauthorized") {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  revalidateTag("gotm", { expire: 0 });
  return Response.json({ revalidated: true });
}
