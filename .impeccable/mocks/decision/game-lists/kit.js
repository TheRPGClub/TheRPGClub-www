/* Game Lists, Franchises and Pools: shared mock data and helpers (www#168).
   Covers and key art come from the Steam CDN (library_600x900 / library_hero); a game without art
   uses the Anton fallback from DESIGN.md. Members are invented. Today is Tue 24 Nov 2026. */
const STEAM = (id, k) => `https://cdn.cloudflare.steamstatic.com/steam/apps/${id}/${k}.jpg`;
const G = {};
const game = (k, t, y, id, o = {}) => (G[k] = { k, t, y, cover: id ? STEAM(id, "library_600x900") : null, art: o.art ?? (id ? STEAM(id, "library_hero") : null), ...o });

/* Final Fantasy: mainline */
game("ff1", "Final Fantasy", 1987, 1173770);
game("ff2", "Final Fantasy II", 1988, 1173780);
game("ff3", "Final Fantasy III", 1990, 1173790);
game("ff4", "Final Fantasy IV", 1991, 1173800);
game("ff5", "Final Fantasy V", 1992, 1173810);
game("ff6", "Final Fantasy VI", 1994, 1173820);
game("ff7", "Final Fantasy VII", 1997, 39140);
game("ff8", "Final Fantasy VIII", 1999, 1026680);
game("ff9", "Final Fantasy IX", 2000, 377840);
game("ff10", "Final Fantasy X", 2001, 359870);
game("ff11", "Final Fantasy XI", 2002, null);
game("ff12", "Final Fantasy XII", 2006, 595520);
game("ff13", "Final Fantasy XIII", 2009, 292120);
game("ff14", "Final Fantasy XIV", 2010, 39210);
game("ff15", "Final Fantasy XV", 2016, 637650);
game("ff16", "Final Fantasy XVI", 2023, 2515020);
/* Final Fantasy: other */
game("ff10_2", "Final Fantasy X-2", 2003, null);
game("ff13_2", "Final Fantasy XIII-2", 2011, null);
game("lr", "Lightning Returns: Final Fantasy XIII", 2013, null);
game("ff7r", "Final Fantasy VII Remake", 2020, 1462040);
game("ff7rb", "Final Fantasy VII Rebirth", 2024, 2909400);
game("cc", "Crisis Core: Final Fantasy VII Reunion", 2022, 1608070);
game("t0", "Final Fantasy Type-0 HD", 2015, 340170);
game("sop", "Stranger of Paradise: Final Fantasy Origin", 2022, null);
game("wofs", "World of Final Fantasy", 2016, 552700);
game("fft", "Final Fantasy Tactics: The Ivalice Chronicles", 2025, null, { art: STEAM(1004640, "library_hero") });
game("ffmq", "Final Fantasy Mystic Quest", 1992, null);
game("ffbe", "Final Fantasy Brave Exvius", 2015, null, { mobile: 1 });
game("ffrk", "Final Fantasy Record Keeper", 2014, null, { mobile: 1 });
game("mobius", "Mobius Final Fantasy", 2015, null, { mobile: 1 });
game("theatr", "Theatrhythm Final Bar Line", 2023, null);
/* Final Fantasy: add-ons (parent_igdb_id set) */
game("ff16_eotf", "Echoes of the Fallen", 2023, null, { parent: "ff16" });
game("ff16_trt", "The Rising Tide", 2024, null, { parent: "ff16" });
game("ff15_glad", "Episode Gladiolus", 2017, null, { parent: "ff15" });
game("ff15_prom", "Episode Prompto", 2017, null, { parent: "ff15" });
game("ff15_ign", "Episode Ignis", 2017, null, { parent: "ff15" });
game("ff7r_int", "Episode INTERmission", 2021, null, { parent: "ff7r" });
game("ff14_dt", "Dawntrail", 2024, null, { parent: "ff14" });
game("ff14_ew", "Endwalker", 2021, null, { parent: "ff14" });

/* Soulslike */
game("nioh", "Nioh", 2017, 485510);
game("nioh2", "Nioh 2", 2020, 1325200);
game("wolong", "Wo Long: Fallen Dynasty", 2023, 1448440);
game("wuchang", "Wuchang: Fallen Feathers", 2025, 2277560);
game("wukong", "Black Myth: Wukong", 2024, 2358720);
game("liesofp", "Lies of P", 2023, 1627720);
game("elden", "Elden Ring", 2022, 1245620);

