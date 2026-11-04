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
 ("societies","societies.html","Societies","Society & Bulk Car Wash Bookings — Vroombrite Mumbai","Doorstep car and bike wash for whole housing societies in Mumbai. Group pricing for 10+ vehicles and fixed weekly wash days."),
 ("gallery","gallery.html",None,"Gallery — Vroombrite","Before and after, foam, rinse and shine. See what a Vroombrite wash looks like."),
 ("contact","contact.html","Contact","Contact & Service Areas — Vroombrite Mumbai","Call or WhatsApp Vroombrite. Check if we cover your PIN code in Mumbai."),
 ("book","book.html","Book Now","Book a Doorstep Wash — Vroombrite","Book a doorstep car or bike wash in three quick steps."),
 ("privacy","privacy.html",None,"Privacy Policy — Vroombrite","How Vroombrite collects, uses and protects your personal information."),
 ("terms","terms.html",None,"Terms of Service — Vroombrite","The terms for booking a doorstep car or bike wash with Vroombrite."),
 ("refunds","refunds.html",None,"Cancellation & Refund Policy — Vroombrite","Rescheduling, cancellation and refund rules for Vroombrite bookings and monthly plans."),
 ("review","review.html",None,"Rate Your Wash — Vroombrite","Tell us how your Vroombrite wash went."),
 ("ops","ops.html",None,"Staff — Vroombrite","Vroombrite staff app."),
]
import json, datetime
AREAS = json.load(open(os.path.join(SRC, "areas.json"), encoding="utf-8"))
AREA_BY = {x["slug"]: x for x in AREAS}
for x in AREAS:
    PAGES.append(("wash-"+x["slug"], "doorstep-car-wash-"+x["slug"]+".html", None,
                  f"Doorstep Car & Bike Wash in {x['a']} — Vroombrite",
                  f"Doorstep car and bike wash in {x['a']}, Mumbai (PIN {', '.join(x['pins'])}). We come to your society parking with our own water and power. Book in a minute."))
FILE = {p[0]: p[1] for p in PAGES}
BARE = {"ops"}                       # no site header/footer, not indexed
NOINDEX = {"ops", "review"}
PREVIEW_SKIP = {"ops"}

# Public address of the site. Change this one line when the custom domain goes live.
SITE_URL = "https://littlegasp.github.io/vroombrite/"
# Share-card image per page (1200x630 in img/); pages not listed use the home card.
OG_IMG = {"car-wash": "og-car.jpg", "bike-wash": "og-bike.jpg", "detailing": "og-detail.jpg", "subscription": "og-plans.jpg"}
OG_ALT = "Vroombrite — doorstep car & bike wash in Mumbai"

def share_tags(slug, fname, title, desc):
    url = SITE_URL if fname == "index.html" else SITE_URL + fname
    img = SITE_URL + "img/" + OG_IMG.get(slug, "og-home.jpg")
    return f'''<link rel="canonical" href="{url}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Vroombrite">
<meta property="og:locale" content="en_IN">
<meta property="og:url" content="{url}">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:image" content="{img}">
<meta property="og:image:secure_url" content="{img}">
<meta property="og:image:type" content="image/jpeg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="{OG_ALT}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{title}">
<meta name="twitter:description" content="{desc}">
<meta name="twitter:image" content="{img}">'''

def links(html, preview):
    return re.sub(r"@@([a-z-]+)@@", lambda m: ("#"+m.group(1)) if preview else FILE[m.group(1)], html)

CTA = open(os.path.join(SRC, "pages", "_cta.txt"), encoding="utf-8").read()
AREA_TPL = open(os.path.join(SRC, "pages", "_area.html"), encoding="utf-8").read()
def page_src(slug):
    if slug.startswith("wash-"):
        x = AREA_BY[slug[5:]]
        near = [AREA_BY[n] for n in x["near"] if n in AREA_BY]
        t = AREA_TPL
        for k, v in {"AREA": x["a"], "SLUG": x["slug"], "PINS": ", ".join(x["pins"]), "PIN1": x["pins"][0],
                     "PINCHIPS": "".join(f"<span>PIN {p}</span>" for p in x["pins"]),
                     "NEARLINKS": ", ".join(f'<a href="@@wash-{n["slug"]}@@" style="text-decoration:underline">{n["a"]}</a>' for n in near)}.items():
            t = t.replace("{{"+k+"}}", v)
        return t.replace("@@CTA@@", CTA)
    return open(os.path.join(SRC, "pages", slug + ".html"), encoding="utf-8").read().replace("@@CTA@@", CTA)

def app_js():
    js = open(os.path.join(SRC, "app.js"), encoding="utf-8").read()
    return js.replace("/*@@AREAS@@*/[]", json.dumps([{"a": x["a"], "slug": x["slug"], "pins": x["pins"]} for x in AREAS], ensure_ascii=False))

