#!/usr/bin/env python3
"""Generates the Game Lists bot options gallery (game-lists-bot/index.html) for www#168.

Shell and Discord styles come from the Birthdays bot gallery (head.css.html, botav.html).
Covers are real Steam library art; members are invented. Today is Tue 24 Nov 2026.
"""
import html, os, re

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(os.path.dirname(HERE), "index.html")

head = open(os.path.join(HERE, "head.css.html")).read()
head = head.replace("<title>Challenges Bot Options</title>", "<title>Game Lists Bot Options</title>")
head = re.sub(r'<meta name="description" content="[^"]*">',
              '<meta name="description" content="Design options for the Pool wizard, Pool Proposals, their DMs and /list in the club\'s Discord bot.">', head)
BOTAV = open(os.path.join(HERE, "botav.html")).read()

EXTRA_CSS = r"""
/* ---------- game lists additions ---------- */
.d-line{min-height:1.375em}
.m-plain{color:var(--dc-text);overflow-wrap:anywhere}
.cv-thumb img,.cv-thumb .nocov{width:64px;height:85px;border-radius:8px;object-fit:cover;display:block;background:#1e1f22}
.cv-thumb .nocov{display:grid;place-items:center;text-align:center;padding:6px;font:700 10px/1.1 "Noto Sans",sans-serif;color:var(--dc-mute)}
.g-item img{width:100%;height:100%;object-fit:cover;display:block}
.cv-gallery.n10{grid-template-columns:repeat(5,1fr)}
.cv-gallery.n10 .g-item:first-child{grid-column:auto;aspect-ratio:3/4}
.cv-gallery.n10 .g-item{aspect-ratio:3/4}
.cv-gallery.n6 .g-item{aspect-ratio:3/4}
.cv-gallery.n5 .g-item{aspect-ratio:3/4}
.cv-gallery.n5 .g-item:nth-child(-n+2){aspect-ratio:3/4}
.dm-top{gap:10px}
.dm-top .m-av{margin-right:2px}
.decide{margin:0 0 28px;padding:14px 18px;border:1px solid var(--rule-strong);border-radius:3px;max-width:96ch;color:var(--paper-dim)}
.decide b{color:var(--hl);font:400 1.1rem/1 Anton,Impact,sans-serif;text-transform:uppercase;margin-right:8px;letter-spacing:.01em}
.decide strong{color:var(--paper);font-weight:600}
.intro{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,560px),1fr));gap:0 40px;margin:0 0 36px}
.intro .frame{margin:0}
.opt+.opt{margin-top:24px}
.opts{grid-template-columns:minmax(0,1fr)}
.btn .r-e{font-size:15px}
.sel-box .val{color:var(--dc-text)}
.sel-menu .sopt .o-l b{font-weight:600}
.num{display:inline-block;min-width:1.9em;color:var(--dc-mute);font-weight:600}
.u-msg .m-name{color:var(--av)}
/* generated image, in the club's print style: the Pool shelf */
.ps{background:#0b0b0d;color:var(--paper);padding:14px 14px 12px;font-family:Barlow,sans-serif}
.ps-head{display:flex;justify-content:space-between;align-items:flex-end;border-bottom:2px solid var(--paper);padding-bottom:6px;margin-bottom:10px}
.ps-name{font:400 26px/.9 Anton,Impact,sans-serif;text-transform:uppercase}
.ps-name span{color:#9ab8f2}
.ps-rule{font:700 11px/1.2 "Barlow Condensed",sans-serif;text-transform:uppercase;letter-spacing:.08em;color:var(--paper-dim);text-align:right}
.ps-rule b{color:var(--paper);font-weight:700}
.ps-lab{display:flex;align-items:baseline;gap:8px;font:400 16px/1 Anton,Impact,sans-serif;text-transform:uppercase;margin:8px 0 6px}
.ps-lab small{font:700 10px/1 "Barlow Condensed",sans-serif;letter-spacing:.08em;color:var(--paper-mute)}
.ps-row{display:grid;grid-template-columns:repeat(14,1fr);gap:3px}
.ps-row.opt{grid-template-columns:repeat(12,1fr)}
.ps-c{position:relative;aspect-ratio:3/4;border-radius:2px;overflow:hidden;background:#1d1d22;box-shadow:inset 0 0 0 1px rgba(244,244,240,.12)}
.ps-c img{width:100%;height:100%;object-fit:cover;display:block}
.ps-c .t{position:absolute;inset:0;display:grid;place-items:center;text-align:center;padding:2px;font:400 7px/1 Anton,Impact,sans-serif;text-transform:uppercase;color:var(--paper-mute)}
.ps-c .nw{position:absolute;left:2px;bottom:2px;background:var(--paper);color:#0b0b0d;font:800 7px/1 "Barlow Condensed",sans-serif;letter-spacing:.05em;text-transform:uppercase;padding:2px 3px 1px;border-radius:1px}
.ps-c.cl{box-shadow:0 0 0 2px #9ab8f2}
.ps-foot{margin-top:9px;font:700 10px/1.2 "Barlow Condensed",sans-serif;letter-spacing:.07em;text-transform:uppercase;color:var(--paper-mute)}
"""

# ---------- data ----------
STEAM = "https://cdn.cloudflare.steamstatic.com/steam/apps/{}/library_600x900.jpg"
G = {
    "ff1": ("Final Fantasy", 1987, 1173770), "ff2": ("Final Fantasy II", 1988, 1173780), "ff3": ("Final Fantasy III", 1990, 1173790),
    "ff4": ("Final Fantasy IV", 1991, 1173800), "ff5": ("Final Fantasy V", 1992, 1173810), "ff6": ("Final Fantasy VI", 1994, 1173820),
    "ff7": ("Final Fantasy VII", 1997, 39140), "ff8": ("Final Fantasy VIII", 1999, 1026680), "ff9": ("Final Fantasy IX", 2000, 377840),
    "ff10": ("Final Fantasy X", 2001, 359870), "ff11": ("Final Fantasy XI", 2002, None), "ff12": ("Final Fantasy XII", 2006, 595520),
    "ff13": ("Final Fantasy XIII", 2009, 292120), "ff14": ("Final Fantasy XIV", 2010, 39210), "ff15": ("Final Fantasy XV", 2016, 637650),
    "ff16": ("Final Fantasy XVI", 2023, 2515020),
    "ff10_2": ("Final Fantasy X-2", 2003, None), "ff13_2": ("Final Fantasy XIII-2", 2011, None), "lr": ("Lightning Returns: Final Fantasy XIII", 2013, None),
    "ff7r": ("Final Fantasy VII Remake", 2020, 1462040), "ff7rb": ("Final Fantasy VII Rebirth", 2024, 2909400),
    "cc": ("Crisis Core: Final Fantasy VII Reunion", 2022, 1608070), "t0": ("Final Fantasy Type-0 HD", 2015, 340170),
    "sop": ("Stranger of Paradise: Final Fantasy Origin", 2022, None), "wofs": ("World of Final Fantasy", 2016, 552700),
    "fft": ("Final Fantasy Tactics: The Ivalice Chronicles", 2025, None), "ffmq": ("Final Fantasy Mystic Quest", 1992, None),
    "theatr": ("Theatrhythm Final Bar Line", 2023, None), "ffbe": ("Final Fantasy Brave Exvius", 2015, None),
    "ffrk": ("Final Fantasy Record Keeper", 2014, None), "mobius": ("Mobius Final Fantasy", 2015, None),
    "dissidia": ("Dissidia Final Fantasy NT", 2018, None), "ffcc": ("Final Fantasy Crystal Chronicles Remastered", 2020, None),
    "nioh": ("Nioh", 2017, 485510), "nioh2": ("Nioh 2", 2020, 1325200), "wolong": ("Wo Long: Fallen Dynasty", 2023, 1448440),
    "wuchang": ("Wuchang: Fallen Feathers", 2025, 2277560), "wukong": ("Black Myth: Wukong", 2024, 2358720), "liesofp": ("Lies of P", 2023, 1627720),
    "ronin": ("Rise of the Ronin", 2024, None), "elden": ("Elden Ring", 2022, 1245620),
    "ct": ("Chrono Trigger", 1995, 613830), "p5r": ("Persona 5 Royal", 2020, 1687950), "disco": ("Disco Elysium", 2019, 632470),
    "bg3": ("Baldur's Gate 3", 2023, 1086940), "outer": ("Outer Wilds", 2019, 753640), "dq11": ("Dragon Quest XI S", 2019, 1295510),
    "metaphor": ("Metaphor: ReFantazio", 2024, 2679460), "hades": ("Hades", 2020, 1145360), "suik2": ("Suikoden II", 1998, None),
}
CORE = ["ff1", "ff2", "ff3", "ff4", "ff5", "ff6", "ff7", "ff8", "ff9", "ff10", "ff12", "ff13", "ff15", "ff16"]
OPTIONAL = ["ff7r", "ff7rb", "cc", "t0", "sop", "wofs", "ff10_2", "ff13_2", "lr", "fft", "ffmq", "theatr"]
NEW_OPT = {"fft", "theatr"}
LEFT_OUT = ["ff11", "ff14", "ffbe", "ffrk", "mobius"]
CLEARED = {"ff1", "ff4", "ff5", "ff6", "ff7", "ff8", "ff9", "ff10", "ff12", "cc"}  # Mara's Run: 9 Core + 1 Optional

