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
- The build writes the 8 root pages (`index`, `car-wash`, `bike-wash`, `detailing`, `subscription`, `gallery`, `contact`, `book`) plus `preview/index.html`. The preview is a single-page, hash-routed copy used for Claude artifact previews and is git-ignored.
- **Do not hand-edit the root `.html`/`style.css`/`app.js`.** The next build overwrites them.

## Config (top of `src/app.js`)
- `SITE.phone`, `SITE.phoneDisplay`: still placeholders (+91 98200 00000).
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
- Testing standard: check every page at phone (390px) and laptop (1440px) widths before calling a change done.
