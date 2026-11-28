"""N · Green frame: greenery assets layered on H's scene.

Writes, next to this file:
  frame-tl.svg, frame-tr.svg, frame-bl.svg, frame-br.svg  corner clusters
  frame-edge-l.svg, frame-edge-r.svg                      fronds for the waterline band
  lilies.svg     lily pads and blossoms on the lagoon surface (repeat-x)
  kelp.svg       tall kelp, bottom-anchored (repeat-x)
  seagrass.svg   short seagrass ribbons, bottom-anchored (repeat-x)
All original vector art, generated; no references traced. Run: python3 -I build-greenery.py
"""
import math
import os
import random

HERE = os.path.dirname(os.path.abspath(__file__))
_gid = [0]


def gid(p):
    _gid[0] += 1
    return f"{p}{_gid[0]}"


def mix(a, b, t):
    a = [int(a[i:i + 2], 16) for i in (1, 3, 5)]
    b = [int(b[i:i + 2], 16) for i in (1, 3, 5)]
    return "#" + "".join(f"{round(x + (y - x) * t):02x}" for x, y in zip(a, b))


def pts(seq):
    return " ".join(f"{x:.1f},{y:.1f}" for x, y in seq)


def smooth_path(points, close=True):
    """Catmull-Rom through points as cubic beziers."""
    n = len(points)
    d = f"M{points[0][0]:.1f},{points[0][1]:.1f}"
    rng = range(n if close else n - 1)
    for i in rng:
        p0 = points[(i - 1) % n] if close or i > 0 else points[0]
        p1 = points[i]
        p2 = points[(i + 1) % n]
        p3 = points[(i + 2) % n] if close or i + 2 < n else points[-1]
        c1 = (p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6)
        c2 = (p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6)
        d += f" C{c1[0]:.1f},{c1[1]:.1f} {c2[0]:.1f},{c2[1]:.1f} {p2[0]:.1f},{p2[1]:.1f}"
    return d + (" Z" if close else "")


# Glossy Aero greens, base to tip; haze pulls distant leaves to the sky.
GREENS = dict(dark="#0b5a2e", mid="#22914a", light="#6fd35a", tip="#c4f28c", rib="#e9ffc4")
HAZE = "#bfe6f2"