TOP10 = [("ct", "Still the cleanest RPG ever made. Twenty hours, no filler, thirteen endings."),
         ("ff6", "The opera house, Kefka, the world of ruin. Everything after copies a piece of it."),
         ("p5r", "The calendar is the game. I've never cared about a school timetable more."),
         ("disco", "A detective story where the best fights are with yourself."),
         ("bg3", "Every problem has four answers and the fifth one is a bear."),
         ("elden", "The moment you leave the first cave and see the Erdtree."),
         ("outer", "Go in blind. That's the whole note."),
         ("dq11", ""),
         ("metaphor", "Atlus finally made the fantasy one. The art direction alone."),
         ("hades", "One more run. One more run. It's 3am.")]
SOULS = [("nioh", "Start here. Learn ki pulse or suffer.", "3 Feb"), ("nioh2", "Better than 1 in every way. The yokai abilities carry.", "3 Feb"),
         ("wolong", "Deflect is the whole game. Easiest of the three.", "4 Feb"), ("wukong", "Boss rush with the best art in the genre.", "20 Aug"),
         ("liesofp", "Not history, but the Belle Epoque counts.", "9 Sep"), ("wuchang", "Added for the Challenge. Ming dynasty, plague, feathers.", "today")]

M = {"Mara": "#e8a38a", "Rowan": "#8fb4ff", "Grindlord": "#c9a6ff", "Jun": "#8fe0a6", "Tavi": "#ffd38a", "Night Owl": "#a3d6ff"}

CHAN_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M10.9 3.2 9.8 8H6v2h3.3l-.9 4H5v2h3l-1 4.8h2L10 16h4l-1 4.8h2l1-4.8h3.9v-2h-3.4l.9-4H21V8h-3l1.1-4.8h-2L16 8h-4l1.1-4.8h-2.2zM11.4 10h4l-.9 4h-4l.9-4z"/></svg>'
AT_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 1 0 4.5 18.9l-.9-1.8A8 8 0 1 1 20 12v1.5a1.5 1.5 0 0 1-3 0V7h-2v.8A5 5 0 1 0 15.6 15a3.5 3.5 0 0 0 6.4-1.5V12A10 10 0 0 0 12 2zm0 13a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/></svg>'
APP = '<span class="app"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M6.5 11.2 3.3 8l1.1-1.1 2.1 2.1 5.1-5.1 1.1 1.1z" fill="currentColor"/></svg>APP</span>'
EPH = '<div class="m-eph"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5C5.6 5 2 12 2 12s3.6 7 10 7 10-7 10-7-3.6-7-10-7zm0 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8z" fill="currentColor"/></svg>Only you can see this · <a class="d-link" href="#" tabindex="-1">Dismiss message</a></div>'
EXT = '<svg class="b-ext" viewBox="0 0 24 24" aria-hidden="true"><path d="M14 3h7v7h-2V6.4l-8.3 8.3-1.4-1.4L17.6 5H14V3zM5 5h6v2H5v12h12v-6h2v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z" fill="currentColor"/></svg>'
CHEV = '<svg class="chev" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M7 10l5 5 5-5z"/></svg>'

e = html.escape
T = lambda k: G[k][0]


def cover_url(k):
    return STEAM.format(G[k][2]) if G[k][2] else None


class Msg:
    """One bot message; counts Components V2 components and text-display characters."""

    def __init__(self):
        self.comps = 0
        self.chars = 0

    def ctr(self, inner, accent=None):
        self.comps += 1
        style = f' style="--accent:{accent}"' if accent else ""
        return f'<div class="cv-ctr{" acc" if accent else ""}"{style}>{inner}</div>'

    def text(self, *lines):
        self.comps += 1
        body = "".join(lines)
        self.chars += len(html.unescape(re.sub("<[^>]+>", "", body)))
        return f'<div class="cv-text">{body}</div>'

    def sep(self, lg=False):
        self.comps += 1
        return f'<div class="cv-sep div{" lg" if lg else ""}"></div>'

    def row(self, *items):
        self.comps += 1
        return f'<div class="cv-row">{"".join(items)}</div>'

    def btn(self, label, kind="secondary", ext=False, emoji="", disabled=False):
        self.comps += 1
        em = f'<span class="r-e" aria-hidden="true">{emoji}</span>' if emoji else ""
        return f'<span class="btn {kind}{" disabled" if disabled else ""}">{em}<span>{label}</span>{EXT if ext else ""}</span>'

    def section(self, text_html, acc_html):
        self.comps += 1
        return f'<div class="cv-section"><div class="cv-sec-text">{text_html}</div><div class="cv-acc">{acc_html}</div></div>'

    def thumb(self, k):
        self.comps += 1
        u = cover_url(k)
        if u:
            return f'<span class="cv-thumb"><img src="{u}" alt="{e(T(k))} cover" loading="lazy"></span>'
        return f'<span class="cv-thumb"><span class="nocov">{e(T(k))}</span></span>'

    def sect(self, text_html, k):
        """A section with the game's cover as its thumbnail, or the text alone when there's no art."""
        if cover_url(k):
            return self.section(text_html, self.thumb(k))
        return text_html

    def gallery(self, keys, cls=None):
        ks = [k for k in keys if cover_url(k)][:10]
        self.comps += 1 + len(ks)
        items = "".join(f'<div class="g-item"><img src="{cover_url(k)}" alt="{e(T(k))}" loading="lazy"></div>' for k in ks)
        return f'<div class="cv-gallery {cls or "n" + str(len(ks))}">{items}</div>'

    def image(self, inner):
        self.comps += 2
        return f'<div class="cv-gallery n1"><div class="g-item gen">{inner}</div></div>'

    def select(self, placeholder, options=None, value=None, multi=False):
        """A select menu in its own action row; options = [(label, desc, on)] shown open."""
        self.comps += 2
        shown = f'<span class="val">{value}</span>' if value else f'<span class="ph">{placeholder}</span>'
        menu = ""
        if options:
            rows = []
            for lab, desc, on in options:
                chk = f'<span class="chk{" on" if on else ""}"></span>' if multi else ""
                d = f'<span class="o-d">{desc}</span>' if desc else ""
                rows.append(f'<div class="sopt{" on" if (on and not multi) else ""}">{chk}<span class="o-txt"><span class="o-l">{lab}</span>{d}</span></div>')
            menu = f'<div class="sel-menu">{"".join(rows)}</div>'
        return f'<div class="sel{" open" if options else ""}"><div class="sel-box">{shown}{CHEV}</div>{menu}</div>'

    def budget(self, plain=False):
        if plain:
            return f"plain content · {self.chars}/2000 chars"
        warn = self.comps > 40 or self.chars > 4000
        return f"{self.comps}/40 components · {self.chars}/4000 chars" + (" · over" if warn else "")


def mention(name):
    return f'<span class="d-mention">@{e(name)}</span>'


def ln(s, cls="d-line"):
    return f'<div class="{cls}">{s}</div>'


def h2(s):
    return f'<div class="d-h2">{s}</div>'


def h3(s):
    return f'<div class="d-h3">{s}</div>'


def sub(s):
    return f'<div class="d-sub">{s}</div>'


def quote(*lines):
    return f'<div class="d-quote">{"".join(ln(x) for x in lines)}</div>'


def code(s):
    return f'<span class="d-code">{s}</span>'


def chan(s):
    return f'<span class="d-mention chan">{s}</span>'


def link(s):
    return f'<a class="d-link" href="#" tabindex="-1">{s}</a>'


def join(items):
    items = list(items)
    if len(items) == 1:
        return items[0]
    return ", ".join(items[:-1]) + " and " + items[-1]


def message(inner, time="Today at 20:14", ref=None, eph=False, plain=False):
    ref_html = ""
    if ref:
        who, cmd = ref
        ref_html = (f'<div class="m-ref"><span class="spine"></span><span class="ref-av" style="--av:{M[who]};--s:16px" aria-hidden="true">{who[0].upper()}</span>'
                    f'<span class="ref-n">{who}</span> used <span class="ref-cmd">{cmd}</span></div>')
    body = f'<div class="m-plain">{inner}</div>' if plain else f'<div class="m-comps">{inner}</div>'
    return (f'<div class="msg">{ref_html}<div class="m-row">{BOTAV}<div class="m-body">'
            f'<div class="m-head"><span class="m-name">GameDB</span>{APP}<span class="m-time">{time}</span></div>'
            f'{body}{EPH if eph else ""}</div></div></div>')


