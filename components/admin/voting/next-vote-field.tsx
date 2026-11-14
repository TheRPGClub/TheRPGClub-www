import { useId } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// The plain date field behind the ruler's pin ("type a date"): the vote's
// opening in the viewer's zone. The pin focuses it by its id.
export function NextVoteField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const id = useId();
  return (
    <div className="mb-2.5">
      <Label htmlFor="next-vote-field" variant="field" className="mb-1 block text-[0.8rem]">
        Vote opens (your time)
      </Label>
      <Input
        id="next-vote-field"
        type="datetime-local"
        aria-describedby={`${id}-zone`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        variant="inset"
      />
      <p id={`${id}-zone`} className="mt-1 text-[0.78rem] text-faint-foreground">
        The close moves with it, to the end of that weekend in club time.
      </p>
    </div>
  );
}
