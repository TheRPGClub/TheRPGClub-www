"use client";

import { useTransition } from "react";
import { Search } from "lucide-react";
import { pastPickAction } from "@/app/actions/challenge-slots";
import { formatFullDay } from "@/lib/challenges/dates";
import { usePastPlay } from "@/hooks/use-past-play";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useRunNotice } from "@/components/challenges/run-notice";
import { YearChoices } from "@/components/challenges/slots/year-choices";

// Pick a past Game Completion (Counts past play, surface brief
// challenges-slots): the member's Game Completions from before their Run
// that fit an open year, searchable by title, each with the years it can
// fill. From an open year's tile it lists only what fits that year. A
// refusal goes to the panel's notice slip.
export function PastPickDialog({
  runId,
  year,
  open,
  onClose,
}: {
  runId: number;
  year: number | null;
  open: boolean;
  onClose: () => void;
}) {
  const setNotice = useRunNotice();
  const list = usePastPlay(runId, open);
  const [pending, startTransition] = useTransition();
  const shown = (list.items ?? []).filter((p) => year === null || p.open_years.includes(year));
  const pick = (completionId: number, slotYear: number) =>
    startTransition(async () => {
      setNotice(null);
      const result = await pastPickAction(runId, completionId, slotYear);
      onClose();
      if (!result.ok) setNotice({ title: "Not picked", message: result.error ?? "That didn't work." });
    });

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{year ? `Pick a past game for ${year}` : "Pick a past Game Completion"}</DialogTitle>
          <DialogDescription>
            Games you Cleared before your Run started{year ? ` that were released in ${year}` : ""}. A pick holds as
            long as its Game Completion does.
          </DialogDescription>
        </DialogHeader>
        <div className="relative">
          <Search aria-hidden className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 opacity-60" />
          <Input
            type="search"
            aria-label="Search your past games"
            placeholder="Search your past games"
            value={list.query}
            autoFocus
            onChange={(e) => list.setQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <div aria-live="polite" className="max-h-[55vh] space-y-1 overflow-y-auto">
          {list.error && <p className="text-sm text-destructive">{list.error}</p>}
          {list.items === null && list.loading && <p className="text-sm text-dim-foreground">Reading your games…</p>}
          {list.items !== null && shown.length === 0 && (
            <p className="text-sm text-dim-foreground">
              {list.query
                ? "No past game of yours matches that."
                : year
                  ? `None of your past games was released in ${year}.`
                  : "None of your past games fits an open year."}
            </p>
          )}
          <ul className="divide-y divide-border">
            {shown.map((p) => (
              <li key={p.completion_id} className="space-y-2 py-3">
                <p className="leading-tight">
                  <span className="font-semibold">{p.title}</span>
                  <span className="block text-sm text-dim-foreground">
                    {p.completed_at ? `Cleared ${formatFullDay(p.completed_at)}` : "Cleared, no date"}
                  </span>
                </p>
                <YearChoices
                  label="Pick it for"
                  years={year ? [year] : p.open_years}
                  pending={pending}
                  empty=""
                  onPick={(slotYear) => pick(p.completion_id, slotYear)}
                />
              </li>
            ))}
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
}
