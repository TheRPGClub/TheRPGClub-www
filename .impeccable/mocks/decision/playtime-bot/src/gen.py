#!/usr/bin/env python3
"""Generates the Playtime and Franchise Progress bot options gallery (playtime-bot/index.html).

The shell, Discord styles and message helpers come from the Game Lists bot gallery (base.py is its
gen.py up to the first surface, copied unchanged). Covers are real Steam library art; members are
invented. Today is Wed 25 Nov 2026.
"""
import os, re

HERE = os.path.dirname(os.path.abspath(__file__))
exec(open(os.path.join(HERE, "base.py")).read())  # noqa: S102 - our own copied helpers

head = head.replace("<title>Game Lists Bot Options</title>", "<title>Playtime Bot Options</title>")
head = re.sub(r'<meta name="description" content="[^"]*">',
              '<meta name="description" content="Design options for the Conquest post, /playtime add and Playtime in the bot\'s game view.">', head)

M.update({"Loot Hoarder": "#e0c0a0"})
GAMEVIEW_ROW = lambda m, extra: m.row(m.btn("Add to Now Playing List", "primary"), m.btn("View Featured Video"), m.btn("Add to Backlog"), m.btn("Add to Collection"), *extra)

PT_CSS = r"""
/* ---------- playtime additions ---------- */
.pr{background:#0b0b0d;color:var(--paper);padding:16px 16px 14px;font-family:Barlow,sans-serif;position:relative}
.pr-top{display:flex;align-items:flex-end;justify-content:space-between;border-bottom:2px solid var(--paper);padding-bottom:8px}
.pr-name{font:400 30px/.9 Anton,Impact,sans-serif;text-transform:uppercase}
.pr-who{font:700 11px/1.2 "Barlow Condensed",sans-serif;letter-spacing:.08em;text-transform:uppercase;color:var(--paper-dim);text-align:right}
.pr-who b{color:var(--paper)}
.pr-mid{display:grid;grid-template-columns:200px 1fr;gap:16px;align-items:end;margin-top:12px}
.pr-g{position:relative;display:grid;justify-items:center}
.pr-g .n{position:absolute;bottom:0;font:400 40px/.8 Anton,Impact,sans-serif}
.pr-g .n span{font-size:20px;color:var(--paper-mute)}
.pr-stamp{position:absolute;left:44px;top:56px;transform:rotate(-8deg);border:2.5px solid var(--paper);outline:1px solid var(--paper);outline-offset:2px;padding:4px 10px 3px;background:#0b0b0d;font:400 22px/.9 Anton,Impact,sans-serif;text-transform:uppercase;box-shadow:0 6px 14px rgba(0,0,0,.45)}
.pr-row{display:grid;grid-template-columns:repeat(8,1fr);gap:3px}
.pr-c{position:relative;aspect-ratio:3/4;border-radius:2px;overflow:hidden;background:#1d1d22;box-shadow:inset 0 0 0 1px rgba(244,244,240,.12)}
.pr-c img{width:100%;height:100%;object-fit:cover;display:block}
.pr-c .t{position:absolute;inset:0;display:grid;place-items:center;text-align:center;padding:2px;font:400 8px/1 Anton,Impact,sans-serif;text-transform:uppercase;color:var(--paper-mute)}
.pr-c .r{position:absolute;left:2px;bottom:2px;background:#0b0b0d;color:var(--paper);font:400 9px/1 Anton,Impact,sans-serif;padding:2px 3px 1px;border-radius:1px}
.pr-foot{margin-top:10px;font:700 11px/1.3 "Barlow Condensed",sans-serif;letter-spacing:.07em;text-transform:uppercase;color:var(--paper-mute);display:flex;justify-content:space-between}
.pr-foot b{color:var(--paper)}
.d-code-block{font-family:"Noto Sans Mono",monospace;font-size:13px;line-height:1.5;background:#2b2d31;border:1px solid #1e1f22;border-radius:4px;padding:8px 10px;white-space:pre;color:var(--dc-text);margin:4px 0}
"""

