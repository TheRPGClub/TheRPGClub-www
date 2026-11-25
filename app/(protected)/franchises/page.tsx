import type { Metadata } from "next";
import { getSession } from "@/lib/session";
import { isRegularOrStaff } from "@/lib/staff";
import { parseBrowseQuery } from "@/lib/franchises/browse";
import { fetchFranchiseTiles } from "@/lib/franchises/fetch";
import { FranchiseIndex } from "@/components/franchises/index/franchise-index";

// /franchises (spec api#487, www#206): every Franchise in GameDB as a wall
// of box sets. Members-only (the protected layout) and part of GameDB, with
// no Feature of its own. Search (`q`), letter (`letter`), sort (`sort`) and
// page (`page`) live in the URL.

export const metadata: Metadata = { title: "Franchises" };

export default async function FranchisesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [params, session, all] = await Promise.all([
    searchParams,
    getSession(),
    // The whole count for the head: a one-tile read.
    fetchFranchiseTiles({ q: "", letter: null, sort: "az", page: 1 }, 1),
  ]);
  return (
    <FranchiseIndex
      query={parseBrowseQuery(params)}
      total={all?.total ?? null}
      canCreate={isRegularOrStaff(session?.membership)}
    />
  );
}