def leaf(defs, base, angle, length, width, droop=0.25, haze=0.0, shape=0.85,
         split=0, gloss=1.0, dew=False, veins=7, lite=None):
    """A glossy broad leaf. angle in degrees (0 = right, 90 = down)."""
    a = math.radians(angle)
    d = (math.cos(a), math.sin(a))
    p = (-d[1], d[0])
    # droop bends the midrib towards +y (gravity) whichever way it points.
    side = 1 if p[1] >= 0 else -1
    N = 10 if lite else 28
    mid, left, right, normals = [], [], [], []
    for i in range(N + 1):
        t = i / N
        bend = droop * length * t * t * side
        x = base[0] + d[0] * length * t + p[0] * bend
        y = base[1] + d[1] * length * t + p[1] * bend
        mid.append((x, y))
    for i in range(N + 1):
        t = i / N
        j0, j1 = max(i - 1, 0), min(i + 1, N)
        tx, ty = mid[j1][0] - mid[j0][0], mid[j1][1] - mid[j0][1]
        l = math.hypot(tx, ty) or 1
        nx, ny = -ty / l, tx / l
        normals.append((nx, ny))
        w = width * (math.sin(math.pi * min(t ** shape, 1))) ** 0.75
        if t < 0.06:
            w *= t / 0.06 * 0.6 + 0.4
        notch = 1.0
        if split and 0.2 < t < 0.92:
            # tropical tears: narrow slits through the blade
            ph = (t - 0.2) / 0.72 * split
            notch = 0.55 + 0.45 * abs(math.cos(math.pi * ph)) ** 0.35
        left.append((mid[i][0] + nx * w * notch, mid[i][1] + ny * w * notch))
        right.append((mid[i][0] - nx * w * notch, mid[i][1] - ny * w * notch))
    # which half faces the light (up-left)?
    nmid = normals[N // 2]
    lit_left = (nmid[1] * 1 + nmid[0] * 0.3) < 0
    dark, midc, light, tip = (mix(GREENS[k], HAZE, haze) for k in ("dark", "mid", "light", "tip"))
    bx, by = base
    ex, ey = mid[-1]
    if lite:
        lit, shade = lite
        return (f'<path d="{smooth_path(left + mid[::-1])}" fill="{lit if lit_left else shade}"/>'
                f'<path d="{smooth_path(mid + right[::-1])}" fill="{shade if lit_left else lit}"/>')
    g_lit, g_shade = gid("gl"), gid("gs")
    defs.append(
        f'<linearGradient id="{g_lit}" gradientUnits="userSpaceOnUse" x1="{bx:.0f}" y1="{by:.0f}" x2="{ex:.0f}" y2="{ey:.0f}">'
        f'<stop offset="0" stop-color="{midc}"/><stop offset="0.55" stop-color="{light}"/><stop offset="1" stop-color="{tip}"/></linearGradient>')
    defs.append(
        f'<linearGradient id="{g_shade}" gradientUnits="userSpaceOnUse" x1="{bx:.0f}" y1="{by:.0f}" x2="{ex:.0f}" y2="{ey:.0f}">'
        f'<stop offset="0" stop-color="{dark}"/><stop offset="0.6" stop-color="{midc}"/><stop offset="1" stop-color="{light}"/></linearGradient>')
    lhalf = left + mid[::-1]
    rhalf = mid + right[::-1]
    if lite:
        lit, shade = lite
        return (f'<path d="{smooth_path(lhalf)}" fill="{lit if lit_left else shade}"/>'
                f'<path d="{smooth_path(rhalf)}" fill="{shade if lit_left else lit}"/>')
    out = []
    # soft contact shadow
    out.append(f'<path d="{smooth_path(left + right[::-1])}" fill="#063a24" opacity="{0.18 * (1 - haze):.2f}" transform="translate(4 7)"/>')
    out.append(f'<path d="{smooth_path(lhalf)}" fill="url(#{g_lit if lit_left else g_shade})"/>')
    out.append(f'<path d="{smooth_path(rhalf)}" fill="url(#{g_shade if lit_left else g_lit})"/>')
    # side veins
    vc = mix(GREENS["rib"], HAZE, haze)
    for k in range(1, veins + 1):
        t = k / (veins + 1)
        i = int(t * N)
        for edge in (left, right):
            j = min(int(i + N * 0.1), N)
            ex2 = mid[i][0] + (edge[j][0] - mid[i][0]) * 0.86
            ey2 = mid[i][1] + (edge[j][1] - mid[i][1]) * 0.86
            out.append(f'<path d="M{mid[i][0]:.1f},{mid[i][1]:.1f} L{ex2:.1f},{ey2:.1f}" '
                       f'fill="none" stroke="{vc}" stroke-width="{max(width * 0.022, 0.8):.1f}" opacity="0.3" stroke-linecap="round"/>')
    # midrib
    out.append(f'<path d="{smooth_path(mid[: int(N * 0.93)], close=False)}" fill="none" stroke="{vc}" '
               f'stroke-width="{max(width * 0.06, 1.2):.1f}" opacity="0.75" stroke-linecap="round"/>')
    # gloss streak on the lit half
    if gloss:
        edge = left if lit_left else right
        g_hi = gid("gh")
        defs.append(
            f'<linearGradient id="{g_hi}" gradientUnits="userSpaceOnUse" x1="{bx:.0f}" y1="{by:.0f}" x2="{ex:.0f}" y2="{ey:.0f}">'
            f'<stop offset="0.1" stop-color="#fff" stop-opacity="0"/><stop offset="0.45" stop-color="#fff" stop-opacity="{0.55 * gloss:.2f}"/>'
            f'<stop offset="0.85" stop-color="#fff" stop-opacity="0"/></linearGradient>')
        a_, b_ = int(N * 0.12), int(N * 0.86)
        outer = [(mid[i][0] + (edge[i][0] - mid[i][0]) * 0.78, mid[i][1] + (edge[i][1] - mid[i][1]) * 0.78) for i in range(a_, b_)]
        inner = [(mid[i][0] + (edge[i][0] - mid[i][0]) * 0.42, mid[i][1] + (edge[i][1] - mid[i][1]) * 0.42) for i in range(a_, b_)]
        out.append(f'<path d="{smooth_path(outer + inner[::-1])}" fill="url(#{g_hi})"/>')
        # rim light along the lit edge
        out.append(f'<path d="{smooth_path(edge[2:-2], close=False)}" fill="none" stroke="#f4ffe0" stroke-width="1.4" opacity="{0.6 * gloss:.2f}"/>')
    if dew:
        i = int(N * 0.55)
        edge = left if lit_left else right
        x = mid[i][0] + (edge[i][0] - mid[i][0]) * 0.55
        y = mid[i][1] + (edge[i][1] - mid[i][1]) * 0.55
        r = max(width * 0.08, 3)
        g_d = gid("gd")
        defs.append(f'<radialGradient id="{g_d}" cx="0.4" cy="0.35" r="0.7"><stop offset="0" stop-color="#fff"/>'
                    f'<stop offset="0.35" stop-color="#e8fff0" stop-opacity="0.7"/><stop offset="1" stop-color="#2a8f4a" stop-opacity="0.35"/></radialGradient>')
        out.append(f'<circle cx="{x + 1.5:.1f}" cy="{y + 2:.1f}" r="{r:.1f}" fill="#063a24" opacity="0.18"/>'
                   f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{r:.1f}" fill="url(#{g_d})"/>'
                   f'<circle cx="{x - r * 0.35:.1f}" cy="{y - r * 0.35:.1f}" r="{r * 0.28:.1f}" fill="#fff"/>')
    return "".join(out)


def frond(defs, base, angle, length, leaflet, droop=0.35, haze=0.0, count=16):
    """A palm/fern frond: a curving rachis with paired narrow leaflets."""
    a = math.radians(angle)
    d = (math.cos(a), math.sin(a))
    p = (-d[1], d[0])
    side = 1 if p[1] >= 0 else -1
    path = []
    N = 30
    for i in range(N + 1):
        t = i / N
        bend = droop * length * t * t * side
        path.append((base[0] + d[0] * length * t + p[0] * bend, base[1] + d[1] * length * t + p[1] * bend))
    out = []
    for k in range(count):
        t = 0.1 + 0.88 * k / count
        i = int(t * N)
        x, y = path[i]
        tx, ty = path[min(i + 1, N)][0] - path[i - 1][0], path[min(i + 1, N)][1] - path[i - 1][1]
        ang = math.degrees(math.atan2(ty, tx))
        ll = leaflet * (1.0 - 0.6 * t) * (0.55 + 0.45 * math.sin(math.pi * min(t * 1.4, 1)))
        for s in (-1, 1):
            out.append(leaf(defs, (x, y), ang + s * 52, ll, ll * 0.17, droop=0.22, haze=haze,
                            shape=0.7, lite=(mix(mix("#7fd85e", "#2f9a48", t * 0.5), HAZE, haze),
                                             mix(mix("#1f7f3e", "#3c9c4a", t), HAZE, haze))))
    rc = mix("#6aa33a", HAZE, haze)
    out.append(f'<path d="{smooth_path(path, close=False)}" fill="none" stroke="{rc}" stroke-width="{max(length * 0.012, 2):.1f}" stroke-linecap="round"/>')
    return "".join(out)


def svg(w, h, defs, body):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}">'
            f'<defs>{"".join(defs)}</defs>{body}</svg>')


