"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import type { User } from "@/lib/api/types";
import { memberName } from "@/lib/achievements";
import { useMemberSearch } from "@/hooks/use-member-search";
import { MemberPicked } from "@/components/admin/member-picked";
import { MemberPickerResult } from "@/components/admin/member-picker-result";
import {
  Combobox,
  ComboboxField,
  ComboboxList,
} from "@/components/ui/combobox";

export interface MemberPickerProps {
  value: User | null;
  onChange: (member: User | null) => void;
  disabled?: boolean;
  autoFocus?: boolean;
  // Labels the search field (the visible label sits outside).
  labelId?: string;
}

// Find a club member by name, username or Discord id, set big in Anton on
// the desk's underline, as the live event topic is: a combobox whose matches
// list inline under the field (arrow keys move through them, Enter picks).
// Bots are left out; a member who left the server is marked. The pick
// replaces the field until "Change" clears it.
export function MemberPicker({
  value,
  onChange,
  disabled,
  autoFocus,
  labelId,
}: MemberPickerProps) {
  const [query, setQuery] = useState("");
  const { hasQuery, results, setResults, error, settled } =
    useMemberSearch(query);

  if (value) {
    return (
      <MemberPicked
        member={value}
        disabled={disabled}
        onChange={() => {
          onChange(null);
          setQuery("");
          setResults([]);
        }}
      />
    );
  }

  return (
    <Combobox<User>
      inline
      items={settled ? results : []}
      filter={null}
      inputValue={query}
      onInputValueChange={setQuery}
      value={null}
      onValueChange={(user) => user && onChange(user)}
      itemToStringLabel={memberName}
      disabled={disabled}
    >
      <div className="relative">
        <div className="relative">
          <Search
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-0 size-5 -translate-y-1/2 text-faint-foreground"
          />
          <ComboboxField
            type="search"
            variant="headline"
            placeholder="Search members…"
            autoFocus={autoFocus}
            aria-labelledby={labelId}
            className="font-headline block h-auto min-w-auto border-0 border-b-2 px-0 pt-1.5 pb-2.5 pl-8 text-[1.8rem] leading-none md:text-[2.4rem] [&::-webkit-search-cancel-button]:hidden"
          />
        </div>
        {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
        {hasQuery && !error && (
          <div className="mt-1.5 max-h-72 overflow-y-auto rounded-sm border border-border-strong bg-muted shadow-[0_12px_30px_rgb(0_0_0/0.45)]">
            {!settled && (
              <p className="px-3 py-2.5 text-xs text-faint-foreground">
                Searching…
              </p>
            )}
            {settled && results.length === 0 && (
              <p className="px-3 py-2.5 text-xs text-faint-foreground">
                No member matches.
              </p>
            )}
            <ComboboxList
              aria-label="Matching members"
              className="max-h-none overflow-visible p-0"
            >
              {(user: User) => (
                <MemberPickerResult key={user.user_id} user={user} />
              )}
            </ComboboxList>
          </div>
        )}
      </div>
    </Combobox>
  );
}
