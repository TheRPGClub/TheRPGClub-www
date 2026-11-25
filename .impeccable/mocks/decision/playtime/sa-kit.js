/* Shelf actions: shared mock data and helpers for the shelf-actions galleries.
   Covers and key art come from the Steam CDN (library_600x900 / library_hero); a game without art
   uses the Anton fallback from DESIGN.md. Members are invented. Today is Tue 24 Nov 2026. */
const STEAM = (id, k) => `https://cdn.cloudflare.steamstatic.com/steam/apps/${id}/${k}.jpg`;
const G = {};
const game = (k, t, y, id, o = {}) => (G[k] = { k, t, y, cover: id ? STEAM(id, "library_600x900") : null, art: o.art ?? (id ? STEAM(id, "library_hero") : null), ...o });

game("ff6", "Final Fantasy VI", 1994, 1173820);
game("ff7", "Final Fantasy VII", 1997, 39140);
game("ff9", "Final Fantasy IX", 2000, 377840);
game("ff12", "Final Fantasy XII", 2006, 595520);
game("ff16", "Final Fantasy XVI", 2023, 2515020);
game("ff7r", "Final Fantasy VII Remake", 2020, 1462040);
game("ff7rb", "Final Fantasy VII Rebirth", 2024, 2909400);
game("ff6adv", "Final Fantasy VI Advance", 2006, null);
game("ff6snes", "Final Fantasy III (US)", 1994, null);
game("e33", "Clair Obscur: Expedition 33", 2025, 1903340);
game("sos", "Sea of Stars", 2023, 1244090);
game("nioh2", "Nioh 2", 2020, 1325200);
game("wolong", "Wo Long: Fallen Dynasty", 2023, 1448440);
game("wuchang", "Wuchang: Fallen Feathers", 2025, 2277560);
game("wukong", "Black Myth: Wukong", 2024, 2358720);
game("liesofp", "Lies of P", 2023, 1627720);
game("elden", "Elden Ring", 2022, 1245620);
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
game("trails", "Trails in the Sky 1st Chapter", 2025, null);
game("xeno", "Xenoblade Chronicles 3", 2022, null);

/* Members (invented). The viewer is Mara. */
const M = {
  mara: { n: "Mara", c: "#e8a38a" }, rowan: { n: "Rowan", c: "#8fb4ff" }, grind: { n: "Grindlord", c: "#c9a6ff" },
  jun: { n: "Jun", c: "#8fe0a6" }, tavi: { n: "Tavi", c: "#ffd38a" }, owl: { n: "Night Owl", c: "#a3d6ff" },
  mog: { n: "Mog Whisperer", c: "#ffb3d1" }, dice: { n: "Dice Goblin", c: "#d4e38a" }, save: { n: "Save Scummer", c: "#b0e0d4" },
  loot: { n: "Loot Hoarder", c: "#e0c0a0" },
};

/* The five lists, in the profile's order */
const LISTS5 = [
  { k: "np", n: "Now Playing", i: "gamepad-2", route: "now-playing-games" },
  { k: "done", n: "Completed", i: "flag", route: "completed-games" },
  { k: "bl", n: "Backlog", i: "hourglass", route: "backlogged-games" },
  { k: "fav", n: "Favorites", i: "heart", route: "favorite-games" },
  { k: "col", n: "Collection", i: "archive", route: "collected-games" },
];
const COUNTS = { np: 3, done: 141, bl: 24, fav: 10, col: 63 };

/* Mara and Final Fantasy VI: on four lists. EMPTY: on none. */
const FF6 = {
  np: { since: "9 Nov 2026", short: "9 Nov", day: 16, plat: "Switch", note: "Pixel Remaster. Doing the Dragons this time." },
  done: [{ n: 1, type: "Main Story", plat: "SNES", start: "2 Feb 2019", end: "14 Mar 2019", endS: "14 MAR", endY: "2019", hrs: 38, note: "Cried at the opera." }],
  bl: null,
  fav: { rank: 2, of: 10, note: "The opera house." },
  col: { own: "Physical", plat: "Switch" },
};
const EMPTY = { np: null, done: [], bl: null, fav: null, col: null };
const stateLine = (s, k) => ({
  np: s.np && `Since ${s.np.short} · ${s.np.plat}`,
  done: s.done.length && `${s.done.length === 1 ? "Once" : s.done.length + " times"} · last ${s.done[s.done.length - 1].end}`,
  bl: s.bl && "Queued",
  fav: s.fav && `No. ${s.fav.rank} of ${s.fav.of}`,
  col: s.col && `${s.col.own} · ${s.col.plat}`,
})[k];

