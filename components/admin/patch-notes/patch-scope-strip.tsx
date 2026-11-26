import { Check } from "lucide-react";

import { pendingCount, type PatchScope } from "@/lib/patch-notes/pending-changes";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Step 2's one line back to step 1 (www#240, pn-editor-steps): "Covers 7
// Pending Changes · 1 dismissed", how many from each repo, and Change.
// Absent until there is a Pending Change to speak of.
export function PatchScopeStrip({ scope, onChange }: { scope: PatchScope | null; onChange: () => void }) {
  if (!scope || scope.offered + scope.dismissed.length === 0) return null;
  const covered = scope.covered.length;
  return (
    <div className="mb-3 flex flex-wrap items-center gap-x-2.5 gap-y-1.5 rounded-[3px] bg-card px-3.5 py-2 text-[0.875rem] text-dim-foreground shadow-[inset_0_0_0_1px_var(--color-border)]">
      <Check aria-hidden className={cn("size-3.5 shrink-0", covered > 0 ? "text-ok" : "text-faint-foreground")} strokeWidth={2.5} />
      <span>
        Covers <b className="font-semibold text-foreground">{covered > 0 ? pendingCount(covered) : "no Pending Changes"}</b>
        {scope.dismissed.length > 0 && ` · ${scope.dismissed.length} dismissed`}
      </span>
      {scope.repos.map((r) => (
        <Badge key={r.repo} tone="status" size="sm">
          {r.name} {r.count}
        </Badge>
      ))}
      <Button type="button" variant="inline-link" size="inline" onClick={onChange} className="ml-auto">
        Change
      </Button>
    </div>
  );
}
