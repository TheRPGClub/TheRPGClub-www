"use client";

import { useState } from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// The catalogue's words: submitted as a search, cleared at once by the x.
export function CatalogueSearch({ q, onSearch }: { q: string; onSearch: (text: string) => void }) {
  const [text, setText] = useState(q);
  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        onSearch(text.trim());
      }}
      className="relative w-full max-w-[520px] min-w-0 sm:flex-1"
    >
      <Search
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-faint-foreground"
      />
      <Input
        type="search"
        variant="compose"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Search every entry…"
        aria-label="Search every entry"
        className="py-0 pr-9 pl-9 text-base md:text-base [&::-webkit-search-cancel-button]:hidden"
      />
      {text && (
        <Button
          variant="clear"
          size="icon-xs"
          aria-label="Clear the search"
          onClick={() => {
            setText("");
            onSearch("");
          }}
          className="absolute top-1/2 right-2 -translate-y-1/2"
        >
          <X aria-hidden className="size-4" />
        </Button>
      )}
    </form>
  );
}

const ANY = "any";

// Any member, or one member's entries only.
export function MemberFilter({
  by,
  members,
  onPick,
}: {
  by: string | null;
  members: { id: string; name: string }[];
  onPick: (id: string | null) => void;
}) {
  const items = [{ value: ANY, label: "Any member" }, ...members.map((m) => ({ value: m.id, label: m.name }))];
  return (
    <Select items={items} value={by ?? ANY} onValueChange={(next) => onPick(next && next !== ANY ? next : null)}>
      <SelectTrigger
        variant="chip"
        aria-label="Member"
        className="gap-2 pr-2.5 pl-3 text-[0.85rem] data-[size=default]:h-9 [&_[data-slot=select-trigger-icon]]:size-3.5"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {items.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