def frame(what, budget, channel, msgs_html, dm=False):
    icon = AT_ICON if dm else CHAN_ICON
    return (f'<figure class="frame"><figcaption class="frame-cap"><span class="what">{what}</span>'
            f'<span class="budget{" warn" if "over" in budget else ""}">{budget}</span></figcaption>'
            f'<div class="dc"><div class="dc-top">{icon}<span>{channel}</span></div><div class="dc-chat">{msgs_html}</div></div></figure>')


def modal(title, body, submit="Submit"):
    return (f'<div class="modal-wrap"><div class="modal"><div class="mo-head">{BOTAV.replace("bot-av", "bot-av sm")}<span class="mo-t">{title}</span><span class="mo-x">&times;</span></div>'
            f'<div class="mo-body">{body}</div><div class="mo-foot"><span class="btn ghost">Cancel</span><span class="btn primary">{submit}</span></div></div></div>')


def mfield(label, value=None, ph=None, desc=None, req=True, para=False, count=None):
    d = f'<div class="ml-d">{desc}</div>' if desc else ""
    v = f'<div class="ti{" para" if para else ""}">{value}{f"<span class=ti-count>{count}</span>" if count else ""}</div>' if value else f'<div class="ti ph{" para" if para else ""}">{ph}</div>'
    return f'<div><div class="ml-l">{label}{"<span class=req>*</span>" if req else ""}</div>{d}{v}</div>'


def msel(label, value, desc=None, options=None):
    d = f'<div class="ml-d">{desc}</div>' if desc else ""
    menu = ""
    if options:
        menu = '<div class="sel-menu">' + "".join(f'<div class="sopt{" on" if on else ""}"><span class="o-txt"><span class="o-l">{l}</span>{f"<span class=o-d>{dd}</span>" if dd else ""}</span></div>' for l, dd, on in options) + "</div>"
    return f'<div><div class="ml-l">{label}<span class="req">*</span></div>{d}<div class="sel{" open" if options else ""}"><div class="sel-box"><span class="val">{value}</span>{CHEV}</div>{menu}</div></div>'


def typing(cmd, opts_html, pop_head, rows, channel="general"):
    """A command being typed with the autocomplete popup open."""
    r = "".join(f'<div class="ac-row{" on" if on else ""}"><span class="ac-l">{l}</span><span class="ac-d">{d}</span></div>' for l, d, on in rows)
    return (f'<div class="dc"><div class="dc-top">{CHAN_ICON}<span>{channel}</span></div><div class="dc-chat"><div class="ac"><div class="ac-pop"><div class="ac-h">{pop_head}</div>{r}</div>'
            f'<div class="cbar"><span class="cb-cmd">{cmd}</span>{opts_html}</div></div></div></div>')


def cbopt(k, v, focus=False):
    return f'<span class="cb-opt{" focus" if focus else ""}"><span class="k">{k}</span><span class="v">{v}{"<span class=caret></span>" if focus else ""}</span></span>'


def raw_frame(what, budget, inner):
    return f'<figure class="frame"><figcaption class="frame-cap"><span class="what">{what}</span><span class="budget">{budget}</span></figcaption>{inner}</figure>'


def modal_frame(what, budget, inner):
    return raw_frame(what, budget, f'<div class="dc">{inner}</div>')


def opt(code_, title, idea, frames, notes):
    return (f'<article class="opt wide" id="o{code_}"><header class="opt-h"><span class="code">{code_}</span><h3>{e(title)}</h3></header>'
            f'<p class="idea">{idea}</p><div class="frames">{"".join(frames)}</div>'
            f'<ul class="notes">{"".join(f"<li>{n}</li>" for n in notes)}</ul></article>')


def section_html(num, sid, title, brief, opts, intro="", decide=""):
    return (f'<section class="type" id="{sid}"><header class="type-h"><span class="num">{num}</span><h2>{e(title)}</h2></header>'
            f'<p class="type-brief">{brief}</p>{decide}{intro}<div class="opts">{"".join(opts)}</div></section>')


def titles(keys):
    return ", ".join(T(k) for k in keys)


def short(k):
    """Short FF names for dense lines: 'Final Fantasy VII' -> 'VII'."""
    t = T(k)
    if t.startswith("Final Fantasy ") and len(t.split()) == 3:
        return t.split()[2]
    if t == "Final Fantasy":
        return "I"
    return t


WIZ_REF = ("Rowan", "/challenge create")
SOUL_REF = ("Grindlord", "/challenge create")

# =====================================================================
# 1 · /challenge Pool wizard
# =====================================================================
INTRO1 = '<div class="intro">' + raw_frame(
    "Typing the command · the new from-list option", "autocomplete over your own Game Lists, 25 max",
    typing("/challenge create", cbopt("format", "Pool") + cbopt("from-list", "soul", True), "FROM-LIST · YOUR GAME LISTS",
           [("Soulslike, but make it history", "6 games · Members", True), ("Souls I bounced off", "3 games · Private", False)],
           channel="challenges")) + raw_frame(
    "The Pool's sources: Series, never Collection", "select option labels, 100 chars max",
    f'<div class="dc"><div class="dc-top">{CHAN_ICON}<span>challenges</span></div><div class="dc-chat" style="padding:16px">'
    + Msg().select("Franchises and Series", [("Final Fantasy", "Franchise · 31 games, 14 Mainline", True), ("Final Fantasy (main series)", "Series · 16 games", False),
                        ("Final Fantasy VII Compilation", "Series · 9 games", False), ("Ivalice Alliance", "Series · 5 games", False)], multi=True)
    + '</div></div>') + '</div>'


def target_line(core, tgt):
    return f"Clear <strong>every Core Game</strong> ({core}) and <strong>{tgt} Optional Games</strong>"


# ---- 1A: the current wizard, with Core and Optional as two lines and two selects ----
def w1a_preview():
    m = Msg()
    head = m.text(h2("Preview: Fall of Final Fantasy"), sub(f"Pool · {target_line(14, 2)} · Seasonal, 22 Sep to 20 Dec"))
    gal = m.gallery(CORE, "n10")
    body = m.text(ln(f"<strong>Core Games (14)</strong> {titles(CORE).replace('Final Fantasy ', '')}".replace("<strong>Core Games (14)</strong> Final Fantasy,", "<strong>Core Games (14)</strong> Final Fantasy I,")),
                  ln(f"<strong>Optional Games (12)</strong> from the Final Fantasy Franchise, plus {T('ffmq')} added by hand"),
                  sub(f"Left out: {titles(LEFT_OUT)}"),
                  sub("Add-ons never come in from a Franchise. Add one by hand if you want it."))
    ctr = m.ctr(head + gal + body)
    s1 = m.select("Core Games: untick to make one Optional", value="Core Games (14 of 26 ticked)")
    s2 = m.select("Leave games out")
    r = m.row(m.btn("Create Challenge", "success"), m.btn("Optional target: 2"), m.btn("Include a game"), m.btn("Back"), m.btn("Cancel"))
    return m, message(ctr + s1 + s2 + r, ref=WIZ_REF, eph=True)


def w1a_core_open():
    m = Msg()
    ctr = m.ctr(m.text(h3("Which games must every Run Clear?"), sub("Ticked games are Core Games. Unticked ones stay in the Pool as Optional Games. Page 1 of 2.")))
    opts = [(T(k), f"{G[k][1]} · Mainline", k in CORE) for k in ["ff1", "ff2", "ff3", "ff4", "ff5", "ff6", "ff7"]] + \
           [(T("ff7r"), "2020 · from the Franchise", False), (T("cc"), "2022 · from the Franchise", False)]
    s = m.select("Core Games", opts, multi=True)
    return m, message(ctr + s, ref=WIZ_REF, eph=True)


def w1a_target():
    body = (mfield("Optional Games to Clear", "2", desc="On top of every Core Game. 0 means Core Games only. The Pool has 12 Optional Games.")
            + '<div><div class="ml-d" style="margin:0">Runs see the change at once. Raising it DMs members with a Run.</div></div>')
    return modal("Optional target", body, "Save")


def w1a_view():
    m = Msg()
    t = m.text(h2("Fall of Final Fantasy"), sub("Pool · Seasonal · 26 days left · hosted by Rowan"),
               ln(f"<strong>To Finish</strong> {target_line(14, 2)}"),
               ln("<strong>Your Run</strong> Core 9/14 · Optional 1/2"),
               sub("Optional Cleared: Crisis Core: Final Fantasy VII Reunion"))
    return m, message(m.ctr(t) + m.row(m.btn("Pool"), m.btn("Propose a game"), m.btn("Runs")), ref=("Mara", "/challenge view"), time="Today at 21:02")