/* ---------------- helpers ---------------- */
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const ic = (n, cls = "") => `<i data-lucide="${n}" class="${cls}"></i>`;
const av = (k, s = 28, cls = "") => { const m = M[k]; return `<span class="av ${cls}" style="--s:${s}px;--c:${m.c}" title="${m.n}">${m.n.split(" ").map((w) => w[0]).join("").slice(0, 2)}</span>`; };
/* cover(key, width px, {cls, tag, tr, fs}) */
const cover = (k, w = 80, o = {}) => {
  const g = G[k];
  const inner = g.cover ? `<img src="${g.cover}" alt="" loading="lazy">` : `<span class="fb" style="font-size:${o.fs ?? Math.max(9, Math.round(w / 7))}px">${esc(g.t)}</span>`;
  return `<span class="cv ${o.cls || ""}" style="width:${typeof w === "number" ? w + "px" : w}" title="${esc(g.t)}">${inner}${o.tag ? `<span class="tg">${o.tag}</span>` : ""}${o.tr ? `<span class="tr">${o.tr}</span>` : ""}</span>`;
};
const artBg = (k) => (G[k].art ? `<div class="art" style="background-image:url('${G[k].art}')"></div>` : "");
const two = (t) => { const i = t.indexOf(":"); if (i > 0) return [t.slice(0, i + 1), t.slice(i + 1).trim()]; const w = t.split(" "); if (w.length === 1) return ["", t]; return [w.slice(0, -1).join(" "), w[w.length - 1]]; };

/* ---------------- shells ---------------- */
const SIDE_PINNED = [["vote", "Voting"], ["gamepad-2", "Games"], ["users", "Members"], ["newspaper", "News"]];
const sidebar = (active) => {
  const pin = SIDE_PINNED.map(([i, n]) => `<div class="nv ${active === n.toLowerCase() ? "on" : ""}">${ic(i)}${n}</div>`).join("");
  const grp = (i, n, cur) => `<div class="nv ${cur ? "mark" : ""}">${ic(i)}${n}${cur ? `<span class="cur">${cur}</span>` : ""}${ic("chevron-right", "chev")}</div>`;
  return `<aside class="side"><div class="wm"><i></i><span>The <b>RPG</b> Club</span></div>
  <div class="nv">${ic("house")}Dashboard</div><div class="gh">Pinned</div>${pin}
  <div class="gh">Browse</div>${grp("dices", "Play")}${grp("library-big", "Games")}${grp("messages-square", "Club")}${grp("shield", "Staff")}
  <div class="foot">${av("mara", 32)}<div><b>Mara</b><small>@mara</small></div></div></aside>`;
};
const desk = (body, active = "games", o = {}) => `<div class="app shell" style="${o.h ? `min-height:${o.h}px` : ""}">${sidebar(active)}<main class="main">${body}</main></div>`;
const phone = (body, tab = "games", o = {}) => {
  const t = (i, n, k) => `<span class="${tab === k ? "on" : ""}">${ic(i)}${n}</span>`;
  return `<div class="app pshell" style="${o.h ? `min-height:${o.h}px` : ""}"><main class="pmain">${body}</main>${o.dock || ""}<nav class="ptab">${t("house", "Home", "home")}${t("dices", "Play", "play")}<span class="burst"><i>Vote</i></span>${t("library-big", "Games", "games")}${t("messages-square", "Club", "club")}<span class="${tab === "you" ? "on" : ""}">${av("mara", 22)}You</span></nav></div>`;
};
/* a phone with a bottom sheet over a dimmed page; h = visible height */
const PSHEET = (ph, sh, h = 844) => `<div class="stage" style="height:${h}px">${ph}<div class="dimmer"></div><div class="sheet"><div class="grab"></div>${sh}</div></div>`;
/* a page with a dialog over it */
const DLG = (page, dlg, h = 900, top = 70) => `<div class="stage" style="height:${h}px">${page}<div class="dimmer" style="z-index:8"></div><div class="dlgwrap" style="padding-top:${top}px">${dlg}</div></div>`;

