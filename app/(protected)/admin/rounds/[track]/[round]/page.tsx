import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { fetchRoundEntries } from "@/lib/api/admin-rounds";
import { requireAuth } from "@/lib/session";
import { canUseTier, staffSection } from "@/lib/staff";
import { TRACK_NAME, trackFromSlug } from "@/lib/rounds";
import { DeskHeader } from "@/components/templates/desk-header";
import { RoundEditor } from "@/components/admin/rounds/round-editor";
import { StaffOnly } from "@/components/staff-only";
import { buttonVariants } from "@/components/ui/button";

const SECTION = staffSection("rounds");

// /admin/rounds/<gotm|nr-gotm>/<round>: edit one track's round, its games
// and Reddit URLs. The round's number and month are fixed once it exists.
export default async function RoundEditPage({
  params,
}: {
  params: Promise<{ track: string; round: string }>;
}) {
  const session = await requireAuth();
  if (!canUseTier(session.membership, SECTION.tier)) {
    return <StaffOnly title={SECTION.label} tier={SECTION.tier} />;
  }

  const { track, round } = await params;
  const category = trackFromSlug(track);
  const roundNumber = /^\d+$/.test(round) ? Number(round) : NaN;
  if (!category || !Number.isInteger(roundNumber) || roundNumber < 1) notFound();

  const entries = await fetchRoundEntries(category, roundNumber);
  const label = TRACK_NAME[category];
  const monthYear = entries?.[0]?.month_year ?? "";

  return (
    <div>
      <DeskHeader
        title={`${label} round ${roundNumber}`}
        side={
          <>
            <b>{monthYear || "No entries"}</b>
            {entries && entries.length > 0 && (
              <>
                {" "}
                · {entries.length} {entries.length === 1 ? "game" : "games"}
              </>
            )}
            <br />
            Number and month are fixed
          </>
        }
      />
      <div className="mt-4">
        <Link href="/admin/rounds" className={buttonVariants({ variant: "ghost", size: "sm" })}>
          <ArrowLeft data-icon="inline-start" />
          All rounds
        </Link>
      </div>
      <div className="mt-4">
        {entries === null ? (
          <p role="alert" className="text-destructive">
            {"Couldn't load the round. Refresh to try again."}
          </p>
        ) : entries.length === 0 ? (
          <p className="text-dim-foreground">
            {label} round {roundNumber} has no games yet.{" "}
            <Link
              href={`/admin/rounds?track=${track}&round=${roundNumber}#add`}
              className="text-foreground underline decoration-highlight underline-offset-4 hover:text-highlight"
            >
              Add it
            </Link>
            .
          </p>
        ) : (
          <RoundEditor category={category} roundNumber={roundNumber} monthYear={monthYear} entries={entries} />
        )}
      </div>
    </div>
  );
}