/* Top 10 and friends */
game("ct", "Chrono Trigger", 1995, 613830);
game("p5r", "Persona 5 Royal", 2020, 1687950);
game("disco", "Disco Elysium", 2019, 632470);
game("bg3", "Baldur's Gate 3", 2023, 1086940);
game("outer", "Outer Wilds", 2019, 753640);
game("dq11", "Dragon Quest XI S", 2019, 1295510);
game("metaphor", "Metaphor: ReFantazio", 2024, 2679460);
game("hades", "Hades", 2020, 1145360);
game("yakuza0", "Yakuza 0", 2017, 638970);
game("octo", "Octopath Traveler", 2018, 921570);

/* Members (invented). The viewer is Mara. */
const M = {
  mara: { n: "Mara", c: "#e8a38a", role: "Regular" },
  rowan: { n: "Rowan", c: "#8fb4ff", role: "Regular" },
  grind: { n: "Grindlord", c: "#c9a6ff", role: "Member" },
  jun: { n: "Jun", c: "#8fe0a6", role: "Moderator" },
  tavi: { n: "Tavi", c: "#ffd38a", role: "Member" },
  owl: { n: "Night Owl", c: "#a3d6ff", role: "Member" },
  mog: { n: "Mog Whisperer", c: "#ffb3d1", role: "Regular" },
  dice: { n: "Dice Goblin", c: "#d4e38a", role: "Member" },
  save: { n: "Save Scummer", c: "#b0e0d4", role: "Member" },
  loot: { n: "Loot Hoarder", c: "#e0c0a0", role: "Admin" },
};

/* The lists */
const LISTS = {
  top10: { id: 12, name: "Top 10 of all time", owner: "mara", vis: "members", sort: "ranked", updated: "2 days ago",
    desc: "The ten I'd hand anyone who asks. Rebuilt every New Year's Eve and argued about every time.",
    games: [
      ["ct", "Still the cleanest RPG ever made. Twenty hours, no filler, thirteen endings."],
      ["ff6", "The opera house, Kefka, the world of ruin. Everything after copies a piece of it."],
      ["p5r", "The calendar is the game. I've never cared about a school timetable more."],
      ["disco", "A detective story where the best fights are with yourself."],
      ["bg3", "Every problem has four answers and the fifth one is a bear."],
      ["elden", "The moment you leave the first cave and see the Erdtree."],
      ["outer", "Go in blind. That's the whole note."],
      ["dq11", ""],
      ["metaphor", "Atlus finally made the fantasy one. The art direction alone."],
      ["hades", "One more run. One more run. It's 3am."],
    ] },
  souls: { id: 31, name: "Soulslike, but make it history", owner: "grind", vis: "members", sort: "added", updated: "today",
    desc: "Soulslikes set in real history and myth. Team Ninja's three, then the Chinese wave, plus the one that's Pinocchio.",
    games: [
      ["nioh", "Start here. Learn ki pulse or suffer.", "3 Feb"], ["nioh2", "Better than 1 in every way. The yokai abilities carry.", "3 Feb"],
      ["wolong", "Deflect is the whole game. Easiest of the three.", "4 Feb"], ["wukong", "Boss rush with the best art in the genre.", "20 Aug"],
      ["liesofp", "Not history, but the Belle Epoque counts.", "9 Sep"], ["wuchang", "Added for the Challenge. Ming dynasty, plague, feathers.", "today"],
    ] },
  jrpg: { id: 18, name: "JRPGs to play", owner: "rowan", vis: "members", sort: "alphabetical", updated: "1 week ago", count: 23, desc: "The backlog of the backlog.", games: [["dq11"], ["octo"], ["ff12"], ["metaphor"], ["p5r"], ["ff9"]] },
  gen7: { id: 7, name: "Best of the 7th generation", owner: "jun", vis: "members", sort: "ranked", updated: "3 weeks ago", count: 15, desc: "PS3, 360 and Wii. 2005 to 2013.", games: [["ff13"], ["yakuza0"], ["ff12"], ["dq11"]] },
  canon: { id: 1, name: "Club Canon: Start Here", owner: null, vis: "members", sort: "ranked", updated: "1 month ago", count: 20, desc: "The twenty games the club keeps coming back to. Kept by the Moderators.", games: [["ct"], ["ff6"], ["p5r"], ["ff7"], ["dq11"], ["ff10"], ["disco"], ["ff9"]] },
  gotm25: { id: 2, name: "Every GOTM winner of 2025", owner: null, vis: "members", sort: "added", updated: "1 month ago", count: 12, desc: "One a month, in the order they won.", games: [["metaphor"], ["ff16"], ["liesofp"], ["octo"], ["ff7rb"], ["bg3"]] },
  cozy: { id: 40, name: "Cozy for the winter", owner: "mara", vis: "private", sort: "added", updated: "5 days ago", count: 4, desc: "", games: [["dq11"], ["octo"], ["hades"], ["ff9"]] },
  ffmain: { id: 41, name: "Final Fantasy, the numbered ones", owner: "mara", vis: "members", sort: "ranked", updated: "2 weeks ago", count: 16, desc: "", games: [["ff6"], ["ff9"], ["ff10"], ["ff7"]] },
};