def w1a_fromlist():
    m = Msg()
    head = m.text(h2("Preview: Soulslike History Tour"), sub(f"Pool · {target_line(6, 0).replace('0 Optional Games', 'no Optional Games')} · Always Open"),
                  ln(f"Made from your Game List <strong>Soulslike, but make it history</strong>. Its 6 games came in as Core Games. Games you add to the list later arrive as Optional Games."))
    gal = m.gallery([k for k, _, _ in SOULS], "n6")
    s = m.select("", value="Core Games (6 of 6 ticked)")
    r = m.row(m.btn("Create Challenge", "success"), m.btn("Optional target: 0"), m.btn("Include a game"), m.btn("Back"), m.btn("Cancel"))
    return m, message(m.ctr(head + gal) + s + r, ref=SOUL_REF, eph=True, time="Today at 19:40")


def opt1a():
    f = []
    m, x = w1a_preview(); f.append(frame("Preview step · Fall of Final Fantasy", m.budget(), "challenges", x))
    m, x = w1a_core_open(); f.append(frame("Core Games select, open (25 per page)", m.budget(), "challenges", x))
    f.append(modal_frame("Optional target button opens a modal", "1 text input", w1a_target()))
    m, x = w1a_fromlist(); f.append(frame("Started from a Game List", m.budget(), "challenges", x))
    m, x = w1a_view(); f.append(frame("/challenge view for a member with a Run", m.budget(), "challenges", x))
    return opt("1A", "Two lines, one tick-box", "The wizard you have today, kept to its two steps. The preview names the <strong>Core Games</strong> and where the <strong>Optional Games</strong> come from in two lines, and one select decides Core: ticked is Core, unticked drops to Optional. The target is a button that opens a one-field modal.", f,
               ["Smallest change to ChallengeWizard.ts: the existing preview grows a Core select and a target button.",
                "Moving a game is one untick or tick. There's no separate Optional list to manage: Optional is whatever the sources bring plus the unticked ones.",
                "A Franchise's Mainline games arrive pre-ticked as Core (spec story 41); a Series brings everything as Optional.",
                "26 games need two pages of 25 in the select, so paging buttons appear, as for Leave games out today."])


# ---- 1B: more steps, one question each ----
def w1b_core():
    m = Msg()
    t = m.text(h3("Fall of Final Fantasy · step 3 of 4: Core Games"),
               ln("Every Run must Clear each Core Game. Only you choose them: sources never add one."),
               ln(f"<strong>Core (14)</strong> {' · '.join(short(k) for k in CORE)}"),
               sub("From the Final Fantasy Franchise's Mainline games. XI and XIV are left out."))
    s1 = m.select("Make Optional", value="Make Optional: pick Core Games to move")
    s2 = m.select("Make Core", value="Make Core: pick Optional Games to move")
    r = m.row(m.btn("Next: Optional Games", "primary"), m.btn("Back"), m.btn("Cancel"))
    return m, message(m.ctr(t) + s1 + s2 + r, ref=WIZ_REF, eph=True)


def w1b_optional():
    m = Msg()
    t = m.text(h3("Fall of Final Fantasy · step 4 of 4: Optional Games"),
               ln(f"<strong>Optional (12)</strong> {' · '.join(T(k).replace('Final Fantasy', 'FF') for k in OPTIONAL)}"),
               sub("New games in the Final Fantasy Franchise join here by themselves. Add-ons never do."))
    tgt = m.text(ln("<strong>Also Clear 2 Optional Games</strong>"), sub("0 means every Core Game and nothing else."))
    r1 = m.row(m.btn("-", disabled=False), m.btn("2", "primary"), m.btn("+"), m.btn("Every Core Game only"))
    s = m.select("Leave games out", value="Left out: Final Fantasy XI, Final Fantasy XIV and 3 more")
    r2 = m.row(m.btn("Preview", "primary"), m.btn("Include a game"), m.btn("Back"), m.btn("Cancel"))
    return m, message(m.ctr(t + m.sep() + tgt) + r1 + s + r2, ref=WIZ_REF, eph=True)


def w1b_move_open():
    m = Msg()
    s = m.select("Make Core: pick Optional Games to move", [(T(k), f"{G[k][1]}", k == "ff7r") for k in OPTIONAL[:6]], multi=True)
    t = m.text(sub("Make Core: the ticked Optional Games become Core Games."))
    return m, message(m.ctr(t) + s, ref=WIZ_REF, eph=True)


def w1b_fromlist():
    m = Msg()
    t = m.text(h3("Soulslike History Tour · step 3 of 4: Core Games"),
               ln("Your list <strong>Soulslike, but make it history</strong> is linked. Its 6 games are Core Games:"),
               quote(*[f"{i + 1}. {T(k)}" for i, (k, _, _) in enumerate(SOULS)]),
               sub("Games you add to the list later arrive as Optional Games, and you can move them to Core."))
    r = m.row(m.btn("Next: Optional Games", "primary"), m.btn("Make some Optional"), m.btn("Unlink the list"), m.btn("Cancel"))
    return m, message(m.ctr(t) + r, ref=SOUL_REF, eph=True, time="Today at 19:40")


def w1b_view():
    m = Msg()
    t = m.text(h2("Fall of Final Fantasy"), sub("Pool · Seasonal · 26 days left"),
               ln("<strong>Your Run</strong>"),
               ln("Core <strong>9/14</strong> &nbsp;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9617;&#9617;&#9617;&#9617;&#9617;"),
               ln("Optional <strong>1/2</strong> &nbsp;&#9608;&#9617;"),
               sub("Still to Clear: II, III, XIII, XV, XVI and 1 Optional Game"))
    return m, message(m.ctr(t, accent="#9ab8f2") + m.row(m.btn("Pool"), m.btn("Propose a game"), m.btn("Runs")), ref=("Mara", "/challenge view"), time="Today at 21:02")


def opt1b():
    f = []
    m, x = w1b_core(); f.append(frame("Step 3 of 4 · Core Games", m.budget(), "challenges", x))
    m, x = w1b_optional(); f.append(frame("Step 4 of 4 · Optional Games and the target", m.budget(), "challenges", x))
    m, x = w1b_move_open(); f.append(frame("Make Core select, open", m.budget(), "challenges", x))
    m, x = w1b_fromlist(); f.append(frame("Step 3 when started from a Game List", m.budget(), "challenges", x))
    m, x = w1b_view(); f.append(frame("/challenge view for a member with a Run", m.budget(), "challenges", x))
    return opt("1B", "One question a step", "The wizard grows to four steps: basics, sources, <strong>Core Games</strong>, then <strong>Optional Games and the target</strong>. Each step lists its games by name and moves them with a <em>Make Optional</em> or <em>Make Core</em> select. The target is a <strong>- 2 +</strong> stepper of buttons, so there's no modal.", f,
               ["Clearest for a first-time Host: each step answers one question, and the words match the website's two columns.",
                "Two more steps to click through, and the cover preview moves to the end (the Preview button) rather than every step.",
                "The view's bars are block characters in text, not an image, so they read in any client and in screen readers as numbers."])


# ---- 1C: the Pool shelf image ----
def shelf(core_keys, opt_keys, clr=frozenset(), name=("Fall of", "Final Fantasy"), rule="Clear every Core Game and 2 Optional Games", foot="Left out: XI, XIV, Brave Exvius, Record Keeper, Mobius · Add-ons stay out"):
    def cell(k, o=False):
        u = cover_url(k)
        inner = f'<img src="{u}" alt="">' if u else f'<span class="t">{e(T(k))}</span>'
        nw = '<span class="nw">New</span>' if k in NEW_OPT else ""
        return f'<span class="ps-c{" cl" if k in clr else ""}">{inner}{nw}</span>'
    return (f'<div class="ps" role="img" aria-label="The Pool: {len(core_keys)} Core Games and {len(opt_keys)} Optional Games">'
            f'<div class="ps-head"><div class="ps-name">{name[0]} <span>{name[1]}</span></div><div class="ps-rule">{rule}</div></div>'
            f'<div class="ps-lab">Core<small>{len(core_keys)} games · every Run Clears all of them</small></div><div class="ps-row" style="grid-template-columns:repeat({max(len(core_keys), 10)},1fr)">{"".join(cell(k) for k in core_keys)}</div>'
            + (f'<div class="ps-lab">Optional<small>{len(opt_keys)} games · Clear any 2</small></div><div class="ps-row opt" style="grid-template-columns:repeat({max(len(opt_keys), 10)},1fr)">{"".join(cell(k, True) for k in opt_keys)}</div>' if opt_keys else "")
            + f'<div class="ps-foot">{foot}</div></div>')


def w1c_preview():
    m = Msg()
    head = m.text(h2("Preview: Fall of Final Fantasy"), sub("Pool · Seasonal, 22 Sep to 20 Dec"))
    img = m.image(shelf(CORE, OPTIONAL))
    s_core = m.section(m.text(ln("<strong>Core Games</strong> 14"), sub("Final Fantasy I to XVI, without XI and XIV")), m.btn("Edit Core"))
    s_opt = m.section(m.text(ln("<strong>Optional Games</strong> 12"), sub("From the Final Fantasy Franchise · 1 added by hand")), m.btn("Edit Optional"))
    s_tgt = m.section(m.text(ln("<strong>Clear 2 Optional Games</strong>"), sub("On top of every Core Game")), m.btn("Change"))
    ctr = m.ctr(head + img + m.sep() + s_core + s_opt + s_tgt)
    r = m.row(m.btn("Create Challenge", "success"), m.btn("Sources"), m.btn("Back"), m.btn("Cancel"))
    return m, message(ctr + r, ref=WIZ_REF, eph=True)


