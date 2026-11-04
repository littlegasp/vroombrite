"""Builds the Vroombrite site from one set of page sources.
   repo root -> multi-page static site served by GitHub Pages
   preview/  -> single-page version (hash routing) for the Claude artifact preview
"""
import os, re, shutil
SRC = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(SRC)
SITE, PREV = ROOT, os.path.join(ROOT, "preview")   # site files live at the repo root (GitHub Pages); preview/ is git-ignored

PAGES = [  # slug, file, nav label, <title>, meta description
 ("home","index.html",None,"Vroombrite — Doorstep Car & Bike Wash in Mumbai","Doorstep car and bike wash in Mumbai. We bring our own water and power to your society parking. Book online in a minute."),
 ("car-wash","car-wash.html","Car Wash","Car Wash at Your Doorstep — Vroombrite Mumbai","Doorstep car wash packages for hatchbacks, sedans and SUVs in Andheri, Powai and nearby. Fixed prices, own water and power."),
 ("bike-wash","bike-wash.html","Bike Wash","Bike Wash at Your Doorstep — Vroombrite Mumbai","Doorstep bike and scooter wash with foam, chain clean and lube. Andheri, Powai and nearby Mumbai suburbs."),
 ("detailing","detailing.html","Detailing","Car Detailing at Home — Vroombrite Mumbai","Interior deep clean, paint polish, ceramic sealant, engine bay and headlight restoration at your parking in Mumbai."),
 ("subscription","subscription.html","Subscription","Monthly Car & Bike Wash Plans — Vroombrite","Monthly doorstep wash plans for cars and bikes in Mumbai. Fixed weekday slot, same washer, lower price per wash."),
 ("gallery","gallery.html","Gallery","Gallery — Vroombrite","Before and after, foam, rinse and shine. See what a Vroombrite wash looks like."),
 ("contact","contact.html","Contact","Contact & Service Areas — Vroombrite Mumbai","Call or WhatsApp Vroombrite. Check if we cover your PIN code in Mumbai."),
 ("book","book.html","Book Now","Book a Doorstep Wash — Vroombrite","Book a doorstep car or bike wash in three quick steps."),
]
FILE = {p[0]: p[1] for p in PAGES}

def links(html, preview):
    return re.sub(r"@@([a-z-]+)@@", lambda m: ("#"+m.group(1)) if preview else FILE[m.group(1)], html)

CTA = open(os.path.join(SRC, "pages", "_cta.txt"), encoding="utf-8").read()
def page_src(slug):
    return open(os.path.join(SRC, "pages", slug + ".html"), encoding="utf-8").read().replace("@@CTA@@", CTA)

def nav():
    items = "".join(
        f'<a class="btn" href="@@{s}@@" data-nav="{s}">{lbl} <span class="arrow">↗</span></a>' if s == "book"
        else f'<a href="@@{s}@@" data-nav="{s}">{lbl}</a>'
        for s, f, lbl, *_ in PAGES if lbl)
    return f'''<header class="nav gut"><div class="wrap">
  <a class="brand" href="@@home@@" aria-label="Vroombrite home"><svg class="vicon" viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" rx="14" fill="#C9F36A"/><path d="M19 17h10l5 18 9-18h10L38 48H28z" fill="#15191C"/><path d="M7 22h11l-1.6 4H5.4zM5 30h10l-1.6 4H3.4zM7 38h8l-1.6 4H5.4z" fill="#15191C"/><path d="M52 6l1.6 4.4L58 12l-4.4 1.6L52 18l-1.6-4.4L46 12l4.4-1.6z" fill="#15191C"/></svg><span class="wm"><b>VROOM<i>BRITE</i></b><small>DOORSTEP CAR &amp; BIKE CARE</small></span></a>
  <button class="burger" id="burger" aria-label="Open menu" aria-expanded="false" aria-controls="links"><span></span><span></span><span></span></button>
  <nav class="links" id="links">{items}</nav>
</div></header>'''

