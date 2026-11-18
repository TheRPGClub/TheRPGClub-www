"use client";

import { Check } from "lucide-react";
import { editFunFactAction } from "@/app/actions/codex-fun-facts";
import { funFactDraft } from "@/lib/codex/fun-fact-text";
import type { CodexEntry } from "@/lib/codex/types";
import { Button } from "@/components/ui/button";
import { FunFactComposer } from "./fun-fact-composer";

// A Fun Fact's card turned over for editing, in its place on the wall: the
// add panel's look (the Fun Facts ink's top rule, the field), straightened,
// with its mentions read back as "@Name". Saving keeps its place in the
// Daily Fun Fact's queue.
export function FunFactEdit({
  id,
  fact,
  number,
  onDone,
}: {
  id: string;
  fact: CodexEntry;
  number: number;
  onDone: () => void;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-edit`}
      className="scroll-mt-24 rounded-md bg-card px-4 pt-4 pb-3.5 shadow-[inset_0_3px_0_var(--color-codex-fact),0_10px_22px_rgb(0_0_0/0.5)]"
    >
      <h3 id={`${id}-edit`} className="font-label mb-2.5 text-[0.8125rem] font-bold tracking-[0.08em] text-codex-fact">
        Edit Fun Fact No. {number}
      </h3>
      <FunFactComposer
        label={`Fun Fact No. ${number}`}
        initial={funFactDraft(fact.body ?? "", fact.mentions)}
        autoFocus
        onSave={async (body) => {
          const result = await editFunFactAction(fact.id, body);
          if (result.ok) onDone();
          return result;
        }}
        actions={({ ready, pending }) => (
          <>
            <Button type="submit" variant="highlight" size="sm" disabled={!ready}>
              <Check aria-hidden />
              {pending ? "Saving…" : "Save"}
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={onDone} disabled={pending}>
              Cancel
            </Button>
          </>
        )}
      />
    </section>
  );
}
