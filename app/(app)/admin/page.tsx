import Link from "next/link";
import { requireAuth } from "@/lib/session";
import { canUseTier, staffSection, staffSectionsFor, TIER_AUDIENCE } from "@/lib/staff";
import { PageHeader } from "@/components/issue/page-header";
import { StaffOnly } from "@/components/staff-only";

// The /admin landing: the staff tools this member's role can use.
export default async function StaffDeskPage() {
  const session = await requireAuth();
  const overview = staffSection("overview");
  if (!canUseTier(session.membership, overview.tier)) {
    return <StaffOnly title={overview.label} tier={overview.tier} />;
  }

  const tools = staffSectionsFor(session.membership).filter((s) => s.key !== "overview");

  return (
    <div className="space-y-6">
      <PageHeader title={overview.label} description={overview.blurb} />
      {tools.length === 0 ? (
        <p className="text-paper-dim">Moderator tools are on the way.</p>
      ) : (
        <ul className="border-t-2 border-paper">
          {tools.map((tool) => (
            <li key={tool.key} className="border-b border-rule py-3">
              <Link href={tool.href} className="font-semibold text-paper hover:underline">
                {tool.label}
              </Link>
              <p className="text-sm text-paper-dim">{tool.blurb}</p>
              <p className="font-label text-[0.78rem] text-paper-mute">
                {TIER_AUDIENCE[tool.tier]}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
