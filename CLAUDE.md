# Vroombrite — project notes

Website for **Vroombrite**, a doorstep car and bike wash/detailing business in Mumbai run by Aniket Gurav. "Vroombrite" is the working brand name. The repo lives on the `littlegasp` GitHub account for now and will be transferred to the brand's own account later.

## Stack
- Plain static HTML/CSS/JS, deployed with GitHub Pages from the root of `main`. `.nojekyll` is present. No framework; this was chosen over Next.js.
- Bookings are saved to a Google Sheet through a Google Apps Script web app (`google-apps-script/Code.gs`), and the customer is also handed off to WhatsApp with the booking prefilled.

## How the files fit
- **Edit sources in `src/`**, then run `python3 src/build.py`.
  - `src/pages/<slug>.html`: the body of each page. `@@slug@@` tokens become links. `@@CTA@@` inserts `src/pages/_cta.txt`.
  - `src/build.py`: page list, titles, meta descriptions, the shared header and footer (logo markup lives here).
  - `src/style.css` and `src/app.js` are copied to the root on build.
- The build writes the root pages (`index`, `car-wash`, `bike-wash`, `detailing`, `subscription`, `societies`, `gallery`, `contact`, `book`, `review`, `ops`, the policy pages `privacy`, `terms`, `refunds`, and one `doorstep-car-wash-<area>.html` landing page per service area) plus `sitemap.xml`, `robots.txt` and `preview/index.html`.
- **Service areas live in `src/areas.json`** (name, slug, PINs, nearby areas). The build injects them into `app.js` (PIN check, area chips) and generates the area pages from `src/pages/_area.html`. To add an area, add it there and rebuild.
- `ops.html` + `src/ops.js` is the **staff app** (no site header, `noindex`, blocked in robots.txt). Sign-in uses PINs stored in the Apps Script's Script Properties (Sheet → Vroombrite menu → Set staff PINs). The owner PIN sees Jobs, Dashboard, Due and Societies; the washer PIN sees Jobs only. Job cards have one-tap WhatsApp messages (confirm, reminder, on my way, review request) and buttons for done, paid (UPI/cash), cancel and use referral credit.
- `review.html?b=<booking ID>` is the customer feedback form. Reviews go to the Sheet's Reviews tab and appear on Home and Gallery only after **Approved** is ticked. The preview is a single-page, hash-routed copy used for Claude artifact previews and is git-ignored.
- Share previews (WhatsApp/Instagram/Facebook): every page has absolute Open Graph and Twitter tags built from `SITE_URL` in `src/build.py`, which must be updated when the custom domain goes live. Cards are `img/og-*.jpg` (1200×630; home, car, bike, detail, plans), and `OG_IMG` maps pages to cards. To redesign or regenerate them, run `src/share-cards/render.py`.
- **Do not hand-edit the root `.html`/`style.css`/`app.js`.** The next build overwrites them.

## Config (top of `src/app.js`)
- `SITE.phone`, `SITE.phoneDisplay`: the business WhatsApp/call number, +91 77189 84191.
- `SITE.upiId`: 7718984191@yescred. After a "Pay online now" booking, the done screen shows one button per UPI app (Google Pay, PhonePe, Paytm, Other) on phones, because iPhones have no app chooser for `upi://` links and open the last-installed UPI app (e.g. WhatsApp Pay). Android uses `intent://` links per app. Laptops see a UPI QR code drawn by `src/vendor/qrcode.js` (qrcode-generator 1.4.4, MIT), which is copied to the root on build.
- `SITE.sheetUrl`: the live Apps Script web app on the "Vroombrite Bookings" Sheet. If `Code.gs` changes, redeploy it as a new version of the same deployment so this URL stays the same.
- `PRICE`, `ADDONS`, `DETAIL`, `PLANS`: all launch placeholders. Don't change prices unless Aniket asks.
- `AREAS`: service areas and the PIN codes accepted at booking. Aniket confirmed this list for launch (Nov 2026).

## Brand (from the Vroombrite Brand Identity Kit)
- Colours: Electric Lime `#C9F36A` (primary), Midnight Graphite `#15191C` (background), Clean White `#F7F8F5` (light sections), Fresh Aqua `#55D6C2` (secondary: info/availability), Turbo Coral `#FF895C` (small highlights only: "Most booked", per-wash tags), Metallic Grey `#A8AFB4` (supporting text).
- Type: Montserrat Bold/ExtraBold for headings and brand; Inter for body and UI.
- Logo: lime rounded-square V icon with speed lines and a sparkle (inline SVG, also `favicon.svg`), plus the italic wordmark VROOM (white) / BRITE (lime), tagline "DOORSTEP CAR & BIKE CARE".
- Brand elements: slanted lime stripes (section kickers), halftone dots (lime CTA band), sparkle.

## Decisions so far
- Home keeps the scroll-to-wash hero: muddy → foam → shine car crossfaded by a jet wipe as you scroll, built from three matching Canva images. The Dribbble-style hero was rejected.
- Separate car and bike booking journeys. Car bookings can add detailing treatments. A PIN check is required in step 2.
- Photos in `img/` are AI-generated (Canva) and labelled "illustrative" on the site. They are to be replaced with real job photos under the same file names (landscape, about 1680×944).
- Payment: **pay after the service (UPI/cash) is the primary/default option**. Online payment (UPI) is the secondary option for the starting phase. Aniket plans to make online payment primary once the brand is established. Razorpay comes later, with its own merchant account for this business, not Little Gasp's.
- Policies (privacy, terms, cancellation & refund) were added at launch. They contain policy decisions Aniket should confirm: the 2-hour free-cancel window, the ₹99 late-cancel/no-access visit fee, 5–7 working-day refunds and the 24-hour redo guarantee.
- Payment status in the Sheet is updated by hand from the Sheet's **Vroombrite** menu (Mark paid · UPI / cash, Mark job done / cancelled). A `upi://` link gives no payment callback. Automatic "paid" status needs a gateway (Razorpay webhook → Apps Script) later.
- Offers: code `WELCOME50` (₹50 off the first wash), or the friend's mobile in "Referred by" (₹50 off for the new customer, plus ₹50 credit for the referrer once the friend's job is marked Done). Only one ₹50 discount per booking. Both are checked against the Sheet before booking, and Confirm is disabled while the check runs. If the script returns no verdict (old deployment) or is unreachable, the offer is applied provisionally and `Code.gs` flags repeat customers in the Promo column. The amounts are placeholders. Keep `PROMOS`/`REFERRAL` in sync between `src/app.js` and `Code.gs`.
- WhatsApp messages are one-tap (they open prefilled for a human to send), not automatic. Automatic sending needs Meta's WhatsApp Business Platform with approved templates, which is not set up.
- The nav shows Societies instead of Gallery; Gallery is in the footer.
- Prices are Claude's launch placeholders. Aniket will send final prices after discussing with his partner.
- Testing standard: check every page at phone (390px) and laptop (1440px) widths before calling a change done.
