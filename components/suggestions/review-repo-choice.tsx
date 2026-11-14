"use client";

import { SUGGESTION_TARGET_REPOS, type SuggestionTargetRepo } from "@/lib/suggestions";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

// Approving: the repo the Suggestion's GitHub issue opens in, one card each.
export function ReviewRepoChoice({
  repo,
  onChange,
  author,
  labelClassName,
}: {
  repo: SuggestionTargetRepo | null;
  onChange: (repo: SuggestionTargetRepo) => void;
  author: string;
  labelClassName: string;
}) {
  return (
    <fieldset className="space-y-2">
      <legend className={labelClassName}>Open its GitHub issue in</legend>
      <RadioGroup
        value={repo}
        onValueChange={(value) => onChange(value as SuggestionTargetRepo)}
        className="gap-2 sm:grid-cols-3"
      >
        {SUGGESTION_TARGET_REPOS.map((r) => (
          <Label
            key={r.value}
            variant="choice-tile"
            className="flex cursor-pointer items-start gap-2 px-2.5 py-2"
          >
            <RadioGroupItem value={r.value} className="mt-1" />
            <span className="min-w-0">
              <span className="font-label block text-[0.92rem] font-extrabold text-foreground">
                {r.label}
              </span>
              <span className="block text-[0.78rem] text-faint-foreground">{r.blurb}</span>
            </span>
          </Label>
        ))}
      </RadioGroup>
      <p className="text-[0.82rem] text-faint-foreground">
        The issue takes its title, details and labels. The bot then tells {author} on Discord.
      </p>
    </fieldset>
  );
}
