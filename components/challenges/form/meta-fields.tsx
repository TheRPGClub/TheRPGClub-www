"use client";

import type { ChallengeFormState } from "@/hooks/use-challenge-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

// Name, Description and, for Moderators and above creating one, the Host:
// the member or the club. They stay editable once the rules are locked.
export function MetaFields({ form, canHostForClub }: { form: ChallengeFormState; canHostForClub: boolean }) {
  const { draft, update, errors } = form;
  return (
    <div data-slot="challenge-desk-meta" className="mt-[30px] grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.4fr_auto]">
      <div className="space-y-1.5">
        <Label variant="field" htmlFor="challenge-name" className="font-label text-[0.82rem] tracking-[0.08em]">
          Name
        </Label>
        <Input
          id="challenge-name"
          variant="compose"
          maxLength={100}
          value={draft.name}
          aria-invalid={!!errors.name || undefined}
          onChange={(e) => update({ name: e.target.value })}
          placeholder="Fall of Final Fantasy"
        />
        {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
      </div>
      <div className="space-y-1.5">
        <Label variant="field" htmlFor="challenge-description" className="font-label text-[0.82rem] tracking-[0.08em]">
          Description
        </Label>
        <Textarea
          id="challenge-description"
          variant="compose"
          rows={3}
          value={draft.description}
          onChange={(e) => update({ description: e.target.value })}
          placeholder="What the Challenge is about, in your words."
        />
      </div>
      {canHostForClub && (
        <div className="space-y-1.5">
          <p id="challenge-host" className="font-label text-[0.82rem] tracking-[0.08em] text-faint-foreground">
            Host
          </p>
          <ToggleGroup
            variant="outline"
            spacing={0}
            aria-labelledby="challenge-host"
            value={[draft.hostedByClub ? "club" : "you"]}
            onValueChange={(value) => value[0] && update({ hostedByClub: value[0] === "club" })}
          >
            <ToggleGroupItem value="you" className="px-3.5">
              You
            </ToggleGroupItem>
            <ToggleGroupItem value="club" className="px-3.5">
              The club (staff)
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      )}
    </div>
  );
}
