import Link from "next/link";
import { notFound, redirect } from "next/navigation";
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
  backlogPickHref,
  backlogPickQuery,
  parseBacklogPickParams,
  pickSourceLabel,
  type BacklogPickParams,
  type BacklogPickSearchParams,
} from "@/lib/api/backlog-pick";
import { PickDeal } from "@/components/issue/member-pick-deal";
import { PickSentence } from "@/components/issue/member-pick-sentence";
import { MemberListShell } from "@/components/member/member-list-shell";
import { memberCounts, memberName } from "@/components/member/member-lists";
import { buttonVariants } from "@/components/ui/button";

// The backlog picker deals a hand of three. The API draws one game per call
// from a seeded shuffle walked by `position`, so the hand is the same seed
// read three times in a row (each call starting at the last one's
// `next_position`). The shuffle covers each candidate once, so the three are
// distinct; a repeat (the walk wrapped round a small pool) ends the hand
// early, which is how a pool of one or two deals one or two cards. The whole
// hand stays in the URL (seed + position), so it can be reloaded or shared,
// and "Deal again" carries on from where the hand ended.

const HAND = 3;

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

type Deal =
  | { kind: "ok"; picks: BacklogPick[]; meta: BacklogPickMeta; next: number; wrapped: boolean }
  | { kind: "empty"; meta: BacklogPickMeta }
  | { kind: "error"; message: string };

async function dealHand(userId: string, filters: BacklogPickParams): Promise<Deal> {
  const picks: BacklogPick[] = [];
  let seed = filters.seed;
  let position = filters.position;
  let first: BacklogPickMeta | null = null;
  let next = position;
  let wrapped = false;

  for (let i = 0; i < HAND; i++) {
    const res = await apiFetch(
      `/api/v1/users/${userId}/backlog/pick${backlogPickQuery({ ...filters, seed, position })}`,
      { cache: "no-store" },
    );
    if (!res.ok) {
      if (i === 0) {
        return {
          kind: "error",
          message: `Couldn't pick a game right now (HTTP ${res.status}).`,
        };
      }
      break; // Keep the cards already dealt.
    }
    const body: BacklogPickResponse = await res.json();
    first ??= body.meta;
    seed = body.meta.seed;
    if (!body.data) break;
    if (picks.some((p) => p.gamedb_game_id === body.data!.gamedb_game_id)) break;
    picks.push(body.data);
    wrapped ||= body.meta.wrapped;
    next = body.meta.next_position ?? 0;
    position = next;
  }

  if (!first) return { kind: "error", message: "Couldn't pick a game right now." };
  // Later calls carry the server-drawn seed; the first meta lacks nothing
  // else the page needs.
  const meta = { ...first, seed: seed ?? first.seed };
  if (picks.length === 0) return { kind: "empty", meta };
  return { kind: "ok", picks, meta, next, wrapped };
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
  const [userRes, deal] = await Promise.all([
    apiFetch(`/api/v1/users/${id}`, { cache: "no-store" }),
    dealHand(id, filters),
  ]);

  if (!userRes.ok) notFound();
  const { data: user }: ApiSingle<User> = await userRes.json();
  const displayName = memberName(user);

  const meta = deal.kind === "error" ? null : deal.meta;
  const platforms =
    deal.kind === "ok" && deal.picks.some((p) => p.platform_id === null)
      ? await loadPlatforms()
      : undefined;

  return (
    <MemberListShell
      userId={id}
      displayName={displayName}
      title="Pick something to play"
      current="backlog"
      counts={memberCounts(user)}
    >
      <PickSentence filters={filters} meta={meta} />

      {deal.kind === "error" && (
        <p
          role="alert"
          className="rounded-sm border border-dashed border-rule-strong px-4 py-10 text-center text-sm text-destructive"
        >
          {deal.message}
        </p>
      )}
      {deal.kind === "empty" && (
        <EmptyState userId={id} filters={filters} total={deal.meta.total} />
      )}
      {deal.kind === "ok" && (
        <div className="space-y-3">
          <PickDeal
            userId={id}
            picks={deal.picks}
            platforms={platforms}
            redealHref={backlogPickHref(id, {
              ...filters,
              seed: deal.meta.seed,
              position: deal.next,
            })}
          />
          {deal.picks.length < HAND && (
            <p className="text-sm text-paper-mute">
              Only {deal.picks.length} game{deal.picks.length === 1 ? "" : "s"}{" "}
              fit{deal.picks.length === 1 ? "s" : ""} these filters, so the hand
              is short.
            </p>
          )}
          {deal.wrapped && (
            <p className="text-sm text-paper-mute">
              Back to the start of your list, so picks may repeat.
            </p>
          )}
        </div>
      )}
    </MemberListShell>
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
    <div className="space-y-3 rounded-sm border border-dashed border-rule-strong px-4 py-10 text-center">
      <p className="text-sm text-paper-mute">{message}</p>
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