/* ---------------- the game page (Final Fantasy VI) ---------------- */
const BLURB = "The Empire has rediscovered magic and means to use it. A half-Esper girl with no memory, a thief, a gambler and a dozen others set out to stop it, until the world itself is broken. The Pixel Remaster keeps the 1994 SNES story with new art and music.";
const baseChips = `<span class="chip">1994</span><span class="chip">RPG</span><span class="chip">Square</span><span class="chip">Switch</span><span class="chip">PC</span>`;
const ttb = `<div class="ttb"><span>Main</span><i style="width:58%"></i><span>31 h</span><span>Extras</span><i style="width:70%"></i><span>38 h</span><span>Complete</span><i style="width:100%"></i><span>55 h</span></div>`;
const blk = (t, body, cls = "", r = "") => `<div class="${cls}"><h4>${t}${r ? `<span class="r">${r}</span>` : ""}</h4>${body}</div>`;
/* o.mine: Mara is on Playing now / Completed by. o.ring: ring her avatar in yellow. o.extra: a fifth block. o.cols */
const plate = (o = {}) => {
  const me = o.ring ? "me" : "";
  const playing = `<div class="avs">${o.mine && !o.notPlaying ? av("mara", 30, me) : ""}${["tavi", "owl"].map((k) => av(k, 30)).join("")}</div><p class="late">${o.mine && !o.notPlaying ? "Mara started 9 Nov" : "Tavi started 20 Nov"}</p>`;
  const completed = `<div class="avs">${["rowan", "jun", "mog", "dice"].map((k) => av(k, 30)).join("")}${o.mine ? av("mara", 30, me) : ""}${["save", "loot", "grind"].map((k) => av(k, 30)).join("")}</div><p class="late">Latest: Rowan, Oct 2026</p>`;
  const threads = `<p class="thr">${ic("message-square")}Final Fantasy VI Pixel Remaster</p><p class="thr">${ic("message-square")}FF6 opera house appreciation</p>`;
  const cols = o.cols || (o.extra ? "1.1fr .85fr .95fr 1fr 1.5fr" : "1.3fr 1fr 1fr 1.3fr");
  return `<div class="plate" style="grid-template-columns:${cols}">${o.extraFirst || ""}${blk("Time to beat", ttb, o.ph ? "full" : "", `<span class="faint">${ic("refresh-cw")}</span>`)}${blk("Playing now", playing)}${blk("Completed by", completed)}${blk("Discord threads", threads, o.ph ? "full" : "")}${o.extra || ""}</div>`;
};
/* hero(o): o.ph phone, o.chips, o.actions (row under the blurb), o.topRight, o.after (absolute bits), o.plate */
const hero = (o = {}) => {
  const ph = o.ph;
  const [l1, l2] = two(G.ff6.t);
  return `<div class="ghero">${artBg("ff6")}
  <div class="top">${ph ? `<span class="pback" style="margin:0;background:rgb(11 11 13/.6);border-radius:2.4px">${ic("arrow-left")}</span>` : `<span class="back">${ic("arrow-left")}Games</span>`}<div class="r">${o.topRight || ""}${ph ? "" : `<span class="btn sm ov">${ic("pencil")}Edit game</span>`}</div></div>
  <div class="blk">${cover("ff6", ph ? 84 : 168)}<div><h1><span>${l1}</span><span>${l2}</span></h1>${ph ? "" : `<div class="chips">${o.chips ?? baseChips}</div><p class="bl">${BLURB} <a>IGDB ↗</a></p>${o.actions || ""}`}</div>
  ${ph ? `<div class="tail"><div class="chips">${o.chips ?? baseChips}</div>${o.actions || ""}</div>` : ""}</div>${plate({ ...o.plate, ph })}${o.after || ""}</div>`;
};
const row3 = (ph, cols) => `<div class="row3" ${cols ? `style="grid-template-columns:${cols}"` : ""}>
  <div><div class="sec"><h2>Releases</h2><span class="r"><span class="lnk">On the Release Calendar</span></span></div><div class="rel"><b>SNES</b><span>JP 2 Apr 1994 · NA 11 Oct 1994</span><b>PC</b><span>WW 23 Feb 2022</span><b>Switch</b><span>WW 19 Apr 2023</span><b>PS4</b><span>WW 19 Apr 2023</span></div></div>
  <div><div class="sec"><h2>Details</h2><span class="r"><span class="lnk">All Details</span></span></div><dl class="facts">
    <dt>Franchise</dt><dd><a>Final Fantasy</a></dd><dt>Series</dt><dd style="color:var(--fg)">Final Fantasy Pixel Remaster</dd>
    <dt>Developer</dt><dd>Square</dd><dt>Genres</dt><dd>Role-playing, Turn-based</dd><dt>Modes</dt><dd>Single player</dd></dl></div>
  ${cols && cols.split(" ").length < 3 ? "" : `<div><div class="sec"><h2>Alternate Versions</h2></div><div class="alt">${cover("ff6adv", 30)}Final Fantasy VI Advance</div><div class="alt">${cover("ff6snes", 30)}Final Fantasy III (US)</div></div>`}
</div>`;
const tailDept = `<div class="ctx"><div class="sec"><h2>Reviews</h2><span class="n lb">6</span></div><div class="empty" style="border-style:solid">The Reviews crew strip, the Game Journal and Achievements follow.</div></div>`;
/* G_DESK(o): hero + o.mid + row3 + o.dept ; o.rail puts a sticky rail beside everything under the hero */
const G_DESK = (o = {}) => {
  const under = (o.mid || "") + row3(0, o.rail ? "1fr 1.2fr" : null) + (o.dept || "") + tailDept;
  const body = hero(o) + (o.rail ? `<div class="wrail"><div class="wmain">${under}</div><aside class="rail">${o.rail}</aside></div>` : under);
  return desk(body, "games", { h: o.h });
};
const G_PH = (o = {}) => phone(hero({ ...o, ph: 1 }) + (o.mid || "") + row3(1) + (o.dept || ""), "games", { h: o.h, dock: o.dock });

