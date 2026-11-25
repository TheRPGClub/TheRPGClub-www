import { Fragment } from "react";
import type { GotmRoundNomination } from "@/lib/api/types";
import { Nominator } from "./round-nominator";

// Later Nominations of a row's game (two members can nominate the same
// game): named under the nominator, their reasons folded away so the row
// stays calm.

export function CoNominators({ nomination }: { nomination: GotmRoundNomination | null }) {
  const coNominations = nomination?.co_nominations ?? [];
  if (coNominations.length === 0) return null;
  return (
    <p className="mt-0.5 text-[0.8125rem] text-faint-foreground">
      also nominated by{" "}
      {coNominations.map((co, i) => (
        <Fragment key={`${co.user_id}-${co.nominated_at}`}>
          {i > 0 && (i === coNominations.length - 1 ? " and " : ", ")}
          <Nominator user={co.user} />
        </Fragment>
      ))}
    </p>
  );
}

export function CoNominationReasons({ nomination }: { nomination: GotmRoundNomination | null }) {
  const coReasons = (nomination?.co_nominations ?? [])
    .map((co) => ({ ...co, reason: co.reason?.trim() }))
    .filter((co) => co.reason);
  if (coReasons.length === 0) return null;
  return (
    <details className="group/why mt-1.5 max-w-[65ch] text-[0.8125rem] text-dim-foreground">
      <summary className="cursor-pointer list-none text-faint-foreground transition-colors hover:text-foreground [&::-webkit-details-marker]:hidden">
        <span className="group-open/why:hidden">Their reasons</span>
        <span className="hidden group-open/why:inline">Hide their reasons</span>
      </summary>
      <ul className="mt-1.5 space-y-1.5 border-l border-border pl-3">
        {coReasons.map((co) => (
          <li key={`${co.user_id}-${co.nominated_at}`} className="leading-relaxed whitespace-pre-line">
            <span className="font-semibold text-foreground/90">
              <Nominator user={co.user} />:
            </span>{" "}
            {co.reason}
          </li>
        ))}
      </ul>
    </details>
  );
}