def w1c_edit():
    m = Msg()
    t = m.text(h3("Edit Core Games"), sub("Pick a game, then say where it goes. Page 1 of 2."))
    s = m.select("", value="Final Fantasy XIII")
    r = m.row(m.btn("Keep as Core", "primary"), m.btn("Move to Optional"), m.btn("Leave it out", "danger"), m.btn("Done"))
    r2 = m.row(m.btn("Previous games", disabled=True), m.btn("More games"))
    return m, message(m.ctr(t) + s + r + r2, ref=WIZ_REF, eph=True)


def w1c_target():
    opts = [("0", "Every Core Game only", False), ("1", "", False), ("2", "Every Core Game and 2 Optional Games", True), ("3", "", False), ("Every Optional Game", "All 12", False)]
    return modal("Optional Games to Clear", msel("How many Optional Games must a Run also Clear?", "2", options=opts, desc="Choices stop at the Pool's 12 Optional Games."), "Save")


def w1c_fromlist():
    m = Msg()
    head = m.text(h2("Preview: Soulslike History Tour"), sub("Pool · Always Open · made from your Game List"))
    img = m.image(shelf([k for k, _, _ in SOULS], [], name=("Soulslike", "History Tour"), rule="Clear every Core Game", foot="Linked to Soulslike, but make it history · games you add to it arrive as Optional"))
    s = m.section(m.text(ln("<strong>Linked list</strong> Soulslike, but make it history"), sub("6 games came in as Core Games")), m.btn("Unlink"))
    r = m.row(m.btn("Create Challenge", "success"), m.btn("Edit Core"), m.btn("Back"), m.btn("Cancel"))
    return m, message(m.ctr(head + img + m.sep() + s) + r, ref=SOUL_REF, eph=True, time="Today at 19:40")


def w1c_view():
    m = Msg()
    head = m.text(h2("Fall of Final Fantasy"), sub("Pool · Seasonal · 26 days left"))
    img = m.image(shelf(CORE, OPTIONAL, clr=CLEARED, rule="Mara's Run · Core 9/14 · Optional 1/2", foot="Ringed: Cleared · New: joined the Pool in the last 14 days"))
    return m, message(m.ctr(head + img) + m.row(m.btn("Pool"), m.btn("Propose a game"), m.btn("Runs")), ref=("Mara", "/challenge view"), time="Today at 21:02")


def opt1c():
    f = []
    m, x = w1c_preview(); f.append(frame("Preview step · Fall of Final Fantasy", m.budget(), "challenges", x))
    m, x = w1c_edit(); f.append(frame("Edit Core: one game at a time", m.budget(), "challenges", x))
    f.append(modal_frame("Change opens a modal with a select", "1 select, 25 options max", w1c_target()))
    m, x = w1c_fromlist(); f.append(frame("Started from a Game List", m.budget(), "challenges", x))
    m, x = w1c_view(); f.append(frame("/challenge view, the same image with the Run ringed", m.budget(), "challenges", x))
    return opt("1C", "The Pool shelf", "A generated image in the club's print style shows the Pool as two shelves, <strong>Core</strong> over <strong>Optional</strong>, with every cover. Under it, three lines (Core, Optional, the target) each carry their own Edit button. The same image comes back on <strong>/challenge view</strong> with your Cleared games ringed.", f,
               ["The only option where a member sees all 26 games at once, including the ones without art (they get the Anton title fallback, as on the website).",
                "Needs a new image composer, like ChallengeShelfImage. The media gallery today stops at 10 covers.",
                "Edit Core works one game at a time (pick, then Keep / Move / Leave out), which is slower for big moves but can't go wrong."])


s1 = section_html(
    1, "s1", "/challenge Pool wizard",
    "Creating or editing a Pool now means choosing the <strong>Core Games</strong> every Run must Clear, the <strong>Optional Games</strong> the sources bring, and how many Optional Games a Run also Clears (0 by default). A Host can start from one of their <strong>Game Lists</strong>; its games come in as Core. Sources are a Franchise or a <strong>Series</strong>, and the word Collection goes away. Each option shows the Fall of Final Fantasy preview, a select or modal open, the Soulslike Challenge started from Grindlord's list, and the Run line on /challenge view.",
    [opt1a(), opt1b(), opt1c()], intro=INTRO1)

# =====================================================================
# 2 · Pool Proposals and DMs
# =====================================================================
PROPS = [("Tavi", "ffcc", "2 days ago"), ("Jun", "dissidia", "yesterday"), ("Mara", "ff14", "3 hours ago")]
OPTOUT = sub(f"You get these because you have a Run. Turn Challenge DMs off with {code('/challenge dms')}.")


def dm_frame(what, m, x, to="Rowan"):
    return frame(what, m.budget(), f"GameDB · DM to {to}", x, dm=True)


def refusal(m, text_):
    return message(m.ctr(m.text(ln(text_))), ref=("Tavi", "/challenge propose"), eph=True, time="Today at 18:20")


# ---- 2A: rows with buttons ----
def p2a_propose():
    m = Msg()
    ok = message(m.ctr(m.text(ln(f"Proposed <strong>{T('ffcc')}</strong> for <strong>Fall of Final Fantasy</strong>."), sub("Rowan decides. You'll get a DM if it's accepted."))), ref=("Tavi", "/challenge propose"), eph=True, time="Sun at 11:02")
    m2 = Msg()
    no = refusal(m2, f"<strong>{T('fft')}</strong> is already in the Pool as an Optional Game.")
    return m, ok + no, m2


def p2a_inbox():
    m = Msg()
    parts = [m.text(h2("Pool Proposals · Fall of Final Fantasy"), sub("3 waiting · oldest first"))]
    for who, k, when in PROPS:
        extra = " · left out right now" if k == "ff14" else ""
        parts.append(m.sep())
        parts.append(m.text(ln(f"<strong>{T(k)}</strong> ({G[k][1]})"), sub(f"from {mention(who)} · {when}{extra}")))
        parts.append(m.row(m.btn("Accept as Core", "success"), m.btn("Accept as Optional", "primary"), m.btn("Decline", "danger")))
    return m, message(m.ctr("".join(parts)), ref=("Rowan", "/challenge proposals"), eph=True, time="Today at 20:14")


def p2a_also():
    m = Msg()
    t = m.text(ln(f"Accepted <strong>Rise of the Ronin</strong> as an Optional Game."),
               ln("Also add it to your list <strong>Soulslike, but make it history</strong>?"), sub("The list feeds this Challenge, and members who can see the list will see it there."))
    return m, message(m.ctr(t) + m.row(m.btn("Add to the list", "primary"), m.btn("Just the Challenge")), ref=("Grindlord", "/challenge proposals"), eph=True, time="Today at 19:52")


def p2a_dms():
    m1 = Msg()
    a = message(m1.ctr(m1.text(ln(f"{mention('Tavi')} proposed <strong>{T('ffcc')}</strong> for your Challenge <strong>Fall of Final Fantasy</strong>.")))
                + m1.row(m1.btn("See proposals", "primary"), m1.btn("Turn off these DMs")), time="Sun at 11:02")
    m2 = Msg()
    b = message(m2.ctr(m2.text(ln(f"Rowan accepted your proposal: <strong>{T('ffcc')}</strong> is now an Optional Game in <strong>Fall of Final Fantasy</strong>.")))
                + m2.row(m2.btn("Open the Challenge", "link", ext=True)), time="Today at 20:16")
    m3 = Msg()
    c = message(m3.ctr(m3.text(ln("<strong>Your goal in Fall of Final Fantasy changed.</strong> Rowan:"),
                               ln("· made <strong>Final Fantasy VII Remake</strong> a Core Game"),
                               ln("· raised the Optional Games to Clear from 2 to 3"),
                               ln("Your Run: Core 9/15 · Optional 1/3"), OPTOUT))
                + m3.row(m3.btn("Open the Challenge", "link", ext=True)), time="Today at 20:31")
    return (dm_frame("pool_proposal · to the Host", m1, a), dm_frame("pool_proposal_accepted · to the proposer", m2, b, "Tavi"), dm_frame("pool_goal_changed · to each member with a Run", m3, c, "Mara"))


def p2a_dev():
    m = Msg()
    x = message(m.ctr(m.text(ln(f"<strong>Pool Proposal</strong> for the club's Challenge <strong>The Club Canon</strong>: {mention('Tavi')} proposed <strong>{T('suik2')}</strong>."),
                             sub("Any Moderator or above can decide.")))
                + m.row(m.btn("Accept as Core", "success"), m.btn("Accept as Optional", "primary"), m.btn("Decline", "danger"), m.btn("Open", "link", ext=True)), time="Today at 17:45")
    return frame("Club-hosted · posted in #dev, no DM", m.budget(), "dev", x)


