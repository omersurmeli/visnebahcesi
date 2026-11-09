#!/usr/bin/env python3
"""Validate SEO metadata, sitemap and local links before GitHub Pages deployment."""
import json
import sys
import xml.etree.ElementTree as ET
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse, unquote

ROOT = Path(__file__).resolve().parents[1]
BASE = "https://visnebahcesi.com/"
HOST = "visnebahcesi.com"
issues = []

class Page(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.lang = ""
        self.title = ""
        self.in_title = False
        self.h1s = 0
        self.meta = {}
        self.canonical = ""
        self.refs = []
        self.jsonld = []
        self.in_jsonld = False
        self.parts = []

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == "html":
            self.lang = a.get("lang", "")
        if tag == "title":
            self.in_title = True
        if tag == "h1":
            self.h1s += 1
        if tag == "meta":
            k = (a.get("property") or a.get("name") or "").lower()
            if k:
                self.meta[k] = a.get("content", "")
        if tag == "link" and "canonical" in (a.get("rel") or "").lower().split():
            self.canonical = a.get("href", "")
        if tag in ("a", "img", "link", "script"):
            key = "src" if tag in ("img", "script") else "href"
            if a.get(key):
                self.refs.append((tag, a[key]))
        if tag == "script" and a.get("type", "").lower() == "application/ld+json":
            self.in_jsonld = True
            self.parts = []

    def handle_data(self, data):
        if self.in_title:
            self.title += data
        if self.in_jsonld:
            self.parts.append(data)

    def handle_endtag(self, tag):
        if tag == "title":
            self.in_title = False
        if tag == "script" and self.in_jsonld:
            self.jsonld.append("".join(self.parts))
            self.in_jsonld = False

def local_path(url):
    p = urlparse(url)
    if p.scheme and p.scheme not in ("http", "https"):
        return None
    if p.netloc and p.hostname not in (HOST, "www." + HOST):
        return None
    if not p.path:
        return None
    rel = unquote(p.path).lstrip("/")
    if not rel or rel.endswith("/"):
        rel += "index.html"
    if ".." in Path(rel).parts:
        return "__unsafe_path__"
    return rel

def main():
    sitemap_file = ROOT / "sitemap.xml"
    try:
        tree = ET.parse(sitemap_file)
        urls = [e.text.strip() for e in tree.findall(".//{*}loc") if e.text]
    except (OSError, ET.ParseError) as e:
        print("Invalid sitemap.xml:", e)
        return 1
    listed = set(urls)
    if len(urls) != len(listed):
        issues.append("Duplicate sitemap URLs")
    for u in urls:
        rel = local_path(u)
        if not u.startswith(BASE) or not rel or not (ROOT / rel).is_file():
            issues.append("Invalid sitemap URL: " + u)

    pages = sorted(ROOT.glob("*.html"))
    for file in pages:
        p = Page()
        p.feed(file.read_text(encoding="utf-8"))
        p.close()
        expected = BASE if file.name == "index.html" else BASE + file.name
        def bad(detail):
            issues.append(file.name + ": " + detail)
        if not p.lang.lower().startswith("tr"):
            bad("missing Turkish html language")
        if not p.title.strip() or p.h1s != 1:
            bad("missing title or exactly one H1")
        description = p.meta.get("description", "")
        if not (80 <= len(description) <= 175):
            bad("meta description absent/too short/too long: " + str(len(description)))
        if p.canonical != expected or p.meta.get("og:url") != expected:
            bad("canonical/og:url mismatch")
        if expected not in listed:
            bad("missing from sitemap")
        for field in ("og:title", "og:description", "og:image", "twitter:card", "twitter:image"):
            if not p.meta.get(field):
                bad("missing " + field)
        if file.name != "index.html" and not any(
            tag == "a" and local_path(url) == "index.html" for tag, url in p.refs
        ):
            bad("no link to home page")
        for tag, url in p.refs:
            rel = local_path(url)
            if rel and not (ROOT / rel).is_file():
                bad("broken local " + tag + " reference: " + url)
        for field in ("og:image", "twitter:image"):
            image_url = p.meta.get(field, "")
            rel = local_path(image_url)
            if image_url and (not rel or not (ROOT / rel).is_file()):
                bad("broken social image: " + image_url)
        types_found = set()
        for block in p.jsonld:
            try:
                schema = json.loads(block)
                nodes = schema.get("@graph", [schema])
                for node in nodes:
                    kind = node.get("@type", "")
                    types_found.add(kind)
                    if kind == "Article":
                        for prop in ("headline", "image", "author", "publisher", "mainEntityOfPage"):
                            if not node.get(prop):
                                bad("Article schema missing " + prop)
                        if node.get("publisher", {}).get("@id") != BASE + "#organization":
                            bad("Article schema publisher is not linked to Organization")
                    if kind == "Organization" and not node.get("description"):
                        bad("Organization schema description missing")
            except (json.JSONDecodeError, AttributeError, TypeError) as error:
                bad("invalid JSON-LD: " + str(error))
        if p.meta.get("og:type") == "article" and "Article" not in types_found:
            bad("article page has no Article schema")
        if file.name == "index.html" and "Organization" not in types_found:
            bad("home page missing Organization schema")
    robots = ROOT / "robots.txt"
    if not robots.is_file() or "Sitemap: " + BASE + "sitemap.xml" not in robots.read_text(encoding="utf-8"):
        issues.append("robots.txt sitemap declaration missing")
    if len(pages) != len(urls):
        issues.append("Page/sitemap entry count mismatch")
    for item in issues:
        print("SEO ERROR:", item)
    if issues:
        print(str(len(issues)) + " issues found.")
        return 1
    print("SEO PASS:", len(pages), "pages,", len(urls), "sitemap URLs; canonical, OG, JSON-LD and local links validated.")
    return 0

if __name__ == "__main__":
    sys.exit(main())