def write(name, s):
    with open(os.path.join(HERE, name), "w") as f:
        f.write(s)


def flipx(items, w):
    return [(kind, (w - b[0], b[1]), 180 - ang, *rest) for kind, b, ang, *rest in items]


def flipy(items, h):
    return [(kind, (b[0], h - b[1]), -ang, *rest) for kind, b, ang, *rest in items]


def render(items, defs):
    body = []
    for kind, b, ang, length, size, kw in items:
        if kind == "leaf":
            body.append(leaf(defs, b, ang, length, size, **kw))
        else:
            body.append(frond(defs, b, ang, length, size, **kw))
    return "".join(body)


# Corner cluster, authored for the top-left corner (leaves entering from off-canvas).
CORNER = [
    ("frond", (-30, -30), 58, 520, 150, dict(haze=0.35, droop=0.25)),
    ("frond", (-40, 30), 12, 500, 140, dict(haze=0.3, droop=0.3)),
    ("leaf", (-60, 200), 2, 400, 92, dict(haze=0.14, droop=0.3, split=5)),
    ("leaf", (-30, -50), 78, 380, 84, dict(haze=0.1, droop=0.18, split=4)),
    ("leaf", (-60, 20), 36, 440, 104, dict(droop=0.3, dew=True)),
    ("leaf", (-50, -40), 18, 320, 62, dict(droop=0.2)),
    ("leaf", (0, -60), 102, 290, 56, dict(droop=0.1, dew=True)),
]


