import { apiFetch } from "@/lib/api";
import { RunningHead, type Crumb } from "@/components/issue/running-head";

// The top bar's running head: the current route as a trail, resolved on the
// server so game and member names render with the page rather than popping
// in after it. Runs as a parallel slot beside every page in the app group.
//
// Names come from the same reads the pages make (same URL and options), which
// React memoizes within a request, so the trail costs no extra API calls.

const SECTIONS: Record<string, string> = {
  dashboard: "Dashboard",
  games: "Games",
  gotm: "GOTM history",
  members: "Members",
  voting: "Voting",
};

const MEMBER_PAGES: Record<string, string> = {
  "now-playing-games": "Now playing",
  "favorite-games": "Favorites",
  "completed-games": "Completed",
  "backlogged-games": "Backlog",
  "collected-games": "Collection",
  reviews: "Reviews",
  edit: "Edit profile",
  imports: "Imports",
};

const MEMBER_SUBPAGES: Record<string, string> = {
  compare: "Compare",
  pick: "Pick one",
  csv: "CSV",
  steam: "Steam",
  completionator: "Completionator",
};

async function gameTitle(id: string): Promise<string> {
  try {
    const res = await apiFetch(`/api/v1/games/${id}`, { cache: "no-store" });
    if (!res.ok) return "Game";
    const body = (await res.json()) as { data?: { title?: string } };
    return body.data?.title ?? "Game";
  } catch {
    return "Game";
  }
}

async function memberName(id: string): Promise<string> {
  try {
    const res = await apiFetch(`/api/v1/users/${id}`, { cache: "no-store" });
    if (!res.ok) return "Member";
    const body = (await res.json()) as {
      data?: { global_name?: string | null; username?: string | null };
    };
    return body.data?.global_name ?? body.data?.username ?? "Member";
  } catch {
    return "Member";
  }
}

async function trailFor(slug: string[]): Promise<Crumb[]> {
  const [section, id, page, sub] = slug;
  const root = `/${section}`;
  const trail: Crumb[] = [{ label: SECTIONS[section] ?? section, href: root }];

  if (section === "games" && id) {
    const base = `${root}/${id}`;
    trail.push({ label: await gameTitle(id), href: base });
    if (page === "reviews") {
      trail.push({ label: "Reviews", href: `${base}/reviews` });
      if (sub) trail.push({ label: "Review", href: `${base}/reviews/${sub}` });
    }
  }

  if (section === "members" && id) {
    const base = `${root}/${id}`;
    trail.push({ label: await memberName(id), href: base });
    if (page && MEMBER_PAGES[page]) {
      trail.push({ label: MEMBER_PAGES[page], href: `${base}/${page}` });
      if (sub && MEMBER_SUBPAGES[sub]) {
        trail.push({ label: MEMBER_SUBPAGES[sub], href: `${base}/${page}/${sub}` });
      }
    }
  }

  return trail;
}

export default async function Crumbs({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  return <RunningHead trail={await trailFor(slug)} />;
}
