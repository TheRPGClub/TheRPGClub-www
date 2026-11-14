"use client";

import { Check, LoaderCircle, Plus } from "lucide-react";
import type { IgdbSearchCandidate } from "@/lib/api/types";
import { igdbYear } from "@/lib/igdb";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// One IGDB result: cover, name, year and IGDB link, and the action that adds
// it to the GameDB (or opens or picks it when it is already there).
export function IgdbRow({
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
        "grid items-center border-b border-border",
        compact
          ? "grid-cols-[2.6rem_1fr] gap-x-3 gap-y-2 py-2.5 sm:grid-cols-[2.6rem_1fr_auto]"
          : "grid-cols-[3rem_1fr] gap-x-4.5 gap-y-2.5 py-3 sm:grid-cols-[3.375rem_1fr_auto]",
        busy &&
          "rounded-[2.4px] bg-highlight/6 px-3 shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--color-highlight)_50%,transparent)]",
      )}
    >
      <span className="row-span-2 block aspect-[3/4] overflow-hidden rounded-[2.4px] bg-muted shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--color-foreground)_12%,transparent)] sm:row-span-1">
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
            existing && "text-dim-foreground",
          )}
        >
          {hit.name}
        </p>
        <p className="mt-1.5 flex flex-wrap gap-x-2.5 text-[0.88rem] text-faint-foreground">
          {year && <b className="font-semibold text-dim-foreground">{year}</b>}
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
