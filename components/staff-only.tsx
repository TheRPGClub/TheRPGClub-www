import Link from "next/link";
import { PageHeader } from "@/components/issue/page-header";
import { buttonVariants } from "@/components/ui/button";
import { TIER_AUDIENCE, type StaffTier } from "@/lib/staff";

// What a staff page shows a member whose role can't use it: who can, rather
// than a blank page or a 404. The API refuses the same member on its own.
export function StaffOnly({ title, tier }: { title: string; tier: StaffTier }) {
  return (
    <div className="space-y-6">
      <PageHeader
        title={title}
        description={`Only ${TIER_AUDIENCE[tier]} can use this page. If you think your role is out of date, sign out and back in to refresh it from Discord.`}
      />
      <Link href="/dashboard" className={buttonVariants({ variant: "outline" })}>
        Back to the dashboard
      </Link>
    </div>
  );
}
