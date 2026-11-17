"use client";

import type { ChallengeFormState } from "@/hooks/use-challenge-form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const MONTHS: Record<string, string> = Object.fromEntries(
  [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ].map((name, i) => [String(i + 1).padStart(2, "0"), name]),
);
const DAYS_IN = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

// A Season edge as a month and a day (it repeats every year).
export function DayEditor({ form, edge }: { form: ChallengeFormState; edge: "start" | "end" }) {
  const field = edge === "start" ? "seasonStart" : "seasonEnd";
  const [month, day] = form.draft[field].split("-");
  const days = Object.fromEntries(
    Array.from({ length: DAYS_IN[Number(month) - 1] ?? 31 }, (_, i) => {
      const d = String(i + 1).padStart(2, "0");
      return [d, String(i + 1)];
    }),
  );
  const set = (m: string, d: string) => {
    const max = DAYS_IN[Number(m) - 1] ?? 31;
    form.update({
      [field]: `${m}-${String(Math.min(Number(d), max)).padStart(2, "0")}`,
    });
  };
  return (
    <div className="flex flex-wrap gap-2">
      <Select items={days} value={day} onValueChange={(v) => set(month, String(v))}>
        <SelectTrigger aria-label="Day" className="w-24">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(days).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select items={MONTHS} value={month} onValueChange={(v) => set(String(v), day)}>
        <SelectTrigger aria-label="Month" className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(MONTHS).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
