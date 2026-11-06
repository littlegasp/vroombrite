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
| `ops.html` | Staff app: day plan, bookings, customers due, inbox, numbers, team (email sign-in) |
| `privacy.html`, `terms.html`, `refunds.html` | Policy pages, linked in the footer |

## Before going live
1. **`src/config.js`**: business phone, UPI ID, and the Supabase Project URL and publishable key (public by design; never put the secret key or database password here).
2. **`src/app.js`**: `PRICE`, `ADDONS`, `DETAIL`, `PLANS` (launch placeholders) and `AREAS` (served PIN codes). Run `python3 src/build.py` after any change.

## Where bookings go (Supabase, Mumbai)
Bookings, enquiries, society requests and reviews are saved in a Supabase database in the Mumbai region. The website calls database functions only; customers can never read anyone's data. Offers (WELCOME50, referrals, the ₹299 minimum) are decided by the database, so a changed price in the browser can't fake a discount.

**Setting up a new Supabase project (done once):**
1. Supabase → **SQL Editor** → paste all of `supabase/migrations/0001_init.sql` → **Run**.
2. **Authentication → Users → Add user → Create new user**, your email and a password, tick **Auto Confirm User**. The first login becomes the owner.
3. **Authentication → Sign In / Providers** → turn off **Allow new users to sign up**.
4. Put the Project URL and publishable key in `src/config.js` and rebuild.

When a customer confirms, WhatsApp also opens with the booking filled in. If Supabase is ever unreachable, the website falls back to the old Google Sheet script (`SITE.sheetUrl`), and if that fails too, the customer is asked to send the WhatsApp message.

## Google Sheet copy (nightly)
The Sheet is now a read-only copy for viewing and backups; make changes in the staff app.
1. Create a **new** Google Sheet (e.g. "Vroombrite Copy"). Keep the old Sheet and its script as they are: they are the website's fallback. In the new Sheet: **Extensions → Apps Script**, replace everything with `google-apps-script/SheetCopy.gs`, save, reload the Sheet.
2. **Vroombrite → Set copy key** and paste the key from the staff app (**Team → Google Sheet copy key**).
3. **Vroombrite → Turn on nightly copy** (about 2 am), then **Copy now** to test.

## GitHub Pages
Pages is set to deploy from `main` / root. The site is served at https://littlegasp.github.io/vroombrite/. To use your own domain, add it under **Settings → Pages → Custom domain**, then point your DNS to GitHub Pages.

## Staff app (ops.html)
Open `https://littlegasp.github.io/vroombrite/ops.html` on your phone, sign in with email and password, and add it to your home screen. It shows the last saved data instantly, refreshes every 30 seconds, and buttons update straight away.
- **Day** (everyone): pick a day; the next job is shown big with one main button that moves it along: Confirm on WhatsApp → Send "On my way" → Mark washed → Paid by UPI / cash → Ask for a review. Call, Map, Chat and More (reminder, cancel, undo paid) are on every card. Referral credits show on the card with *Mark used*.
- **Bookings** (everyone): upcoming bookings and search by name, phone, plate, area or ID.
- **Owner only:** **Customers** (nobody booked and last wash 7/12/21/30+ days ago, with a rebook message), **Inbox** (society requests, contact messages, reviews: *Show on website*), **Numbers** (bookings, money collected, unpaid, top packages and areas), **Team** (switch washer logins on/off, rename, Sheet copy key).
- **Adding a washer:** Supabase → Authentication → Users → Add user (Auto Confirm), then switch their login on in **Team**.

## Search engines
`sitemap.xml` and `robots.txt` are generated on every build. In Google Search Console, add the site and submit `sitemap.xml`.

## Images
The photos in `img/` are AI-generated illustrative images. Replace them with real photos of your work as you collect them, keeping the same file names. Photos should be landscape, about 1680×944.