def opt2a():
    f = []
    m, x, m2 = p2a_propose(); f.append(frame("/challenge propose · sent, then refused", f"{m.budget()} · refusal {m2.chars} chars", "challenges", x))
    m, x = p2a_inbox(); f.append(frame("/challenge proposals · the Host's inbox", m.budget(), "challenges", x))
    m, x = p2a_also(); f.append(frame("Accepting with a linked list", m.budget(), "challenges", x))
    f.extend(p2a_dms())
    f.append(p2a_dev())
    return opt("2A", "A row per proposal", "The Host's inbox lists every pending <strong>Pool Proposal</strong> as a line with its own three buttons. DMs are one sentence and a button, in the voice of today's Challenge DMs.", f,
               ["Deciding is one click per proposal, with no extra step.",
                "Each proposal costs 6 components (separator, text, row of 3), so a page holds 5. Busy Challenges page with Previous and Next.",
                "The pool_goal_changed DM lists each change on its own line, one DM per save, and ends with the opt-out."])


# ---- 2B: one proposal at a time, as a card ----
def p2b_propose():
    m = Msg()
    t = m.text(ln(f"Proposed <strong>{T('ffcc')}</strong> for <strong>Fall of Final Fantasy</strong>."), sub("It's with Rowan now. 2 other proposals are waiting."))
    ok = message(m.ctr(m.sect(t, "ffcc")), ref=("Tavi", "/challenge propose"), eph=True, time="Sun at 11:02")
    m2 = Msg()
    no = refusal(m2, f"Someone already proposed <strong>{T('dissidia')}</strong>. It's waiting for Rowan.")
    return m, ok + no, m2


def p2b_inbox():
    m = Msg()
    t = m.text(sub("Pool Proposal 3 of 3 · Fall of Final Fantasy"), h2(T("ff14")),
               ln(f"from {mention('Mara')} · 3 hours ago"),
               ln("You left this game out. Accepting puts it back in."),
               sub("Core: every Run must Clear it, and members with a Run get a DM. Optional: it just joins the Pool."))
    sec = m.sect(t, "ff14")
    r1 = m.row(m.btn("Accept as Core", "success"), m.btn("Accept as Optional", "primary"), m.btn("Decline", "danger"))
    r2 = m.row(m.btn("Previous", disabled=False), m.btn("Next", disabled=True), m.btn("Game page", "link", ext=True))
    return m, message(m.ctr(sec, accent="#9ab8f2") + r1 + r2, ref=("Rowan", "/challenge proposals"), eph=True, time="Today at 20:14")


def p2b_also():
    m = Msg()
    t = m.text(ln("<strong>Rise of the Ronin</strong> is now an Optional Game."))
    s = m.section(m.text(ln("Add it to <strong>Soulslike, but make it history</strong> too?"), sub("Your list feeds this Challenge. Members who can see the list will see it there.")), m.btn("Add to list", "primary"))
    return m, message(m.ctr(t + m.sep() + s) + m.row(m.btn("No, keep the list as it is")), ref=("Grindlord", "/challenge proposals"), eph=True, time="Today at 19:52")


def p2b_dms():
    m1 = Msg()
    a = message(m1.ctr(m1.sect(m1.text(h3("New Pool Proposal"), ln(f"{mention('Tavi')} proposed <strong>{T('ffcc')}</strong> for <strong>Fall of Final Fantasy</strong>."), sub("3 proposals are waiting.")), "ffcc"))
                + m1.row(m1.btn("Decide", "primary"), m1.btn("Turn off these DMs")), time="Sun at 11:02")
    m2 = Msg()
    b = message(m2.ctr(m2.sect(m2.text(h3("Proposal accepted"), ln(f"<strong>{T('ffcc')}</strong> is now an Optional Game in Fall of Final Fantasy. Rowan accepted it."), sub("If you have a Run, Clearing it counts.")), "ffcc"))
                + m2.row(m2.btn("Open the Challenge", "link", ext=True)), time="Today at 20:16")
    m3 = Msg()
    c = message(m3.ctr(m3.section(m3.text(h3("Your goal changed"), ln("<strong>Fall of Final Fantasy</strong> now asks for one more Core Game and one more Optional Game."),
                                          quote("New Core Game: <strong>Final Fantasy VII Remake</strong>", "Optional Games to Clear: 2 &rarr; 3"),
                                          ln("Your Run: <strong>Core 9/15 · Optional 1/3</strong>")), m3.thumb("ff7r")) + m3.sep() + OPTOUT_T(m3), accent="#9ab8f2")
                + m3.row(m3.btn("Open the Challenge", "link", ext=True)), time="Today at 20:31")
    return (dm_frame("pool_proposal · to the Host", m1, a), dm_frame("pool_proposal_accepted · to the proposer", m2, b, "Tavi"), dm_frame("pool_goal_changed · to each member with a Run", m3, c, "Mara"))


def OPTOUT_T(m):
    return m.text(sub(f"You get this because you have a Run. Turn Challenge DMs off with {code('/challenge dms')}."))


def p2b_dev():
    m = Msg()
    s = m.sect(m.text(sub("Pool Proposal · club-hosted"), h3(T("suik2")), ln(f"for <strong>The Club Canon</strong>, from {mention('Tavi')}"), sub("Any Moderator or above can decide on the website or with /challenge proposals.")), "suik2")
    x = message(m.ctr(s) + m.row(m.btn("Open the Challenge", "link", ext=True), m.btn("Proposals", "link", ext=True)), time="Today at 17:45")
    return frame("Club-hosted · posted in #dev, no DM", m.budget(), "dev", x)


def opt2b():
    f = []
    m, x, m2 = p2b_propose(); f.append(frame("/challenge propose · sent, then refused", f"{m.budget()} · refusal {m2.chars} chars", "challenges", x))
    m, x = p2b_inbox(); f.append(frame("/challenge proposals · one at a time", m.budget(), "challenges", x))
    m, x = p2b_also(); f.append(frame("Accepting with a linked list", m.budget(), "challenges", x))
    f.extend(p2b_dms())
    f.append(p2b_dev())
    return opt("2B", "One proposal at a time", "Each <strong>Pool Proposal</strong> gets the whole card: its cover, who proposed it, what Core and Optional mean for the Run, and a note when the game was left out. The Host steps through them. DMs carry the game's cover too.", f,
               ["The Host sees what accepting as Core costs members before they click it.",
                "Slower when ten proposals pile up: one card each.",
                "The #dev post links to the Challenge rather than deciding in place, so staff decide where they can see the whole Pool."])


# ---- 2C: triage with a multi-select ----
def p2c_propose():
    m = Msg()
    ok = message(f'<div class="d-line">Proposed <strong>{T("ffcc")}</strong> for Fall of Final Fantasy. Rowan will decide.</div>', ref=("Tavi", "/challenge propose"), eph=True, plain=True, time="Sun at 11:02")
    m.chars = 76
    m2 = Msg()
    no = refusal(m2, f"<strong>{T('fft')}</strong> is already an Optional Game in this Pool, so there's nothing to propose.")
    return m, ok + no, m2


def p2c_inbox():
    m = Msg()
    t = m.text(h3("3 Pool Proposals for Fall of Final Fantasy"), sub("Tick the ones to decide on, then choose what happens to all of them."))
    opts = [(f"{T(k)}", f"from {who} · {when}{' · left out now' if k == 'ff14' else ''}", k != "ff14") for who, k, when in PROPS]
    s = m.select("Pool Proposals to decide on", opts, multi=True)
    r = m.row(m.btn("Accept 2 as Core", "success"), m.btn("Accept 2 as Optional", "primary"), m.btn("Decline 2", "danger"))
    return m, message(m.ctr(t) + s + r, ref=("Rowan", "/challenge proposals"), eph=True, time="Today at 20:14")


def p2c_also():
    m = Msg()
    t = m.text(ln("Accepted <strong>Rise of the Ronin</strong> and <strong>Sekiro</strong> as Optional Games."))
    s = m.select("Also add to Soulslike, but make it history?", [("Add both to the list", "", False), ("Add Rise of the Ronin only", "", False), ("Add Sekiro only", "", False), ("Don't change the list", "", False)])
    return m, message(m.ctr(t) + s, ref=("Grindlord", "/challenge proposals"), eph=True, time="Today at 19:52")