def corner(name, fx, fy, w=520, h=520):
    defs = []
    items = CORNER
    if fy:
        items = flipy(items, h)
    if fx:
        items = flipx(items, w)
    write(name, svg(w, h, defs, render(items, defs)))


# A spray entering from the left edge at the waterline band.
EDGE = [
    ("frond", (-30, 250), -28, 300, 90, dict(haze=0.3, droop=0.3)),
    ("leaf", (-40, 300), -12, 280, 66, dict(haze=0.12, droop=0.3, split=4)),
    ("leaf", (-30, 230), -48, 230, 54, dict(droop=0.25, dew=True)),
    ("leaf", (-20, 330), 12, 200, 44, dict(droop=0.2)),
]


def edge(name, fx, w=340, h=360):
    defs = []
    items = flipx(EDGE, w) if fx else EDGE
    write(name, svg(w, h, defs, render(items, defs)))


def lily_pad(defs, cx, cy, r, haze=0.0, rot=0):
    g = gid("lp")
    ry = r * 0.36
    defs.append(f'<radialGradient id="{g}" cx="0.42" cy="0.3" r="0.75">'
                f'<stop offset="0" stop-color="{mix("#a6ea6e", HAZE, haze)}"/>'
                f'<stop offset="0.55" stop-color="{mix("#3fae4a", HAZE, haze)}"/>'
                f'<stop offset="1" stop-color="{mix("#13703a", HAZE, haze)}"/></radialGradient>')
    # notch: a wedge cut from the pad
    a0 = math.radians(rot - 14)
    a1 = math.radians(rot + 14)
    ring = []
    M = 40
    for i in range(M + 1):
        a = a1 + (2 * math.pi - (a1 - a0)) * i / M
        ring.append((cx + r * math.cos(a), cy + ry * math.sin(a)))
    d = f"M{cx:.1f},{cy:.1f} L" + " L".join(f"{x:.1f},{y:.1f}" for x, y in ring) + " Z"
    out = [f'<ellipse cx="{cx + 2:.1f}" cy="{cy + ry * 0.35:.1f}" rx="{r * 1.04:.1f}" ry="{ry * 1.05:.1f}" fill="#0a4f7a" opacity="0.28"/>',
           f'<path d="{d}" fill="url(#{g})"/>']
    for k in range(9):
        a = a1 + (2 * math.pi - (a1 - a0)) * (k + 0.5) / 9
        out.append(f'<line x1="{cx:.1f}" y1="{cy:.1f}" x2="{cx + r * 0.85 * math.cos(a):.1f}" y2="{cy + ry * 0.85 * math.sin(a):.1f}" '
                   f'stroke="#e6ffc0" stroke-width="0.8" opacity="0.35"/>')
    out.append(f'<path d="M{cx - r * 0.8:.1f},{cy - ry * 0.25:.1f} A{r * 0.85:.1f},{ry * 0.7:.1f} 0 0 1 {cx + r * 0.5:.1f},{cy - ry * 0.75:.1f}" '
               f'fill="none" stroke="#ffffff" stroke-width="1.6" opacity="0.6" stroke-linecap="round"/>')
    return "".join(out)


