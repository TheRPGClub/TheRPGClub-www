"use client";

import { EyeOff } from "lucide-react";
import type { PlatformChoice } from "@/lib/hidden-platforms";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// The foot of the Hidden Platforms list: a platform picker and Hide.
export function HiddenPlatformPicker({
  offered,
  pick,
  onPick,
  disabled,
  onHide,
}: {
  offered: PlatformChoice[];
  pick: string | null;
  onPick: (pick: string | null) => void;
  disabled: boolean;
  onHide: () => void;
}) {
  return (
    <div className="mt-2.5 flex items-center gap-2">
      {/* Wrapped: the Select's hidden input is a sibling of its trigger. */}
      <div className="min-w-0 flex-1">
        <Select
          items={Object.fromEntries(offered.map((c) => [String(c.id), c.name]))}
          value={pick}
          onValueChange={(v) => onPick(v as string | null)}
          disabled={disabled || offered.length === 0}
        >
          <SelectTrigger
            aria-label="Platform to hide"
            className="w-full min-w-0 data-[size=default]:h-9"
          >
            <SelectValue placeholder="Choose a platform" />
          </SelectTrigger>
          <SelectContent>
            {offered.map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button
        variant="outline"
        size="sm"
        className="h-9"
        disabled={disabled || pick === null}
        onClick={onHide}
      >
        <EyeOff data-icon="inline-start" aria-hidden />
        Hide
      </Button>
    </div>
  );
}