def p2c_dms():
    m1 = Msg()
    a = message(m1.text(ln(f"<strong>Fall of Final Fantasy</strong> · {mention('Tavi')} proposed <strong>{T('ffcc')}</strong>."), sub(f"3 waiting. Decide with {code('/challenge proposals')} or on the website."))
                , time="Sun at 11:02")
    m2 = Msg()
    b = message(m2.text(ln(f"<strong>Fall of Final Fantasy</strong> · your proposal <strong>{T('ffcc')}</strong> was accepted as an Optional Game.")), time="Today at 20:16")
    m3 = Msg()
    c = message(m3.text(ln("<strong>Fall of Final Fantasy</strong> · your goal changed: Core 9/14 &rarr; <strong>9/15</strong> (Final Fantasy VII Remake), Optional 1/2 &rarr; <strong>1/3</strong>."),
                        sub(f"From Rowan's edit at 20:31. Turn Challenge DMs off with {code('/challenge dms')}.")), time="Today at 20:31")
    return (dm_frame("pool_proposal · to the Host", m1, a), dm_frame("pool_proposal_accepted · to the proposer", m2, b, "Tavi"), dm_frame("pool_goal_changed · to each member with a Run", m3, c, "Mara"))


def p2c_dev():
    m = Msg()
    x = message(m.text(ln(f"Pool Proposal · <strong>The Club Canon</strong> (club-hosted) · {mention('Tavi')} proposed <strong>{T('suik2')}</strong> &middot; {link('open the Challenge')}")), time="Today at 17:45")
    return frame("Club-hosted · posted in #dev, no DM", m.budget(), "dev", x)


def opt2c():
    f = []
    m, x, m2 = p2c_propose(); f.append(frame("/challenge propose · sent, then refused", f"plain content · {m.chars}/2000 chars · refusal {m2.chars} chars", "challenges", x))
    m, x = p2c_inbox(); f.append(frame("/challenge proposals · tick, then decide", m.budget(), "challenges", x))
    m, x = p2c_also(); f.append(frame("Accepting several with a linked list", m.budget(), "challenges", x))
    f.extend(p2c_dms())
    f.append(p2c_dev())
    return opt("2C", "Triage in one select", "The inbox is a single tick-box select of every pending <strong>Pool Proposal</strong> (up to 25), and the buttons act on all the ticked ones at once. DMs shrink to one line each with the Challenge's name first, so a DM list scans like a feed.", f,
               ["Fastest for a busy Host or the club's staff: clear ten proposals in two clicks.",
                "The buttons' labels count the ticked ones, so the Host knows what will happen.",
                "Easy to accept a game as Core by accident in a batch; the Core DMs to members would then go out. A confirm step for Core could guard it."])


s2 = section_html(
    2, "s2", "Pool Proposals and DMs",
    "Any member can <strong>propose</strong> a game for a Pool Challenge. A game already in the Pool or already pending is refused; a left-out game can be proposed. The Host (or any Moderator for a club-hosted Challenge) accepts it as Core or Optional, or declines it, and is asked whether to add it to a linked list. Three DMs go out, all respecting the Challenge DM opt-out: <strong>pool_proposal</strong> to the Host, <strong>pool_proposal_accepted</strong> to the proposer, and <strong>pool_goal_changed</strong> to members with a Run when a save adds Core Games or raises the target. Club-hosted proposals post in #dev instead of DMing.",
    [opt2a(), opt2b(), opt2c()])

# =====================================================================
# 3 · /list view and Add to list
# =====================================================================
INTRO3 = '<div class="intro">' + raw_frame(
    "Typing the command · /list view and /list add", "autocomplete, 25 max",
    typing("/list view", cbopt("list", "top", True), "LIST · YOURS FIRST, THEN THE CLUB'S AND MEMBERS'",
           [("Top 10 of all time", "Mara · 10 games · ranked", True), ("Club Canon: Start Here", "The club · 20 games", False),
            ("Every GOTM winner of 2025", "The club · 12 games", False), ("Best of the 7th generation", "Jun · 15 games", False)])) + raw_frame(
    "The game view's details: Series replaces Series / Collection", "existing text display",
    f'<div class="dc"><div class="dc-top">{CHAN_ICON}<span>general</span></div><div class="dc-chat">'
    + message(Msg().text(ln("<strong>Developer:</strong> Square"), ln("<strong>Publisher:</strong> Square Enix"),
                         ln("<strong>Series:</strong> Final Fantasy (main series)"), ln(f"<strong>Franchise:</strong> Final Fantasy · {link('Franchise page')}"),
                         ln("<strong>Game Lists:</strong> in 6 lists")), ref=("Mara", "/gamedb view"), time="Today at 20:40")
    + '</div></div>') + '</div>'

GAMEVIEW_ROW = lambda m, extra: m.row(m.btn("Add to Now Playing List", "primary"), m.btn("View Featured Video"), m.btn("Add to Backlog"), m.btn("Add to Collection"), *extra)


# ---- 3A: numbered text, page of 10 ----
def l3a_view():
    m = Msg()
    head = m.section(m.text(h2("Top 10 of all time"), sub(f"{mention('Mara')}'s Game List · ranked · 10 games · updated 2 days ago"),
                            ln("The ten I'd hand anyone who asks. Rebuilt every New Year's Eve and argued about every time.")), m.thumb("ct"))
    lines = []
    for i, (k, note) in enumerate(TOP10):
        lines.append(ln(f"<span class='num'>{i + 1}.</span><strong>{T(k)}</strong> ({G[k][1]})"))
        if note:
            lines.append(sub(f"&nbsp;&nbsp;&nbsp;&nbsp;{note}"))
    body = m.text(*lines)
    r = m.row(m.btn("Previous", disabled=True), m.btn("Page 1 of 1", disabled=True), m.btn("Next", disabled=True), m.btn("Open on the website", "link", ext=True))
    return m, message(m.ctr(head + m.sep() + body) + r, ref=("Jun", "/list view"), time="Today at 20:40")


def l3a_souls():
    m = Msg()
    head = m.text(h2("Soulslike, but make it history"), sub(f"{mention('Grindlord')}'s Game List · by date added · 6 games · feeds the Challenge Soulslike History Tour"))
    body = m.text(*[ln(f"<strong>{T(k)}</strong> · added {d}") + (sub(note)) for k, note, d in SOULS])
    r = m.row(m.btn("Open on the website", "link", ext=True))
    return m, message(m.ctr(head + m.sep() + body) + r, ref=("Tavi", "/list view"), time="Today at 20:44")


def l3a_add():
    m = Msg()
    g = message(m.ctr(m.text(ln("&hellip; Final Fantasy IX's game view &hellip;"))) + GAMEVIEW_ROW(m, [m.btn("Add to List")]), ref=("Mara", "/gamedb view"), time="Today at 20:50")
    m2 = Msg()
    pick = message(m2.ctr(m2.text(ln("Add <strong>Final Fantasy IX</strong> to which list?"))) + m2.select("Choose one of your lists", [("Top 10 of all time", "10 games · ranked", False), ("Final Fantasy, the numbered ones", "Already has this game", False), ("Cozy for the winter", "4 games · Private", True)]), eph=True, time="Today at 20:50")
    m3 = Msg()
    ok = message(m3.ctr(m3.text(ln("Added <strong>Final Fantasy IX</strong> to <strong>Cozy for the winter</strong>. It's 5th, the newest."), sub("Notes and order live on the website."))) + m3.row(m3.btn("Open the list", "link", ext=True), m3.btn("Undo")), eph=True, time="Today at 20:50")
    return m, g + pick + ok, m2, m3


def l3a_refuse():
    m = Msg()
    a = message(m.ctr(m.text(ln("<strong>Final Fantasy IX</strong> is already in <strong>Final Fantasy, the numbered ones</strong>, at number 2."))), ref=("Mara", "/list add"), eph=True, time="Today at 20:52")
    m2 = Msg()
    b = message(m2.ctr(m2.text(ln("<strong>Every JRPG I own</strong> is full: a Game List holds 500 games."), sub("Remove one on the website first, or start a new list."))), ref=("Mara", "/list add"), eph=True, time="Today at 20:53")
    return m, a + b, m2


def opt3a():
    f = []
    m, x = l3a_view(); f.append(frame("/list view · ranked, notes under each game", m.budget(), "general", x))
    m, x = l3a_souls(); f.append(frame("/list view · by date added", m.budget(), "general", x))
    m, x, m2, m3 = l3a_add(); f.append(frame("Game view · Add to List · pick · added", f"game view row 5/5 buttons · pick {m2.budget()} · reply {m3.budget()}", "general", x))
    m, x, m2 = l3a_refuse(); f.append(frame("Refusals: already in the list, list full", f"{m.chars} and {m2.chars} chars", "general", x))
    return opt("3A", "The list as text", "/list view is the list as a numbered page of text, with each game's note in small type under it and the first game's cover as the thumbnail. On the game view, <strong>Add to List</strong> fills the fifth and last slot of the existing button row and opens a select of your lists.", f,
               ["Cheapest to build and fully readable without images. 10 games and their notes fit one page; 500 games page in tens.",
                "The row now holds exactly 5 buttons, Discord's limit, so a future game action needs a second row.",
                "Lists that already have the game say so in the select (Discord can't disable an option); picking one gets the refusal."])


