import type { ImportCandidate } from "@/lib/api/types";
import { Badge } from "@/components/ui/badge";
import { RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

// One GameDB match as a choice card: the whole card is the radio's label.
export function ImportCandidateOption({
  candidate,
  exact,
}: {
  candidate: ImportCandidate;
  // The preselected exact title match, marked as such.
  exact: boolean;
}) {
  return (
    <Label variant="choice" className="grid cursor-pointer grid-cols-[1.25rem_2.9rem_1fr] items-center gap-3.5 px-3 py-2.5 has-data-disabled:cursor-default has-data-disabled:opacity-60 sm:grid-cols-[1.25rem_2.9rem_1fr_auto]">
      <RadioGroupItem variant="choice" value={candidate.game_id} />
      <span className="block h-[3.8rem] w-[2.9rem] overflow-hidden rounded-[2px] bg-background">
        {candidate.cover_url && (
          // eslint-disable-next-line @next/next/no-img-element -- remote game art from the API's image hosts, which next/image isn't configured for
          <img src={candidate.cover_url} alt="" className="size-full object-cover" />
        )}
      </span>
      <span className="min-w-0">
        <span className="font-label block text-[1.1rem] leading-[1.05] font-extrabold tracking-[0.02em] break-words">
          {candidate.title}
        </span>
        <span className="mt-0.5 block text-[0.8rem] text-faint-foreground tabular-nums">
          GameDB #{candidate.game_id}
        </span>
      </span>
      {exact && (
        <Badge className="hidden h-5.5 border-0 text-[0.72rem] sm:inline-flex">
          Exact match
        </Badge>
      )}
    </Label>
  );
}
