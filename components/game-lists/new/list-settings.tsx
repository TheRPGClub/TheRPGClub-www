"use client";

import { List, ArrowDownAZ, CalendarPlus, Lock, Users } from "lucide-react";
import {
  DESCRIPTION_MAX,
  GAME_LIST_SORTS,
  NAME_MAX,
  SORT_LABEL,
  type GameListSort,
  type GameListVisibility,
} from "@/lib/game-lists/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export interface ListSettingsDraft {
  name: string;
  description: string;
  sort: GameListSort;
  visibility: GameListVisibility;
}

const SORT_ICON = { ranked: List, alphabetical: ArrowDownAZ, added: CalendarPlus } as const;

// A new list's settings, first on /lists/new (pick 3C with the owner's
// change: settings before games): its name set big, an optional
// description, the order and who sees it, each with its counter.
export function ListSettings({ draft, onChange }: { draft: ListSettingsDraft; onChange: (next: Partial<ListSettingsDraft>) => void }) {
  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:gap-x-10">
      <div className="space-y-5">
        <Field id="list-name" label="Name it" count={draft.name.length} max={NAME_MAX}>
          <Input
            id="list-name"
            variant="headline"
            value={draft.name}
            maxLength={NAME_MAX}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="Top 10 of all time"
            autoComplete="off"
          />
        </Field>
        <Field id="list-description" label="Description, optional" count={draft.description.length} max={DESCRIPTION_MAX}>
          <Textarea
            id="list-description"
            variant="compose"
            rows={3}
            maxLength={DESCRIPTION_MAX}
            value={draft.description}
            onChange={(e) => onChange({ description: e.target.value })}
            placeholder="What ties these games together?"
          />
        </Field>
      </div>
      <div className="space-y-5">
        <Choice id="list-order" label="Order">
          <ToggleGroup variant="outline" spacing={0} aria-labelledby="list-order" value={[draft.sort]} onValueChange={(v) => v[0] && onChange({ sort: v[0] as GameListSort })} className="flex-wrap">
            {GAME_LIST_SORTS.map((sort) => {
              const Icon = SORT_ICON[sort];
              return (
                <ToggleGroupItem key={sort} value={sort} className="gap-1.5 px-3">
                  <Icon aria-hidden />
                  {SORT_LABEL[sort]}
                </ToggleGroupItem>
              );
            })}
          </ToggleGroup>
        </Choice>
        <Choice id="list-seen" label="Seen by">
          <ToggleGroup variant="outline" spacing={0} aria-labelledby="list-seen" value={[draft.visibility]} onValueChange={(v) => v[0] && onChange({ visibility: v[0] as GameListVisibility })} className="flex-wrap">
            <ToggleGroupItem value="members" className="gap-1.5 px-3">
              <Users aria-hidden />
              Members
            </ToggleGroupItem>
            <ToggleGroupItem value="private" className="gap-1.5 px-3">
              <Lock aria-hidden />
              Only me (Private)
            </ToggleGroupItem>
          </ToggleGroup>
        </Choice>
        <p className="max-w-[48ch] text-[0.88rem] leading-snug text-faint-foreground">
          Members see it on Lists and on your profile. A Private list is yours alone, staff included.
        </p>
      </div>
    </div>
  );
}

function Field({ id, label, count, max, children }: { id: string; label: string; count: number; max: number; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <Label variant="field" htmlFor={id} className="font-label text-[0.82rem] tracking-[0.08em]">
          {label}
        </Label>
        <span className="font-label text-[0.74rem] font-bold tracking-[0.07em] text-faint-foreground">
          <b className="text-dim-foreground">{count}</b> / {max}
        </span>
      </div>
      {children}
    </div>
  );
}

function Choice({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <p id={id} className="font-label text-[0.82rem] tracking-[0.08em] text-faint-foreground">
        {label}
      </p>
      {children}
    </div>
  );
}