def blossom(defs, cx, cy, s, hue="pink"):
    pal = {"pink": ("#ffffff", "#ffc2dc", "#e2558f"), "white": ("#ffffff", "#f3f7ff", "#b9c8e6")}[hue]
    g = gid("bp")
    defs.append(f'<linearGradient id="{g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{pal[0]}"/>'
                f'<stop offset="0.6" stop-color="{pal[1]}"/><stop offset="1" stop-color="{pal[2]}"/></linearGradient>')
    out = [f'<ellipse cx="{cx:.1f}" cy="{cy + s * 0.25:.1f}" rx="{s * 1.1:.1f}" ry="{s * 0.3:.1f}" fill="#0a4f7a" opacity="0.22"/>']
    # back petals then front petals, a cup in three-quarter view
    for layer, (n, spread, ln, wd) in enumerate([(7, 150, 1.0, 0.34), (5, 110, 0.95, 0.36), (3, 60, 0.8, 0.38)]):
        for k in range(n):
            ang = -90 - spread / 2 + spread * k / (n - 1)
            a = math.radians(ang)
            L = s * ln
            tipx, tipy = cx + L * math.cos(a), cy + L * math.sin(a) * 0.95
            nx, ny = -math.sin(a), math.cos(a)
            w = s * wd
            mx, my = cx + L * 0.5 * math.cos(a), cy + L * 0.5 * math.sin(a)
            d = (f"M{cx:.1f},{cy:.1f} Q{mx + nx * w:.1f},{my + ny * w:.1f} {tipx:.1f},{tipy:.1f} "
                 f"Q{mx - nx * w:.1f},{my - ny * w:.1f} {cx:.1f},{cy:.1f} Z")
            out.append(f'<path d="{d}" fill="url(#{g})" stroke="{pal[2]}" stroke-width="0.5" stroke-opacity="0.4"/>')
    out.append(f'<ellipse cx="{cx:.1f}" cy="{cy - s * 0.12:.1f}" rx="{s * 0.2:.1f}" ry="{s * 0.1:.1f}" fill="#ffd23a"/>')
    out.append(f'<ellipse cx="{cx - s * 0.05:.1f}" cy="{cy - s * 0.15:.1f}" rx="{s * 0.08:.1f}" ry="{s * 0.04:.1f}" fill="#fff6c0"/>')
    return "".join(out)


