
import type { MemberEditData } from "@/lib/member-edit";
import type { ManagedList } from "@/lib/members/managed-lists";
import { SocialsEditor } from "@/components/socials-editor";
import { LinkedAccountsEditor } from "@/components/member/linked-accounts-editor";
import { PageHeader } from "@/components/templates/page-header";
import { EditSections, type EditSection } from "@/components/member/edit/edit-sections";

// The profile edit page: its header, then the member's socials and (where the
// hub is open to them) their Linked Accounts behind the section switcher, with
// links to the Imports and to each list's own page, where the lists are
// managed (spec api#451).
export function MemberEditView({
  data,
  linked,
  lists,
  importsHref,
}: {
  data: MemberEditData;
  // Whether the Linked Accounts section shows (the hub's flag).
  linked: boolean;
  // The list pages the "Manage your lists" row links to.
  lists: ManagedList[];
  // Null when there's nothing to import.
  importsHref: string | null;
}) {
  const { user } = data;
  const displayName = user.global_name ?? user.username ?? user.user_id;

  const sections: EditSection[] = [
    {
      id: "socials",
      label: "Socials",
      count: user.socials?.length ?? 0,
      content: (
        <SocialsEditor
          userId={user.user_id}
          socials={user.socials ?? []}
          platforms={data.socialPlatforms}
        />
      ),
    },
  ];
  if (linked) {
    sections.push({
      // www-03's "link an account" CTA lands on /edit#linked-accounts.
      id: "linked-accounts",
      label: "Linked Accounts",
      count: data.linkedAccounts?.length ?? 0,
      content: (
        <LinkedAccountsEditor
          userId={user.user_id}
          accounts={data.linkedAccounts}
          socials={user.socials ?? []}
          totals={data.providerTotals}
        />
      ),
    });
  }

  return (
    <div className="space-y-7">
      <PageHeader
        back={{ href: `/members/${user.user_id}`, label: displayName }}
        title="Edit profile"
        count={displayName}
      />
      <EditSections sections={sections} importsHref={importsHref} lists={lists} />
    </div>
  );
}
