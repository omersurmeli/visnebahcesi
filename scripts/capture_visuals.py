#!/usr/bin/env python3
"""Capture actual Chromium renderings of the staged public site. No user data or live APIs."""
import base64
import functools
import http.server
import io
import threading
from pathlib import Path

from PIL import Image, ImageDraw
from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT / "_site"
OUT = ROOT / "visual-review"
OUT.mkdir(exist_ok=True)
server = http.server.ThreadingHTTPServer(("127.0.0.1", 0), functools.partial(http.server.SimpleHTTPRequestHandler, directory=str(SITE)))
threading.Thread(target=server.serve_forever, daemon=True).start()
base = f"http://127.0.0.1:{server.server_port}"

def capture(browser, label, width, height):
    context = browser.new_context(viewport={"width": width, "height": height}, reduced_motion="reduce", device_scale_factor=1)
    context.route("**/*", lambda route: route.continue_() if route.request.url.startswith(base + "/") else route.abort())
    page = context.new_page()
    images = []
    targets = [
        ("home", "index.html", None),
        ("daily", "index.html", ".v3-daily-grid"),
        ("guides", "index.html", "#rehberler"),
        ("article", "budama.html", None),
        ("research", "arastirma-merkezi.html", None),
        ("workspace", "bahcem.html", "#yonetim"),
        ("telemetry", "akilli-bahce.html", "#sensor-panel"),
    ]
    for name, path, selector in targets:
        response = page.goto(base + "/" + path, wait_until="load")
        assert response and response.ok, path
        if selector:
            target = page.locator(selector)
            expect(target).to_be_visible()
            target.evaluate("(el)=>el.scrollIntoView({block:'start',behavior:'instant'})")
        page.evaluate("document.fonts.ready")
        # Force lazy loading of images in the viewport before capturing.
        page.evaluate("""async () => {const imgs=[...document.images].filter(i=>{const r=i.getBoundingClientRect();return r.bottom>0&&r.top<innerHeight;});await Promise.all(imgs.map(i=>{i.loading='eager';return i.decode().catch(()=>{});}));}""")
        page.wait_for_timeout(350)
        path = OUT / f"{label}-{name}.png"
        page.screenshot(path=str(path), animations="disabled")
        images.append((name, path))
        print(f"VISUAL CAPTURE {label} {name} {width}x{height}", flush=True)
    context.close()
    # A compact contact sheet for quick review, plus unscaled captures in the artifact.
    thumb_w = min(480, width)
    thumb_h = round(height * thumb_w / width)
    columns = 2
    canvas = Image.new("RGB", (columns * (thumb_w + 12) + 12, ((len(images)+1)//2) * (thumb_h+30)+12), "#f0f0eb")
    draw = ImageDraw.Draw(canvas)
    for i, (name, path) in enumerate(images):
        with Image.open(path) as im:
            im = im.convert("RGB").resize((thumb_w, thumb_h), Image.Resampling.LANCZOS)
            x = 12 + (i%columns)*(thumb_w+12)
            y = 12 + (i//columns)*(thumb_h+30)
            draw.text((x,y), f"{label} / {name}", fill="#222222")
            canvas.paste(im,(x,y+18))
    canvas.save(OUT / f"{label}-contact.jpg", quality=85)
    # Small, reproducible preview in public CI logs; no secrets or real records.
    canvas.thumbnail((900, 1800))
    buf = io.BytesIO()
    canvas.save(buf, format="JPEG", quality=48, optimize=True)
    data = base64.b64encode(buf.getvalue()).decode("ascii")
    for i in range(0, len(data), 1800):
        print(f"VISUAL_PREVIEW:{label}:{i//1800:04d}:{data[i:i+1800]}", flush=True)

try:
    with sync_playwright() as p:
        browser = p.chromium.launch()
        for dims in (("desktop",1440,900),("tablet",768,1024),("mobile",390,844)):
            capture(browser,*dims)
        browser.close()
finally:
    server.shutdown()
