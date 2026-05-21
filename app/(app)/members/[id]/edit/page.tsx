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
import { SocialsEditor } from "@/components/socials-editor";
import { GameListEditor } from "@/components/member/game-list-editor";

const EDITOR_LIMIT = 50;

async function loadCollection<T>(path: string): Promise<{ data: T[]; total: number }> {
  try {
    const res = await apiFetch(path, { cache: "no-store" });
    if (!res.ok) return { data: [], total: 0 };
    const body: ApiCollection<T> = await res.json();
    return { data: body.data, total: body.meta.total ?? body.data.length };
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
    loadCollection<Platform>("/api/v1/platforms?limit=100"),
    loadCollection<UserFavorite>(
      `/api/v1/users/${id}/favorites?limit=${EDITOR_LIMIT}`,
    ),
    loadCollection<UserNowPlaying>(
      `/api/v1/users/${id}/now_playing?limit=${EDITOR_LIMIT}`,
    ),
    loadCollection<GameCompletion>(
      `/api/v1/users/${id}/completions?limit=${EDITOR_LIMIT}`,
    ),
    loadCollection<UserBacklog>(
      `/api/v1/users/${id}/backlog?limit=${EDITOR_LIMIT}`,
    ),
    loadCollection<GameCollection>(
      `/api/v1/users/${id}/collections?limit=${EDITOR_LIMIT}`,
    ),
  ]);

  if (!userRes.ok) notFound();
  const { data: user }: ApiSingle<User> = await userRes.json();
  const displayName = user.global_name ?? user.username ?? user.user_id;

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link
          href="/members"
          className="hover:text-foreground transition-colors"
        >
          Members
        </Link>
        <span>›</span>
        <Link
          href={`/members/${user.user_id}`}
          className="hover:text-foreground transition-colors"
        >
          {displayName}
        </Link>
        <span>›</span>
        <span className="text-foreground">Edit</span>
      </div>

      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight">Edit profile</h1>
        <Link
          href={`/members/${user.user_id}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="size-4" />
          Back to profile
        </Link>
      </div>

      <div className="rounded-2xl border bg-card p-6 shadow-sm">
        <SocialsEditor
          userId={user.user_id}
          socials={user.socials ?? []}
          platforms={socialPlatforms.data}
        />
      </div>

      <GameListEditor
        userId={user.user_id}
        kind="now_playing"
        title="Now playing"
        description="Games you're actively playing."
        entries={nowPlaying.data}
        total={nowPlaying.total}
        platforms={platforms.data}
      />

      <GameListEditor
        userId={user.user_id}
        kind="favorite"
        title="Favorites"
        description="Your all-time picks."
        entries={favorites.data}
        total={favorites.total}
        platforms={platforms.data}
      />

      <GameListEditor
        userId={user.user_id}
        kind="completed"
        title="Completed"
        description="Games you've finished."
        entries={completed.data}
        total={completed.total}
        platforms={platforms.data}
      />

      <GameListEditor
        userId={user.user_id}
        kind="backlog"
        title="Backlog"
        description="Games you'd like to play."
        entries={backlog.data}
        total={backlog.total}
        platforms={platforms.data}
      />

      <GameListEditor
        userId={user.user_id}
        kind="collection"
        title="Collection"
        description="Games you own."
        entries={collection.data}
        total={collection.total}
        platforms={platforms.data}
      />
    </div>
  );
}
