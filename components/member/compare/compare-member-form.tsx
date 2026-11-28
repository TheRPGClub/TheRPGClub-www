import Form from "next/form";
import type { CompareFilters } from "@/lib/completions-compare";
import type { CompareMemberOption } from "@/lib/members/compare-page";
import { MemberSelect } from "@/components/issue/member-field";
import { Button } from "@/components/ui/button";

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
    <Form action={action} data-slot="compare-form" className="flex flex-wrap items-end gap-2.5">
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
