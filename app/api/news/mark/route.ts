import { revalidateTag } from "next/cache";
import { putNewsMark } from "@/lib/api/news-mark";
import { newsFeedTag } from "@/lib/news-category-preferences";
import { readNewsMarkBeacon } from "@/lib/news-mark";
import { getSession } from "@/lib/session";

// The News page's leave beacon (ticket www#222): moves the member's News
// Mark to the newest News Item the page showed, carrying the session to the
// API. Nobody reads the answer (a beacon can't), so a failure only leaves
// the mark where it was.
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = JSON.parse(await req.text());
  } catch {
    body = null;
  }
  const beacon = readNewsMarkBeacon(body);
  if (!beacon) return Response.json({ error: "news_mark must be an ISO 8601 instant" }, { status: 422 });

  const session = await getSession();
  if (!session) return Response.json({ error: "unauthenticated" }, { status: 401 });
  const userId = session.principal.discord_id;

  const status = await putNewsMark(userId, beacon);
  if (status === null) return Response.json({ error: "unavailable" }, { status: 502 });
  // The feed's meta carries the mark: expire the member's cached feed at
  // once, so coming back shows the items as Seen.
  if (status >= 200 && status < 300) revalidateTag(newsFeedTag(userId), { expire: 0 });
  return new Response(null, { status: status >= 200 && status < 300 ? 204 : status });
}
