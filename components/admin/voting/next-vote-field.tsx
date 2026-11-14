import { useId } from "react";
import { Input } from "@/components/ui/input";

// The plain date field behind the ruler's pin ("type a date"): the vote's
// opening in the viewer's zone. The pin focuses it by its id.
export function NextVoteField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const id = useId();
  return (
    <div className="mb-2.5">
      <label htmlFor="next-vote-field" className="mb-1 block text-[0.8rem] text-faint-foreground">
        Vote opens (your time)
      </label>
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
