import Form from "next/form";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Download, FileUp, GitCompareArrows, Search } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { getSession } from "@/lib/session";
import type {
  ApiCollection,
  ApiSingle,
  GameCompletion,
  User,
} from "@/lib/api/types";
import { paginationOf } from "@/lib/api/pagination";
import { CompletedReel } from "@/components/issue/member-completed-reel";
import {
  YearDial,
  dialMonths,
  type DialYear,
} from "@/components/issue/member-year-dial";
import { MemberListShell } from "@/components/member/member-list-shell";
import { MemberListEmpty } from "@/components/member/member-game-card";
import {
  completionMonth,
  completionYear,
  memberCounts,
  memberName,
} from "@/components/member/member-lists";
import { fetchAllCompletions } from "@/components/member/member-lists-server";
import { ListPagination } from "@/components/list-pagination";
import { buttonVariants } from "@/components/ui/button";
import { importsHubHref } from "@/lib/imports/kinds";
import { firstParam } from "@/lib/search-params";

const PAGE_SIZE = 48;

// Completed games, a year at a time: the year dial picks the year (newest by
// default), the spotlight shows one completion in full, and the filmstrip
// runs through the year's completions by month. A search looks across every
// year.
//
// The dial is built from the member's whole completion history (read at the
// API's largest page size), since no endpoint summarises completions by
// year. The page itself is the API's own `year`-filtered, paginated list.

type YearKey = string; // "2026" | "unknown" | "all"

