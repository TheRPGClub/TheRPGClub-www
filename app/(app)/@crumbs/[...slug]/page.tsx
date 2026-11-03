import { apiFetch } from "@/lib/api";
import { setDetailPath } from "@/lib/member-achievements";
import { roundEditHref, TRACK_NAME, trackFromSlug } from "@/lib/rounds";
import { STAFF_SECTIONS } from "@/lib/staff";
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
  achievements: "Achievements",
  members: "Members",
  voting: "Voting",
  giveaways: "Giveaways",
  admin: "Staff desk",
  suggestions: "Suggestion Board",
  journals: "Game Journals",
};

// /admin tool pages, labelled as the desk names them. Sections that live
// elsewhere (versions on the game page) or on another section's page (a
// #hash) have no page of their own.
const ADMIN_PAGES: Record<string, string> = Object.fromEntries(
  STAFF_SECTIONS.filter(
    (s) => s.href.startsWith("/admin/") && !s.href.includes("#"),
  ).map((s) => [s.href.split("/")[2], s.label]),
);

const MEMBER_PAGES: Record<string, string> = {
  "now-playing-games": "Now playing",
  "favorite-games": "Favorites",
  "completed-games": "Completed",
  "backlogged-games": "Backlog",
  "collected-games": "Collection",
  reviews: "Reviews",
  journal: "Journal",
  achievements: "Achievements",
  edit: "Edit profile",
  imports: "Imports",
};

const GIVEAWAY_PAGES: Record<string, string> = {
  donate: "Donate",
  claimed: "Your claimed keys",
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

// An Achievement Set's title, from the set page's own read.
async function achievementSetTitle(setId: string, userId: string): Promise<string> {
  if (!/^\d+$/.test(setId)) return "Set";
  try {
    const res = await apiFetch(setDetailPath(setId, userId), { cache: "no-store" });
    if (!res.ok) return "Set";
    const body = (await res.json()) as { data?: { title?: string | null } };
    return body.data?.title?.trim() || "Set";
  } catch {
    return "Set";
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
      if (page === "achievements" && sub) {
        trail.push({
          label: await achievementSetTitle(sub, id),
          href: `${base}/${page}/${sub}`,
        });
      } else if (sub && MEMBER_SUBPAGES[sub]) {
        trail.push({ label: MEMBER_SUBPAGES[sub], href: `${base}/${page}/${sub}` });
      }
    }
  }

  if (section === "giveaways" && id && GIVEAWAY_PAGES[id]) {
    trail.push({ label: GIVEAWAY_PAGES[id], href: `${root}/${id}` });
  }

  if (section === "suggestions" && id === "new") {
    trail.push({ label: "Suggest something", href: `${root}/new` });
  }

  if (section === "admin" && id && ADMIN_PAGES[id]) {
    trail.push({ label: ADMIN_PAGES[id], href: `${root}/${id}` });
    // A round's edit page: /admin/rounds/<gotm|nr-gotm>/<round>.
    const track = id === "rounds" ? trackFromSlug(page) : null;
    if (track && sub && /^\d+$/.test(sub)) {
      trail.push({ label: `${TRACK_NAME[track]} round ${sub}`, href: roundEditHref(track, Number(sub)) });
    }
    if (id === "live-events" && page === "new") {
      trail.push({ label: "New", href: `${root}/${id}/new` });
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
