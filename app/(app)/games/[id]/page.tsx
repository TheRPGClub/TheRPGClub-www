import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { apiFetch } from "@/lib/api";
import type {
  ApiSingle,
  Game,
  GameRelations,
  User,
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
import {
  ExternalLink,
  Gamepad2,
  Layers,
  Trophy,
  type LucideIcon,
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";
const MAX_VISIBLE_PLAYERS = 8;

type AccentVariant = "emerald" | "purple";
type AccentProfile = {
  pill: string;
  number: string;
  glow: string;
  icon: string;
  gradient: string;
  underline: string;
  ribbon: string;
  ribbonText: string;
  ribbonRing: string;
  ribbonTextSize: string;
  label: string;
};

const ACCENT_PROFILES: Record<AccentVariant, AccentProfile> = {
  emerald: {
    pill: "bg-emerald-500/15 text-emerald-300 ring-1 ring-inset ring-emerald-500/30",
    number: "text-emerald-200/90",
    glow: "from-emerald-950/40 to-transparent",
    icon: "text-emerald-300 drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]",
    gradient: "from-emerald-200 via-emerald-300 to-emerald-500",
    underline: "from-emerald-500/60 via-emerald-500/20 to-transparent",
    ribbon: "from-emerald-500 to-emerald-600",
    ribbonText: "text-emerald-50",
    ribbonRing: "ring-emerald-700/40",
    ribbonTextSize: "text-[10px] tracking-[0.25em]",
    label: "GOTM Winner",
  },
  purple: {
    pill: "bg-purple-500/15 text-purple-300 ring-1 ring-inset ring-purple-500/30",
    number: "text-purple-200/90",
    glow: "from-purple-950/40 to-transparent",
    icon: "text-purple-300 drop-shadow-[0_0_8px_rgba(168,85,247,0.4)]",
    gradient: "from-purple-200 via-purple-300 to-purple-500",
    underline: "from-purple-500/60 via-purple-500/20 to-transparent",
    ribbon: "from-purple-500 to-purple-600",
    ribbonText: "text-purple-50",
    ribbonRing: "ring-purple-700/40",
    ribbonTextSize: "text-[9px] tracking-[0.15em]",
    label: "NR GOTM Winner",
  },
};

const NEUTRAL_PILL =
  "bg-muted/40 text-muted-foreground ring-1 ring-inset ring-border";
const NEUTRAL_UNDERLINE = "from-border via-border/40 to-transparent";

function pickAccent(game: Game): AccentProfile | null {
  if (game.gotm_won) return ACCENT_PROFILES.emerald;
  if (game.nr_gotm_won) return ACCENT_PROFILES.purple;
  return null;
}

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
  const gameRes = await apiFetch(`/api/v1/games/${gameId}`);

  if (!gameRes.ok) notFound();

  const { data: game }: ApiSingle<Game> = await gameRes.json();

  const uniqueUsers = (entries: { user_id: string; user?: User | null }[]) => {
    const seen = new Set<string>();
    return entries.flatMap((e) => {
      if (!e.user || seen.has(e.user_id)) return [];
      seen.add(e.user_id);
      return [e.user];
    });
  };

  const players = uniqueUsers(game.now_playing ?? []);
  const completers = uniqueUsers(game.completions ?? []);

  const releaseDate = game.initial_release_date
    ? new Date(game.initial_release_date).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;
  const imageUrl = game.art_url ?? game.cover_url;
  const accent = pickAccent(game);

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
      <div className="relative overflow-hidden rounded-xl border bg-card min-h-72">
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
        {accent && (
          <div
            className={`absolute inset-y-0 left-0 w-[55%] bg-linear-to-r ${accent.glow} pointer-events-none`}
          />
        )}
        {accent && <WinnerRibbon accent={accent} />}
        <div className="relative flex flex-col p-6 sm:p-8 max-w-[55%]">
          {(game.gotm_month_year || game.nr_gotm_month_year) && (
            <span
              className={`inline-flex self-start items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.15em] ${accent?.pill ?? NEUTRAL_PILL}`}
            >
              {game.gotm_month_year
                ? `Game of the Month of ${game.gotm_month_year}`
                : `Non RPG Game of the Month of ${game.nr_gotm_month_year}`}
            </span>
          )}
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            {accent ? (
              <span
                className={`bg-linear-to-r ${accent.gradient} bg-clip-text text-transparent`}
              >
                {game.title}
              </span>
            ) : (
              game.title
            )}
          </h1>
          <div className="mt-5 flex flex-wrap items-end gap-x-8 gap-y-3">
            <Stat label="Playing" value={players.length} accent={accent} />
            <Stat label="Completed" value={completers.length} accent={accent} />
            {releaseDate && (
              <Stat
                label="Release Date"
                value={releaseDate}
                size="md"
                accent={accent}
              />
            )}
          </div>
          {game.description && (
            <p className="mt-5 text-sm leading-relaxed text-muted-foreground line-clamp-4">
              {game.description}
            </p>
          )}
          {game.igdb_url && (
            <Button
              variant="ghost"
              size="sm"
              nativeButton={false}
              className="mt-3 -ml-2.5 self-start"
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
      <section className="space-y-4">
        <SectionHeader
          title="Currently Playing"
          Icon={Gamepad2}
          accent={accent}
          meta={
            players.length > 0
              ? `${players.length} ${players.length === 1 ? "member" : "members"}`
              : undefined
          }
        />
        {players.length > 0 ? (
          <UserAvatarGroup users={players} apiBase={API_BASE} />
        ) : (
          <EmptyState message="No one is playing this game right now." />
        )}
      </section>

      {/* Completed by */}
      <section className="space-y-4">
        <SectionHeader
          title="Completed By"
          Icon={Trophy}
          accent={accent}
          meta={
            completers.length > 0
              ? `${completers.length} ${completers.length === 1 ? "member" : "members"}`
              : undefined
          }
        />
        {completers.length > 0 ? (
          <UserAvatarGroup users={completers} apiBase={API_BASE} />
        ) : (
          <EmptyState message="No one has completed this game yet." />
        )}
      </section>

      {/* Relations stream in separately — doesn't block the hero */}
      <Suspense fallback={<GameRelationsSkeleton />}>
        <GameRelationsSection gameId={gameId} accent={accent} />
      </Suspense>
    </>
  );
}

async function GameRelationsSection({
  gameId,
  accent,
}: {
  gameId: number;
  accent: AccentProfile | null;
}) {
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

      {/* Alternate versions */}
      {relations.alternates.length > 0 && (
        <section className="space-y-4">
          <SectionHeader
            title="Alternate Versions"
            Icon={Layers}
            accent={accent}
            meta={`${relations.alternates.length} ${relations.alternates.length === 1 ? "version" : "versions"}`}
          />
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
      <Skeleton className="min-h-72 w-full rounded-xl" />

      {/* Avatar row */}
      <div className="space-y-4">
        <SectionHeaderSkeleton />
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
  );
}

function SectionHeaderSkeleton() {
  return (
    <div className="space-y-2">
      <div className="flex items-end justify-between gap-x-4">
        <div className="flex items-center gap-3">
          <Skeleton className="size-5 rounded" />
          <Skeleton className="h-6 w-40" />
        </div>
        <Skeleton className="h-3 w-20" />
      </div>
      <Skeleton className="h-px w-full" />
    </div>
  );
}

function SectionHeader({
  title,
  Icon,
  meta,
  accent,
}: {
  title: string;
  Icon: LucideIcon;
  meta?: string;
  accent: AccentProfile | null;
}) {
  return (
    <header className="space-y-2">
      <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
        <div className="flex items-center gap-3">
          <Icon
            className={`h-5 w-5 ${accent?.icon ?? "text-muted-foreground"}`}
            strokeWidth={1.75}
          />
          <h2
            className={`text-xl font-bold tracking-tight sm:text-2xl ${
              accent
                ? `bg-linear-to-r ${accent.gradient} bg-clip-text text-transparent`
                : "text-foreground"
            }`}
          >
            {title}
          </h2>
        </div>
        {meta && (
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            {meta}
          </p>
        )}
      </div>
      <div
        className={`h-px w-full bg-linear-to-r ${accent?.underline ?? NEUTRAL_UNDERLINE}`}
      />
    </header>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-dashed px-4 py-6 text-center">
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

function Stat({
  label,
  value,
  size = "lg",
  accent,
}: {
  label: string;
  value: number | string;
  size?: "lg" | "md";
  accent: AccentProfile | null;
}) {
  const valueSize =
    size === "lg" ? "text-3xl sm:text-4xl" : "text-2xl sm:text-3xl";
  return (
    <div>
      <span
        className={`block ${valueSize} font-extralight leading-none tracking-tight tabular-nums ${accent?.number ?? "text-foreground"}`}
      >
        {value}
      </span>
      <span className="mt-1.5 block text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

function WinnerRibbon({ accent }: { accent: AccentProfile }) {
  return (
    <div
      aria-label={`${accent.label} winner`}
      className="pointer-events-none absolute top-7 -right-14 z-10 flex h-7 w-52 rotate-45 items-center justify-center"
    >
      <div
        className={`flex h-full w-full items-center justify-center whitespace-nowrap bg-linear-to-r font-bold uppercase shadow-md ring-1 ${accent.ribbon} ${accent.ribbonText} ${accent.ribbonTextSize} ${accent.ribbonRing}`}
      >
        {accent.label}
      </div>
    </div>
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