export default async function CompletedGamesPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ id }, raw] = await Promise.all([params, searchParams]);
  const currentPage = Math.max(1, parseInt(firstParam(raw.page) ?? "1", 10) || 1);
  const q = firstParam(raw.q)?.trim() ?? "";
  const yearParam = firstParam(raw.year)?.trim().toLowerCase() ?? "";

  const [session, userRes, history] = await Promise.all([
    getSession(),
    apiFetch(`/api/v1/users/${id}`, { cache: "no-store" }),
    fetchAllCompletions(id),
  ]);

  if (!userRes.ok) notFound();
  const { data: user }: ApiSingle<User> = await userRes.json();
  const displayName = memberName(user);
  const isSelf = session?.principal.discord_id === id;

  // Year → count, and month → its completions in the API's order (newest
  // completion first, then newest entry), for the dial and its month jumps.
  const yearCounts = new Map<string, number>();
  const byYear = new Map<string, GameCompletion[]>();
  for (const entry of history?.entries ?? []) {
    const year = completionYear(entry.completed_at) ?? "unknown";
    yearCounts.set(year, (yearCounts.get(year) ?? 0) + 1);
    byYear.set(year, [...(byYear.get(year) ?? []), entry]);
  }
  const yearKeys = [...yearCounts.keys()]
    .filter((k) => k !== "unknown")
    .sort((a, b) => b.localeCompare(a));
  if (yearCounts.has("unknown")) yearKeys.push("unknown");

  const valid = (k: string) =>
    k === "all" || k === "unknown" || /^\d{4}$/.test(k);
  const year: YearKey = valid(yearParam)
    ? yearParam
    : q || !history || yearKeys.length === 0
      ? "all"
      : yearKeys[0];

  const listQuery = new URLSearchParams({
    per: String(PAGE_SIZE),
    page: String(currentPage),
  });
  if (year !== "all") listQuery.set("year", year);
  if (q) listQuery.set("q", q);
  const listRes = await apiFetch(
    `/api/v1/users/${id}/completions?${listQuery}`,
    { cache: "no-store" },
  );

  let entries: GameCompletion[] = [];
  let total = 0;
  let totalPages = 1;
  const failed = !listRes.ok;
  if (listRes.ok) {
    const body: ApiCollection<GameCompletion> = await listRes.json();
    entries = body.data;
    // The server owns the split; PAGE_SIZE is only what we asked for.
    const pagination = paginationOf(body.meta, entries.length);
    total = pagination.total;
    totalPages = pagination.totalPages;
  }

  const base = `/members/${id}/completed-games`;
  const hrefFor = (y: YearKey | null, p = 1, query = q) => {
    const ps = new URLSearchParams();
    if (y) ps.set("year", y);
    if (query) ps.set("q", query);
    if (p > 1) ps.set("page", String(p));
    return `${base}${ps.size ? `?${ps}` : ""}`;
  };

  const dialYears: DialYear[] = yearKeys.map((key) => ({
    key,
    label: key === "unknown" ? "No date" : key,
    count: yearCounts.get(key) ?? 0,
    href: hrefFor(key, 1, ""),
  }));
  const monthJumps = new Map<string, { count: number; href: string }>();
  if (/^\d{4}$/.test(year) && !q) {
    const inYear = [...(byYear.get(year) ?? [])].sort(
      (a, b) =>
        (b.completed_at ?? "").localeCompare(a.completed_at ?? "") ||
        b.created_at.localeCompare(a.created_at),
    );
    inYear.forEach((entry, i) => {
      const month = completionMonth(entry.completed_at);
      if (!month) return;
      const hit = monthJumps.get(month);
      if (hit) hit.count += 1;
      else
        monthJumps.set(month, {
          count: 1,
          href: `${hrefFor(year, Math.floor(i / PAGE_SIZE) + 1)}#m-${month}`,
        });
    });
  }
  const months = /^\d{4}$/.test(year) && !q ? dialMonths(year, monthJumps) : [];

  const scope =
    year === "all"
      ? "every year"
      : year === "unknown"
        ? "entries with no date"
        : year;

  return (
    <MemberListShell
      userId={id}
      displayName={displayName}
      title="Completed games"
      count={total}
      current="completed"
      counts={memberCounts(user)}
      action={
        <>
          {session && !isSelf && (
            <Link
              href={`${base}/compare`}
              className={buttonVariants({ variant: "outline" })}
            >
              <GitCompareArrows data-icon="inline-start" /> Compare
            </Link>
          )}
          {isSelf && (
            // A plain link, not next/link: the route handler answers with an
            // attachment, so the browser downloads it instead of navigating.
            <a
              href={`/api/members/${id}/completions/export`}
              download="completions.csv"
              className={buttonVariants({ variant: "outline" })}
            >
              <Download data-icon="inline-start" /> Export CSV
            </a>
          )}
          {isSelf && (
            <Link
              href={importsHubHref(id)}
              className={buttonVariants({ variant: "outline" })}
            >
              <FileUp data-icon="inline-start" /> Import
            </Link>
          )}
        </>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_5rem] lg:gap-7">
        <div className="min-w-0 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
            <h2 className="font-headline text-3xl sm:text-[2.5rem]">
              {q ? (
                <>Matching &ldquo;{q}&rdquo;</>
              ) : year === "all" ? (
                "Every year"
              ) : year === "unknown" ? (
                "No date"
              ) : (
                year
              )}
              <span className="font-label ml-3 align-middle text-sm font-extrabold tracking-[0.08em] text-paper-mute">
                {total} {total === 1 ? "game" : "games"}
              </span>
            </h2>
            <Form
              action={base}
              role="search"
              className="flex h-10 w-full max-w-80 items-center gap-2 rounded-sm border border-rule bg-ink-2 px-3 text-paper-mute transition-colors focus-within:border-paper-mute"
            >
              <Search aria-hidden className="size-4 shrink-0" />
              <label htmlFor="completed-search" className="sr-only">
                Search {displayName}&apos;s completed games
              </label>
              <input
                id="completed-search"
                name="q"
                type="search"
                defaultValue={q}
                placeholder="Search completed games"
                className="h-full min-w-0 flex-1 bg-transparent text-sm text-paper outline-none placeholder:text-paper-mute"
              />
              <input type="hidden" name="year" value="all" />
            </Form>
          </div>

          <div className="lg:hidden">
            <YearDial
              years={dialYears}
              current={year}
              months={[]}
              layout="row"
              all={{ href: hrefFor("all", 1, q), count: null, on: year === "all" }}
            />
          </div>

          {failed ? (
            <MemberListEmpty>
              Couldn&apos;t load completed games. Try again in a moment.
            </MemberListEmpty>
          ) : entries.length === 0 ? (
            <div className="space-y-3">
              <MemberListEmpty>
                {q
                  ? `No completed games match “${q}”.`
                  : year === "all"
                    ? "No completed games yet."
                    : `Nothing completed in ${scope}.`}
              </MemberListEmpty>
              {q && (
                <p className="text-center">
                  <Link
                    href={hrefFor(null, 1, "")}
                    className="font-label text-sm font-extrabold text-paper-dim transition-colors hover:text-highlight"
                  >
                    Clear search
                  </Link>
                </p>
              )}
            </div>
          ) : (
            <CompletedReel
              // A new page or year starts the spotlight on its first entry.
              key={`${year}-${q}-${currentPage}`}
              entries={entries}
              ownerName={displayName}
              offset={(currentPage - 1) * PAGE_SIZE}
              total={total}
            />
          )}

          <ListPagination
            currentPage={currentPage}
            totalPages={totalPages}
            buildHref={(p) => hrefFor(year, p)}
          />
        </div>

        <div className="hidden lg:block">
          <YearDial
            years={dialYears}
            current={year}
            months={months}
            all={{ href: hrefFor("all", 1, q), count: null, on: year === "all" }}
          />
        </div>
      </div>

      {history?.capped && (
        <p className="text-xs text-paper-mute">
          The year dial covers the first {history.entries.length} completions
          only; use All to reach the rest.
        </p>
      )}
    </MemberListShell>
  );
}
