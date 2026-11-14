import { apiFetch } from "@/lib/api";
import type { ApiCollection, SearchSynonymGroup } from "@/lib/api/types";
import { requireAuth } from "@/lib/session";
import { canUseTier, staffSection } from "@/lib/staff";
import { DeskHeader } from "@/components/templates/desk-header";
import { StaffOnly } from "@/components/staff-only";
import { SynonymsDictionary } from "@/components/admin/synonyms/synonyms-dictionary";

const SECTION = staffSection("synonyms");

// The API's largest page, and a ceiling on how many pages one view reads.
const PER = 500;
const MAX_PAGES = 20;

// Every synonym group with its terms, so the look-up filters as you type.
// Null when the list can't be read.
async function fetchSynonymGroups(): Promise<SearchSynonymGroup[] | null> {
  const groups: SearchSynonymGroup[] = [];
  try {
    for (let page = 1; page <= MAX_PAGES; page++) {
      const res = await apiFetch(
        `/api/v1/search_synonym_groups?include=terms&per=${PER}&page=${page}`,
        { cache: "no-store" },
      );
      if (!res.ok) return null;
      const body = (await res.json()) as ApiCollection<SearchSynonymGroup>;
      groups.push(...body.data);
      if (!body.meta.next) break;
    }
  } catch {
    return null;
  }
  return groups;
}

function plural(n: number, one: string, many: string) {
  return `${n.toLocaleString("en")} ${n === 1 ? one : many}`;
}

export default async function SynonymsPage() {
  const session = await requireAuth();
  if (!canUseTier(session.membership, SECTION.tier)) {
    return <StaffOnly title={SECTION.label} tier={SECTION.tier} />;
  }

  const groups = await fetchSynonymGroups();
  const termCount = groups?.reduce((n, g) => n + g.terms.length, 0) ?? 0;

  return (
    <div>
      <DeskHeader
        title={SECTION.label}
        side={
          groups && (
            <>
              <b>{plural(groups.length, "group", "groups")}</b> · {plural(termCount, "term", "terms")}
              <br />A search for one term finds the rest
            </>
          )
        }
      />
      {groups === null ? (
        <p role="alert" className="mt-5 text-destructive">
          {"Couldn't load the synonyms. Refresh to try again."}
        </p>
      ) : (
        <SynonymsDictionary groups={groups} />
      )}
    </div>
  );
}
