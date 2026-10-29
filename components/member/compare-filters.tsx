import Form from "next/form";
import Link from "next/link";
import type { ReactNode } from "react";
import type { Platform } from "@/lib/api/types";
import {
  COMPARE_SORTS,
  compareYearOptions,
  type CompareFilters,
} from "@/lib/completions-compare";
import {
  MemberField,
  MemberSelect,
  memberControlClass,
} from "@/components/issue/member-field";
import { Button, buttonVariants } from "@/components/ui/button";

export interface CompareMemberOption {
  user_id: string;
  name: string;
}

// The member picker at the top of the compare page. A GET form: choosing
// someone new starts a fresh comparison, so the filters drop.
export function CompareMemberForm({
  action,
  ownerName,
  filters,
  members,
}: {
  action: string;
  ownerName: string;
  filters: CompareFilters;
  members: CompareMemberOption[];
}) {
  return (
    <Form action={action} className="flex flex-wrap items-end gap-2.5">
      <MemberField
        label={`Compare ${ownerName} with`}
        className="w-full max-w-72"
      >
        <MemberSelect name="with" defaultValue={filters.with ?? ""}>
          <option value="">Pick a member…</option>
          {members.map((m) => (
            <option key={m.user_id} value={m.user_id}>
              {m.name}
            </option>
          ))}
        </MemberSelect>
      </MemberField>
      <Button type="submit" variant="outline">
        Compare
      </Button>
    </Form>
  );
}

export interface CompareFiltersFormProps {
  action: string;
  filters: CompareFilters;
  platforms: Platform[];
  // The heading the bar sits beside ("The 37 in common").
  heading?: ReactNode;
}

// The shared games' filters. A GET form: submitting navigates to the same
// page with new search params, which resets paging (no `page` field), and
// keeps the member being compared with. next/form keeps it client-side.
export function CompareFiltersForm({
  action,
  filters,
  platforms,
  heading,
}: CompareFiltersFormProps) {
  return (
    <Form
      action={action}
      className="flex flex-wrap items-end gap-2.5 border-t-2 border-paper pt-3.5"
    >
      {heading && (
        <h2 className="font-headline mr-auto w-full self-center text-[2rem] leading-none lg:w-auto">
          {heading}
        </h2>
      )}
      {filters.with && <input type="hidden" name="with" value={filters.with} />}
      <MemberField label="Year" className="min-w-0 flex-[1_1_8.5rem] lg:w-38 lg:flex-none">
        <MemberSelect name="year" defaultValue={filters.year ?? ""}>
          <option value="">Any year</option>
          <option value="unknown">No date</option>
          {compareYearOptions().map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </MemberSelect>
      </MemberField>
      <MemberField label="Platform" className="min-w-0 flex-[1_1_8.5rem] lg:w-40 lg:flex-none">
        <MemberSelect name="platform" defaultValue={filters.platform ?? ""}>
          <option value="">Any platform</option>
          {platforms.map((p) => (
            <option key={p.platform_id} value={p.platform_id}>
              {p.platform_name}
            </option>
          ))}
        </MemberSelect>
      </MemberField>
      <MemberField label="Search" className="min-w-0 flex-[1_1_8.5rem] lg:w-40 lg:flex-none">
        <input
          type="search"
          name="q"
          defaultValue={filters.q}
          placeholder="Game title"
          className={memberControlClass}
        />
      </MemberField>
      <MemberField label="Sort" className="min-w-0 flex-[1_1_8.5rem] lg:w-40 lg:flex-none">
        <MemberSelect name="sort" defaultValue={filters.sort}>
          {COMPARE_SORTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </MemberSelect>
      </MemberField>
      <div className="flex gap-1.5">
        <Button type="submit" variant="outline" className="h-9.5">
          Apply
        </Button>
        <Link
          href={
            filters.with
              ? `${action}?with=${encodeURIComponent(filters.with)}`
              : action
          }
          className={buttonVariants({ variant: "ghost", className: "h-9.5" })}
        >
          Clear
        </Link>
      </div>
    </Form>
  );
}
