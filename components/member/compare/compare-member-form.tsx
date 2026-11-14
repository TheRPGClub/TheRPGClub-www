import Form from "next/form";
import type { CompareFilters } from "@/lib/completions-compare";
import type { CompareMemberOption } from "@/lib/members/compare-page";
import { MemberField, MemberSelect } from "@/components/issue/member-field";
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
