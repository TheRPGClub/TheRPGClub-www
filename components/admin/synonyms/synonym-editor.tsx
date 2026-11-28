"use client";

import { useState, type FormEvent } from "react";
import { Check } from "lucide-react";
import { saveSynonymGroupAction } from "@/app/actions/synonyms";
import { addSynonymTerms, checkSynonymTerms } from "@/lib/synonyms";
import { TermInput } from "@/components/admin/synonyms/term-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// The yellow-ringed edit box: the headword, the other terms as chips, and one
// save for all of them. A new entry starts from what was looked up.
export function SynonymEditor({
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
    let result: Awaited<ReturnType<typeof saveSynonymGroupAction>>;
    try {
      result = await saveSynonymGroupAction(groupId, checked.terms);
    } catch {
      setError("Couldn't reach the club's server. Try again.");
      return;
    } finally {
      setSaving(false);
    }
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
        <Label htmlFor={`${fieldId}-headword`} variant="field" className="font-label text-[0.72rem] font-bold tracking-[0.08em]">
          Headword
        </Label>
        <span className="font-label text-[0.72rem] font-bold tracking-[0.08em] text-highlight">
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
        variant="inset"
        className="mt-1 h-10 text-[1.05rem] font-bold md:text-[1.05rem]"
      />

      <Label htmlFor={`${fieldId}-also`} variant="field" className="font-label mt-3 mb-1 block text-[0.72rem] font-bold tracking-[0.08em]">
        Also searched as
      </Label>
      <TermInput
        terms={also}
        onTermsChange={setAlso}
        pending={pending}
        onPendingChange={setPending}
        id={`${fieldId}-also`}
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
        <span className="ml-auto text-[0.8rem] text-faint-foreground">Enter adds a term</span>
      </div>
    </form>
  );
}