# ---- 3B: cover gallery, compact lines ----
def l3b_view():
    m = Msg()
    head = m.text(h2("Top 10 of all time"), sub(f"{mention('Mara')} · ranked · 10 games"))
    gal = m.gallery([k for k, _ in TOP10], "n10")
    body = m.text(*[ln(f"<span class='num'>{i + 1}</span>{T(k)}") for i, (k, _) in enumerate(TOP10)])
    r = m.row(m.btn("Show notes"), m.btn("Open on the website", "link", ext=True))
    return m, message(m.ctr(head + gal + body) + r, ref=("Jun", "/list view"), time="Today at 20:40")


def l3b_notes():
    m = Msg()
    head = m.text(h3("Top 10 of all time · notes"))
    body = m.text(*[ln(f"<span class='num'>{i + 1}</span><strong>{T(k)}</strong> {note}") for i, (k, note) in enumerate(TOP10) if note])
    return m, message(m.ctr(head + body), ref=("Jun", "/list view"), eph=True, time="Today at 20:41")


def l3b_add():
    body = (msel("List", "Cozy for the winter", desc="Your lists. Lists that already have this game aren't offered.",
                 options=[("Top 10 of all time", "10 games · ranked", False), ("Cozy for the winter", "4 games · Private", True)])
            + '<div class="ml-d" style="margin:0">Final Fantasy IX goes at the end. Change the order and add a note on the website.</div>')
    return modal("Add Final Fantasy IX to a list", body, "Add")


def l3b_ok():
    m = Msg()
    s = m.section(m.text(ln("<strong>Final Fantasy IX</strong> is in <strong>Cozy for the winter</strong> now."), sub("5 games · Private, so only you see it")), m.thumb("ff9"))
    a = message(m.ctr(s) + m.row(m.btn("Open the list", "link", ext=True)), eph=True, time="Today at 20:50")
    m2 = Msg()
    b = message(m2.ctr(m2.text(ln("That list already has <strong>Final Fantasy IX</strong>.")) + m2.text(sub("Lists hold each game once, and up to 500 games."))), ref=("Mara", "/list add"), eph=True, time="Today at 20:52")
    return m, a + b, m2


def opt3b():
    f = []
    m, x = l3b_view(); f.append(frame("/list view · covers first, titles under", m.budget(), "general", x))
    m, x = l3b_notes(); f.append(frame("Show notes · ephemeral", m.budget(), "general", x))
    f.append(modal_frame("Game view's Add to List button opens a modal with a select", "modal with 1 select", l3b_add()))
    m, x, m2 = l3b_ok(); f.append(frame("Added, then the refusal", f"{m.budget()} · refusal {m2.budget()}", "general", x))
    return opt("3B", "Covers on the shelf", "/list view leads with the list's covers as a media gallery (10 to a page), then a compact numbered list of titles. Notes open on <strong>Show notes</strong> for whoever asks. <strong>Add to List</strong> opens a small modal with a select of your lists and adds the game at the end.", f,
               ["Most visual, and closest to the website's list page. Games without art are left out of the gallery but stay in the numbered lines.",
                "The gallery's cover grid crops to Discord's layout; at 10 covers it's 5 across.",
                "A modal with a select needs discord.js's newer Label component (modal selects). If the bot's version lacks it, the select moves to an ephemeral reply as in 3A."])


# ---- 3C: one section per game ----
def l3c_view():
    m = Msg()
    parts = [m.text(h2("Top 10 of all time"), sub(f"{mention('Mara')} · ranked · 1 to 5 of 10"))]
    for i, (k, note) in enumerate(TOP10[:5]):
        parts.append(m.section(m.text(ln(f"<strong>{i + 1}. {T(k)}</strong>"), sub(f"{G[k][1]}") + (ln(note) if note else "")), m.thumb(k)))
    r = m.row(m.btn("Previous", disabled=True), m.btn("Next", "primary"), m.btn("Open on the website", "link", ext=True))
    return m, message(m.ctr("".join(parts)) + r, ref=("Jun", "/list view"), time="Today at 20:40")


def l3c_souls():
    m = Msg()
    parts = [m.text(h2("Soulslike, but make it history"), sub(f"{mention('Grindlord')} · by date added, newest last · 4 to 6 of 6"))]
    for k, note, d in SOULS[3:]:
        parts.append(m.section(m.text(ln(f"<strong>{T(k)}</strong>"), sub(f"added {d}"), ln(note)), m.thumb(k)))
    r = m.row(m.btn("Previous"), m.btn("Next", disabled=True), m.btn("Open on the website", "link", ext=True))
    return m, message(m.ctr("".join(parts)) + r, ref=("Tavi", "/list view"), time="Today at 20:44")


def l3c_add():
    m = Msg()
    g = message(m.ctr(m.text(ln("&hellip; Final Fantasy IX's game view &hellip;"))) + GAMEVIEW_ROW(m, []) + m.row(m.btn("Add to a Game List", "primary"), m.btn("In 6 Game Lists")), ref=("Mara", "/gamedb view"), time="Today at 20:50")
    return m, g


def l3c_cmd():
    t = typing("/list add", cbopt("game", "Final Fantasy IX") + cbopt("list", "co", True), "LIST · YOUR LISTS",
               [("Cozy for the winter", "4 games · Private", True), ("Top 10 of all time", "10 games · ranked", False)])
    m = Msg()
    ok = message(m.ctr(m.text(ln("Added <strong>Final Fantasy IX</strong> to <strong>Cozy for the winter</strong> (5 games)."), sub("Order and notes: on the website."))), ref=("Mara", "/list add"), eph=True, time="Today at 20:51")
    m2 = Msg()
    no = message(m2.ctr(m2.text(ln("<strong>Every JRPG I own</strong> has 500 games, the most a list holds. Nothing was added."))), ref=("Mara", "/list add"), eph=True, time="Today at 20:53")
    return t, m, ok + no, m2


def opt3c():
    f = []
    m, x = l3c_view(); f.append(frame("/list view · a section per game", m.budget(), "general", x))
    m, x = l3c_souls(); f.append(frame("/list view · by date added, page 2", m.budget(), "general", x))
    m, x = l3c_add(); f.append(frame("Game view · a second row for lists", m.budget(), "general", x))
    t, m, x, m2 = l3c_cmd()
    f.append(raw_frame("/list add · autocomplete over your lists", "autocomplete, 25 max", t))
    f.append(frame("Added, then the 500 refusal", f"{m.budget()} · refusal {m2.budget()}", "general", x))
    return opt("3C", "A card per game", "/list view gives each game a section of its own: rank and title, year, the note, and the cover beside it, five to a page. The game view gets a <strong>second button row</strong> for lists: <em>Add to a Game List</em> and <em>In 6 Game Lists</em>, which shows the lists the game is in.", f,
               ["Reads like the website's list page, notes and all. A ranked list of 500 pages 100 times, so Open on the website matters more.",
                "Each game costs 3 components (section, text, thumbnail), so 5 per page keeps well under 40.",
                "In 6 Game Lists needs the count and the visible lists from GET /games/:id/game_lists, which the API already plans."])


s3 = section_html(
    3, "s3", "/list view and Add to list",
    "Members can read any <strong>Game List</strong> they can see with <strong>/list view</strong>, and add a game to one of their own with <strong>/list add</strong> or an <strong>Add to List</strong> button on the game view. Reordering and notes stay on the website, so every reply points there. Both are gated by the Game Lists Feature. A game appears in a list once, and a list holds up to 500.",
    [opt3a(), opt3b(), opt3c()], intro=INTRO3)

MAST = """<header class="mast"><h1>Game Lists <b>in Discord</b></h1>
<p class="lede">Options for every message the bot sends for <strong>Core and Optional Games</strong>, <strong>Pool Proposals</strong> and <strong>Game Lists</strong> (spec api#442, ticket www#168). <strong>Pick one per surface</strong>, or mix parts of several. Every mock uses only what the bot can really send: plain content or Components V2 (containers, sections, text, separators, thumbnails, media galleries, buttons, selects), modals and autocomplete. Each frame lists its component and character budget. The website's options are in <a href="../game-lists/index.html">../game-lists/</a>.</p>
<ul class="keys"><li>Today <span>Tue 24 Nov 2026</span></li><li>Members <span>invented</span></li><li>Covers <span>Steam library art</span></li><li>Fall of Final Fantasy <span>Core 14 · Optional 12 · Clear 2</span></li><li>Game Lists <span>Feature in Preview</span></li></ul>
</header>
<nav class="toc" aria-label="Surfaces"><ol><li><a href="#s1"><b>1</b>/challenge Pool wizard</a></li><li><a href="#s2"><b>2</b>Pool Proposals and DMs</a></li><li><a href="#s3"><b>3</b>/list view and Add to list</a></li></ol></nav>"""

doc = head + EXTRA_CSS + "</style>\n</head>\n<body>\n" + MAST + "<main>" + s1 + s2 + s3 + "</main>\n</body></html>\n"
assert "\u2014" not in doc, "em dash in output"
open(OUT, "w").write(doc)
print("wrote", OUT, len(doc))
