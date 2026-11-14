"use client";

import { useEffect, useId, useState } from "react";
import { Search, X } from "lucide-react";
import type { ApiCollection, User } from "@/lib/api/types";
import { memberName } from "@/lib/achievements";
import { discordAvatarUrl } from "@/lib/auth-types";
import { Button } from "@/components/ui/button";

export interface MemberPickerProps {
  value: User | null;
  onChange: (member: User | null) => void;
  disabled?: boolean;
  autoFocus?: boolean;
  // Labels the search field (the visible label sits outside).
  labelId?: string;
}

// Find a club member by name, username or Discord id, set big in Anton on
// the desk's underline, as the live event topic is. Bots are left out; a
// member who left the server is marked. The pick replaces the field until
// "Change" clears it.
export function MemberPicker({ value, onChange, disabled, autoFocus, labelId }: MemberPickerProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState<string | null>(null);
  const listId = useId();

  const trimmed = query.trim();
  const hasQuery = trimmed.length >= 2;

  useEffect(() => {
    if (!hasQuery) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/members/search?per=10&q=${encodeURIComponent(trimmed)}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const body = (await res.json()) as ApiCollection<User>;
        setResults(body.data.filter((user) => !user.is_bot));
        setSearched(trimmed);
        setError(null);
      } catch (err) {
        if ((err as Error).name !== "AbortError") setError("Search failed. Try again.");
      } finally {
        // A newer search aborted this one and is still in flight.
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 250);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [trimmed, hasQuery]);

  if (value) {
    return (
      <div className="flex items-end gap-3 border-b-2 border-highlight pt-1.5 pb-2.5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={discordAvatarUrl(value.user_id, value.discord_avatar, 64)}
          alt=""
          className="mb-1 size-9 shrink-0 rounded-full bg-muted"
        />
        <div className="min-w-0 flex-1">
          <p className="font-headline truncate text-[1.8rem] leading-none md:text-[2.4rem]">
            {memberName(value)}
          </p>
          <p className="mt-1 truncate text-[0.85rem] text-faint-foreground">
            {value.username ? `@${value.username}` : value.user_id}
            {value.server_left_at ? " · left the server" : ""}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          onClick={() => {
            onChange(null);
            setQuery("");
            setResults([]);
          }}
        >
          <X aria-hidden />
          Change
        </Button>
      </div>
    );
  }

  const settled = !loading && searched === trimmed;
  return (
    <div className="relative">
      <div className="relative">
        <Search
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-0 size-5 -translate-y-1/2 text-faint-foreground"
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search members…"
          autoFocus={autoFocus}
          disabled={disabled}
          aria-labelledby={labelId}
          aria-controls={hasQuery ? listId : undefined}
          aria-expanded={hasQuery}
          role="combobox"
          aria-autocomplete="list"
          className="font-headline block w-full border-0 border-b-2 border-border-strong bg-transparent pt-1.5 pb-2.5 pl-8 text-[1.8rem] leading-none text-foreground caret-highlight outline-none placeholder:text-faint-foreground/70 focus-visible:border-highlight md:text-[2.4rem] [&::-webkit-search-cancel-button]:hidden"
        />
      </div>
      {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
      {hasQuery && !error && (
        <div
          id={listId}
          role="listbox"
          aria-label="Matching members"
          className="mt-1.5 max-h-72 overflow-y-auto rounded-sm border border-border-strong bg-muted shadow-[0_12px_30px_rgb(0_0_0/0.45)]"
        >
          {!settled && <p className="px-3 py-2.5 text-xs text-faint-foreground">Searching…</p>}
          {settled && results.length === 0 && (
            <p className="px-3 py-2.5 text-xs text-faint-foreground">No member matches.</p>
          )}
          {settled &&
            results.map((user) => (
              <button
                key={user.user_id}
                type="button"
                role="option"
                aria-selected={false}
                onClick={() => onChange(user)}
                className="group/result grid w-full grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-3 border-t border-border px-2.5 py-2 text-left text-sm transition-colors first:border-t-0 hover:bg-highlight/8 focus-visible:bg-highlight/8 focus-visible:outline-none"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={discordAvatarUrl(user.user_id, user.discord_avatar, 64)}
                  alt=""
                  className="size-8 rounded-full bg-card"
                />
                <span className="min-w-0">
                  <span className="block truncate font-semibold">{memberName(user)}</span>
                  <span className="block truncate text-xs text-faint-foreground">
                    {user.username ? `@${user.username}` : user.user_id}
                    {user.server_left_at ? " · left the server" : ""}
                  </span>
                </span>
                <span className="font-label rounded-xs border border-border-strong px-2 py-0.5 text-[0.75rem] font-extrabold tracking-[0.08em] text-dim-foreground transition-colors group-hover/result:border-highlight group-hover/result:bg-highlight group-hover/result:text-highlight-foreground">
                  Pick
                </span>
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
