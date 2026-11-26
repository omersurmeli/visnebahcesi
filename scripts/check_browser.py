#!/usr/bin/env python3
"""Chromium smoke tests against the staged site; no live credentials or external APIs."""
import functools
import http.server
import threading
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT / "_site"
server = http.server.ThreadingHTTPServer(("127.0.0.1", 0), functools.partial(http.server.SimpleHTTPRequestHandler, directory=str(SITE)))
threading.Thread(target=server.serve_forever, daemon=True).start()
base = "http://127.0.0.1:" + str(server.server_port)

def run(browser, width, height):
    context = browser.new_context(viewport={"width": width, "height": height}, accept_downloads=True)
    # Offline dependencies: only same-origin website requests are allowed.
    context.route("**/*", lambda route: route.continue_() if route.request.url.startswith(base + "/") else route.abort())
    page = context.new_page()
    errors = []
    page.on("pageerror", lambda error: errors.append(str(error)))
    def visit(name):
        response = page.goto(base + "/" + name, wait_until="load")
        assert response and response.ok, name
    for file in sorted(SITE.glob("*.html")):
        visit(file.name)
        expect(page.locator("h1")).to_have_count(1)
        assert page.evaluate("document.querySelector('script[src=\"script.js\"]') !== null"), file.name
    visit("index.html")
    expect(page.locator(".home-quick-links a")).to_have_count(6)
    expect(page.locator(".guide-grid-four .guide-card-image")).to_have_count(4)
    assert page.locator(".v28-hero-img").evaluate("(el) => el.complete && el.naturalWidth > 0"), "Hero image missing"
    for image in page.locator(".guide-grid-four img").all():
        image.scroll_into_view_if_needed()
        expect(image).to_be_visible()
        page.wait_for_function("(el) => el.complete && el.naturalWidth > 0", arg=image.element_handle())
    assert page.evaluate("document.documentElement.scrollWidth <= innerWidth + 2"), "Home horizontal overflow"
    visit("budama.html")
    expect(page.locator(".v28-article-figure img")).to_be_visible()
    assert page.evaluate("document.documentElement.scrollWidth <= innerWidth + 2"), "Article horizontal overflow"
    if width < 800:
        page.locator(".menu-button").click()
        expect(page.locator("#site-nav a[href='arastirma-merkezi.html']")).to_be_visible()
        page.locator(".menu-button").click()
    visit("bilimsel-kaynaklar.html")
    expect(page.locator("[data-source]")).to_have_count(83)
    page.locator("#source-search").fill("K-083")
    expect(page.locator("#K-083")).to_be_visible()
    page.locator("#source-search").fill("zzzz-no-match-2027")
    expect(page.locator("#source-count")).to_have_text("0 kayıt")
    visit("haftalik-visne-bakim-programi.html")
    expect(page.locator("[data-week]")).to_have_count(52)
    page.locator("#week-filter").select_option("07")
    assert page.locator("[data-week]:visible").count() > 0
    assert page.locator('[data-week]:visible:not([data-month="07"])').count() == 0
    visit("araclar.html")
    frost = page.locator('form[data-v21="frost"]')
    frost.locator('[name="n"]').fill("100")
    frost.locator('[name="d"]').fill("25")
    frost.locator('button[type="submit"]').click()
    expect(frost.locator("output")).to_contain_text("25 %")
    frost.locator('[name="d"]').fill("101")
    frost.locator('button[type="submit"]').click()
    expect(frost.locator("output")).to_contain_text("aşamaz")
    expect(page.locator('form[data-v21="jam"] output')).to_contain_text("348")
    expect(page.locator('form[data-v21="profit"] output')).to_contain_text("70.000")
    visit("akilli-bahce.html")
    expect(page.locator("#tm-status")).to_contain_text("DEMO")
    expect(page.locator(".tm-card")).to_have_count(13)
    expect(page.locator("#tm-chart svg")).to_have_count(1)
    visit("bahcem.html")
    expect(page.locator("#bc-state")).to_contain_text("kapalı")
    expect(page.locator("#bs-state")).to_contain_text("kapalı")
    expect(page.locator("#tm-refresh")).to_be_disabled()
    expect(page.locator("#bp-view form")).to_have_count(1)
    page.locator('#bp-view input[name="code"]').fill("TEST-01")
    page.locator('#bp-view input[name="block"]').fill("Test")
    page.locator('#bp-view button[type="submit"]').click()
    expect(page.locator("#bp-view tbody")).to_contain_text("TEST-01")
    page.reload(wait_until="load")
    expect(page.locator("#bp-view tbody")).to_contain_text("TEST-01")
    page.locator('[data-bp-tab="tasks"]').click()
    expect(page.locator("#bp-view tbody tr")).to_have_count(52)
    page.locator('[data-bp-tab="stock"]').click()
    page.locator('#bp-view input[name="code"]').fill("TEST-STOK")
    page.locator('#bp-view input[name="name"]').fill("Test ürün")
    page.locator('#bp-view input[name="open"]').fill("10")
    page.locator('#bp-view button[type="submit"]').click()
    expect(page.locator("#bp-view tbody").first).to_contain_text("TEST-STOK")
    page.locator('[data-bp-tab="ledger"]').click()
    page.locator('#bp-view input[name="date"]').fill("2027-07-01")
    page.locator('#bp-view select[name="type"]').select_option("Satış")
    page.locator('#bp-view input[name="qty"]').fill("100")
    page.locator('#bp-view select[name="unit"]').select_option("kg")
    page.locator('#bp-view input[name="price"]').fill("30")
    page.locator('#bp-view input[name="paid"]').fill("2000")
    page.locator('#bp-view textarea[name="note"]').fill("Test satış")
    page.locator('#bp-view button[type="submit"]').click()
    expect(page.locator("#bp-metrics")).to_contain_text("3.000 TL")
    page.locator('[data-bp-tab="reports"]').click()
    with page.expect_download() as download:
        page.get_by_role("button", name="Panel yedeği (JSON)").click()
    assert download.value.suggested_filename.endswith(".json")
    visit("index.html")
    protected = page.evaluate("!document.body.dispatchEvent(new Event('copy',{bubbles:true,cancelable:true}))")
    assert protected, "Public copy protection missing"
    visit("araclar.html")
    allowed = page.locator('form[data-v21="frost"] input[name="n"]').evaluate("(el)=>el.dispatchEvent(new Event('paste',{bubbles:true,cancelable:true}))")
    assert allowed, "Input paste blocked"
    if width < 800:
        visit("index.html")
        page.locator(".menu-button").click()
        expect(page.locator("#site-nav")).to_have_class(__import__("re").compile(r"\bopen\b"))
    assert not errors, errors
    context.close()
    print("Browser smoke PASS", width, height)

try:
    with sync_playwright() as p:
        browser = p.chromium.launch()
        for dims in ((1440,900),(390,844)):
            run(browser,*dims)
        browser.close()
finally:
    server.shutdown()