def lilies():
    random.seed(7)
    W, H = 1100, 70
    defs, body = [], []
    clusters = [(90, 1.0), (430, 0.8), (700, 1.1), (980, 0.7)]
    for x0, sc in clusters:
        pads = []
        for k in range(random.randint(3, 5)):
            r = random.uniform(20, 34) * sc
            pads.append((x0 + random.uniform(-60, 60) * sc, random.uniform(26, 50), r))
        pads.sort(key=lambda t: t[1])
        for x, y, r in pads:
            body.append(lily_pad(defs, x, y, r, haze=0.05, rot=random.uniform(0, 360)))
        bx, by, br = pads[len(pads) // 2]
        body.append(blossom(defs, bx, by - 2, 13 * sc, hue="pink" if x0 % 2 == 0 else "white"))
        if sc > 0.9:
            bx, by, br = pads[-1]
            body.append(blossom(defs, bx + br * 0.3, by - 1, 9 * sc, hue="white"))
    write("lilies.svg", svg(W, H, defs, "".join(body)))


def blade_path(x, base, h, w, sway, seed):
    random.seed(seed)
    left, right = [], []
    N = 18
    for i in range(N + 1):
        t = i / N
        cx = x + sway * math.sin(t * math.pi * 1.2 + seed) * t
        y = base - h * t
        ww = w * (1 - t ** 3) * (0.8 + 0.2 * math.sin(t * 9 + seed))
        left.append((cx - ww, y))
        right.append((cx + ww, y))
    return smooth_path(left + right[::-1])


def kelp():
    random.seed(11)
    W, H = 760, 560
    defs = ['<linearGradient id="kg" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#2f6f3a"/>'
            '<stop offset="0.5" stop-color="#5aa344"/><stop offset="1" stop-color="#b6dd6a" stop-opacity="0.85"/></linearGradient>',
            '<linearGradient id="kgb" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#1f6a6e"/>'
            '<stop offset="1" stop-color="#6cc0a0" stop-opacity="0.6"/></linearGradient>',
            '<linearGradient id="kfade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/>'
            '<stop offset="0.25" stop-color="#fff" stop-opacity="1"/></linearGradient>',
            '<mask id="km"><rect width="100%" height="100%" fill="url(#kfade)"/></mask>']
    body = ['<g mask="url(#km)">']
    # far stalks (teal, hazy), then near stalks (golden-green) with blades
    for layer, (count, grad, op, hmin, hmax) in enumerate([(6, "kgb", 0.55, 280, 440), (5, "kg", 0.9, 360, 540)]):
        for k in range(count):
            x = (k + 0.5) * W / count + random.uniform(-40, 40)
            h = random.uniform(hmin, hmax)
            sway = random.uniform(-26, 26)
            stem = []
            for i in range(25):
                t = i / 24
                stem.append((x + sway * math.sin(t * math.pi * 1.2) * t, H - h * t))
            g = [f'<g opacity="{op}">',
                 f'<path d="{smooth_path(stem, close=False)}" fill="none" stroke="url(#{grad})" stroke-width="{3 if layer else 2}" stroke-linecap="round"/>']
            for j in range(3, 24, 2):
                t = j / 24
                sx, sy = stem[j]
                s = 1 if j % 4 == 1 else -1
                L = (64 + 44 * math.sin(math.pi * t)) * (0.8 if layer == 0 else 1)
                ang = math.radians(-90 + s * (16 + 14 * t))
                ex, ey = sx + L * math.cos(ang), sy + L * math.sin(ang)
                wv = L * 0.16
                nx, ny = -math.sin(ang), math.cos(ang)
                mx, my = (sx + ex) / 2, (sy + ey) / 2
                g.append(f'<path d="M{sx:.1f},{sy:.1f} Q{mx + nx * wv:.1f},{my + ny * wv:.1f} {ex:.1f},{ey:.1f} '
                         f'Q{mx - nx * wv * 0.6:.1f},{my - ny * wv * 0.6:.1f} {sx:.1f},{sy:.1f} Z" fill="url(#{grad})"/>')
                if layer:
                    g.append(f'<path d="M{sx:.1f},{sy:.1f} Q{mx + nx * wv * 0.4:.1f},{my + ny * wv * 0.4:.1f} {ex:.1f},{ey:.1f}" '
                             f'fill="none" stroke="#f0ffc8" stroke-width="0.9" opacity="0.45"/>')
                    if j % 6 == 3:
                        g.append(f'<circle cx="{sx:.1f}" cy="{sy:.1f}" r="3.4" fill="#c9b04a"/>'
                                 f'<circle cx="{sx - 1:.1f}" cy="{sy - 1.2:.1f}" r="1.1" fill="#fff8d0"/>')
            g.append("</g>")
            body.append("".join(g))
    body.append("</g>")
    write("kelp.svg", svg(W, H, defs, "".join(body)))


def seagrass():
    random.seed(23)
    W, H = 640, 220
    defs = ['<linearGradient id="sg" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#1d7a54"/>'
            '<stop offset="0.6" stop-color="#3fbf7a"/><stop offset="1" stop-color="#b4f2b0"/></linearGradient>',
            '<linearGradient id="sg2" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#1a6a74"/>'
            '<stop offset="1" stop-color="#7fd7c0" stop-opacity="0.8"/></linearGradient>']
    body = []
    for tuft in range(9):
        x0 = (tuft + 0.5) * W / 9 + random.uniform(-20, 20)
        for b in range(random.randint(4, 7)):
            x = x0 + random.uniform(-14, 14)
            h = random.uniform(80, 210)
            grad = "sg" if b % 3 else "sg2"
            body.append(f'<path d="{blade_path(x, H, h, random.uniform(2.6, 4.2), random.uniform(-30, 30), random.uniform(0, 6))}" '
                        f'fill="url(#{grad})" opacity="{random.uniform(0.7, 0.95):.2f}"/>')
    write("seagrass.svg", svg(W, H, defs, "".join(body)))


if __name__ == "__main__":
    corner("frame-tl.svg", False, False)
    corner("frame-tr.svg", True, False)
    corner("frame-bl.svg", False, True)
    corner("frame-br.svg", True, True)
    edge("frame-edge-l.svg", False)
    edge("frame-edge-r.svg", True)
    lilies()
    kelp()
    seagrass()
