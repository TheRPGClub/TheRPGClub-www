import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { getSession } from "@/lib/session";
import type {
  ApiCollection,
  ApiSingle,
  GameCollection,
  GameCompletion,
  Platform,
  SocialPlatform,
  User,
  UserBacklog,
  UserFavorite,
  UserNowPlaying,
} from "@/lib/api/types";
import { paginationOf } from "@/lib/api/pagination";
import { SocialsEditor } from "@/components/socials-editor";
import { GameListEditor } from "@/components/member/game-list-editor";
import { importsHubHref } from "@/lib/imports/kinds";
import { PageHeader } from "@/components/issue/page-header";
import { EditSections, type EditSection } from "@/components/issue/edit-sections";
import { buttonVariants } from "@/components/ui/button";

const EDITOR_LIMIT = 50;

async function loadCollection<T>(path: string): Promise<{ data: T[]; total: number }> {
  try {
    const res = await apiFetch(path, { cache: "no-store" });
    if (!res.ok) return { data: [], total: 0 };
    const body: ApiCollection<T> = await res.json();
    return { data: body.data, total: paginationOf(body.meta, body.data.length).total };
  } catch {
    return { data: [], total: 0 };
  }
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
  ] = await Promise.all([
    apiFetch(`/api/v1/users/${id}`, { cache: "no-store" }),
    loadCollection<SocialPlatform>("/api/v1/social_platforms"),
    loadCollection<Platform>("/api/v1/platforms?per=100"),
    loadCollection<UserFavorite>(
      `/api/v1/users/${id}/favorites?per=${EDITOR_LIMIT}`,
    ),
    loadCollection<UserNowPlaying>(
      `/api/v1/users/${id}/now_playing?per=${EDITOR_LIMIT}`,
    ),
    loadCollection<GameCompletion>(
      `/api/v1/users/${id}/completions?per=${EDITOR_LIMIT}`,
    ),
    loadCollection<UserBacklog>(
      `/api/v1/users/${id}/backlog?per=${EDITOR_LIMIT}`,
    ),
    loadCollection<GameCollection>(
      `/api/v1/users/${id}/collections?per=${EDITOR_LIMIT}`,
    ),
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
    },
    {
      id: "favorites",
      kind: "favorite",
      title: "Favorites",
      description: "Your all-time picks.",
      list: favorites,
    },
    {
      id: "completed",
      kind: "completed",
      title: "Completed",
      description: "Games you've finished.",
      list: completed,
    },
    {
      id: "backlog",
      kind: "backlog",
      title: "Backlog",
      description: "Games you'd like to play.",
      list: backlog,
    },
    {
      id: "collection",
      kind: "collection",
      title: "Collection",
      description: "Games you own.",
      list: collection,
    },
  ] as const;

  const sections: EditSection[] = [
    ...lists.map(({ id: sectionId, kind, title, description, list }) => ({
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

  return (
    <div className="mx-auto w-full max-w-7xl space-y-7">
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
        importsHref={importsHubHref(user.user_id)}
      />
    </div>
  );
}