/* ---------------- calendar ---------------- */
/* cal({y, m (1-12), sel, span:[a,b], today, max (last pickable day), title, say, foot, cls, style}) */
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const cal = (o) => {
  const y = o.y ?? 2026, m = o.m ?? 11;
  const first = new Date(Date.UTC(y, m - 1, 1));
  const lead = (first.getUTCDay() + 6) % 7; // Monday first
  const dim = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const prevDim = new Date(Date.UTC(y, m - 1, 0)).getUTCDate();
  const cells = [];
  for (let i = lead - 1; i >= 0; i--) cells.push(`<span class="o">${prevDim - i}</span>`);
  for (let d = 1; d <= dim; d++) {
    const c = [];
    if (o.span && d > o.span[0] && d < o.span[1]) c.push("in");
    if (d === o.sel) c.push("sel");
    if (o.other === d) c.push("anc2");
    if (d === o.today) c.push("today");
    if (o.max && d > o.max) c.push("fut");
    if (o.hov === d) c.push("hov");
    cells.push(`<span class="${c.join(" ")}">${d}</span>`);
  }
  let n = 1; while (cells.length % 7) cells.push(`<span class="o">${n++}</span>`);
  return `<div class="pop cal ${o.cls || ""}" style="${o.style || ""}">
    <div class="mh"><div style="flex:1">${o.title ? `<small>${o.title}</small>` : ""}<b>${MONTHS[m - 1]} ${y}</b></div><span class="btn xs ic gh">${ic("chevron-left")}</span><span class="btn xs ic gh ${o.max ? "dis" : ""}">${ic("chevron-right")}</span></div>
    ${o.say ? `<p class="say">${o.say}</p>` : ""}
    <div class="wd">${["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d) => `<span>${d}</span>`).join("")}</div>
    <div class="dd">${cells.join("")}</div>
    <div class="ft">${o.foot ?? `<span class="tl">Today</span><span class="tl">Clear</span>`}</div></div>`;
};

