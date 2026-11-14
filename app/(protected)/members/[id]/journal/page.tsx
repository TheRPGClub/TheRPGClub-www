import { notFound } from "next/navigation";
import type { RawSearchParams } from "@/lib/search-params";
import { loadJournalVolume, parseVolumeQuery } from "@/lib/journals/volume-page";
import { MemberListTemplate } from "@/components/templates/member-list-template";
import { memberCounts } from "@/lib/members/member-lists";
import { JournalNotice } from "@/components/journal/journal-notice";
import { JournalVolumeSpread } from "@/components/journal/journal-volume-spread";

// A member's Game Journal as a bound volume: the Contents page (one chapter
// per game) beside the open chapter (lib/journals/volume-page).

export default async function MemberJournalPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<RawSearchParams>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const view = await loadJournalVolume(id, parseVolumeQuery(query));
  if (!view) notFound();
  const { user, displayName, chapters } = view;

  return (
    <MemberListTemplate
      userId={user.user_id}
      displayName={displayName}
      title="Journal"
      count={chapters.length}
      countNoun={["chapter", "chapters"]}
      current="journal"
      counts={memberCounts(user)}
    >
      {view.failed ? (
        <JournalNotice centered>The journal couldn&apos;t be loaded right now.</JournalNotice>
      ) : chapters.length === 0 && !view.isOwner ? (
        <JournalNotice centered>{displayName} hasn&apos;t journaled any games yet.</JournalNotice>
      ) : (
        <JournalVolumeSpread view={view} />
      )}
    </MemberListTemplate>
  );
}
