"use client";

import { useDeferredValue, useState } from "react";
import { Plus, Search } from "lucide-react";
import { deleteSynonymGroupAction } from "@/app/actions/synonyms";
import type { SearchSynonymGroup } from "@/lib/api/types";
import {
  addSynonymTerms,
  synonymAlso,
  synonymDeletedMessage,
  synonymGroupMatches,
  synonymHeadword,
} from "@/lib/synonyms";
import { DictionaryList } from "@/components/admin/desk/dictionary-list";
import { SynonymEditor } from "@/components/admin/synonyms/synonym-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// /admin/synonyms: every synonym group as a dictionary entry filed under its
// headword, with a look-up, a new entry, edit in place (all terms in one
// save) and delete behind the Undo bar.
export function SynonymsDictionary({ groups }: { groups: SearchSynonymGroup[] }) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [editingKey, setEditingKey] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);

  const visible = groups.filter((g) => synonymGroupMatches(g, deferredQuery));
  const q = deferredQuery.trim();

  return (
    <div>
      <div className="mt-4.5 flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-[380px]">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-faint-foreground" />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Look up a term"
            aria-label="Look up a term"
            className="pl-9"
          />
        </div>
        <Button
          type="button"
          variant="highlight"
          onClick={() => {
            setEditingKey(null);
            setCreating(true);
          }}
          disabled={creating}
        >
          <Plus data-icon="inline-start" />
          New entry
        </Button>
      </div>

      {creating && (
        <div className="mt-4.5 max-w-xl rounded-md bg-card p-3 ring-1 ring-highlight ring-inset">
          <SynonymEditor
            groupId={null}
            initialTerms={addSynonymTerms([], q)}
            onDone={() => setCreating(false)}
          />
        </div>
      )}

      <DictionaryList
        items={visible}
        getKey={(g) => g.group_id}
        headword={synonymHeadword}
        also={synonymAlso}
        onDelete={async (g) => {
          const result = await deleteSynonymGroupAction(g.group_id);
          return result.ok ? undefined : { error: result.error };
        }}
        deletedMessage={synonymDeletedMessage}
        onEdit={(g) => {
          setCreating(false);
          setEditingKey(g.group_id);
        }}
        editingKey={editingKey}
        renderEditor={(g) => (
          <SynonymEditor
            key={g.group_id}
            groupId={g.group_id}
            initialTerms={[synonymHeadword(g), ...synonymAlso(g)]}
            // A save that lands after another entry was opened leaves that one open.
            onDone={() => setEditingKey((k) => (k === g.group_id ? null : k))}
          />
        )}
        empty={
          q ? (
            <>No entry has a term like &ldquo;{q}&rdquo;. Add it with New entry.</>
          ) : (
            "No synonyms yet. Add the first with New entry."
          )
        }
      />
    </div>
  );
}
