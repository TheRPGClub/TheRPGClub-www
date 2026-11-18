import { notFound } from "next/navigation";
import { getSession, requireFeature } from "@/lib/session";
import { fetchCodexPage } from "@/lib/api/codex";
import { pageParam } from "@/lib/codex/wall";
import { firstParam, type RawSearchParams } from "@/lib/search-params";
import { isRegularOrStaff } from "@/lib/staff";
import { PreviewBadge } from "@/components/feature/preview-badge";
import { FunFactsWall } from "@/components/codex/fun-facts/fun-facts-wall";

// The Fun Facts wall (spec api#397, designs 4D and 5D, www#124): every Fun
// Fact, newest first, twelve to a page, added and edited in place.

const PER = 12;

export default async function FunFactsPage({ searchParams }: { searchParams: Promise<RawSearchParams> }) {
  const features = await requireFeature("club_codex");
  const page = pageParam(firstParam((await searchParams).page));
  const [session, read] = await Promise.all([getSession(), fetchCodexPage("fun_fact", page, PER)]);
  // The flag changed after the gate ran.
  if (read === "not_found") notFound();

  return (
    <FunFactsWall
      facts={read?.data ?? []}
      total={read?.total ?? 0}
      pages={read?.pages ?? 1}
      page={page}
      per={PER}
      canAdd={isRegularOrStaff(session?.membership ?? null)}
      failed={read === null}
      badge={features.preview("club_codex") && <PreviewBadge />}
    />
  );
}
