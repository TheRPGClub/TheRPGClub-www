import Link from "next/link";
import type { CSSProperties } from "react";
import { requireAuth } from "@/lib/session";
import { hasMemberRole, isAdminOrAbove } from "@/lib/staff";
import { fetchClaimedKeys, fetchDonatedKeys, fetchMemberNames, fetchShelfKeys } from "@/lib/api/game-keys";
import { buildShelves, platformFamilyByKey, PLATFORM_FAMILIES } from "@/lib/giveaways";
import { PageHeader } from "@/components/issue/page-header";
import { GiveawayShelf } from "@/components/giveaways/giveaway-shelf";
import { ClaimedMini, DonatePanel, DonationsMini } from "@/components/giveaways/giveaway-rail";
import { cn } from "@/lib/utils";

export const metadata = { title: "Giveaways" };

export default async function GiveawaysPage({
  searchParams,
}: {
  searchParams: Promise<{ platform?: string }>;
}) {
  const session = await requireAuth();
  const { platform } = await searchParams;
  const viewerId = session.principal.discord_id;

  const [keys, claimed, donated, names] = await Promise.all([
    fetchShelfKeys(),
    fetchClaimedKeys(viewerId),
    fetchDonatedKeys(viewerId),
    fetchMemberNames(),
  ]);

  const canClaim = hasMemberRole(session.membership);
  const allShelves = buildShelves(keys ?? []);
  const picked = platformFamilyByKey(platform);
  const shelves = picked ? allShelves.filter((s) => s.family.key === picked.key) : allShelves;
  const total = allShelves.reduce((n, s) => n + s.count, 0);
  const counts = new Map(allShelves.map((s) => [s.family.key, s.count]));

  return (
    <div className="space-y-5">
      <PageHeader
        title="Giveaways"
        count={keys === null ? undefined : `${total} ${total === 1 ? "key" : "keys"} on the shelf`}
      />

      {!canClaim && (
        <p className="max-w-[65ch] text-sm text-paper-dim">
          You can browse and donate, but claiming a key needs the Members role in Discord, as it does in the bot. If you
          have it, sign out and back in to refresh your roles.
        </p>
      )}

      {keys === null ? (
        <p role="alert" className="text-destructive">
          {"Couldn't load the shelf. Refresh to try again."}
        </p>
      ) : (
        <>
          <nav aria-label="Platforms" className="flex flex-wrap gap-2">
            <PlatformTab href="/giveaways" active={!picked} label="All" count={total} />
            {PLATFORM_FAMILIES.filter((f) => f.key !== "other" || counts.has("other")).map((f) => (
              <PlatformTab
                key={f.key}
                href={`/giveaways?platform=${f.key}`}
                active={picked?.key === f.key}
                label={f.label}
                count={counts.get(f.key) ?? 0}
                ink={f.ink}
              />
            ))}
          </nav>
          <GiveawayShelf
            shelves={shelves}
            viewerId={viewerId}
            canClaim={canClaim}
            canRevokeAny={isAdminOrAbove(session.membership)}
            names={Object.fromEntries(names)}
            emptyCopy={
              picked
                ? `No ${picked.label} keys on the shelf right now.`
                : "The shelf is empty right now. Got a spare key? Put it up."
            }
            rail={
              <>
                <DonatePanel canClaimCopy="Put it on the shelf. Any member with the Members role can claim it." />
                <ClaimedMini keys={claimed} />
                <DonationsMini keys={donated} />
              </>
            }
          />
        </>
      )}
    </div>
  );
}

function PlatformTab({
  href,
  active,
  label,
  count,
  ink,
}: {
  href: string;
  active: boolean;
  label: string;
  count: number;
  ink?: string;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      style={ink ? ({ "--p": ink } as CSSProperties) : undefined}
      className={cn(
        "font-label inline-flex h-8 items-center gap-2 rounded-sm px-3 text-[0.88rem] font-extrabold transition-colors",
        !ink && (active ? "bg-ink-2 text-paper shadow-[inset_0_0_0_2px_var(--color-highlight)]" : "bg-ink-2 text-paper-dim hover:text-paper"),
        ink && (active ? "bg-(--p) text-ink" : "text-paper-dim shadow-[inset_0_0_0_1.5px_var(--p)] hover:text-paper"),
        count === 0 && !active && "opacity-60",
      )}
    >
      {label}
      <b className="font-extrabold opacity-65">{count}</b>
    </Link>
  );
}
