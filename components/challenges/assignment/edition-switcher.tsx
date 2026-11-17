"use client";

import { useRouter } from "next/navigation";
import type { ChallengeEdition } from "@/lib/challenges/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Previous Editions (surface brief challenges-assignment): an outline select
// at the right of the rules row; the Edition shown is in the address.
export function EditionSwitcher({
  challengeId,
  editions,
  current,
}: {
  challengeId: number;
  editions: Pick<ChallengeEdition, "id" | "year">[];
  current: number;
}) {
  const router = useRouter();
  const items = Object.fromEntries(editions.map((e) => [String(e.id), `Edition ${e.year}`]));
  return (
    <Select
      items={items}
      value={String(current)}
      onValueChange={(value) => router.push(`/challenges/${challengeId}?edition=${value}`, { scroll: false })}
    >
      <SelectTrigger variant="search" aria-label="Edition" className="w-44">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {editions.map((e) => (
          <SelectItem key={e.id} value={String(e.id)}>
            Edition {e.year}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