def jsonld(slug):
    if not (slug == "home" or slug == "contact" or slug.startswith("wash-")): return ""
    served = [AREA_BY[slug[5:]]["a"]] if slug.startswith("wash-") else [x["a"] for x in AREAS]
    d = {"@context": "https://schema.org", "@type": "AutoWash", "name": "Vroombrite", "url": SITE_URL,
         "image": SITE_URL + "img/og-home.jpg", "logo": SITE_URL + "apple-touch-icon.png", "telephone": "+91-77189-84191",
         "description": "Doorstep car and bike wash and detailing. We come to your society parking with our own water and power.",
         "address": {"@type": "PostalAddress", "addressLocality": "Mumbai", "addressRegion": "Maharashtra", "addressCountry": "IN"},
         "areaServed": [{"@type": "Place", "name": a + ", Mumbai"} for a in served],
         "openingHoursSpecification": [{"@type": "OpeningHoursSpecification", "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"], "opens": "06:00", "closes": "20:00"}],
         "paymentAccepted": "Cash, UPI"}
    return '<script type="application/ld+json">' + json.dumps(d, ensure_ascii=False) + '</script>\n' 

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
    <div><h4>COMPANY</h4><div class="fl"><a href="@@societies@@">Society bookings</a><a href="@@gallery@@">Gallery</a><a href="@@contact@@">Contact &amp; areas</a><a href="@@book@@">Book a wash</a></div></div>
    <div><h4>CONTACT</h4><div class="fl"><span data-num></span><a data-wa href="#">WhatsApp us</a><span>Andheri · Powai · Chandivali and nearby</span></div></div>
    <div class="legal"><span>© 2026 Vroombrite · Prices shown are launch prices and may change.</span><span class="ll"><a href="@@privacy@@">Privacy</a><a href="@@terms@@">Terms</a><a href="@@refunds@@">Cancellation &amp; refunds</a></span></div>
  </div>
  <div class="giant" aria-hidden="true">VROOM<span>BRITE</span></div>
</footer>
<a class="btn btn-wa fab" id="fab" data-wa href="#">WhatsApp</a>'''

FONTS = '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Montserrat:ital,wght@0,600;0,700;0,800;1,800;1,900&display=swap">'

def build_site():
    if os.path.exists(SITE):
        for f in os.listdir(SITE):
            if f.endswith(".html") or f in ("style.css","app.js","ops.js","sitemap.xml","robots.txt"): os.remove(os.path.join(SITE, f))
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
{share_tags(slug, fname, title, desc)}
{'<meta name="robots" content="noindex">' if slug in NOINDEX else ''}
{jsonld(slug)}<meta name="theme-color" content="#15191C">
<link rel="icon" href="favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="apple-touch-icon.png">
{FONTS}
<link rel="stylesheet" href="style.css">
</head>
<body data-page="{slug}">
{'' if slug in BARE else nav()}
<main>
{body}
</main>
{'' if slug in BARE else FOOTER}
<script src="app.js"></script>{'<script src="ops.js"></script>' if slug == "ops" else ''}
</body>
</html>
'''
        open(os.path.join(SITE, fname), "w", encoding="utf-8").write(links(html, False))
    shutil.copy(os.path.join(SRC,"style.css"), SITE); open(os.path.join(SITE,"app.js"),"w",encoding="utf-8").write(app_js()); shutil.copy(os.path.join(SRC,"ops.js"), SITE); shutil.copy(os.path.join(SRC,"favicon.svg"), SITE); shutil.copy(os.path.join(SRC,"apple-touch-icon.png"), SITE)

def build_seo():
    today = datetime.date.today().isoformat()
    urls = [SITE_URL if f == "index.html" else SITE_URL + f for s_, f, *_ in PAGES if s_ not in NOINDEX]
    xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + "".join(f"  <url><loc>{u}</loc><lastmod>{today}</lastmod></url>\n" for u in urls) + "</urlset>\n"
    open(os.path.join(SITE, "sitemap.xml"), "w").write(xml)
    open(os.path.join(SITE, "robots.txt"), "w").write(f"User-agent: *\nAllow: /\nDisallow: /ops.html\n\nSitemap: {SITE_URL}sitemap.xml\n")

def build_preview():
    os.makedirs(PREV, exist_ok=True)
    views = "\n".join(f'<div class="view" id="v-{s}"{" hidden" if s!="home" else ""}>\n{page_src(s)}\n</div>' for s, *_ in PAGES if s not in PREVIEW_SKIP)
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
    shutil.copy(os.path.join(SRC,"style.css"), PREV); open(os.path.join(PREV,"app.js"),"w",encoding="utf-8").write(app_js())
    if os.path.exists(os.path.join(PREV,"img")): shutil.rmtree(os.path.join(PREV,"img"))
    shutil.copytree(os.path.join(SITE,"img"), os.path.join(PREV,"img"))

build_site(); build_seo(); build_preview(); print("built", len(PAGES), "pages")
