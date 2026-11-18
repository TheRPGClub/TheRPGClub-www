import { notFound } from "next/navigation";
import { getSession, requireFeature } from "@/lib/session";
import { fetchCodexPage } from "@/lib/api/codex";
import { pageParam } from "@/lib/codex/wall";
import { firstParam, type RawSearchParams } from "@/lib/search-params";
import { isRegularOrStaff } from "@/lib/staff";
import { PreviewBadge } from "@/components/feature/preview-badge";
import { LoreShelfPage } from "@/components/codex/lore/lore-shelf-page";

// Club Lore (spec api#397, design 4D, www#125): every Lore Entry, newest
// first, twelve to a shelf. `?entry=` keeps the picked one.

const PER = 12;

export default async function LorePage({ searchParams }: { searchParams: Promise<RawSearchParams> }) {
  const features = await requireFeature("club_codex");
  const params = await searchParams;
  const page = pageParam(firstParam(params.page));
  const picked = Number(firstParam(params.entry));
  const [session, read] = await Promise.all([getSession(), fetchCodexPage("lore_entry", page, PER)]);
  // The flag changed after the gate ran.
  if (read === "not_found") notFound();

  return (
    <LoreShelfPage
      entries={read?.data ?? []}
      total={read?.total ?? 0}
      pages={read?.pages ?? 1}
      page={page}
      per={PER}
      picked={Number.isInteger(picked) && picked > 0 ? picked : null}
      viewerId={session?.principal.discord_id ?? null}
      canAdd={isRegularOrStaff(session?.membership ?? null)}
      failed={read === null}
      badge={features.preview("club_codex") && <PreviewBadge />}
    />
  );
}
