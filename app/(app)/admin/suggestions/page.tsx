import { requireAuth } from "@/lib/session";
import { canUseTier, staffSection } from "@/lib/staff";
import { PageHeader } from "@/components/issue/page-header";
import { StaffOnly } from "@/components/staff-only";

const SECTION = staffSection("suggestions");

// Placeholder until this tool's own ticket lands; the gate is already live.
export default async function SuggestionReviewPage() {
  const session = await requireAuth();
  if (!canUseTier(session.membership, SECTION.tier)) {
    return <StaffOnly title={SECTION.label} tier={SECTION.tier} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader title={SECTION.label} description={SECTION.blurb} />
      <p className="text-paper-dim">{"This tool isn't ready yet."}</p>
    </div>
  );
}
