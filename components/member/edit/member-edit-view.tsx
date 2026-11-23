
import { EDIT_LISTS, type MemberEditData, type MemberEditShown } from "@/lib/member-edit";
import { SocialsEditor } from "@/components/socials-editor";
import { GameListEditor } from "@/components/member/game-list-editor";
import { LinkedAccountsEditor } from "@/components/member/linked-accounts-editor";
import { PageHeader } from "@/components/templates/page-header";
import { EditSections, type EditSection } from "@/components/member/edit/edit-sections";

// The profile edit page: its header, then one section per list the member is
// shown, their socials and (where the hub is open to them) their Linked
// Accounts, behind the section switcher.
export function MemberEditView({
  data,
  shown,
  igdbBlockedReason,
  importsHref,
}: {
  data: MemberEditData;
  shown: MemberEditShown;
  igdbBlockedReason: string | null;
  // Null when there's nothing to import.
  importsHref: string | null;
}) {
  const { user } = data;
  const displayName = user.global_name ?? user.username ?? user.user_id;

  const sections: EditSection[] = [
    ...EDIT_LISTS.filter((def) => def.shown === null || shown[def.shown]).map((def) => {
      const list = data.lists[def.list];
      return {
        id: def.id,
        label: def.title,
        count: list.total,
        content: (
          <GameListEditor
            userId={user.user_id}
            kind={def.kind}
            title={def.title}
            description={def.description}
            entries={list.data}
            total={list.total}
            platforms={data.platforms}
            igdbBlockedReason={igdbBlockedReason}
          />
        ),
      };
    }),
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
  if (shown.linked) {
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
      <EditSections sections={sections} importsHref={importsHref} />
    </div>
  );
}
