import Form from "next/form";
import Link from "next/link";
import type { Platform } from "@/lib/api/types";
import {
  COMPARE_SORTS,
  compareYearOptions,
  type CompareFilters,
} from "@/lib/completions-compare";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const SELECT_CLASS =
  "h-8 w-full rounded-lg border border-input bg-background px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export interface CompareMemberOption {
  user_id: string;
  name: string;
}

export interface CompareFiltersFormProps {
  action: string;
  filters: CompareFilters;
  members: CompareMemberOption[];
  platforms: Platform[];
}

// A GET form: submitting navigates to the same page with new search params,
// which resets paging (no `page` field). next/form keeps it client-side.
export function CompareFiltersForm({
  action,
  filters,
  members,
  platforms,
}: CompareFiltersFormProps) {
  return (
    <Form
      action={action}
      className="grid grid-cols-2 gap-3 rounded-lg border bg-card p-3 sm:grid-cols-3 lg:grid-cols-6"
    >
      <label className="col-span-2 space-y-1 text-xs text-muted-foreground sm:col-span-1 lg:col-span-2">
        <span>Compare with</span>
        <select
          name="with"
          defaultValue={filters.with ?? ""}
          className={SELECT_CLASS}
        >
          <option value="">Pick a member…</option>
          {members.map((m) => (
            <option key={m.user_id} value={m.user_id}>
              {m.name}
            </option>
          ))}
        </select>
      </label>
      <label className="space-y-1 text-xs text-muted-foreground">
        <span>Year</span>
        <select
          name="year"
          defaultValue={filters.year ?? ""}
          className={SELECT_CLASS}
        >
          <option value="">Any year</option>
          <option value="unknown">No date</option>
          {compareYearOptions().map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </label>
      <label className="space-y-1 text-xs text-muted-foreground">
        <span>Platform</span>
        <select
          name="platform"
          defaultValue={filters.platform ?? ""}
          className={SELECT_CLASS}
        >
          <option value="">Any platform</option>
          {platforms.map((p) => (
            <option key={p.platform_id} value={p.platform_id}>
              {p.platform_name}
            </option>
          ))}
        </select>
      </label>
      <label className="space-y-1 text-xs text-muted-foreground">
        <span>Title</span>
        <Input
          type="search"
          name="q"
          defaultValue={filters.q}
          placeholder="Search…"
        />
      </label>
      <label className="space-y-1 text-xs text-muted-foreground">
        <span>Sort</span>
        <select name="sort" defaultValue={filters.sort} className={SELECT_CLASS}>
          {COMPARE_SORTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </label>
      <div className="col-span-2 flex items-end justify-end gap-2 sm:col-span-3 lg:col-span-6">
        <Link
          href={
            filters.with
              ? `${action}?with=${encodeURIComponent(filters.with)}`
              : action
          }
          className={buttonVariants({ variant: "ghost", size: "sm" })}
        >
          Clear filters
        </Link>
        <Button type="submit" variant="outline" size="sm">
          Compare
        </Button>
      </div>
    </Form>
  );
}
