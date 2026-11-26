"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { searchTiers, type Tier } from "@/lib/members/members-wall";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { TierRow } from "./tier-row";
import { WallNote } from "./wall-note";

// The tiers under a search that narrows them by name or username as you type.

export function MemberTiers({ tiers }: { tiers: Tier[] }) {
  const [query, setQuery] = useState("");
  const shown = useMemo(() => searchTiers(tiers, query), [tiers, query]);

  return (
    <div className="space-y-5">
      <InputGroup
        variant="quick-search"
        className="h-10 w-full gap-2 px-3 sm:max-w-sm has-[>[data-align=inline-start]]:[&>input]:pl-0"
      >
        <InputGroupAddon className="p-0">
          <Search aria-hidden className="size-4 shrink-0" />
        </InputGroupAddon>
        <Label htmlFor="member-search" variant="field" className="sr-only">
          Find a member
        </Label>
        <InputGroupInput
          id="member-search"
          type="search"
          placeholder="Find a member"
          autoComplete="off"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </InputGroup>

      {shown.length === 0 ? (
        <WallNote>No member matches &ldquo;{query.trim()}&rdquo;.</WallNote>
      ) : (
        <div className="border-t border-border">
          {shown.map((tier) => (
            <TierRow key={tier.key} tier={tier} />
          ))}
        </div>
      )}
    </div>
  );
}
