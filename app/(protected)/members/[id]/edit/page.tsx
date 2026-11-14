import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { getFeatures, getSession } from "@/lib/session";
import { igdbAddBlockedReason } from "@/lib/igdb";
import type {
  AchievementProviderTotals,
  ApiCollection,
  ApiSingle,
  GameCollection,
  GameCompletion,
  LinkedAccount,
  Platform,
  SocialPlatform,
  User,
  UserBacklog,
  UserFavorite,
  UserNowPlaying,
} from "@/lib/api/types";
import { NO_ROWS, paginationOf, type ListPage } from "@/lib/api/pagination";
import { fetchAchievementSummary } from "@/lib/member-achievements-server";
import { SocialsEditor } from "@/components/socials-editor";
import { GameListEditor } from "@/components/member/game-list-editor";
import { LinkedAccountsEditor } from "@/components/member/linked-accounts-editor";
import { importsHubHref, shownImportKinds } from "@/lib/imports/kinds";
import { PageHeader } from "@/components/templates/page-header";
import { EditSections, type EditSection } from "@/components/templates/edit-sections";
import { buttonVariants } from "@/components/ui/button";

const EDITOR_LIMIT = 50;

async function loadCollection<T>(path: string): Promise<ListPage<T>> {
  try {
    const res = await apiFetch(path, { cache: "no-store" });
    if (!res.ok) return NO_ROWS;
    const body: ApiCollection<T> = await res.json();
    return { data: body.data, total: paginationOf(body.meta, body.data.length).total };
  } catch {
    return NO_ROWS;
  }
}

// The member's Linked Accounts (`{ data: [...] }`, no meta). Null when the
// list can't be read, so the editor says so instead of offering to link
// accounts the member may already have.
async function loadLinkedAccounts(userId: string): Promise<LinkedAccount[] | null> {
  try {
    const res = await apiFetch(`/api/v1/users/${userId}/linked_accounts`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const body: { data: LinkedAccount[] } = await res.json();
    return body.data;
  } catch {
    return null;
  }
}

// Unlocks per Provider, for the unlink warning. The summary is 404 for a
// member with no Linked Account, which means no Unlocks anywhere.
async function loadProviderTotals(
  userId: string,
): Promise<AchievementProviderTotals[] | null> {
  const result = await fetchAchievementSummary(userId);
  if (result.status === "ok") return result.summary.providers;
  return result.status === "none" ? [] : null;
}

export default async function MemberEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();

  if (!session) redirect("/");
  if (session.principal.discord_id !== id) {
    redirect(`/members/${id}`);
  }
  // Lists belong to Features; the editor leaves out (and doesn't read) the
  // ones this member isn't shown. Linked Accounts follow the flag only, like
  // the Achievements pages whose "link an account" button lands here.
  const features = await getFeatures();
  const listShown = {
    now_playing: features.shown("now_playing"),
    completed: features.shown("game_completions"),
    backlog: features.shown("backlog"),
    collection: features.shown("collection"),
  };
  const linkedShown = features.canOpen("achievement_hub");

  // Fan-out: profile + socials reference data + every game list. Each list
  // request is independent, so we issue them in parallel.
  const [
    userRes,
    socialPlatforms,
    platforms,
    favorites,
    nowPlaying,
    completed,
    backlog,
    collection,
    linkedAccounts,
    providerTotals,
  ] = await Promise.all([
    apiFetch(`/api/v1/users/${id}`, { cache: "no-store" }),
    loadCollection<SocialPlatform>("/api/v1/social_platforms"),
    loadCollection<Platform>("/api/v1/platforms?per=100"),
    loadCollection<UserFavorite>(
      `/api/v1/users/${id}/favorites?per=${EDITOR_LIMIT}`,
    ),
    listShown.now_playing
      ? loadCollection<UserNowPlaying>(
          `/api/v1/users/${id}/now_playing?per=${EDITOR_LIMIT}`,
        )
      : NO_ROWS,
    listShown.completed
      ? loadCollection<GameCompletion>(
          `/api/v1/users/${id}/completions?per=${EDITOR_LIMIT}`,
        )
      : NO_ROWS,
    listShown.backlog
      ? loadCollection<UserBacklog>(
          `/api/v1/users/${id}/backlog?per=${EDITOR_LIMIT}`,
        )
      : NO_ROWS,
    listShown.collection
      ? loadCollection<GameCollection>(
          `/api/v1/users/${id}/collections?per=${EDITOR_LIMIT}`,
        )
      : NO_ROWS,
    linkedShown ? loadLinkedAccounts(id) : null,
    linkedShown ? loadProviderTotals(id) : null,
  ]);

  if (!userRes.ok) notFound();
  const { data: user }: ApiSingle<User> = await userRes.json();
  const displayName = user.global_name ?? user.username ?? user.user_id;

  const lists = [
    {
      id: "now-playing",
      kind: "now_playing",
      title: "Now playing",
      description: "Games you're actively playing.",
      list: nowPlaying,
      shown: listShown.now_playing,
    },
    {
      id: "favorites",
      kind: "favorite",
      title: "Favorites",
      description: "Your all-time picks.",
      list: favorites,
      shown: true,
    },
    {
      id: "completed",
      kind: "completed",
      title: "Completed",
      description: "Games you've finished.",
      list: completed,
      shown: listShown.completed,
    },
    {
      id: "backlog",
      kind: "backlog",
      title: "Backlog",
      description: "Games you'd like to play.",
      list: backlog,
      shown: listShown.backlog,
    },
    {
      id: "collection",
      kind: "collection",
      title: "Collection",
      description: "Games you own.",
      list: collection,
      shown: listShown.collection,
    },
  ] as const;

  const sections: EditSection[] = [
    ...lists
      .filter(({ shown }) => shown)
      .map(({ id: sectionId, kind, title, description, list }) => ({
        id: sectionId,
        label: title,
        count: list.total,
        content: (
          <GameListEditor
            userId={user.user_id}
            kind={kind}
            title={title}
            description={description}
            entries={list.data}
            total={list.total}
            platforms={platforms.data}
            igdbBlockedReason={igdbAddBlockedReason(true, session.membership)}
          />
        ),
      })),
    {
      id: "socials",
      label: "Socials",
      count: user.socials?.length ?? 0,
      content: (
        <SocialsEditor
          userId={user.user_id}
          socials={user.socials ?? []}
          platforms={socialPlatforms.data}
        />
      ),
    },
  ];
  if (linkedShown) {
    sections.push({
      // www-03's "link an account" CTA lands on /edit#linked-accounts.
      id: "linked-accounts",
      label: "Linked Accounts",
      count: linkedAccounts?.length ?? 0,
      content: (
        <LinkedAccountsEditor
          userId={user.user_id}
          accounts={linkedAccounts}
          socials={user.socials ?? []}
          totals={providerTotals}
        />
      ),
    });
  }

  return (
    <div className="space-y-7">
      <PageHeader
        title="Edit profile"
        count={displayName}
        actions={
          <Link
            href={`/members/${user.user_id}`}
            className={buttonVariants({ variant: "outline" })}
          >
            <ChevronLeft data-icon="inline-start" />
            Back to profile
          </Link>
        }
      />
      <EditSections
        sections={sections}
        importsHref={
          shownImportKinds(features).length > 0 ? importsHubHref(user.user_id) : null
        }
      />
    </div>
  );
}