FOOTER = '''<footer class="gut">
  <div class="wrap">
    <div><a class="brand" href="@@home@@" aria-label="Vroombrite home"><svg class="vicon" viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" rx="14" fill="#C9F36A"/><path d="M19 17h10l5 18 9-18h10L38 48H28z" fill="#15191C"/><path d="M7 22h11l-1.6 4H5.4zM5 30h10l-1.6 4H3.4zM7 38h8l-1.6 4H5.4z" fill="#15191C"/><path d="M52 6l1.6 4.4L58 12l-4.4 1.6L52 18l-1.6-4.4L46 12l4.4-1.6z" fill="#15191C"/></svg><span class="wm"><b>VROOM<i>BRITE</i></b><small>DOORSTEP CAR &amp; BIKE CARE</small></span></a>
      <p style="color:var(--muted);margin-top:16px;max-width:34ch">Doorstep car and bike wash for Mumbai's housing societies. Open daily, 6 AM to 8 PM.</p></div>
    <div><h4>SERVICES</h4><div class="fl"><a href="@@car-wash@@">Car wash</a><a href="@@bike-wash@@">Bike wash</a><a href="@@detailing@@">Detailing</a><a href="@@subscription@@">Monthly plans</a></div></div>
    <div><h4>COMPANY</h4><div class="fl"><a href="@@gallery@@">Gallery</a><a href="@@contact@@">Contact &amp; areas</a><a href="@@book@@">Book a wash</a></div></div>
    <div><h4>CONTACT</h4><div class="fl"><span data-num></span><a data-wa href="#">WhatsApp us</a><span>Andheri · Powai · Chandivali and nearby</span></div></div>
    <div class="legal"><span>© 2026 Vroombrite</span><span>Prices shown are launch prices and may change.</span></div>
  </div>
  <div class="giant" aria-hidden="true">VROOM<span>BRITE</span></div>
</footer>
<a class="btn btn-wa fab" id="fab" data-wa href="#">WhatsApp</a>'''

FONTS = '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Montserrat:ital,wght@0,600;0,700;0,800;1,800;1,900&display=swap">'

def build_site():
    if os.path.exists(SITE):
        for f in os.listdir(SITE):
            if f.endswith(".html") or f in ("style.css","app.js"): os.remove(os.path.join(SITE, f))
    os.makedirs(os.path.join(SITE,"img"), exist_ok=True)
    for slug, fname, lbl, title, desc in PAGES:
        body = page_src(slug)
        html = f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta property="og:title" content="{title}"><meta property="og:description" content="{desc}"><meta property="og:image" content="img/shine.jpg">
<meta name="theme-color" content="#15191C">
<link rel="icon" href="favicon.svg" type="image/svg+xml">
{FONTS}
<link rel="stylesheet" href="style.css">
</head>
<body data-page="{slug}">
{nav()}
<main>
{body}
</main>
{FOOTER}
<script src="app.js"></script>
</body>
</html>
'''
        open(os.path.join(SITE, fname), "w", encoding="utf-8").write(links(html, False))
    shutil.copy(os.path.join(SRC,"style.css"), SITE); shutil.copy(os.path.join(SRC,"app.js"), SITE); shutil.copy(os.path.join(SRC,"favicon.svg"), SITE)

def build_preview():
    os.makedirs(PREV, exist_ok=True)
    views = "\n".join(f'<div class="view" id="v-{s}"{" hidden" if s!="home" else ""}>\n{page_src(s)}\n</div>' for s, *_ in PAGES)
    html = f'''<title>Vroombrite</title>
<meta name="claude:viewport-fit-sides" content="cover">
{FONTS}
<link rel="stylesheet" href="style.css">
{nav()}
<main>
{views}
</main>
{FOOTER}
<script src="app.js"></script>
'''
    open(os.path.join(PREV,"index.html"),"w",encoding="utf-8").write(links(html, True))
    shutil.copy(os.path.join(SRC,"style.css"), PREV); shutil.copy(os.path.join(SRC,"app.js"), PREV)
    if os.path.exists(os.path.join(PREV,"img")): shutil.rmtree(os.path.join(PREV,"img"))
    shutil.copytree(os.path.join(SITE,"img"), os.path.join(PREV,"img"))

build_site(); build_preview(); print("built")