/* Fall of Final Fantasy (Pool, hosted by Rowan) */
const FOFF = {
  name: ["Fall of", "Final Fantasy"], host: "rowan", season: "Season 2026 · 22 Sep – 20 Dec", daysLeft: 26, runs: 9, finished: 1,
  core: ["ff1", "ff2", "ff3", "ff4", "ff5", "ff6", "ff7", "ff8", "ff9", "ff10", "ff12", "ff13", "ff15", "ff16"],
  optional: ["ff7r", "ff7rb", "cc", "t0", "sop", "wofs", "ff10_2", "ff13_2", "lr", "fft", "ffmq", "theatr"],
  newOpt: ["fft", "theatr"], target: 2, excluded: ["ff11", "ff14", "ffbe", "ffrk", "mobius"],
};

/* ---------------- helpers ---------------- */
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const ic = (n, cls = "") => `<i data-lucide="${n}" class="${cls}"></i>`;
const av = (k, s = 28) => { const m = M[k]; if (!k) return `<span class="av club" style="--s:${s}px">R</span>`; return `<span class="av" style="--s:${s}px;--c:${m.c}" title="${m.n}">${m.n.split(" ").map((w) => w[0]).join("").slice(0, 2)}</span>`; };
const who = (k) => (k ? M[k].n : "The club");
/* cover(key, width px, {cls, tag, tr, fs}) */
const cover = (k, w = 80, o = {}) => {
  const g = G[k];
  const inner = g.cover ? `<img src="${g.cover}" alt="" loading="lazy">` : `<span class="fb" style="font-size:${o.fs ?? Math.max(9, Math.round(w / 7))}px">${esc(g.t)}</span>`;
  return `<span class="cv ${o.cls || ""}" style="width:${w}px" title="${esc(g.t)}">${inner}${o.tag ? `<span class="tg">${o.tag}</span>` : ""}${o.tr ? `<span class="tr">${o.tr}</span>` : ""}</span>`;
};
const artBg = (k) => (G[k].art ? `<div class="art" style="background-image:url('${G[k].art}')"></div>` : "");
/* two-line headline: break at the colon, else before the last word */
const two = (t) => { const i = t.indexOf(":"); if (i > 0) return [t.slice(0, i + 1), t.slice(i + 1).trim()]; const w = t.split(" "); if (w.length === 1) return ["", t]; return [w.slice(0, -1).join(" "), w[w.length - 1]]; };

