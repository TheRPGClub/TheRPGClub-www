"use client";

import { X } from "lucide-react";
import type { SocialPlatform } from "@/lib/api/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const NEW_PLATFORM = "__new__";

// A social's platform: one of the club's known platforms, or a new one typed
// in. `newLabel` is null while picking from the list.
export function PlatformField({
  platforms,
  platformId,
  onPlatformChange,
  newLabel,
  onNewLabelChange,
}: {
  platforms: SocialPlatform[];
  platformId: number | null;
  onPlatformChange: (id: number | null) => void;
  newLabel: string | null;
  onNewLabelChange: (label: string | null) => void;
}) {
  if (newLabel !== null) {
    return (
      <div className="flex gap-1">
        <Input
          type="text"
          placeholder="e.g. Bluesky"
          aria-label="New platform name"
          maxLength={80}
          value={newLabel}
          onChange={(e) => onNewLabelChange(e.target.value)}
          autoFocus
        />
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => onNewLabelChange(null)}
          aria-label="Cancel new platform"
        >
          <X />
        </Button>
      </div>
    );
  }

  const items: Record<string, string> = Object.fromEntries(
    platforms.map((p) => [String(p.id), p.label]),
  );
  items[NEW_PLATFORM] = "+ Add new platform…";

  return (
    <Select
      items={items}
      value={platformId === null ? null : String(platformId)}
      onValueChange={(value) => {
        if (value === NEW_PLATFORM) {
          onNewLabelChange("");
          onPlatformChange(null);
        } else {
          onPlatformChange(value ? Number(value) : null);
        }
      }}
    >
      <SelectTrigger aria-label="Platform" className="w-full min-w-0 data-[size=default]:h-9">
        <SelectValue placeholder="Platform…" />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(items).map(([value, label]) => (
          <SelectItem key={value} value={value}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
