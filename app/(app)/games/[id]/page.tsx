import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { apiFetch } from "@/lib/api";
import type {
  ApiCollection,
  ApiSingle,
  Game,
  GameCompletion,
  GameRelations,
  User,
  UserNowPlaying,
} from "@/lib/api/types";
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";
const MAX_VISIBLE_PLAYERS = 8;

export default function GamePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <div className="space-y-6">
      <Suspense fallback={<GameContentSkeleton />}>
        {params.then(({ id }) => {
          const gameId = parseInt(id, 10);
          if (isNaN(gameId)) notFound();
          return <GameContent gameId={gameId} />;
        })}
      </Suspense>
    </div>
  );
}

async function GameContent({ gameId }: { gameId: number }) {
  const [gameRes, nowPlayingRes, completionsRes] = await Promise.all([
    apiFetch(`/api/v1/games/${gameId}`),
    apiFetch(`/api/v1/games/${gameId}/now_playing`),
    apiFetch(`/api/v1/games/${gameId}/completions`),
  ]);

  if (!gameRes.ok) notFound();

  const { data: game }: ApiSingle<Game> = await gameRes.json();

  let players: User[] = [];
  if (nowPlayingRes.ok) {
    const { data: entries }: ApiCollection<UserNowPlaying> =
      await nowPlayingRes.json();
    const seen = new Set<string>();
    players = entries.flatMap((e) => {
      if (!e.user || seen.has(e.user_id)) return [];
      seen.add(e.user_id);
      return [e.user];
    });
  }

  let completers: User[] = [];
  if (completionsRes.ok) {
    const { data: entries }: ApiCollection<GameCompletion> =
      await completionsRes.json();
    const seen = new Set<string>();
    completers = entries.flatMap((e) => {
      if (!e.user || seen.has(e.user_id)) return [];
      seen.add(e.user_id);
      return [e.user];
    });
  }

  const year = game.initial_release_date
    ? new Date(game.initial_release_date).getFullYear()
    : null;
  const imageUrl = game.art_url ?? game.cover_url;

  return (
    <>
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/games" className="hover:text-foreground transition-colors">
          Games
        </Link>
        <span>›</span>
        <span className="text-foreground">{game.title}</span>
      </div>

      {/* Hero */}
      <div className="relative overflow-hidden rounded-xl border bg-card min-h-64">
        {imageUrl && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt=""
              aria-hidden
              className="absolute top-0 right-0 h-full w-[65%] object-cover object-[center_20%]"
            />
            <div className="absolute top-0 right-0 h-full w-[65%] bg-linear-to-r from-card to-transparent" />
          </>
        )}
        <div className="relative p-6 space-y-2 max-w-[55%]">
          {game.parent_game_name && (
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              {game.parent_game_name}
            </p>
          )}
          <h1 className="text-3xl font-bold tracking-tight">{game.title}</h1>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            {year && <span>{year}</span>}
          </div>
          {game.description && (
            <p className="text-sm text-muted-foreground pt-1 leading-relaxed">
              {game.description}
            </p>
          )}
          {game.igdb_url && (
            <Button
              variant="ghost"
              size="sm"
              nativeButton={false}
              className="mt-1 -ml-2.5"
              render={
                <a
                  href={game.igdb_url}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
            >
              View on IGDB
              <ExternalLink />
            </Button>
          )}
        </div>
      </div>

      {/* Currently playing */}
      {players.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Currently Playing
          </h2>
          <UserAvatarGroup users={players} apiBase={API_BASE} />
        </section>
      )}

      {/* Completed by */}
      {completers.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Completed By
          </h2>
          <UserAvatarGroup users={completers} apiBase={API_BASE} />
        </section>
      )}

      {/* Relations stream in separately — doesn't block the hero */}
      <Suspense fallback={<GameRelationsSkeleton />}>
        <GameRelationsSection gameId={gameId} />
      </Suspense>
    </>
  );
}

