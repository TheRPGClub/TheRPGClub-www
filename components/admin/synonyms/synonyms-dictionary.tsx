"use client";

import { useDeferredValue, useState, type FormEvent } from "react";
import { Check, Plus, Search } from "lucide-react";
import { deleteSynonymGroupAction, saveSynonymGroupAction } from "@/app/actions/synonyms";
import type { SearchSynonymGroup } from "@/lib/api/types";
import {
  addSynonymTerms,
  checkSynonymTerms,
  synonymAlso,
  synonymDeletedMessage,
  synonymGroupMatches,
  synonymHeadword,
} from "@/lib/synonyms";
import { DictionaryList } from "@/components/admin/desk/dictionary-list";
import { TermInput } from "@/components/admin/synonyms/term-input";
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
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-paper-mute" />
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
        <div className="mt-4.5 max-w-xl rounded-md bg-ink-2 p-3 ring-1 ring-highlight ring-inset">
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

// The yellow-ringed edit box: the headword, the other terms as chips, and one
// save for all of them. A new entry starts from what was looked up.
function SynonymEditor({
  groupId,
  initialTerms,
  onDone,
}: {
  groupId: number | null;
  initialTerms: string[];
  onDone: () => void;
}) {
  const [headword, setHeadword] = useState(initialTerms[0] ?? "");
  const [also, setAlso] = useState(initialTerms.slice(1));
  const [pending, setPending] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const checked = checkSynonymTerms(addSynonymTerms([headword, ...also], pending));
    if (!checked.ok) {
      setError(checked.error);
      return;
    }
    setSaving(true);
    setError(null);
    const result = await saveSynonymGroupAction(groupId, checked.terms);
    setSaving(false);
    if (!result.ok) {
      setError(result.error ?? "Couldn't save the entry.");
      return;
    }
    onDone();
  };

  const isNew = groupId === null;
  const fieldId = isNew ? "synonym-new" : `synonym-${groupId}`;

  return (
    <form
      onSubmit={onSubmit}
      onKeyDown={(e) => {
        if (e.key === "Escape" && !saving) {
          e.preventDefault();
          onDone();
        }
      }}
      aria-label={isNew ? "New entry" : `Edit ${initialTerms[0] ?? "entry"}`}
    >
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={`${fieldId}-headword`} className="font-label text-[0.72rem] font-bold tracking-[0.08em] text-paper-mute uppercase">
          Headword
        </label>
        <span className="font-label text-[0.72rem] font-bold tracking-[0.08em] text-highlight uppercase">
          {isNew ? "New entry" : "Editing"}
        </span>
      </div>
      <Input
        id={`${fieldId}-headword`}
        value={headword}
        onChange={(e) => setHeadword(e.target.value)}
        disabled={saving}
        autoFocus={isNew || !headword}
        placeholder="final fantasy"
        maxLength={255}
        className="mt-1 h-10 bg-ink text-[1.05rem] font-bold md:text-[1.05rem]"
      />

      <label htmlFor={`${fieldId}-also`} className="font-label mt-3 mb-1 block text-[0.72rem] font-bold tracking-[0.08em] text-paper-mute uppercase">
        Also searched as
      </label>
      <TermInput
        terms={also}
        onTermsChange={setAlso}
        pending={pending}
        onPendingChange={setPending}
        id={`${fieldId}-also`}
        label="Also searched as"
        disabled={saving}
        autoFocus={!isNew && !!headword}
      />

      {error && (
        <p role="alert" className="mt-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button type="submit" variant="highlight" size="sm" disabled={saving}>
          <Check data-icon="inline-start" />
          {saving ? "Saving" : "Save entry"}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onDone} disabled={saving}>
          Cancel
        </Button>
        <span className="ml-auto text-[0.8rem] text-paper-mute">Enter adds a term</span>
      </div>
    </form>
  );
}
