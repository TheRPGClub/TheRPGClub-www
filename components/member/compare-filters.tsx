import Form from "next/form";
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
import { Button, ButtonLink } from "@/components/ui/button";

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
      <MemberSelect
        label={`Compare ${ownerName} with`}
        className="w-full max-w-72"
        name="with"
        defaultValue={filters.with ?? ""}
        items={[
          { value: "", label: "Pick a member…" },
          ...members.map((m) => ({ value: m.user_id, label: m.name })),
        ]}
      />
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
      className="flex flex-wrap items-end gap-2.5 border-t-2 border-foreground pt-3.5"
    >
      {heading && (
        <h2 className="font-headline mr-auto w-full self-center text-[2rem] leading-none lg:w-auto">
          {heading}
        </h2>
      )}
      {filters.with && <input type="hidden" name="with" value={filters.with} />}
      <MemberSelect
        label="Year"
        className="min-w-0 flex-[1_1_8.5rem] lg:w-38 lg:flex-none"
        name="year"
        defaultValue={filters.year ?? ""}
        items={[
          { value: "", label: "Any year" },
          { value: "unknown", label: "No date" },
          ...compareYearOptions().map((y) => ({ value: String(y), label: String(y) })),
        ]}
      />
      <MemberSelect
        label="Platform"
        className="min-w-0 flex-[1_1_8.5rem] lg:w-40 lg:flex-none"
        name="platform"
        defaultValue={filters.platform?.toString() ?? ""}
        items={[
          { value: "", label: "Any platform" },
          ...platforms.map((p) => ({
            value: String(p.platform_id),
            label: p.platform_name,
          })),
        ]}
      />
      <MemberField label="Search" className="min-w-0 flex-[1_1_8.5rem] lg:w-40 lg:flex-none">
        <input
          type="search"
          name="q"
          defaultValue={filters.q}
          placeholder="Game title"
          className={memberControlClass}
        />
      </MemberField>
      <MemberSelect
        label="Sort"
        className="min-w-0 flex-[1_1_8.5rem] lg:w-40 lg:flex-none"
        name="sort"
        defaultValue={filters.sort}
        items={COMPARE_SORTS.map((s) => ({ value: s.value, label: s.label }))}
      />
      <div className="flex gap-1.5">
        <Button type="submit" variant="outline" className="h-9.5">
          Apply
        </Button>
        <ButtonLink
          href={
            filters.with
              ? `${action}?with=${encodeURIComponent(filters.with)}`
              : action
          }
          variant="ghost"
          className="h-9.5"
        >
          Clear
        </ButtonLink>
      </div>
    </Form>
  );
}