FFM = ["ff1", "ff2", "ff3", "ff4", "ff5", "ff6", "ff7", "ff8", "ff9", "ff10", "ff11", "ff12", "ff13", "ff14", "ff15", "ff16"]
ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV", "XV", "XVI"]
SOURCES = [("Steam", "PC", 42, "synced today"), ("RetroAchievements", "SNES", 48, "synced today"), ("PSN", "PS4", 29, "new on 3 Nov"),
           ("Manual", "Switch", 30, "from my save file"), ("Manual", "PS4", 31, "old note from 2023")]
TOTAL = sum(s[2] for s in SOURCES)


def gauge_svg(n, m, w=190, sw=18):
    import math
    r = (w - sw) / 2 - 2
    cx, cy = w / 2, r + sw / 2 + 2
    h = math.ceil(cy + 2)
    pt = lambda a: f"{cx + r * math.cos(a):.2f} {cy - r * math.sin(a):.2f}"
    d, gap = math.pi / m, min(0.05, 0.45 / m)
    out = []
    for i in range(m):
        a0 = math.pi - i * d - (gap / 2 if i else 0)
        a1 = math.pi - (i + 1) * d + (gap / 2 if i < m - 1 else 0)
        out.append(f'<path d="M {pt(a0)} A {r:.2f} {r:.2f} 0 0 1 {pt(a1)}" fill="none" stroke="{"#f4f4f0" if i < n else "#303037"}" stroke-width="{sw}"/>')
    return f'<svg viewBox="0 0 {w} {h}" width="{w}" height="{h}" aria-hidden="true">{"".join(out)}</svg>'


def pr_cover(k):
    u = cover_url(k)
    inner = f'<img src="{u}" alt="">' if u else f'<span class="t">{e(T(k))}</span>'
    return f'<div class="pr-c">{inner}<span class="r">{ROMAN[FFM.index(k)]}</span></div>'


def conquest_print():
    return (f'<div class="pr"><div class="pr-top"><span class="pr-name">Final Fantasy</span><span class="pr-who"><b>Mara</b> · 25 Nov 2026<br>4th member to Conquer it</span></div>'
            f'<div class="pr-mid"><div class="pr-g">{gauge_svg(16, 16)}<span class="n">16<span>/16</span></span><span class="pr-stamp">Conquered</span></div>'
            f'<div><div class="pr-row">{"".join(pr_cover(k) for k in FFM)}</div></div></div>'
            f'<div class="pr-foot"><span>Every Mainline game · <b>812 h</b> of Playtime in the Franchise</span><span>Add-ons never count</span></div></div>')


COMPLETION = ("### Mara", "Mara has added a game completion: <strong>Final Fantasy XIV</strong> - Main Story - 25/11/2026 - 380 hrs",
              "Game completion #31 for 2026")


def completion_lines():
    return h3("Mara") + ln(COMPLETION[1]) + ln("&nbsp;") + ln(COMPLETION[2])


# =====================================================================
# 4 · The Conquest post
# =====================================================================
def c4a():
    m = Msg()
    body = (completion_lines() + ln("&nbsp;") + ln("<strong>Mara Conquered Final Fantasy.</strong> Every Mainline game, 16 of 16, with 812 h of Playtime across the Franchise. The 4th member to Conquer it."))
    return m, message(body, plain=True, time="Today at 21:02")


def opt4a():
    m, x = c4a()
    return opt("4A", "A line on the completion post", "No new message: the Game Completion that finishes the last Mainline game gets <strong>one more line</strong> on its usual post in the completions channel. The member's name is plain text, never a ping.", [frame("The completion post, with the Conquest line", m.budget(plain=True), "completions", x)],
               ["Quietest; it can't be missed because it rides the post people already read.",
                "A Conquest from a Game Completion logged without announce:true posts nothing. Say if it should post on its own then."])


def c4b():
    m = Msg()
    inner = m.ctr(m.text(h2("Mara Conquered Final Fantasy"), sub("Every Mainline game · 16 of 16 · 25 Nov 2026"))
                  + m.gallery(["ff6", "ff7", "ff8", "ff9", "ff10", "ff12", "ff13", "ff14", "ff15", "ff16"], "n10")
                  + m.text(ln("<strong>812 h</strong> of Playtime in the Franchise. Joins Loot Hoarder, Rowan and Jun.")), "#f4f4f0")
    r = m.row(m.btn("Open Final Fantasy", "link", ext=True))
    first = message(completion_lines(), plain=True, time="Today at 21:02")
    return m, first + message(inner + r, time="Today at 21:02")


