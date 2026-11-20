"use client";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MAX_FACETS, type ReviewFacets } from "@/lib/reviews/facets";
import { unpickedFacets, withOrder } from "@/lib/reviews/scorecard-edits";

// "Add a category": one menu holding the catalogue categories not on the card
// yet, each with its hint, then the way to name your own. A menu rather than
// a button per category, so the card stays short in the margin beside the
// sheet however few categories it has.
export function FacetPicker({
  value,
  onChange,
  onAddOwn,
  disabled,
}: {
  value: ReviewFacets;
  onChange: (next: ReviewFacets) => void;
  onAddOwn: () => void;
  disabled?: boolean;
}) {
  const full = value.order.length >= MAX_FACETS;

  return (
    <div className="flex items-center gap-2.5 pt-2.5">
      <DropdownMenu>
        <DropdownMenuTrigger
          disabled={disabled || full}
          render={<Button type="button" variant="ghost" size="xs" />}
        >
          <Plus />
          Add a category
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="max-h-80 max-w-72">
          {unpickedFacets(value).map((facet) => (
            <DropdownMenuItem
              key={facet.key}
              onClick={() => onChange(withOrder(value, [...value.order, facet.key]))}
            >
              <span className="block">
                <span className="block">{facet.label}</span>
                <span className="mt-0.5 block text-xs text-muted-foreground">{facet.hint}</span>
              </span>
            </DropdownMenuItem>
          ))}
          {/* Nothing in the catalogue fits? Name your own. It lives on this
              review only — the club can average `music` across everyone's
              reviews, but not a field one person invented — so renaming a
              catalogue row is the better move where one is close enough. */}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onAddOwn}>Add your own</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <span className="font-label text-[0.72rem] font-bold tracking-[0.08em] text-faint-foreground">
        {full ? `${MAX_FACETS} of ${MAX_FACETS}, the limit` : `${value.order.length} of ${MAX_FACETS}`}
      </span>
    </div>
  );
}
