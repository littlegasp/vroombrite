# Vroombrite — website

Static website for a doorstep car and bike wash in Mumbai. Plain HTML, CSS and JavaScript, served by GitHub Pages from the root of this repo.

**To edit:** change the files in `src/` (page bodies are in `src/pages/`, and the shared header and footer are in `src/build.py`), then run `python3 src/build.py`. That regenerates the root pages, `style.css` and `app.js`. Don't edit the root copies directly, because the next build overwrites them.

## Pages
| File | Page |
|---|---|
| `index.html` | Home: scroll-to-wash hero, before/after, packages, PIN check, plans |
| `car-wash.html` | Car packages by size (hatchback / sedan / SUV), comparison table, add-ons |
| `bike-wash.html` | Bike packages, comparison table, add-ons |
| `detailing.html` | Detailing treatments |
| `subscription.html` | Monthly plans for cars and bikes |
| `gallery.html` | Before/after slider, process stages, photo grid |
| `contact.html` | Call / WhatsApp, enquiry form, PIN check, service areas, FAQ |
| `book.html` | 3-step booking: vehicle → place & time (PIN checked) → details and payment choice |
| `societies.html` | Society/bulk quote form (saved to the Sheet's Society leads tab) |
| `doorstep-car-wash-<area>.html` | One landing page per service area for Google search, generated from `src/areas.json` |
| `review.html?b=ID` | Customer feedback form; approved reviews show on Home and Gallery |
| `ops.html` | Staff app: today's jobs, dashboard, due-for-wash list, society leads (PIN sign-in) |
| `privacy.html`, `terms.html`, `refunds.html` | Policy pages, linked in the footer |

## Before going live: edit the top of `src/app.js`, then rebuild
1. **`SITE.phone` / `SITE.phoneDisplay`**: your WhatsApp Business number (already set to +91 77189 84191).
   **`SITE.upiId`**: the UPI ID for the "Pay online now" option. Until it's set, that option shows as "coming soon" and everyone pays after the wash.
2. **`SITE.sheetUrl`**: your Google Apps Script web-app URL (see below).
3. **`PRICE`, `ADDONS`, `DETAIL`, `PLANS`**: all prices are launch placeholders. Change them here and every page updates.
4. **`AREAS`**: the areas and PIN codes you serve. Bookings from any other PIN are refused with a "message us" link.

## Saving bookings to Google Sheets
1. Create a Google Sheet, for example "Vroombrite Bookings".
2. Open **Extensions → Apps Script**, paste in `google-apps-script/Code.gs`, then save.
3. Choose **Deploy → New deployment → Web app**. Set *Execute as: Me* and *Who has access: Anyone*.
4. Copy the web-app URL into `SITE.sheetUrl` in `src/app.js`, then run `python3 src/build.py`.

Each booking is saved to a **Bookings** tab with its booking ID, vehicle, package, extras, date, slot, address, PIN, name, mobile and estimated total. Contact-form messages go to an **Enquiries** tab. Both tabs are created on the first submission.

**Tracking payment and job status:** open the Sheet and use the **Vroombrite** menu. It appears a few seconds after the Sheet loads. Select one or more booking rows, then choose *Mark paid · UPI*, *Mark paid · cash*, *Mark job done* or *Mark cancelled*. Marking a booking paid also fills in the **Paid on** time. Run *Set up dropdowns & colours* once so the Status and Payment columns get dropdowns and colour coding. Online UPI payments can't be confirmed automatically, so mark them paid once the money shows in your UPI app.

When a customer confirms a booking, WhatsApp opens with the full booking and its ID already filled in, and the booking is saved to the Sheet at the same time. If the Sheet can't be reached, the customer is asked to send the WhatsApp message instead.

## GitHub Pages
Pages is set to deploy from `main` / root. The site is served at https://littlegasp.github.io/vroombrite/. To use your own domain, add it under **Settings → Pages → Custom domain**, then point your DNS to GitHub Pages.

## Staff app (ops.html)
1. In the Sheet, open the **Vroombrite** menu → *Set staff PINs* and choose an owner PIN and a washer PIN, each 4–8 digits.
2. Open `https://littlegasp.github.io/vroombrite/ops.html` on your phone and sign in. Add it to your home screen so it opens like an app.
3. **Jobs:** pick a date, and each booking card has Call, Map and one-tap WhatsApp messages (Confirm, Reminder, On my way, Ask for review), plus Job done, Paid · UPI / cash and Cancel buttons.
4. **Owner only:** *Dashboard* (bookings, money collected, unpaid jobs, repeat customers), *Due* (customers whose last wash was 12+ days ago, with a one-tap rebook message) and *Societies* (quote requests).

## Search engines
`sitemap.xml` and `robots.txt` are generated on every build. In Google Search Console, add the site and submit `sitemap.xml`.

## Images
The photos in `img/` are AI-generated illustrative images. Replace them with real photos of your work as you collect them, keeping the same file names. Photos should be landscape, about 1680×944.