def opt4b():
    m, x = c4b()
    return opt("4B", "Its own card under the completion", "Right after the completion post, a <strong>Conquest card</strong>: the headline, the date, a gallery of the Franchise's Mainline covers, the Playtime and who else has Conquered it, and a link to the Franchise page. <strong>Recommended</strong>: it reads as an event of its own without a new channel.", [frame("Completion post, then the Conquest card", m.budget(), "completions", x)],
               ["The gallery holds 10 covers, so a long Franchise shows its latest 10 Mainline games with art.",
                "The container's 3px edge is paper, not a Provider or track colour."])


def c4c():
    m = Msg()
    inner = m.ctr(m.image(conquest_print()) + m.text(ln("<strong>Mara Conquered Final Fantasy.</strong> 812 h of Playtime. The 4th member to Conquer it.")))
    r = m.row(m.btn("Open Final Fantasy", "link", ext=True))
    first = message(completion_lines(), plain=True, time="Today at 21:02")
    return m, first + message(inner + r, time="Today at 21:02")


def opt4c():
    m, x = c4c()
    return opt("4C", "The printed Conquest", "The card is a <strong>generated image in the club's print style</strong>: the full Mainline meter with the Conquered stamp, all 16 Mainline covers numbered I to XVI (the Anton fallback where IGDB has none) and the Playtime, with one line of text under it.", [frame("Completion post, then the printed Conquest", m.budget(), "completions", x)],
               ["Most like the website; needs the bot to render an image (it already draws birthday banners), so it costs the most to build.",
                "Fits every Mainline game, where the gallery stops at 10."])


s4 = section_html(4, "s4", "The Conquest post",
                  "When a Game Completion makes a member <strong>Conquer</strong> a Franchise (a Game Completion for every Mainline game), the bot says so in the completions channel. <strong>No pings.</strong> Conquests that already exist when the Feature launches, and ones reached through a Completionator import, are never posted. Gated by the Franchise Progress Feature.",
                  [opt4a(), opt4b(), opt4c()])

# =====================================================================
# 5 · /playtime add
# =====================================================================
INTRO5 = '<div class="intro">' + raw_frame(
    "Typing the command · platform autocompletes from GameDB, yours first", "autocomplete, 25 max",
    typing("/playtime add", cbopt("title", "Final Fantasy VI (1994)") + cbopt("platform", "sw", True) + cbopt("hours", "3"), "PLATFORM · YOURS FIRST",
           [("Nintendo Switch", "your Manual Playtime: 30 h", True), ("Nintendo Switch 2", "", False), ("Super Nintendo", "RetroAchievements reports 48 h", False)],
           channel="general")) + '</div>'


def p5a():
    m = Msg()
    ok = message(m.ctr(m.text(ln("Added <strong>3 h</strong> to your Switch Manual Playtime for <strong>Final Fantasy VI</strong>: 30 h to 33 h. Your Playtime is now <strong>183 h</strong>."))) + m.row(m.btn("Undo")),
                 ref=("Mara", "/playtime add"), eph=True, time="Today at 21:10")
    m2 = Msg()
    st = message(m2.ctr(m2.text(ln("Set your Switch Manual Playtime for <strong>Final Fantasy VI</strong> to <strong>41 h</strong> (was 30 h). Your Playtime is now <strong>191 h</strong>."))) + m2.row(m2.btn("Undo")),
                 ref=("Mara", "/playtime add set:true"), eph=True, time="Today at 21:11")
    return m, ok + st, m2


def opt5a():
    m, x, m2 = p5a()
    return opt("5A", "One line and Undo", "An ephemeral line that says what changed (from and to) and the new Playtime, with Undo. <strong>set:true</strong> says \"Set\" and shows what it was.", [frame("Add time, then set:true", f"{m.budget()} · {m2.budget()}", "general", x)],
               ["Fastest to read; nothing about other sources or the Playthrough."])


