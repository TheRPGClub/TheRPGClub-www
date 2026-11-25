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
