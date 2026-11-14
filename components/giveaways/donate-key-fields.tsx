"use client";

import { Eye, EyeOff } from "lucide-react";
import { GAME_KEY_REGIONS, MAX_KEY } from "@/lib/giveaways";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DONATE_LABEL, DONATE_LABEL_TYPE } from "@/components/giveaways/donate-pick-fields";
import { Label } from "@/components/ui/label";

const REGION_ITEMS = GAME_KEY_REGIONS.map((r) => ({
  value: r,
  label: r === "Global" ? "Global (redeems anywhere)" : r,
}));

// Where the key redeems.
export function DonateRegionField({ region, onRegion }: { region: string; onRegion: (region: string) => void }) {
  return (
    <div className="mb-4">
      <span id="donate-region-label" className={DONATE_LABEL}>
        Region
      </span>
      <Select items={REGION_ITEMS} value={region} onValueChange={(next) => next && onRegion(next)}>
        <SelectTrigger
          id="donate-region"
          aria-labelledby="donate-region-label"
          variant="inverse"
          className="w-full px-3 data-[size=default]:h-9"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {REGION_ITEMS.map((r) => (
            <SelectItem key={r.value} value={r.value}>
              {r.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

// The key itself, hidden as typed until the member asks to see it.
export function DonateKeyField({
  value,
  onValue,
  shown,
  onShown,
}: {
  value: string;
  onValue: (value: string) => void;
  shown: boolean;
  onShown: (shown: boolean) => void;
}) {
  return (
    <div className="mb-1">
      <Label htmlFor="donate-key" variant="inverse" className={DONATE_LABEL_TYPE}>
        Key
      </Label>
      <div className="relative">
        <Input
          id="donate-key"
          type={shown ? "text" : "password"}
          autoComplete="off"
          spellCheck={false}
          value={value}
          maxLength={MAX_KEY}
          onChange={(e) => onValue(e.target.value)}
          placeholder="XXXXX-XXXXX-XXXXX"
          variant="inverse"
          className="pr-10 tracking-[0.2em]"
        />
        <Button
          variant="inverse-ghost"
          size="icon-sm"
          onClick={() => onShown(!shown)}
          aria-label={shown ? "Hide the key" : "Show the key"}
          className="absolute top-1/2 right-1 -translate-y-1/2"
        >
          {shown ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </Button>
      </div>
      <p className="mt-1.5 text-xs text-highlight-muted-foreground">Only you, the member who claims it, and Admins ever see the key.</p>
    </div>
  );
}
