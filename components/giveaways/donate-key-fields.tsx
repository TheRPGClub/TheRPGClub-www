"use client";

import { GAME_KEY_REGIONS, MAX_KEY } from "@/lib/giveaways";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { DONATE_LABEL, DONATE_LABEL_TYPE } from "@/components/giveaways/donate-pick-fields";

// Where the key redeems, one tap each (Global unless the key says otherwise).
export function DonateRegionField({ region, onRegion }: { region: string; onRegion: (region: string) => void }) {
  return (
    <fieldset className="mb-5">
      <legend className={DONATE_LABEL}>Region</legend>
      <ToggleGroup
        variant="inverse"
        size="sm"
        spacing={1.5}
        value={[region]}
        onValueChange={(next) => {
          if (next[0]) onRegion(next[0]);
        }}
        className="flex-wrap"
      >
        {GAME_KEY_REGIONS.map((r) => (
          <ToggleGroupItem key={r} value={r} className="text-[0.82rem]">
            {r}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </fieldset>
  );
}

// The key itself, in plain sight for the member donating it: it's theirs.
export function DonateKeyField({ value, onValue }: { value: string; onValue: (value: string) => void }) {
  return (
    <div className="mb-1">
      <div className="flex items-baseline justify-between gap-3">
        <Label htmlFor="donate-key" variant="inverse" className={DONATE_LABEL_TYPE}>
          Key
        </Label>
        <span className="font-label text-[0.7rem] font-bold text-slip-muted-foreground">
          Only you, whoever claims it and Admins see it
        </span>
      </div>
      <Input
        id="donate-key"
        autoComplete="off"
        spellCheck={false}
        value={value}
        maxLength={MAX_KEY}
        onChange={(e) => onValue(e.target.value)}
        placeholder="XXXXX-XXXXX-XXXXX"
        variant="inverse"
        className="h-11 tracking-[0.16em]"
      />
    </div>
  );
}
