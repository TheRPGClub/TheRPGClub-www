import { fetchAdminRounds } from "@/lib/api/admin-rounds";
import { paginationOf } from "@/lib/api/pagination";
import { requireAuth } from "@/lib/session";
import { firstParam, type RawSearchParams } from "@/lib/search-params";
import { canUseTier, staffSection } from "@/lib/staff";
import { nextRoundDefaults, trackFromSlug } from "@/lib/rounds";
import { DeskHeader } from "@/components/templates/desk-header";
import { RoundForm } from "@/components/admin/rounds/round-form";
import { RoundsOnFile } from "@/components/admin/rounds/rounds-on-file";
import { StaffOnly } from "@/components/staff-only";

const SECTION = staffSection("rounds");

// /admin/rounds: add a GOTM or NR-GOTM round by searching games, over the
// rounds on file, newest first, each track with its Edit link.
export default async function RoundsAdminPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const session = await requireAuth();
  if (!canUseTier(session.membership, SECTION.tier)) {
    return <StaffOnly title={SECTION.label} tier={SECTION.tier} />;
  }

  const params = await searchParams;
  const pageParam = parseInt(firstParam(params.page) ?? "", 10);
  const page = Number.isFinite(pageParam) && pageParam > 1 ? pageParam : 1;
  const track = trackFromSlug(firstParam(params.track));
  const prefillRound = parseInt(firstParam(params.round) ?? "", 10);
  const prefillMonth = firstParam(params.month)?.trim();

  // The defaults come from the newest rounds, whatever page is listed.
  const [listed, newest] = await Promise.all([
    fetchAdminRounds(page),
    page === 1 ? null : fetchAdminRounds(1),
  ]);
  const head = (page === 1 ? listed : newest)?.rounds ?? [];
  const now = new Date();
  const defaults = {
    gotm: nextRoundDefaults(head, "gotm", now),
    nr_gotm: nextRoundDefaults(head, "nr_gotm", now),
  };
  const latest = head[0];
  const latestMonth = latest ? (latest.gotm?.month_year ?? latest.nr_gotm?.month_year) : null;
  const rounds = listed?.rounds ?? [];
  const { total, totalPages } = paginationOf(listed?.meta ?? undefined, rounds.length);

  return (
    <div>
      <DeskHeader
        title={SECTION.label}
        side={
          latest ? (
            <>
              <b>Latest Round {latest.round_number}</b>
              {latestMonth && <> · {latestMonth}</>}
              <br />
              {total} {total === 1 ? "round" : "rounds"} on file
            </>
          ) : (
            "No rounds on file yet"
          )
        }
      />

      <div id="add" className="mt-6.5 scroll-mt-20">
        <RoundForm
          // A new prefill link starts a fresh form.
          key={`${track ?? ""}-${prefillRound}-${prefillMonth ?? ""}`}
          defaults={defaults}
          prefill={
            track
              ? {
                  category: track,
                  roundNumber: Number.isFinite(prefillRound) && prefillRound > 0 ? prefillRound : undefined,
                  monthYear: prefillMonth || undefined,
                }
              : null
          }
        />
      </div>

      <RoundsOnFile rounds={listed === null ? null : rounds} page={page} totalPages={totalPages} />
    </div>
  );
}