/* ---------------- form helpers ---------------- */
const fld = (v, o = {}) => `<div class="fld ${o.cls || ""}">${o.i ? ic(o.i) : ""}<span class="v">${v}</span>${o.end ? `<span class="end">${ic(o.end)}</span>` : ""}</div>`;
const sel = (v, o = {}) => fld(v, { ...o, end: "chevron-down" });
const dateF = (v, o = {}) => fld(v, { i: "calendar", cls: `date ${o.open ? "open" : ""} ${o.empty ? "empty" : ""} ${o.cls || ""}` });
const lab = (t, opt) => `<span class="flab">${t}${opt ? `<span class="opt">· optional</span>` : ""}</span>`;
const ck = (t, on, small) => `<span class="ck ${on ? "on" : ""}"><span class="bx">${on ? ic("check") : ""}</span><span>${t}${small ? `<small>${small}</small>` : ""}</span></span>`;
const segm = (opts, on, cls = "") => `<span class="seg ${cls}">${opts.map((o, i) => `<span class="${i === on ? "on" : ""}">${o}</span>`).join("")}</span>`;
const TYPES = ["Main Story", "Main Story + Side Content", "Completionist"];
const OWN = ["Digital", "Physical", "Subscription", "Other"];

/* ---------------- gallery builders ---------------- */
const frame = (cap, html, kind = "") => `<div><span class="cap">${cap}</span><div class="fr ${kind}"><div class="z">${html}</div></div></div>`;
/* option({code, title, idea, rec, desk:[cap, html], phone:[cap, html], more:[[cap, html, kind]...], notes:[...]}) */
const option = (o) => `<article class="opt" id="o${o.code.toLowerCase()}">
  <div class="opt-h"><span class="code">${o.code}</span><h3>${o.title}</h3>${o.rec ? `<span class="rec">${ic("thumbs-up")}Recommended</span>` : ""}</div>
  <p class="idea">${o.idea}</p>
  ${o.trade ? `<p class="trade"><b>Trade-offs.</b> ${o.trade}</p>` : ""}
  <div class="views ${o.phone ? "" : "solo"}">${o.desk ? frame(o.desk[0], o.desk[1]) : ""}${o.phone ? frame(o.phone[0], o.phone[1], "ph") : ""}</div>
  ${o.more && o.more.length ? `<div class="states">${o.more.map(([c, h, k]) => frame(c, h, k || "")).join("")}</div>` : ""}
  ${o.notes ? `<ul class="notes">${o.notes.map((n) => `<li>${n}</li>`).join("")}</ul>` : ""}
</article>`;
const surface = (s) => `<section class="surf" id="${s.id}"><h2>${s.title}<small>${s.sub || ""}</small></h2>${s.brief ? `<p class="brief">${s.brief}</p>` : ""}${s.options.map(option).join("")}</section>`;
/* page({title, lede, keys:[[k,v]], surfaces:[...]}) renders into document.body */
const page = (p) => {
  const jump = p.surfaces.flatMap((s) => s.options.map((o) => `<a href="#o${o.code.toLowerCase()}"><b>${o.code}</b>${o.short || ""}</a>`)).join("");
  document.body.innerHTML = `<div class="gx"><a class="gx-back" href="index.html">${ic("arrow-left")} Playtime options</a><h1>${p.title}</h1><p class="lede">${p.lede}</p>
  ${p.keys ? `<div class="gx-keys">${p.keys.map(([k, v]) => `<span>${k} <b>${v}</b></span>`).join("")}</div>` : ""}
  <nav class="jump">${jump}</nav>${p.surfaces.map(surface).join("")}</div>`;
  fit();
  if (window.lucide) lucide.createIcons({ attrs: { "stroke-width": 2 } });
};
function fit() { document.querySelectorAll(".fr").forEach((f) => { const z = f.querySelector(".z"); if (!z) return; const w = f.classList.contains("ph") ? 390 : 1280; f.style.setProperty("--z", (f.clientWidth / w).toFixed(4)); }); }
window.addEventListener("resize", fit);
