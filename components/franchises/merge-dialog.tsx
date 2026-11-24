"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { GitMerge, Search } from "lucide-react";
import type { FranchiseColumns } from "@/lib/franchises/types";
import { mergeFranchiseAction } from "@/app/actions/franchises";
import { useFranchiseSearch } from "@/hooks/use-franchise-search";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { SearchProblemNote } from "@/components/search-problem-note";

// Merge (Admins): pick the Franchise this one goes into, then confirm. The
// games, remembered unlinks and Pool sources move there, and the page goes
// to the target. A merge can't be undone.
export function MergeDialog({ franchise, games }: { franchise: { franchise_id: number; name: string }; games: number }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [target, setTarget] = useState<FranchiseColumns | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const search = useFranchiseSearch(query);
  const results = search.results.filter((f) => f.franchise_id !== franchise.franchise_id);

  const merge = () =>
    target &&
    startTransition(async () => {
      const result = await mergeFranchiseAction(franchise.franchise_id, target.franchise_id);
      if (!result.ok) return setError(result.error);
      setOpen(false);
      router.push(`/franchises/${target.franchise_id}`);
    });

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (pending) return;
        setOpen(next);
        setQuery("");
        setTarget(null);
        setError(null);
      }}
    >
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        <GitMerge data-icon="inline-start" />
        Merge
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{target ? `Merge into ${target.name}?` : `Merge ${franchise.name} into…`}</DialogTitle>
          <DialogDescription>
            {target
              ? `${franchise.name}'s ${games === 1 ? "1 game moves" : `${games} games move`} to ${target.name}, and Pools built from it use ${target.name} instead. A merge can't be undone.`
              : "Find the Franchise it belongs in."}
          </DialogDescription>
        </DialogHeader>
        {target ? (
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="ghost" onClick={() => setTarget(null)} disabled={pending}>
              Pick another
            </Button>
            <Button variant="destructive-solid" onClick={merge} disabled={pending}>
              <GitMerge data-icon="inline-start" />
              {pending ? "Merging…" : "Merge"}
            </Button>
          </div>
        ) : (
          <div>
            <div className="relative">
              <Search aria-hidden className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-faint-foreground" />
              <Input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Franchise name" aria-label="Franchise to merge into" className="pl-8" autoFocus />
            </div>
            {search.problem && <SearchProblemNote problem={search.problem} className="mt-2" />}
            {search.settled && results.length === 0 && <p className="mt-2 text-sm text-faint-foreground">No other Franchise has that in its name.</p>}
            <ul className="mt-2 max-h-64 overflow-y-auto" aria-label="Matching Franchises">
              {results.map((f) => (
                <li key={f.franchise_id}>
                  <Button variant="row" size="bare" className="w-full justify-start px-2 py-2" onClick={() => setTarget(f)}>
                    {f.name}
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
