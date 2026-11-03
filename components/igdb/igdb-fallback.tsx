"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Download, LoaderCircle, Plus } from "lucide-react";
import { addGameFromIgdbAction } from "@/app/actions/igdb";
import type { Game, IgdbSearchCandidate } from "@/lib/api/types";
import { igdbErrorMessage, igdbSearchHref, igdbYear } from "@/lib/igdb";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Delay before the picker's automatic IGDB search, so typing through an empty
// GameDB result doesn't spend an IGDB call per keystroke.
const PICKER_SEARCH_DELAY_MS = 400;

export interface IgdbFallbackProps {
  // The search the GameDB found nothing for.
  query: string;
  // "page": the /games index. Searches IGDB when asked, and opens the game
  // once it's added. "picker": the list game picker. Searches straight away
  // and hands the added game back through `onAdded` to carry on the list flow.
  variant: "page" | "picker";
  // Why the viewer can't add games (signed out, no Members role), or null when
  // they can. The box still says the game isn't here, and why.
  blockedReason?: string | null;
  // The picker's list, for its copy ("on your Backlog").
  listLabel?: string;
  onAdded?: (game: Game) => void;
}

type SearchState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "done"; results: IgdbSearchCandidate[] }
  | { status: "error"; message: string };

// "Not here? Add it from IGDB": what a game search shows when the GameDB has
// no match. Each IGDB result row adds that game (`POST /games`), or opens it
// when it is already in the GameDB. Key it by `query` so a new search starts
// over.
export function IgdbFallback({
  query,
  variant,
  blockedReason = null,
  listLabel,
  onAdded,
}: IgdbFallbackProps) {
  const router = useRouter();
  const picker = variant === "picker";
  const allowed = !blockedReason;
  const [search, setSearch] = useState<SearchState>(() =>
    picker && allowed ? { status: "loading" } : { status: "idle" },
  );
  const [busyId, setBusyId] = useState<number | null>(null);
  const [rowError, setRowError] = useState<{ id: number; message: string } | null>(
    null,
  );
  const [, startTransition] = useTransition();

  async function runSearch(signal?: AbortSignal) {
    setSearch({ status: "loading" });
    try {
      const res = await fetch(igdbSearchHref(query), { signal });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setSearch({
          status: "error",
          message: igdbErrorMessage("search", res.status, body.error),
        });
        return;
      }
      setSearch({
        status: "done",
        results: (body.data ?? []) as IgdbSearchCandidate[],
      });
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      setSearch({ status: "error", message: "IGDB search failed. Try again." });
    }
  }

  // The picker searches on its own: the member is mid-flow and asked for a
  // game already.
  useEffect(() => {
    if (!picker || !allowed) return;
    const controller = new AbortController();
    const timer = setTimeout(
      () => void runSearch(controller.signal),
      PICKER_SEARCH_DELAY_MS,
    );
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
    // runSearch reads only `query`, which keys this component.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [picker, allowed]);

  function add(hit: IgdbSearchCandidate) {
    setBusyId(hit.igdb_id);
    setRowError(null);
    startTransition(async () => {
      const result = await addGameFromIgdbAction(hit.igdb_id);
      if (!result.ok || !result.data) {
        setBusyId(null);
        setRowError({
          id: hit.igdb_id,
          message: result.error ?? "Couldn't add it. Try again.",
        });
        return;
      }
      if (onAdded) {
        setBusyId(null);
        onAdded(result.data);
      } else {
        // Stay busy while the game page loads.
        router.push(`/games/${result.data.game_id}`);
      }
    });
  }

  const busyHit =
    search.status === "done"
      ? search.results.find((hit) => hit.igdb_id === busyId)
      : undefined;

  return (
    <div className={cn(picker ? "space-y-1.5" : "space-y-5")}>
      <div
        className={cn(
          "flex flex-wrap items-center rounded-[3px] border border-dashed border-rule-strong",
          picker ? "px-4 py-3.5" : "gap-5 px-6 py-5.5",
        )}
      >
        {picker ? (
          <p className="flex-1 text-sm text-paper-dim">
            {allowed
              ? `Not in the GameDB. These are from IGDB: adding one puts it in the GameDB and on your ${listLabel ?? "list"}.`
              : `Not in the GameDB. ${blockedReason}`}
          </p>
        ) : (
          <>
            <div className="min-w-0 flex-1 basis-64">
              <p className="font-headline text-[2rem]">Not here?</p>
              <p className="mt-2 text-[0.95rem] text-paper-dim">
                No game in the GameDB matches &ldquo;{query}&rdquo;.{" "}
                {allowed
                  ? "Add it from IGDB and it joins the catalogue for everyone."
                  : blockedReason}
              </p>
            </div>
            {allowed && search.status !== "done" && (
              <Button
                type="button"
                variant="highlight"
                disabled={search.status === "loading"}
                onClick={() => void runSearch()}
              >
                {search.status === "loading" ? (
                  <LoaderCircle data-icon="inline-start" className="animate-spin" />
                ) : (
                  <Download data-icon="inline-start" />
                )}
                {search.status === "loading" ? "Searching IGDB" : "Add it from IGDB"}
              </Button>
            )}
          </>
        )}
      </div>

      {picker && search.status === "loading" && (
        <p className="flex items-center gap-2 px-1 py-1.5 text-xs text-paper-mute">
          <LoaderCircle aria-hidden className="size-3.5 animate-spin" />
          Searching IGDB…
        </p>
      )}

      {search.status === "error" && (
        <p role="alert" className="px-1 text-sm text-destructive">
          {search.message}
        </p>
      )}

      {search.status === "done" && (
        <section aria-label="IGDB results">
          {!picker && (
            <div className="mb-2.5 flex items-baseline gap-2.5 border-b border-rule pb-1.5">
              <h3 className="font-label text-[1.05rem] font-extrabold">IGDB results</h3>
              <span className="font-label ml-auto text-[0.8rem] tracking-[0.08em] text-paper-mute">
                {search.results.length === 0
                  ? "No matches"
                  : `${search.results.length} ${search.results.length === 1 ? "match" : "matches"} · pick one`}
              </span>
            </div>
          )}
          {search.results.length === 0 ? (
            <p className="px-1 py-2 text-sm text-paper-mute">
              IGDB has nothing for &ldquo;{query}&rdquo; either. Try another spelling.
            </p>
          ) : (
            <ul>
              {search.results.map((hit) => (
                <IgdbRow
                  key={hit.igdb_id}
                  hit={hit}
                  compact={picker}
                  busy={busyId === hit.igdb_id}
                  disabled={busyId !== null}
                  error={rowError?.id === hit.igdb_id ? rowError.message : null}
                  existingLabel={picker ? "In GameDB · Pick" : "In GameDB · Open game"}
                  onAdd={() => add(hit)}
                />
              ))}
            </ul>
          )}
          {picker && busyHit && (
            <p className="mt-2.5 flex items-center gap-2.5 rounded-[2.4px] bg-ink-3 px-3 py-2.5 text-sm text-paper-dim">
              You stay here. {busyHit.name} goes on your {listLabel ?? "list"} as soon
              as it is added.
            </p>
          )}
        </section>
      )}
    </div>
  );
}

function IgdbRow({
  hit,
  compact,
  busy,
  disabled,
  error,
  existingLabel,
  onAdd,
}: {
  hit: IgdbSearchCandidate;
  compact: boolean;
  busy: boolean;
  disabled: boolean;
  error: string | null;
  existingLabel: string;
  onAdd: () => void;
}) {
  const year = igdbYear(hit.first_release_date);
  const existing = hit.already_imported;
  return (
    <li
      aria-busy={busy || undefined}
      className={cn(
        "grid items-center border-b border-rule",
        compact
          ? "grid-cols-[2.6rem_1fr] gap-x-3 gap-y-2 py-2.5 sm:grid-cols-[2.6rem_1fr_auto]"
          : "grid-cols-[3rem_1fr] gap-x-4.5 gap-y-2.5 py-3 sm:grid-cols-[3.375rem_1fr_auto]",
        busy &&
          "rounded-[2.4px] bg-highlight/6 px-3 shadow-[inset_0_0_0_1px_rgb(255_212_0/0.5)]",
      )}
    >
      <span className="row-span-2 block aspect-[3/4] overflow-hidden rounded-[2.4px] bg-ink-3 shadow-[inset_0_0_0_1px_rgb(244_244_240/0.12)] sm:row-span-1">
        {hit.cover_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={hit.cover_url} alt="" className="size-full object-cover" />
        )}
      </span>
      <div className="min-w-0">
        <p
          className={cn(
            "font-headline leading-none break-words",
            compact ? "text-[1.1rem]" : "text-[1.35rem]",
            existing && "text-paper-dim",
          )}
        >
          {hit.name}
        </p>
        <p className="mt-1.5 flex flex-wrap gap-x-2.5 text-[0.88rem] text-paper-mute">
          {year && <b className="font-semibold text-paper-dim">{year}</b>}
          {hit.url ? (
            <a
              href={hit.url}
              target="_blank"
              rel="noreferrer"
              className="underline-offset-2 hover:text-highlight hover:underline"
            >
              IGDB #{hit.igdb_id}
            </a>
          ) : (
            <span>IGDB #{hit.igdb_id}</span>
          )}
        </p>
        {error && (
          <p role="alert" className="mt-1.5 text-sm text-destructive">
            {error}
          </p>
        )}
      </div>
      <div className="justify-self-start sm:justify-self-end">
        <Button
          type="button"
          size="sm"
          variant={existing ? "outline" : "highlight"}
          disabled={disabled}
          onClick={onAdd}
        >
          {busy ? (
            <LoaderCircle data-icon="inline-start" className="animate-spin" />
          ) : existing ? (
            <Check data-icon="inline-start" />
          ) : (
            <Plus data-icon="inline-start" />
          )}
          {busy
            ? existing && !compact
              ? "Opening"
              : "Adding"
            : existing
              ? existingLabel
              : "Add to GameDB"}
        </Button>
      </div>
    </li>
  );
}
