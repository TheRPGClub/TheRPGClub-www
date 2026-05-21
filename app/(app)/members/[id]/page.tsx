import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BookMarked,
  Boxes,
  Pencil,
  Star,
  Trophy,
  Gamepad2,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { getSession } from "@/lib/session";
import { resolveEntryId } from "@/lib/api/game-list-entry";
import type {
  ApiCollection,
  ApiSingle,
  GameCompletion,
  Review,
  UserFavorite,
  UserNowPlaying,
  UserProfile,
  UserSocial,
} from "@/lib/api/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { SocialIcon } from "@/components/social-icon";
import { MemberGameSection } from "@/components/member/member-game-section";
import { MemberGameCard } from "@/components/member/member-game-card";
import { MemberReferenceRow } from "@/components/member/member-reference-row";
import { MemberReviewList } from "@/components/member/member-review-list";

const API_BASE = process.env.API_URL ?? "http://localhost:3000";
const PREVIEW_LIMIT = 5;

const roleColors: Record<string, string> = {
  red: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  orange:
    "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  blue: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  green: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  purple:
    "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  zinc: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
};

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium ${roleColors[color] ?? roleColors.zinc}`}
    >
      {label}
    </span>
  );
}

async function fetchPreview<T>(
  path: string,
): Promise<{ data: T[]; total: number }> {
  try {
    const res = await apiFetch(path, { cache: "no-store" });
    if (!res.ok) return { data: [], total: 0 };
    const body: ApiCollection<T> = await res.json();
    return { data: body.data, total: body.meta.total ?? body.data.length };
  } catch {
    return { data: [], total: 0 };
  }
}

export default async function MemberPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // We fan out to each list endpoint instead of relying on the aggregated
  // `user.previews` slice because that slice doesn't always include the joined
  // game data, leading to missing cover images in the preview grid.
  const previewQs = `?limit=${PREVIEW_LIMIT}`;
  const [
    userRes,
    session,
    nowPlayingPreview,
    favoritesPreview,
    completedPreview,
    backlogPreview,
    collectionPreview,
    reviewsPreview,
  ] = await Promise.all([
    apiFetch(`/api/v1/users/${id}`, { cache: "no-store" }),
    getSession(),
    fetchPreview<UserNowPlaying>(`/api/v1/users/${id}/now_playing${previewQs}`),
    fetchPreview<UserFavorite>(`/api/v1/users/${id}/favorites${previewQs}`),
    fetchPreview<GameCompletion>(`/api/v1/users/${id}/completions${previewQs}`),
    fetchPreview<UserNowPlaying>(`/api/v1/users/${id}/backlog${previewQs}`),
    fetchPreview<UserNowPlaying>(`/api/v1/users/${id}/collections${previewQs}`),
    fetchPreview<Review>(`/api/v1/users/${id}/reviews${previewQs}`),
  ]);

  if (!userRes.ok) notFound();
  const { data: user }: ApiSingle<UserProfile> = await userRes.json();

  const displayName = user.global_name ?? user.username ?? user.user_id;
  const initials = displayName.slice(0, 2).toUpperCase();
  const membership = user.membership;
  const isSelf = session?.principal.discord_id === user.user_id;
  const socials: UserSocial[] = user.socials ?? [];
  // Backend ships `counts` on the aggregated user payload; fall back to the
  // totals from the per-list fetches if it's missing.
  const aggregatedCounts = user.counts;
  const counts = {
    now_playing: aggregatedCounts?.now_playing ?? nowPlayingPreview.total,
    favorites: aggregatedCounts?.favorites ?? favoritesPreview.total,
    completed: aggregatedCounts?.completed ?? completedPreview.total,
    backlog: aggregatedCounts?.backlog ?? backlogPreview.total,
    collection: aggregatedCounts?.collection ?? collectionPreview.total,
    reviews: aggregatedCounts?.reviews ?? reviewsPreview.total,
  };
  const nowPlaying = nowPlayingPreview.data;
  const favorites = favoritesPreview.data;
  const reviewPreviews = reviewsPreview.data;
  const completed = completedPreview.data;

  const memberHref = `/members/${user.user_id}`;

  return (
    <div className="mx-auto w-full max-w-4xl space-y-8">
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link
          href="/members"
          className="hover:text-foreground transition-colors"
        >
          Members
        </Link>
        <span>›</span>
        <span className="text-foreground">{displayName}</span>
      </div>

      <div className="relative flex flex-col items-center gap-6 rounded-2xl border bg-card p-8 shadow-sm">
        {isSelf && (
          <Button
            variant="outline"
            size="sm"
            className="absolute right-4 top-4"
            nativeButton={false}
            render={<Link href={`${memberHref}/edit`} />}
          >
            <Pencil />
            Edit
          </Button>
        )}

        <Avatar size="lg" className="size-24">
          <AvatarImage
            src={`${API_BASE}/api/v1/users/${user.user_id}/avatar`}
            alt={displayName}
          />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>

        <div className="text-center">
          <p className="text-xl font-semibold">{displayName}</p>
          {user.global_name &&
            user.username &&
            user.global_name !== user.username && (
              <p className="text-sm text-muted-foreground">@{user.username}</p>
            )}
        </div>

        {membership && (
          <div className="flex flex-wrap justify-center gap-2">
            {membership.admin && <Badge label="Admin" color="red" />}
            {membership.dev && <Badge label="Dev" color="purple" />}
            {membership.moderator && (
              <Badge label="Moderator" color="orange" />
            )}
            {membership.regular && <Badge label="Regular" color="blue" />}
            {membership.member && <Badge label="Member" color="green" />}
            {membership.longstanding && (
              <Badge label="Longstanding" color="green" />
            )}
            {membership.newcomer && <Badge label="Newcomer" color="zinc" />}
            {!membership.active && <Badge label="Inactive" color="zinc" />}
          </div>
        )}

        {socials.length > 0 && (
          <dl className="grid w-full grid-cols-1 gap-x-6 gap-y-3 border-t pt-6 sm:grid-cols-2">
            {socials.map((social) => (
              <div key={social.id} className="flex items-start gap-3">
                <SocialIcon
                  label={social.social_platform?.label}
                  className="mt-0.5 shrink-0 text-muted-foreground"
                />
                <div className="flex min-w-0 flex-col">
                  <dt className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                    {social.social_platform?.label ?? "Unknown"}
                  </dt>
                  <dd className="text-sm">
                    {social.url ? (
                      <a
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="break-all underline-offset-2 hover:underline"
                      >
                        {social.display_text}
                      </a>
                    ) : (
                      <span className="break-all">{social.display_text}</span>
                    )}
                  </dd>
                </div>
              </div>
            ))}
          </dl>
        )}
      </div>

      {/* Order per issue: Now Playing → Favorites → Reviews → Completed,
          then Backlog and Collection as reference rows. Profile is
          read-only — all management lives on the edit page. */}

      <MemberGameSection
        title="Now Playing"
        count={counts.now_playing}
        seeAllHref={`${memberHref}/now-playing-games`}
        emptyMessage="Nothing in progress right now."
      >
        {nowPlaying.map((entry, i) => (
          <NowPlayingCard
            key={resolveEntryId("now_playing", entry) ?? i}
            entry={entry}
          />
        ))}
      </MemberGameSection>

      <MemberGameSection
        title="Favorites"
        count={counts.favorites}
        seeAllHref={`${memberHref}/favorite-games`}
        emptyMessage="No favorites picked yet."
      >
        {favorites.map((entry, i) => (
          <FavoriteCard
            key={resolveEntryId("favorite", entry) ?? i}
            entry={entry}
          />
        ))}
      </MemberGameSection>

      <section className="space-y-3">
        <header className="flex items-end justify-between gap-3">
          <div className="flex items-baseline gap-2">
            <h2 className="text-lg font-semibold tracking-tight">Reviews</h2>
            <span className="text-sm text-muted-foreground tabular-nums">
              {counts.reviews}
            </span>
          </div>
          {counts.reviews > 0 && (
            <Link
              href={`${memberHref}/reviews`}
              className="text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors"
            >
              See all →
            </Link>
          )}
        </header>
        <MemberReviewList
          reviews={reviewPreviews}
          hideUser
          emptyMessage="No reviews yet."
        />
      </section>

      <MemberGameSection
        title="Completed"
        count={counts.completed}
        seeAllHref={`${memberHref}/completed-games`}
        emptyMessage="No completed games yet."
      >
        {completed.map((entry, i) => (
          <CompletedCard
            key={resolveEntryId("completed", entry) ?? i}
            entry={entry}
          />
        ))}
      </MemberGameSection>

      <MemberReferenceRow
        title="Backlog"
        count={counts.backlog}
        href={`${memberHref}/backlogged-games`}
        Icon={BookMarked}
        emptyMessage="Nothing queued up."
      />
      <MemberReferenceRow
        title="Collection"
        count={counts.collection}
        href={`${memberHref}/collected-games`}
        Icon={Boxes}
        emptyMessage="No owned games tracked."
      />
    </div>
  );
}

function NowPlayingCard({ entry }: { entry: UserNowPlaying }) {
  return (
    <MemberGameCard
      game={entry.game}
      platform={entry.platform}
      note={entry.note}
      meta={
        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
          <Gamepad2 className="size-3" /> Playing
        </span>
      }
    />
  );
}

function FavoriteCard({ entry }: { entry: UserFavorite }) {
  return (
    <MemberGameCard
      game={entry.game}
      platform={entry.platform}
      note={entry.note}
      meta={
        <span className="inline-flex items-center gap-1 text-xs text-amber-500">
          <Star className="size-3 fill-amber-400 text-amber-400" /> Favorite
        </span>
      }
    />
  );
}

function CompletedCard({ entry }: { entry: GameCompletion }) {
  const completed = entry.completion_date
    ? new Date(entry.completion_date).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
      })
    : null;
  return (
    <MemberGameCard
      game={entry.game}
      platform={entry.platform}
      note={entry.note}
      meta={
        <span className="inline-flex items-center gap-1 text-xs text-emerald-500">
          <Trophy className="size-3" /> {completed ?? "Completed"}
        </span>
      }
    />
  );
}

