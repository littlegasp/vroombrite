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
- The build writes the 11 root pages (`index`, `car-wash`, `bike-wash`, `detailing`, `subscription`, `gallery`, `contact`, `book`, plus the policy pages `privacy`, `terms`, `refunds`, which are linked in the footer only) plus `preview/index.html`. The preview is a single-page, hash-routed copy used for Claude artifact previews and is git-ignored.
- **Do not hand-edit the root `.html`/`style.css`/`app.js`.** The next build overwrites them.

## Config (top of `src/app.js`)
- `SITE.phone`, `SITE.phoneDisplay`: the business WhatsApp/call number, +91 77189 84191.
- `SITE.upiId`: empty, so "Pay online now" shows as "coming soon". Once a UPI ID is set, it opens a `upi://` payment link for the booking total on the done screen.
- `SITE.sheetUrl`: empty until the Apps Script web app is deployed.
- `PRICE`, `ADDONS`, `DETAIL`, `PLANS`: all launch placeholders. Don't change prices unless Aniket asks.
- `AREAS`: service areas and the PIN codes accepted at booking. Aniket still needs to confirm this list.

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
- Prices are Claude's launch placeholders. Aniket will send final prices after discussing with his partner.
- Testing standard: check every page at phone (390px) and laptop (1440px) widths before calling a change done.
