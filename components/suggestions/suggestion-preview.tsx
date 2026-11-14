import type { Suggestion } from "@/lib/api/types";
import { SuggestionCard } from "./suggestion-card";

const STEPS = [
  <>
    It goes on the <b>Suggestion Board</b> as <b>Pending</b>, and members can
    upvote it.
  </>,
  <>
    A Superadmin <b>approves</b> it into a GitHub issue, or <b>rejects</b> it
    with a reason.
  </>,
  <>
    The bot posts the outcome in Discord and mentions you. You can withdraw it
    while it&apos;s Pending.
  </>,
];

// Beside the Suggest something form: the card it will pin to the board, live,
// and what happens after.
export function SuggestionPreview({ suggestion }: { suggestion: Suggestion }) {
  return (
    <aside aria-label="Preview" className="min-w-0">
      <div className="mb-3 flex items-baseline gap-2.5 border-b border-border pb-1.5">
        <h2 className="font-label text-[1.05rem] font-extrabold">On the board</h2>
        <span className="font-label ml-auto text-[0.8rem] tracking-[0.08em] text-faint-foreground">
          Preview
        </span>
      </div>
      <div aria-hidden className="pointer-events-none">
        <SuggestionCard
          suggestion={suggestion}
          mine
          bylineWhen="just now"
          headingLevel="h3"
          actions={
            <span className="font-label inline-flex h-[30px] items-center rounded-sm px-2.5 text-[0.85rem] font-extrabold text-faint-foreground shadow-[inset_0_0_0_1px_var(--color-border)]">
              Upvote
            </span>
          }
        />
      </div>

      <div className="mt-7 space-y-4">
        <div className="flex items-baseline border-b border-border pb-1.5">
          <h2 className="font-label text-[1.05rem] font-extrabold">What happens next</h2>
        </div>
        <ol className="space-y-4">
          {STEPS.map((step, i) => (
            <li key={i} className="grid grid-cols-[28px_1fr] items-start gap-3">
              <span className="font-headline text-[1.6rem] text-faint-foreground">{i + 1}</span>
              <p className="text-[0.92rem] text-dim-foreground [&_b]:font-semibold [&_b]:text-foreground">
                {step}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </aside>
  );
}
