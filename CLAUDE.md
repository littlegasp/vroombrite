# Vroombrite — project notes

Website for **Vroombrite**, a doorstep car and bike wash/detailing business in Mumbai run by Aniket Gurav. "Vroombrite" is the working brand name. The repo lives on the `littlegasp` GitHub account for now and will be transferred to the brand's own account later.

## Stack
- Plain static HTML/CSS/JS, deployed with GitHub Pages from the root of `main`. `.nojekyll` is present. No framework; this was chosen over Next.js.
- Data lives in **Supabase** (project `rcekecnigbtgicvntfbz`, Mumbai region). Schema, security and all functions are in `supabase/migrations/0001_init.sql`; test it locally with `supabase/test/stub.sql` + `test.sql` on plain Postgres. The site and staff app call database functions (`/rest/v1/rpc/<fn>`) with plain `fetch`, no libraries. All tables have RLS on and no direct grants; anon may only call `check_offer`, `create_booking`, `submit_enquiry`, `submit_society_lead`, `submit_review`, `public_reviews`, `sheet_copy`.
- The customer is also handed off to WhatsApp with the booking prefilled. The old Apps Script (`google-apps-script/Code.gs`, `SITE.sheetUrl`) is only a fallback if Supabase is unreachable. `google-apps-script/SheetCopy.gs` copies the database into the Google Sheet nightly (read-only copy) using the key shown in Team.
- Never put the Supabase secret/service_role key or database password in the repo or chat. Only the publishable key goes in `src/config.js`. New schema changes go in a new numbered migration file that Aniket runs in the SQL Editor.

## How the files fit
- **Edit sources in `src/`**, then run `python3 src/build.py`.
  - `src/pages/<slug>.html`: the body of each page. `@@slug@@` tokens become links. `@@CTA@@` inserts `src/pages/_cta.txt`.
  - `src/build.py`: page list, titles, meta descriptions, the shared header and footer (logo markup lives here).
  - `src/style.css`, `src/app.js`, `src/config.js`, `src/ops.js`, `src/ops.css` and `src/ops.webmanifest` are copied to the root on build. `config.js` loads before `app.js`/`ops.js` on every page.
- The build writes the root pages (`index`, `car-wash`, `bike-wash`, `detailing`, `subscription`, `societies`, `gallery`, `contact`, `book`, `review`, `ops`, the policy pages `privacy`, `terms`, `refunds`, and one `doorstep-car-wash-<area>.html` landing page per service area) plus `sitemap.xml`, `robots.txt` and `preview/index.html`.
- **Service areas live in `src/areas.json`** (name, slug, PINs, nearby areas). The build injects them into `app.js` (PIN check, area chips) and generates the area pages from `src/pages/_area.html`. To add an area, add it there and rebuild.
- `ops.html` + `src/ops.js` + `src/ops.css` is the **staff app** (own design, not the website's or Studio CRM's look; no site header, `noindex`, blocked in robots.txt). Email/password sign-in through Supabase Auth; the first user is the owner, later users are washers and stay switched off until the owner switches them on in Team. Washers see Day and Bookings; the owner also sees Customers, Inbox, Numbers and Team. It renders from localStorage cache first, then refreshes; buttons update optimistically and roll back on failure; polls every 30 s. Each job card has one main next-step button (confirm → on my way → washed → paid → review) plus Call/Map/Chat/More.
- `review.html?b=<booking ID>` is the customer feedback form. Reviews are saved to the database and appear on Home and Gallery only after the owner taps **Show on website** in the staff app's Inbox. The preview is a single-page, hash-routed copy used for Claude artifact previews and is git-ignored.
- Share previews (WhatsApp/Instagram/Facebook): every page has absolute Open Graph and Twitter tags built from `SITE_URL` in `src/build.py`, which must be updated when the custom domain goes live. Cards are `img/og-*.jpg` (1200×630; home, car, bike, detail, plans), and `OG_IMG` maps pages to cards. To redesign or regenerate them, run `src/share-cards/render.py`.
- **Do not hand-edit the root `.html`, `.css` and `.js` files.** The next build overwrites them.

## Config (`src/config.js` and top of `src/app.js`)
- `SITE.phone`, `SITE.phoneDisplay`: the business WhatsApp/call number, +91 77189 84191.
- `SITE.upiId`: 7718984191@yescred. After a "Pay online now" booking, the done screen shows one button per UPI app (Google Pay, PhonePe, Paytm, Other) on phones, because iPhones have no app chooser for `upi://` links and open the last-installed UPI app (e.g. WhatsApp Pay). Android uses `intent://` links per app. Laptops see a UPI QR code drawn by `src/vendor/qrcode.js` (qrcode-generator 1.4.4, MIT), which is copied to the root on build.
- `SITE.supabaseUrl`, `SITE.supabaseKey` (publishable): in `src/config.js`, with phone and UPI. Empty URL = website falls back to the Sheet.
- `SITE.sheetUrl`: the old Apps Script web app, kept as a fallback only.
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
- Payment status is updated by staff in the staff app (Paid by UPI / Paid in cash). A `upi://` link gives no payment callback. Automatic "paid" status needs a gateway (Razorpay webhook → Supabase) later.
- Offers need a **minimum order of ₹299** (package + add-ons, before discount; `min` in `PROMOS`/`REFERRAL`), set so the cheaper bike washes stay profitable. Below the minimum, the offer stays attached but gives no discount, and the site tells the customer how much more to add.
- Offers: code `WELCOME50` (₹50 off the first wash), or the friend's mobile in "Referred by" (₹50 off for the new customer, plus ₹50 credit for the referrer once the friend's job is marked Done). Only one ₹50 discount per booking. Both are checked by the database (`check_offer`, and again inside `create_booking`, which decides the discount itself) before booking, and Confirm is disabled while the check runs. If the check is unreachable, the offer is shown provisionally and the database still refuses it at booking if not allowed. The amounts are placeholders. Keep `PROMOS`/`REFERRAL` in `src/app.js` in sync with the `offers` table.
- WhatsApp messages are one-tap (they open prefilled for a human to send), not automatic. Automatic sending needs Meta's WhatsApp Business Platform with approved templates, which is not set up.
- The nav shows Societies instead of Gallery; Gallery is in the footer.
- Prices are Claude's launch placeholders. Aniket will send final prices after discussing with his partner.
- Testing standard: check every page at phone (390px) and laptop (1440px) widths before calling a change done.
- Ops app moved from the PIN/Sheet version to Supabase (Nov 2026) because Apps Script was too slow (1–3 s per call). Aniket chose a new design for it rather than copying Studio CRM.
