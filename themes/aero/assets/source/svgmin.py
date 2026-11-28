"""Minify a generated SVG: drop comments and whitespace between tags,
round numbers to one decimal (two below 10, for opacities and offsets)."""
import re, sys
def num(m):
    s = m.group(0)
    v = float(s)
    d = 2 if abs(v) < 10 else 1
    r = f"{v:.{d}f}".rstrip("0").rstrip(".")
    if r in ("-0", ""): r = "0"
    if r.startswith("0.") : r = r[1:]
    elif r.startswith("-0."): r = "-" + r[2:]
    return r
src, dst = sys.argv[1], sys.argv[2]
t = open(src).read()
t = re.sub(r"<!--.*?-->", "", t, flags=re.S)
t = re.sub(r">\s+<", "><", t).strip()
# numbers inside attribute values only (not ids/colours)
def attr(m):
    name, val = m.group(1), m.group(2)
    if name in ("id", "href", "xlink:href", "class") or val.startswith("#") or "url(" in val and "," not in val:
        return m.group(0)
    val = re.sub(r"(?<![#\w])-?\d*\.\d+(?:e-?\d+)?", num, val)
    return f'{name}="{val}"'
t = re.sub(r'([\w:-]+)="([^"]*)"', attr, t)
t = re.sub(r"\s{2,}", " ", t)
open(dst, "w").write(t)
