"use client";

import { useState } from "react";
import type { DatePrecision } from "@/lib/api/types";
import { precisionNote } from "@/lib/releases";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { DeskSelect } from "@/components/admin/desk/desk-select";

const QUARTERS = [1, 2, 3, 4].map((q) => ({ value: String(q), label: `Q${q}` }));

// A Release's date at its Date Precision (www#161): a day, a month, a
// quarter of a year, or a year; TBA has no date. A vague date is kept on the
// first day of its period, as the API stores it.
export function ReleaseDateField({
  date,
  precision,
  onChange,
  label,
}: {
  date: string | null;
  precision: DatePrecision;
  onChange: (date: string | null) => void;
  // Names the field for assistive tech ("Release date").
  label: string;
}) {
  if (precision === "tba") return <Badge tone="precision">{precisionNote("tba")}</Badge>;
  if (precision === "day" || precision === "month") {
    return (
      <Input
        type={precision === "day" ? "date" : "month"}
        aria-label={label}
        value={precision === "day" ? (date ?? "") : (date?.slice(0, 7) ?? "")}
        onChange={(e) => {
          const v = e.target.value;
          onChange(v ? (precision === "day" ? v : `${v}-01`) : null);
        }}
        className="h-8 w-40"
      />
    );
  }
  return <YearQuarter key={precision} date={date} quarter={precision === "quarter"} onChange={onChange} label={label} />;
}

// A year, and for a quarter which one; the year is typed, so it keeps its
// own text until it reads as four digits.
function YearQuarter({
  date,
  quarter,
  onChange,
  label,
}: {
  date: string | null;
  quarter: boolean;
  onChange: (date: string | null) => void;
  label: string;
}) {
  const [year, setYear] = useState(date?.slice(0, 4) ?? "");
  const [q, setQ] = useState(date ? String(Math.floor((Number(date.slice(5, 7)) - 1) / 3) + 1) : "1");
  const emit = (y: string, qq: string) => {
    if (!/^\d{4}$/.test(y)) return onChange(null);
    const month = quarter ? (Number(qq) - 1) * 3 + 1 : 1;
    onChange(`${y}-${String(month).padStart(2, "0")}-01`);
  };

  return (
    <div className="flex items-center gap-1.5">
      {quarter && (
        <div className="w-20">
          <DeskSelect
            groups={[{ options: QUARTERS }]}
            value={q}
            onValueChange={(next) => {
              setQ(next);
              emit(year, next);
            }}
          />
        </div>
      )}
      <Input
        inputMode="numeric"
        aria-label={`${label} year`}
        placeholder="Year"
        maxLength={4}
        value={year}
        onChange={(e) => {
          setYear(e.target.value);
          emit(e.target.value, q);
        }}
        className="h-8 w-20"
      />
    </div>
  );
}
