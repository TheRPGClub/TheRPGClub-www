import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft, Dices, Shuffle } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { getSession } from "@/lib/session";
import type {
  ApiCollection,
  ApiSingle,
  BacklogPick,
  BacklogPickMeta,
  BacklogPickResponse,
  Platform,
  User,
} from "@/lib/api/types";
import {
  PICK_SOURCES,
  backlogPickHref,
  backlogPickQuery,
  parseBacklogPickParams,
  pickSourceLabel,
  type BacklogPickParams,
  type BacklogPickSearchParams,
} from "@/lib/api/backlog-pick";
import { MemberListShell } from "@/components/member/member-list-shell";
import { StartPlayingForm } from "@/components/member/start-playing-form";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const fieldClass =
  "h-8 rounded-lg border border-input bg-background px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

async function loadPlatforms(): Promise<Platform[]> {
  try {
    const res = await apiFetch("/api/v1/platforms?per=100", { cache: "no-store" });
    if (!res.ok) return [];
    const body: ApiCollection<Platform> = await res.json();
    return body.data;
  } catch {
    return [];
  }
}

export default async function BacklogPickPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<BacklogPickSearchParams>;
}) {
  const [{ id }, raw] = await Promise.all([params, searchParams]);
  const session = await getSession();

  if (!session) redirect("/");
  if (session.principal.discord_id !== id) {
    redirect(`/members/${id}/backlogged-games`);
  }

  const filters = parseBacklogPickParams(raw);
  const [userRes, pickRes] = await Promise.all([
    apiFetch(`/api/v1/users/${id}`, { cache: "no-store" }),
    apiFetch(`/api/v1/users/${id}/backlog/pick${backlogPickQuery(filters)}`, {
      cache: "no-store",
    }),
  ]);

  if (!userRes.ok) notFound();
  const { data: user }: ApiSingle<User> = await userRes.json();
  const displayName = user.global_name ?? user.username ?? id;

  let pick: BacklogPick | null = null;
  let meta: BacklogPickMeta | null = null;
  let error: string | null = null;
  if (pickRes.ok) {
    const body: BacklogPickResponse = await pickRes.json();
    pick = body.data;
    meta = body.meta;
  } else {
    error = `Couldn't pick a game right now (HTTP ${pickRes.status}).`;
  }

  const platforms =
    pick && pick.platform_id === null ? await loadPlatforms() : undefined;

  return (
    <MemberListShell
      userId={id}
      displayName={displayName}
      title="Pick something to play"
      action={
        <Link
          href={`/members/${id}/backlogged-games`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="size-4" />
          Back to backlog
        </Link>
      }
    >
      <FilterForm filters={filters} meta={meta} />

      {error ? (
        <p className="rounded-lg border border-dashed px-4 py-10 text-center text-sm text-destructive">
          {error}
        </p>
      ) : pick && meta ? (
        <PickCard
          userId={id}
          pick={pick}
          meta={meta}
          filters={filters}
          platforms={platforms}
        />
      ) : (
        <EmptyState userId={id} filters={filters} total={meta?.total ?? 0} />
      )}
    </MemberListShell>
  );
}

// A plain GET form: submitting it is a fresh pick under the new filters, so it
// drops the seed and position and the server draws a new seed.
function FilterForm({
  filters,
  meta,
}: {
  filters: BacklogPickParams;
  meta: BacklogPickMeta | null;
}) {
  const platformOptions = meta?.platforms ?? [];
  const selectedMissing =
    filters.platformId !== null &&
    !platformOptions.some((p) => p.platform_id === filters.platformId);

  return (
    <form
      method="get"
      className="flex flex-wrap items-end gap-3 rounded-xl border bg-card p-4"
    >
      <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
        Pick from
        <select name="source" defaultValue={filters.source} className={fieldClass}>
          {PICK_SOURCES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
        Platform
        <select
          name="platform_id"
          defaultValue={filters.platformId?.toString() ?? ""}
          className={cn(fieldClass, "max-w-56")}
        >
          <option value="">Any platform</option>
          {selectedMissing && (
            <option value={filters.platformId!}>Platform #{filters.platformId}</option>
          )}
          {platformOptions.map((p) => (
            <option key={p.platform_id} value={p.platform_id}>
              {p.platform_name ?? p.platform_abbreviation ?? `Platform #${p.platform_id}`}{" "}
              ({p.count})
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
        Max hours
        <input
          type="number"
          name="max_hours"
          min={1}
          max={1000}
          step={1}
          inputMode="numeric"
          placeholder="Any"
          defaultValue={filters.maxHours ?? ""}
          className={cn(fieldClass, "w-24")}
        />
      </label>
      <button type="submit" className={buttonVariants({ variant: "outline" })}>
        <Dices />
        Pick
      </button>
    </form>
  );
}

function filtersSummary(filters: BacklogPickParams, pick: BacklogPick | null): string {
  const parts: string[] = [pickSourceLabel(filters.source)];
  if (filters.platformId !== null) {
    parts.push(pick?.platform?.platform_name ?? `platform #${filters.platformId}`);
  }
  if (filters.maxHours !== null) {
    parts.push(`up to ${filters.maxHours} hour${filters.maxHours === 1 ? "" : "s"}`);
  }
  return parts.join(" · ");
}

function PickCard({
  userId,
  pick,
  meta,
  filters,
  platforms,
}: {
  userId: string;
  pick: BacklogPick;
  meta: BacklogPickMeta;
  filters: BacklogPickParams;
  platforms: Platform[] | undefined;
}) {
  const game = pick.game;
  const coverUrl = game.cover_url ?? pick.hltb?.image_url ?? null;
  const rerollHref = backlogPickHref(userId, {
    ...filters,
    seed: meta.seed,
    position: meta.next_position ?? 0,
  });
  const times = [
    { label: "Main", value: pick.hltb?.main },
    { label: "Main + Sides", value: pick.hltb?.main_sides },
    { label: "Completionist", value: pick.hltb?.completionist },
  ].filter((t): t is { label: string; value: string } => Boolean(t.value));

  return (
    <div className="space-y-3">
      <article className="relative overflow-hidden rounded-2xl border bg-card">
        {game.art_url && (
          <div className="pointer-events-none absolute inset-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={game.art_url}
              alt=""
              aria-hidden
              className="h-full w-full object-cover opacity-15"
            />
            <div className="absolute inset-0 bg-linear-to-r from-card via-card/90 to-card/60" />
          </div>
        )}
        <div className="relative flex flex-col gap-6 p-6 sm:flex-row">
          <Link
            href={`/games/${game.game_id}`}
            className="relative aspect-3/4 w-36 shrink-0 overflow-hidden rounded-lg border bg-muted sm:w-44"
          >
            {coverUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={coverUrl}
                alt={game.title}
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <span className="flex h-full items-center justify-center p-3 text-center text-xs text-muted-foreground">
                {game.title}
              </span>
            )}
          </Link>

          <div className="flex min-w-0 flex-1 flex-col gap-4">
            <div className="space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Try this next
              </p>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                <Link href={`/games/${game.game_id}`} className="hover:underline">
                  {game.title}
                </Link>
              </h2>
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                {pick.platform && (
                  <span className="rounded-md bg-muted/60 px-1.5 py-0.5 font-medium uppercase tracking-wider">
                    {pick.platform.platform_name}
                  </span>
                )}
                <span>
                  From your {pick.kind === "backlog" ? "backlog" : "collection"}
                </span>
              </div>
            </div>

            {times.length > 0 ? (
              <dl className="grid max-w-md grid-cols-3 gap-2">
                {times.map((t) => (
                  <div key={t.label} className="rounded-lg border bg-background/60 px-3 py-2">
                    <dt className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      {t.label}
                    </dt>
                    <dd className="text-sm font-semibold tabular-nums">{t.value}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="text-sm text-muted-foreground">
                No HowLongToBeat times on file.
              </p>
            )}

            {pick.note && (
              <p className="max-w-prose text-sm italic text-muted-foreground">{pick.note}</p>
            )}

            <div className="mt-auto flex flex-wrap items-start gap-2">
              <StartPlayingForm
                userId={userId}
                gamedbGameId={pick.gamedb_game_id}
                platformId={pick.platform_id}
                platforms={platforms}
              />
              <Link href={rerollHref} className={buttonVariants({ variant: "outline" })}>
                <Shuffle />
                Reroll
              </Link>
            </div>
          </div>
        </div>
      </article>

      <div className="flex flex-wrap justify-between gap-2 text-xs text-muted-foreground">
        <span>Filters: {filtersSummary(filters, pick)}</span>
        <span className="tabular-nums">
          {meta.total} game{meta.total === 1 ? "" : "s"} in the draw
        </span>
      </div>
      {meta.wrapped && (
        <p className="text-xs text-muted-foreground">
          Back to the start of your list, so picks may repeat.
        </p>
      )}
    </div>
  );
}

function EmptyState({
  userId,
  filters,
  total,
}: {
  userId: string;
  filters: BacklogPickParams;
  total: number;
}) {
  const where = pickSourceLabel(filters.source).toLowerCase();
  let message: string;
  if (filters.maxHours !== null && total > 0) {
    message = `Nothing in your ${where} has a HowLongToBeat time of ${filters.maxHours} hour${filters.maxHours === 1 ? "" : "s"} or less. Games with no time on file are skipped when you set a limit.`;
  } else if (filters.platformId !== null) {
    message = `Nothing in your ${where} on that platform that isn't already on Now Playing.`;
  } else {
    message = `Nothing in your ${where} to pick from. Games already on Now Playing are left out.`;
  }

  return (
    <div className="space-y-3 rounded-lg border border-dashed px-4 py-10 text-center">
      <p className="text-sm text-muted-foreground">{message}</p>
      {(filters.platformId !== null || filters.maxHours !== null) && (
        <Link
          href={backlogPickHref(userId, {
            source: filters.source,
            platformId: null,
            maxHours: null,
            seed: null,
            position: 0,
          })}
          className={buttonVariants({ variant: "ghost", size: "sm" })}
        >
          Clear filters
        </Link>
      )}
    </div>
  );
}
