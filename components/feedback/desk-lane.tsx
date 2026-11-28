import type { CSSProperties } from "react";
import type { Feedback } from "@/lib/api/types";
import type { FeedbackKindMeta } from "@/lib/feedback";
import { Button } from "@/components/ui/button";
import { KIND_ICON } from "./kind-icon";

// One kind's lane on the review desk: its icon, name and Pending count in
// Anton over a 3px rule in the kind's ink, then its cards (title, author,
// upvote count), each opening the review Sheet.
export function DeskLane({
  kind,
  rows,
  openId,
  onOpen,
}: {
  kind: FeedbackKindMeta;
  rows: Feedback[];
  openId: number | null;
  onOpen: (f: Feedback) => void;
}) {
  const Icon = KIND_ICON[kind.value];
  return (
    <section
      aria-labelledby={`lane-${kind.value}`}
      data-slot="feedback-lane"
      style={{ "--k": kind.ink } as CSSProperties}
      className="min-w-0"
    >
      <h2
        id={`lane-${kind.value}`}
        className="mb-3 flex items-center gap-2.5 border-b-[3px] border-(--k) pb-2.5 text-(--k)"
      >
        <Icon aria-hidden className="size-[22px] shrink-0" />
        <span className="font-headline flex-1 truncate text-[1.4rem] leading-none">{kind.plural}</span>
        <span className="font-headline text-[1.4rem] leading-none text-foreground">{rows.length}</span>
      </h2>
      {rows.length === 0 ? (
        <p className="px-1 text-sm text-faint-foreground">Nothing waiting.</p>
      ) : (
        <ul className="space-y-2">
          {rows.map((f) => (
            <li key={f.feedback_id}>
              <Button
                variant="lane-card"
                size="bare"
                aria-haspopup="dialog"
                aria-expanded={openId === f.feedback_id}
                onClick={() => onOpen(f)}
                className="block w-full px-3 py-2.5"
              >
                <span className="flex items-start justify-between gap-2.5">
                  <b className="text-[0.95rem] leading-snug font-medium">{f.title}</b>
                  <span className="font-headline text-[1.4rem] leading-none" aria-label={`${f.upvote_count} upvotes`}>
                    {f.upvote_count}
                  </span>
                </span>
                <span className="mt-1 block text-[0.82rem] text-faint-foreground">
                  {f.created_by_name ?? "Unknown member"}
                </span>
              </Button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
