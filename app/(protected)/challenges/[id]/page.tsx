import { notFound } from "next/navigation";
import { requireAuth, requireFeature } from "@/lib/session";
import { isModeratorOrAbove } from "@/lib/staff";
import { loadChallengePage } from "@/lib/challenges/challenge-page";
import { canEditChallenge, canHostDelete } from "@/lib/challenges/permissions";
import { parsePlayed } from "@/lib/challenges/pool-wall";
import { PreviewBadge } from "@/components/feature/preview-badge";
import { ChallengeView } from "@/components/challenges/challenge-view";
import { DuplicateNotice } from "@/components/challenges/duplicate-notice";
import { HostTools } from "@/components/challenges/host-tools";
import { StaffMenu } from "@/components/challenges/staff-menu";
import { NoticeSlip } from "@/components/issue/notice-slip";
import { RunActionButton } from "@/components/challenges/run-action-button";
import { loadEditionPage } from "@/lib/challenges/edition-page";
import { EditionView } from "@/components/challenges/assignment/edition-view";

// A Challenge's page: its rules, Host and schedule, every member's Run, and
// The Pool (`?view=pool`); an Assignment Challenge's Edition (`?edition=`,
// else the current one). `dup` names the Challenges that already had this
// one's name, right after it was created.
export default async function ChallengePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    view?: string;
    played?: string;
    all?: string;
    dup?: string;
    edition?: string;
  }>;
}) {
  const session = await requireAuth();
  const features = await requireFeature("challenges");
  const { id: rawId } = await params;
  const { view, played, all, dup, edition } = await searchParams;
  const id = Number(rawId);
  if (!Number.isInteger(id) || id <= 0) notFound();

  const viewer = {
    id: session.principal.discord_id,
    membership: session.membership,
  };
  const read = await loadChallengePage(id, viewer.id);
  if (!read.ok) {
    if (read.status === 404) notFound();
    return (
      <NoticeSlip title="Not just now" role="alert" className="mt-8 max-w-xl">
        This Challenge couldn&apos;t be read. Try again in a moment.
      </NoticeSlip>
    );
  }
  const { page } = read;
  const { challenge } = page;
  const staff = isModeratorOrAbove(session.membership);
  const otherId = Number(dup?.split(",")[0]);
  const canEdit = canEditChallenge(challenge, viewer);
  const canDelete = canHostDelete(challenge, viewer);
  const tools = (canEdit || canDelete || staff) && (
    <>
      <HostTools challengeId={challenge.id} name={challenge.name} canEdit={canEdit} canDelete={canDelete} />
      {staff && (
        <StaffMenu
          challengeId={challenge.id}
          name={challenge.name}
          hidden={challenge.hidden}
          clubHosted={challenge.hosted_by_club}
          runCount={challenge.run_count ?? 0}
        />
      )}
    </>
  );

  const dupNotice = dup !== undefined && (
    <DuplicateNotice
      challengeId={challenge.id}
      name={challenge.name}
      otherId={Number.isInteger(otherId) && otherId > 0 ? otherId : null}
    />
  );
  if (challenge.challenge_format === "assignment") {
    const data = await loadEditionPage(challenge, Number(edition) || null, viewer.id, page.today);
    const badge = features.preview("challenges") && <PreviewBadge />;
    return <EditionView page={page} data={data} badge={badge} tools={tools} notice={dupNotice} />;
  }

  return (
    <ChallengeView
      page={page}
      view={view === "pool" ? "pool" : "runs"}
      played={parsePlayed(played)}
      showAll={all === "1"}
      badge={features.preview("challenges") && <PreviewBadge />}
      tools={tools}
      runAction={<RunActionButton action={page.runAction} challengeId={challenge.id} challengeName={challenge.name} />}
      notice={dupNotice}
    />
  );
}