/* app shell. active = sidebar row to light up: "lists" | "games" | "challenges" | "members" */
const SIDE_PINNED = [["vote", "Voting"], ["gamepad-2", "Games"], ["users", "Members"], ["newspaper", "News"]];
const sidebar = (active) => {
  const pin = SIDE_PINNED.map(([i, n]) => `<div class="nv ${active === n.toLowerCase() ? "on" : ""}">${ic(i)}${n}</div>`).join("");
  const grp = (i, n, cur) => `<div class="nv ${cur ? "mark" : ""}">${ic(i)}${n}${cur ? `<span class="cur">${cur}</span>` : ""}${ic("chevron-right", "chev")}</div>`;
  const curGames = { lists: "Lists", franchises: "Franchises" }[active];
  const curPlay = active === "challenges" ? "Challenges" : null;
  return `<aside class="side"><div class="wm"><i></i><span>The <b>RPG</b> Club</span></div>
  <div class="nv">${ic("house")}Dashboard</div><div class="gh">Pinned</div>${pin}
  ${active === "lists-pinned" ? `<div class="nv on">${ic("list-ordered")}Lists<span class="pv">Preview</span></div>` : ""}
  <div class="gh">Browse</div>${grp("dices", "Play", curPlay)}${grp("library-big", "Games", curGames)}${grp("messages-square", "Club", active === "members" ? null : null)}${grp("shield", "Staff")}
  <div class="foot">${av("mara", 32)}<div><b>Mara</b><small>@mara</small></div></div></aside>`;
};
const desk = (body, active = "lists", o = {}) => `<div class="app shell" style="${o.h ? `min-height:${o.h}px` : ""}">${sidebar(active)}<main class="main">${body}</main></div>`;
const phone = (body, tab = "games", o = {}) => {
  const t = (i, n, k) => `<span class="${tab === k ? "on" : ""}">${ic(i)}${n}</span>`;
  return `<div class="app pshell" style="${o.h ? `min-height:${o.h}px` : ""}"><main class="pmain">${body}</main><nav class="ptab">${t("house", "Home", "home")}${t("dices", "Play", "play")}<span class="burst"><i>Vote</i></span>${t("library-big", "Games", "games")}${t("messages-square", "Club", "club")}<span>${av("mara", 22)}You</span></nav></div>`;
};

/* gallery builders */
const frame = (cap, html, kind = "") => `<div><span class="cap">${cap}</span><div class="fr ${kind}"><div class="z">${html}</div></div></div>`;
/* option({code, title, idea, desk:[cap, html], phone:[cap, html], more:[[cap, html, kind]...], notes:[...]}) */
const option = (o) => `<article class="opt" id="o${o.code.toLowerCase()}">
  <div class="opt-h"><span class="code">${o.code}</span><h3>${o.title}</h3></div>
  <p class="idea">${o.idea}</p>
  <div class="views ${o.phone ? "" : "solo"}">${o.desk ? frame(o.desk[0], o.desk[1]) : ""}${o.phone ? frame(o.phone[0], o.phone[1], "ph") : ""}</div>
  ${o.more && o.more.length ? `<div class="states">${o.more.map(([c, h, k]) => frame(c, h, k || "")).join("")}</div>` : ""}
  ${o.notes ? `<ul class="notes">${o.notes.map((n) => `<li>${n}</li>`).join("")}</ul>` : ""}
</article>`;
const surface = (s) => `<section class="surf" id="${s.id}"><h2>${s.title}<small>${s.sub || ""}</small></h2>${s.brief ? `<p class="brief">${s.brief}</p>` : ""}${s.options.map(option).join("")}</section>`;
/* page({title, lede, keys:[[k,v]], surfaces:[...]}) renders into document.body */
const page = (p) => {
  const jump = p.surfaces.flatMap((s) => s.options.map((o) => `<a href="#o${o.code.toLowerCase()}"><b>${o.code}</b>${o.short || ""}</a>`)).join("");
  document.body.innerHTML = `<div class="gx"><a class="gx-back" href="index.html">${ic("arrow-left")} Game Lists options</a><h1>${p.title}</h1><p class="lede">${p.lede}</p>
  ${p.keys ? `<div class="gx-keys">${p.keys.map(([k, v]) => `<span>${k} <b>${v}</b></span>`).join("")}</div>` : ""}
  <nav class="jump">${jump}</nav>${p.surfaces.map(surface).join("")}</div>`;
  fit();
  if (window.lucide) lucide.createIcons({ attrs: { "stroke-width": 2 } });
};
function fit() { document.querySelectorAll(".fr").forEach((f) => { const z = f.querySelector(".z"); if (!z) return; const w = f.classList.contains("ph") ? 390 : 1280; f.style.setProperty("--z", (f.clientWidth / w).toFixed(4)); }); }
window.addEventListener("resize", fit);
