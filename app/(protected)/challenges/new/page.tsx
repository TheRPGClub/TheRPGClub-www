import { requireAuth, requireFeature } from "@/lib/session";
import { isModeratorOrAbove } from "@/lib/staff";
import { emptyDraft } from "@/lib/challenges/form";
import { canStartFromList, draftFromFranchise, draftFromList } from "@/lib/challenges/start-from";
import { fetchGameList } from "@/lib/game-lists/api";
import { fetchFranchisePage } from "@/lib/franchises/fetch";
import { PreviewBadge } from "@/components/feature/preview-badge";
import { ChallengeForm } from "@/components/challenges/form/challenge-form";

// New Challenge: any member hosts a Slots or Pool Challenge (spec api#442);
// staff may also make an Assignment one and host it for the club. `?list=`
// starts a Pool from a Game List (its games as Core, the list linked) and
// `?franchise=` from a Franchise (its Mainline games as Core, the Franchise
// a source). A list the viewer can't start from opens an empty form.
export default async function NewChallengePage({
  searchParams,
}: {
  searchParams: Promise<{ list?: string; franchise?: string }>;
}) {
  const session = await requireAuth();
  const features = await requireFeature("challenges");
  const staff = isModeratorOrAbove(session.membership);
  const { list: listId, franchise: franchiseId } = await searchParams;
  const initial = (await startingDraft(listId, franchiseId, { id: session.principal.discord_id, staff })) ?? emptyDraft();
  return (
    <ChallengeForm
      initial={initial}
      edit={null}
      staff={staff}
      runCount={0}
      badge={features.preview("challenges") && <PreviewBadge />}
    />
  );
}

const idOf = (raw: string | undefined) => {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
};

async function startingDraft(listRaw: string | undefined, franchiseRaw: string | undefined, viewer: { id: string; staff: boolean }) {
  const listId = idOf(listRaw);
  if (listId) {
    const list = await fetchGameList(listId).catch(() => null);
    return list && canStartFromList(list, viewer) ? draftFromList(list) : null;
  }
  const franchiseId = idOf(franchiseRaw);
  if (franchiseId) {
    const read = await fetchFranchisePage(franchiseId).catch(() => null);
    return read?.status === "ok" && !read.page.merged_into_id ? draftFromFranchise(read.page) : null;
  }
  return null;
}
