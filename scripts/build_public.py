#!/usr/bin/env python3
"""Stage only public website files, never the source repository or server code."""
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "_site"
if OUT.exists():
    shutil.rmtree(OUT)
OUT.mkdir()
for suffix in ("*.html", "*.css", "*.js"):
    for file in sorted(ROOT.glob(suffix)):
        if file.is_file() and not file.is_symlink():
            shutil.copy2(file, OUT / file.name)
for name in ("CNAME", "robots.txt", "sitemap.xml"):
    shutil.copy2(ROOT / name, OUT / name)
assets = ROOT / "assets"
for file in assets.rglob("*"):
    if file.is_file() and not file.is_symlink() and file.suffix.lower() in {".png",".jpg",".jpeg",".webp",".gif",".svg",".ico",".woff",".woff2"}:
        target = OUT / file.relative_to(ROOT)
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(file, target)
(OUT / ".nojekyll").touch()
assert (OUT / "index.html").is_file()
assert not (OUT / "supabase").exists()
assert not (OUT / ".git").exists()
print("Public package:", len(list(OUT.glob("*.html"))), "HTML pages")