def p5b():
    m = Msg()
    lines = "".join(ln(f"{s[0]} · {s[1]} <strong>{s[2] + (3 if s[1] == 'Switch' else 0)} h</strong>" + (" <em>(+3)</em>" if s[1] == "Switch" else "")) for s in SOURCES)
    inner = m.ctr(m.sect(m.text(h3("Final Fantasy VI · 183 h"), sub("Added 3 h to Manual · Switch (30 h to 33 h)"), lines), "ff6")
                  + m.sep() + m.text(ln("Playthrough open since 9 Nov: <strong>17 h 20 m</strong>"), sub("PSN and your manual PS4 entry may both count your PS4 time. Sort it out on the website.")))
    r = m.row(m.btn("Undo"), m.btn("Open on the website", "link", ext=True))
    return m, message(inner + r, ref=("Mara", "/playtime add"), eph=True, time="Today at 21:10")


def opt5b():
    m, x = p5b()
    return opt("5B", "The receipt", "The reply is a <strong>receipt</strong>: the game's cover, the new total, every source with the changed one marked, the open Playthrough, and the mismatch as one plain line pointing to the website. <strong>Recommended</strong>: adding time is when members check whether the total is right.", [frame("Added 3 h, with the breakdown", m.budget(), "general", x)],
               ["The Playthrough grew by the 3 h too, because Manual time added while a Playthrough is open counts toward it."])


def p5c():
    m = Msg()
    ask = message(m.ctr(m.text(ln("<strong>Steam already reports 42 h</strong> on PC for Final Fantasy VI. Manual Playtime adds on top, so this would count that time twice."),
                               sub("Manual Playtime is for play no Provider sees: another platform, a save file, an old note."))) + m.row(m.btn("Add 10 h anyway", "danger"), m.btn("Cancel")),
                  ref=("Mara", "/playtime add platform:PC hours:10"), eph=True, time="Today at 21:12")
    m2 = Msg()
    no = message(m2.ctr(m2.text(ln("Hours must be more than 0 and at most 10,000, in steps of 0.25 h. You typed <strong>-3</strong>."))), ref=("Mara", "/playtime add"), eph=True, time="Today at 21:13")
    return m, ask + no, m2


def opt5c():
    m, x, m2 = p5c()
    return opt("5C", "Ask first when a Provider covers it", "Same reply as 5A, but when the platform is one a Provider already reports for this game, the bot <strong>asks before adding</strong>: \"Steam already reports 42 h on PC\", with Add anyway or Cancel. Catches the double count at the source.", [frame("Adding PC time on a Steam game, then a refusal", f"{m.budget()} · refusal {m2.budget()}", "general", x)],
               ["Can combine with 5A or 5B for the normal reply.", "The red Add anyway is Discord's danger style; on the website the same warning is the yellow mismatch."])


s5 = section_html(5, "s5", "/playtime add",
                  "<strong>/playtime add title platform hours [set]</strong> adds to (or with set:true, sets) the member's <strong>Manual Playtime</strong> for one game on one platform. Replies are ephemeral. Not gated: Playtime is part of every game page.",
                  [opt5a(), opt5b(), opt5c()], intro=INTRO5)

# =====================================================================
# 6 · Playtime in the game view
# =====================================================================
GV_HEAD = lambda m: m.sect(m.text(h2("Final Fantasy VI"), sub("1994 · Square · RPG"), ln("The Empire has rediscovered magic and means to use it&hellip;"), ln("<strong>Time to beat</strong> Main 31 h · Extras 38 h · Complete 55 h")), "ff6")


def g6a():
    m = Msg()
    inner = m.ctr(GV_HEAD(m) + m.sep() + m.text(h3("Mara's Playtime · 180 h"),
                  ln("Steam 42 h · RetroAchievements 48 h · PSN 29 h · Manual Switch 30 h · Manual PS4 31 h"), sub("Playthrough open since 9 Nov: 14 h 20 m")))
    return m, message(inner + GAMEVIEW_ROW(m, []), ref=("Mara", "/gamedb view"), time="Today at 21:20")


def opt6a():
    m, x = g6a()
    return opt("6A", "A block in the view", "The game view gains a <strong>Playtime block</strong> for whoever ran the command, named so everyone reading knows whose it is: the total, the sources on one line and the open Playthrough.", [frame("Mara runs /gamedb view", m.budget(), "general", x)],
               ["Simple, but a game view posted in a channel shows only its author's Playtime."])