async function GameRelationsSection({ gameId }: { gameId: number }) {
  const relationsRes = await apiFetch(`/api/v1/games/${gameId}/relations`, {
    cache: "no-store",
  });
  if (!relationsRes.ok) return null;
  const { data: relations }: ApiSingle<GameRelations> =
    await relationsRes.json();

  return (
    <>
      {/* Metadata grid */}
      <div className="grid grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-3 lg:grid-cols-4">
        {relations.genres.length > 0 && (
          <MetaSection label="Genres">
            <BadgeList items={relations.genres.map((g) => g.name)} />
          </MetaSection>
        )}
        {relations.themes.length > 0 && (
          <MetaSection label="Themes">
            <BadgeList items={relations.themes.map((t) => t.name)} />
          </MetaSection>
        )}
        {relations.modes.length > 0 && (
          <MetaSection label="Game Modes">
            <BadgeList items={relations.modes.map((m) => m.name)} />
          </MetaSection>
        )}
        {relations.perspectives.length > 0 && (
          <MetaSection label="Perspectives">
            <BadgeList items={relations.perspectives.map((p) => p.name)} />
          </MetaSection>
        )}
        {relations.platforms.length > 0 && (
          <MetaSection label="Platforms">
            <BadgeList
              items={relations.platforms.map((p) => p.platform_name)}
            />
          </MetaSection>
        )}
        {relations.franchises.length > 0 && (
          <MetaSection label="Franchises">
            <BadgeList items={relations.franchises.map((f) => f.name)} />
          </MetaSection>
        )}
        {relations.companies.length > 0 && (
          <MetaSection label="Companies">
            <ul className="space-y-0.5 text-sm">
              {relations.companies.map((c) => (
                <li key={c.company_id}>
                  {c.name}
                  {c.role && (
                    <span className="text-muted-foreground"> · {c.role}</span>
                  )}
                </li>
              ))}
            </ul>
          </MetaSection>
        )}
      </div>

      {/* Releases */}
      {relations.releases.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Releases
          </h2>
          <div className="rounded-lg border text-sm divide-y">
            {relations.releases.map((release) => (
              <div
                key={release.release_id}
                className="grid grid-cols-3 px-4 py-2.5 gap-4"
              >
                <span className="font-medium">{release.platform_name}</span>
                <span className="text-muted-foreground">
                  {release.region_name}
                </span>
                <span className="text-muted-foreground tabular-nums text-right">
                  {release.release_date
                    ? new Date(release.release_date).toLocaleDateString()
                    : "—"}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Alternate versions */}
      {relations.alternates.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Alternate Versions
          </h2>
          <div className="flex flex-wrap gap-2">
            {relations.alternates.map((alt) => (
              <Button
                key={alt.game_id}
                variant="outline"
                size="sm"
                nativeButton={false}
                render={<Link href={`/games/${alt.game_id}`} />}
              >
                {alt.title}
              </Button>
            ))}
          </div>
        </section>
      )}
    </>
  );
}

function UserAvatarGroup({
  users,
  apiBase,
}: {
  users: User[];
  apiBase: string;
}) {
  return (
    <AvatarGroup>
      {users.slice(0, MAX_VISIBLE_PLAYERS).map((user) => {
        const name = user.global_name ?? user.username ?? user.user_id;
        const initials = name.slice(0, 2).toUpperCase();
        return (
          <Tooltip key={user.user_id}>
            <TooltipTrigger
              render={<span className="inline-flex cursor-default" />}
            >
              <Avatar className="ring-2 ring-background">
                <AvatarImage
                  src={`${apiBase}/api/v1/users/${user.user_id}/avatar`}
                  alt={name}
                />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent>{name}</TooltipContent>
          </Tooltip>
        );
      })}
      {users.length > MAX_VISIBLE_PLAYERS && (
        <AvatarGroupCount>
          +{users.length - MAX_VISIBLE_PLAYERS}
        </AvatarGroupCount>
      )}
    </AvatarGroup>
  );
}

function GameContentSkeleton() {
  return (
    <>
      {/* Breadcrumb */}
      <Skeleton className="h-4 w-32" />

      {/* Hero */}
      <Skeleton className="min-h-64 w-full rounded-xl" />

      {/* Avatar row */}
      <div className="space-y-3">
        <Skeleton className="h-3 w-28" />
        <div className="flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="size-8 rounded-full" />
          ))}
        </div>
      </div>
    </>
  );
}

function GameRelationsSkeleton() {
  return (
    <>
      <div className="grid grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-3 w-20" />
            <div className="flex flex-wrap gap-1.5">
              <Skeleton className="h-5 w-14 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-5 w-12 rounded-full" />
            </div>
          </div>
        ))}
      </div>
      <div className="space-y-3">
        <Skeleton className="h-3 w-16" />
        <div className="rounded-lg border divide-y overflow-hidden">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="grid grid-cols-3 px-4 py-2.5 gap-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20 ml-auto" />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function MetaSection({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <h2 className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
        {label}
      </h2>
      {children}
    </div>
  );
}

function BadgeList({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <Badge key={item} variant="outline">
          {item}
        </Badge>
      ))}
    </div>
  );
}
