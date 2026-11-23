"use client";

import { Plus } from "lucide-react";
import { addFunFactAction } from "@/app/actions/codex-fun-facts";
import { ADD_FUN_FACT_ID } from "@/lib/codex/paths";
import { Button } from "@/components/ui/button";
import { FunFactComposer } from "./fun-fact-composer";
import { useWall } from "./wall-state";

// Adding a Fun Fact, inline at the top of the wall (5D: Fun Facts skip the
// writing desk): a panel under the Fun Facts ink's top rule. A new Fun Fact
// goes to the front of the Daily Fun Fact's queue, and the panel says so.
// Its See also (www#127) saves once it is added; if that fails, the links
// stay on the form to retry.
export function FunFactAdd() {
  const { setNextDaily } = useWall();
  return (
    <section
      id={ADD_FUN_FACT_ID}
      aria-labelledby={`${ADD_FUN_FACT_ID}-label`}
      className="max-w-3xl scroll-mt-9 rounded-md bg-card px-4 pt-4 pb-3.5 shadow-[inset_0_3px_0_var(--color-codex-fact)]"
    >
      <h2
        id={`${ADD_FUN_FACT_ID}-label`}
        className="font-label mb-2.5 text-[0.8125rem] font-bold tracking-[0.08em] text-codex-fact"
      >
        Add a Fun Fact
      </h2>
      <FunFactComposer
        label="Your Fun Fact"
        onSave={async (body, links) => {
          const result = await addFunFactAction(body);
          if (!result.ok) return result;
          if (!result.id) {
            return links.changed ? { ...result, error: "The Fun Fact is added. Find it on the wall to give it See also." } : result;
          }
          setNextDaily(result.id);
          const linkError = await links.save(result.id);
          return linkError ? { ...result, error: `The Fun Fact is added, but See also isn't: ${linkError}` } : result;
        }}
        resetOnSave
        actions={({ ready, pending }) => (
          <>
            <span className="mr-auto text-[0.8125rem] text-faint-foreground">Goes out next as the Daily Fun Fact</span>
            <Button type="submit" variant="highlight" size="sm" disabled={!ready} className="max-sm:w-full">
              <Plus aria-hidden />
              {pending ? "Adding…" : "Add"}
            </Button>
          </>
        )}
      />
    </section>
  );
}