def g6b():
    m = Msg()
    view = message(m.ctr(GV_HEAD(m)) + GAMEVIEW_ROW(m, [m.btn("My Playtime")]), ref=("Mara", "/gamedb view"), time="Today at 21:20")
    m2 = Msg()
    table = "\n".join(f"{(s[0] + ' · ' + s[1]):<26}{s[2]:>5} h" for s in SOURCES) + f"\n{'':-<32}\n{'Playtime':<26}{TOTAL:>5} h"
    eph = message(m2.ctr(m2.text(h3("Your Playtime · Final Fantasy VI"), f'<div class="d-code-block">{e(table)}</div>', ln("Playthrough open since 9 Nov: <strong>14 h 20 m</strong>"), sub("Add time with /playtime add. PSN and your manual PS4 entry may both count your PS4 time.")))
                  + m2.row(m2.btn("Open on the website", "link", ext=True)), eph=True, time="Today at 21:21")
    m3 = Msg()
    eph2 = message(m3.ctr(m3.text(ln("You have no Playtime on <strong>Final Fantasy VI</strong> yet."), sub("Link Steam, RetroAchievements or PSN on the website, or add it with /playtime add."))), eph=True, time="Today at 21:22")
    return m, view + eph + eph2, m2


def opt6b():
    m, x, m2 = g6b()
    return opt("6B", "My Playtime, for whoever presses it", "The view gets a <strong>My Playtime</strong> button. Whoever presses it gets their own breakdown, ephemeral: a small table of sources, the total and the open Playthrough. <strong>Recommended</strong>: one posted view works for every member reading it.", [frame("Mara's view, Mara presses it, then Tavi does", f"{m.budget()} · reply {m2.budget()}", "general", x)],
               ["The table is a code block so the hours line up; it stays under 2,000 characters for any game."])


def g6c():
    m = Msg()
    inner = m.ctr(GV_HEAD(m) + m.sep() + m.text(h3("Club Playtime · 1,240 h"), ln("9 members · most: <strong>Rowan 212 h</strong>, Mara 180 h, Jun 151 h"), sub("Final Fantasy VI is Mainline in Final Fantasy, Conquered by 3 members.")))
    return m, message(inner + GAMEVIEW_ROW(m, [m.btn("My Playtime")]), ref=("Mara", "/gamedb view"), time="Today at 21:20")


def opt6c():
    m, x = g6c()
    return opt("6C", "The club's Playtime, yours on the button", "The view shows the <strong>club's Playtime</strong> on the game (total, members, the top three) and a line on its Franchise, with 6B's <strong>My Playtime</strong> button for your own.", [frame("The view with club Playtime", m.budget(), "general", x)],
               ["Needs a club Playtime figure from the API, which the spec doesn't have yet."])


s6 = section_html(6, "s6", "Playtime in the game view",
                  "The bot's existing game view (<strong>/gamedb view</strong>) and its buttons. Today it shows the game, Time to beat and the shelf buttons.",
                  [opt6a(), opt6b(), opt6c()])

MAST = """<header class="mast"><h1>Playtime <b>in Discord</b></h1>
<p class="lede">Options for the bot's side of <strong>Playtime</strong> and <strong>Franchise Progress</strong>: the <strong>Conquest post</strong>, <strong>/playtime add</strong> and Playtime in the <strong>game view</strong>. <strong>Pick one per surface</strong>, or mix. Every mock uses only what the bot can send (plain content or Components V2, modals, autocomplete), with its component and character budget. The website's options are in <a href="../playtime/index.html">../playtime/</a>.</p>
<ul class="keys"><li>Today <span>Wed 25 Nov 2026</span></li><li>Members <span>invented</span></li><li>Covers <span>Steam library art</span></li><li>Mara's Final Fantasy VI <span>180 h from 5 sources</span></li><li>Franchise Progress <span>Feature in Preview</span></li></ul>
</header>
<nav class="toc" aria-label="Surfaces"><ol><li><a href="#s4"><b>4</b>The Conquest post</a></li><li><a href="#s5"><b>5</b>/playtime add</a></li><li><a href="#s6"><b>6</b>Playtime in the game view</a></li></ol></nav>"""

OUT = os.path.join(os.path.dirname(HERE), "index.html")
doc = head + EXTRA_CSS + PT_CSS + "</style>\n</head>\n<body>\n" + MAST + "<main>" + s4 + s5 + s6 + "</main>\n</body></html>\n"
assert "—" not in doc, "em dash in output"
open(OUT, "w").write(doc)
print("wrote", OUT, len(doc))
