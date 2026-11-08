/* Help guide for the staff app. Keep it in step with the app: every change people can see
   updates its section here and adds a line to WHATS_NEW, in the same commit.
   role: "all" (everyone) or "owner". Write for washers: short steps, button names as on screen. */
const WHATS_NEW = [
  ["8 Nov 2026", "Phone: the screen you're on now shows as a lime button floating on a wave in the bottom bar; tap another tab and it glides over, with the wave following like water. Laptop: a glass pill slides along the side menu."],
  ["8 Nov 2026", "Swipe a job on your phone: right for the next step (a long swipe does it straight away), left for Call, Chat and Cancel."],
  ["8 Nov 2026", "Undo: after Paid, Washed, Cancel, Start wash, a stock − / + or deleting a bill, tap Undo on the message at the bottom (or shake the phone) within a few seconds."],
  ["8 Nov 2026", "A dark bar at the top shows the wash that's running, with its timer and checklist, on every screen. Tap it to open the job."],
  ["8 Nov 2026", "Small touches: buttons answer with a little bounce, Android phones vibrate on Paid and Washed (turn it off in Me → Feedback), and you can pull a sheet down by its handle to close it."],
  ["8 Nov 2026", "Owner: Arrange on Stock & bills puts the stock list in the order you like (drag by the dots, or ↑ ↓)."],
  ["7 Nov 2026", "Fixed: tapping a tab (like Last 30 days, or 21+ days under Due for a wash) now always marks the tab you tapped."],
  ["7 Nov 2026", "Tidier screens on phones and laptops: even spacing between sections, stock list easier to edit on a phone, plan visits say how many are left."],
  ["7 Nov 2026", "Cancelling a booking now asks why (rain, couldn't reach the customer…). Analytics shows the reasons."],
  ["7 Nov 2026", "Send receipt: once a job is paid, send the customer a receipt link on WhatsApp."],
  ["7 Nov 2026", "Stock & bills: tap − / + as you use and buy supplies, and add fuel or supply bills with a photo. The owner approves them."],
  ["7 Nov 2026", "Owner: Settings → Pay works out each washer's pay from a rate per car and per bike, with Mark paid and a statement to send. Washers see their own pay under Me."],
  ["7 Nov 2026", "Owner: phone alerts for new website bookings (Me → Phone alerts)."],
  ["7 Nov 2026", "Owner: new Plans screen for monthly plans and society contracts. Adding one books all the month's visits on its fixed days; you mark the month paid once."],
  ["7 Nov 2026", "Plan and society visits show on Jobs like any booking, with nothing to collect. A society visit's checklist is its list of vehicles."],
  ["7 Nov 2026", "Owner: Start contract on a society request in Inbox fills in the society for you."],
  ["7 Nov 2026", "Start wash timer: tap Start wash when you begin and Mark washed when you finish. Analytics shows the average time per package and per washer."],
  ["7 Nov 2026", "Checklist on every job, made from the package (same steps as the website) plus its add-ons. Tick as you go."],
  ["7 Nov 2026", "Saved note for a customer (gate code, parking spot): save it once and it shows on all their bookings."],
  ["7 Nov 2026", "Route button on Jobs: the day's jobs in order, opened in Google Maps."],
  ["7 Nov 2026", "Owner: Move day on Jobs, for rain. Move the day's bookings to another day, then send each customer the ready WhatsApp message."],
  ["6 Nov 2026", "No internet (basement parking)? Taps like Washed, Paid and notes are saved on your phone and sent by themselves when the internet is back. An orange bar shows how many are waiting."],
  ["6 Nov 2026", "Before and after photos on every booking, and one tap to send them to the customer."],
  ["6 Nov 2026", "UPI QR button: the customer scans it on your phone and the amount is already filled in."],
  ["6 Nov 2026", "Owner: Settings → Slots & days off. Set how many website bookings each time can take, a weekly day off, and close a day or a time for holidays or rain. The website shows Full or Closed."],
  ["6 Nov 2026", "Screens no longer flash or jump when they refresh in the background; they only change when something new comes in."],
  ["6 Nov 2026", "New look, same as Studio CRM's layout in Vroombrite colours: a menu on the left (laptop) or tabs at the bottom (phone), light and dark look."],
  ["6 Nov 2026", "Owner: Home shows what needs attention, the month's calendar and recent bookings. Analytics compares any period with the one before."],
  ["6 Nov 2026", "Bookings has a board (drag a card to move it along) and a table. Every booking has its own page with a journey line, money box and history."],
  ["6 Nov 2026", "Search anything with Ctrl K (or the search button), a bell for new bookings, a short tour, add a job to your phone calendar, and a warning when a time slot is already busy."],
  ["6 Nov 2026", "New booking button: add phone, WhatsApp and walk-in bookings. Paste a customer's WhatsApp message and tap Fill to fill the form."],
  ["6 Nov 2026", "Every booking now has a history (who confirmed, washed, got paid, changed it), notes, and call results."],
  ["6 Nov 2026", "Owner: add washers, change their access, set new passwords and delete logins in Team. No need to open Supabase."],
  ["6 Nov 2026", "Owner: give each job to a washer. Washers see their own jobs first."],
  ["6 Nov 2026", "Owner: Settings for WhatsApp message wording, offers and codes, team notice, monthly costs, booking download and activity log."],
  ["6 Nov 2026", "Customers list with every customer's washes, spend and referral credit. Month calendar in Bookings. Light and dark look."],
  ["6 Nov 2026", "Staff app moved to the new fast database, with email sign-in."]
];

const GUIDE = [
  { id: "start", role: "all", title: "Getting started", body: `
<p>Open the staff app link on your phone and sign in with your email and password.</p>
<ol><li>In Chrome: tap <b>⋮ → Add to Home screen</b>. On iPhone Safari: tap <b>Share → Add to Home Screen</b>.</li>
<li>Open it from the home screen icon from then on.</li></ol>
<p><b>Phone:</b> tabs at the bottom (owner: Home, Jobs, <b>+</b>, Bookings, More · washer: Jobs, Bookings, <b>+</b>, Help, Me). The top bar has search, the bell and the light/dark switch.</p>
<p><b>Laptop:</b> the menu is on the left. The button at its top folds it to icons. Press <b>Ctrl K</b> to search.</p>
<p>When a new version is published you'll see <b>A new version of the staff app is ready</b>. Tap <b>Update</b>. Tap <b>Show me around</b> on this page to see the tour again.</p>` },

  { id: "home", role: "owner", title: "Home", body: `
<ul><li>The boxes at the top: jobs today, upcoming, money collected and <b>Washed, not paid</b>. Tap a box to open that screen.</li>
<li><b>Needs attention</b>: bookings not confirmed yet (tap <b>Confirm</b> to send the WhatsApp), washed jobs not paid, jobs with no washer, customers due for a wash and new Inbox items.</li>
<li>The <b>calendar</b> shows bookings per day. Tap a day to open it in Jobs.</li>
<li><b>Recent bookings</b> lists the newest bookings. Tap one to open it.</li></ul>` },

  { id: "day", role: "all", title: "Jobs: today's work", body: `
<p>Pick a day in the strip. Dots show how many jobs are on each day.</p>
<p><b>Up next</b> is the next job, shown big. Its main button moves the job along, one tap at a time:</p>
<ol><li><b>Confirm on WhatsApp</b>: opens WhatsApp with the confirmation filled in. Press send.</li>
<li><b>Send "On my way"</b>: when you leave for the customer.</li>
<li><b>Start wash</b>: when you begin washing. The timer runs on the button.</li>
<li><b>Mark washed</b>: when the job is finished. If some checklist items aren't ticked, the app reminds you; tap again if it's done.</li>
<li><b>Paid by UPI</b> or <b>Paid in cash</b>: once the money is with you.</li>
<li><b>Ask for a review</b>: sends the rating link.</li></ol>
<p><b>Swipe</b> (phone): slide a job card or row to the <b>right</b> for its next step (Confirm, On my way, Start, Washed, UPI / Cash, Review). A long swipe right does it straight away when there's only one. Slide <b>left</b> for <b>Call</b>, <b>Chat</b> and <b>Cancel</b>. Tap anywhere else to close it.</p>
<p><b>Undo</b>: after <b>Paid</b>, <b>Mark washed</b>, <b>Cancel</b> or <b>Start wash</b>, the message at the bottom has an <b>Undo</b> button for a few seconds. You can also shake the phone (Me → Feedback; an iPhone asks once).</p>
<p>While a wash is running, a <b>dark bar at the top</b> shows the customer, the timer and how many checklist items are ticked, on every screen. Tap it to open the job.</p>
<p><b>Call</b>, <b>Map</b>, <b>Chat</b> (pick a ready message) and <b>Open</b> are on every card. Tap a short row to open its full card; tap the name to open the booking's page.</p>
<p>While you're washing, the card has a <b>Checklist</b>: tap Show and tick each step. It's made from the package (the same steps the website lists), the add-ons the customer chose, and a final walk-round with the customer.</p>
<p>A blue note with a pin is the customer's <b>saved note</b> (gate code, parking spot). It shows on all their bookings.</p>
<p><b>Route</b> lists the day's open jobs in order and opens them in Google Maps, starting from where you are. Choose <b>By time</b> or <b>Same area together</b>. Google Maps takes 10 stops per link, so a busy day has more than one button.</p>
<p>Owner: <b>Move day</b> is for rain or a day off. Tick the bookings, pick the new day (and a time, or keep each one's time), then tap <b>Move</b>. A list opens with a <b>WhatsApp</b> button for each customer with the "Moved" message ready; send them one by one. The history of each booking shows the move. Slot limits don't stop a move, but the app tells you if the new day is closed or already busy.</p>
<p>Washers see <b>Mine</b> (jobs given to you) and <b>Everyone</b>.</p>
<p>If a customer has <b>referral credit</b>, the card says so. Take it off the bill, then tap <b>Mark used</b>.</p>` },

  { id: "bookings", role: "all", title: "Bookings: board and table", body: `
<p>Choose <b>Board</b> or <b>Table</b>, and a range: Today, Next 7 days, Next 30 days, Last 30 days or ±60 days. Search finds any booking by name, mobile, number plate, area or booking ID.</p>
<p><b>Board</b> has a column for each step: New, Confirmed, On the way, To collect, Done, Cancelled. On a laptop, drag a card to another column to move it along (to Done asks UPI or cash; to Cancelled asks first). On a phone, scroll sideways and tap a card.</p>
<p><b>Table</b>: tap a column heading to sort by it. The owner can also show one washer's bookings.</p>` },

  { id: "job", role: "all", title: "A booking's page", body: `
<ul><li>The <b>journey line</b> at the top shows where the job is. Tap a later step to move it there.</li>
<li><b>Next step</b> has the one button you need now.</li>
<li><b>The job</b>: day, time, vehicle, package, address (Map), notes, washer. Tap <b>Edit</b> to change it. Washers can change the number plate and notes; the owner can change everything, including day, time and price.</li>
<li>The money box shows what to collect, any discount or referral credit, and the paid buttons (with <b>Undo</b>).</li>
<li><b>UPI QR</b>: tap it and show your screen to the customer. They scan it with Google Pay, PhonePe, Paytm or any UPI app; the amount and booking ID are filled in. When their app says paid, tap <b>They've paid · Paid by UPI</b>. Always check the money has come in before you tap.</li>
<li><b>Wash time</b>: when the wash started and how long it took. <b>Undo start</b> if you tapped Start wash by mistake.</li>
<li><b>Checklist</b>: the same list as on the job card.</li>
<li><b>Saved note</b> (under Customer): tap <b>Add a saved note</b> for things that stay true every visit, like the gate code or parking spot. Anyone in the team can change it. Not for payment or personal details. It is deleted with the customer's last booking.</li>
<li><b>Photos</b>: tap <b>Before</b> when you arrive and <b>After</b> when you finish. Take the photo or pick it from your gallery. Photos need internet. Tap <b>Send photos to …</b> to share them with the customer: on a phone pick WhatsApp and their chat, or send links that work for 7 days. You can delete your own photos (tap ✕ twice); the owner can delete any.</li>
<li><b>Customer</b>: Call, WhatsApp, Map and <b>Calendar</b> (adds the job to your phone's calendar).</li>
<li><b>History and notes</b>: every step with who did it and when, including messages, calls and changes. Add notes like gate codes here.</li>
<li><b>More</b>: send a reminder, ask for a review, cancel or reopen.</li>
<li><b>Cancel booking</b> asks why: pick a reason (and add a few words if you like). The reason shows on the booking and in Analytics.</li>
<li><b>Send receipt</b> (once it's paid): opens WhatsApp with a link to a receipt page showing the booking, the amount and "Paid". It shows the customer's first name only, not their phone or address.</li></ul>
<p><b>After a call</b> the app asks how it went: <b>Talked</b>, <b>No answer</b> (offers the "Couldn't reach you" WhatsApp message) or <b>Busy</b>. It's saved in the history.</p>` },

  { id: "new", role: "all", title: "Adding a booking (phone, WhatsApp, walk-in)", body: `
<ol><li>Tap <b>+</b> (phone) or <b>New booking</b> (laptop).</li>
<li>Fastest: copy the customer's WhatsApp message, paste it in the box at the top and tap <b>Fill</b>. Check what it filled.</li>
<li>Choose the vehicle, package and any add-ons. The price fills in by itself; you can change it. To give a discount, enter it with a reason.</li>
<li>Pick the day and time. Each time shows how many bookings it has (for example 2/3). If a time is <b>full</b> or the day is <b>closed</b>, a yellow note says so. You can still save it if you've agreed it with the customer.</li>
<li>Enter the address and PIN code (the area fills in by itself), choose where the booking came from and tap <b>Save booking</b>.</li></ol>
<p>After saving you can send the confirmation on WhatsApp in one tap. Bookings a washer adds are given to that washer.</p>` },

  { id: "messages-use", role: "all", title: "WhatsApp messages", body: `
<p>The app never sends messages by itself. It opens WhatsApp with the message ready; you press send. <b>Chat</b> lets you pick any ready message; sending one is noted in the booking's history.</p>` },

  { id: "search", role: "all", title: "Search and the bell", body: `
<p><b>Search</b> (Ctrl K on a laptop, the magnifier on a phone) finds bookings, customers and screens. Use the arrow keys and Enter on a laptop.</p>
<p>The <b>bell</b> lists new bookings that came in since you last looked (the owner also sees new Inbox items). The app also shows a note at the bottom and vibrates when a new booking arrives.</p>` },

  { id: "plans", role: "owner", title: "Plans and societies", screens: ["plans", "c"], body: `
<p><b>Plans</b> (in the menu; on a phone under More) holds monthly plans for customers and contracts with societies. Each has fixed days, a time slot and a price a month.</p>
<ol><li>Tap <b>Plan</b> (or <b>Society</b>). Fill in the customer, vehicle and plan (washes and price fill in from the website's plans; change them if you agreed something else), the days, time and washer.</li>
<li>For a society, list its vehicles, one per line: <b>flat · vehicle · plate</b>. Or open its request in <b>Inbox</b> and tap <b>Start contract</b>; the details fill in and the request is marked Won.</li>
<li>Keep <b>Book this month's visits now</b> ticked. The app books every visit for the month on the chosen days, from today on. A plan stops at its number of washes; a society gets every chosen day.</li></ol>
<p>Visits show on <b>Jobs</b> like any booking, with <b>Nothing to collect</b>. Washers do them as usual (On the way, Start wash, Mark washed). On a society visit the checklist is the list of vehicles, so washers tick each car as it's done.</p>
<p>On a plan's page:</p>
<ul><li><b>This month</b>: how many washes are done and left, and whether the month is paid. Tap <b>Paid by UPI</b> or <b>Paid in cash</b> once for the whole month. <b>Payment reminder</b> opens WhatsApp with the amount and your UPI ID.</li>
<li><b>Create next month</b> books the next month's visits. Do this when the customer renews; <b>Ask to renew</b> sends them a ready message first. Home lists plans ending in 3 days or less and months not paid.</li>
<li><b>Extra visit</b> adds a make-up wash in the current month (after a rained-off or cancelled one).</li>
<li><b>Edit</b> changes days, time, washer, price or the vehicle list. Changes apply to months you create after that; to move visits already booked, open each one or use <b>Move day</b> on Jobs.</li>
<li><b>End plan</b> removes visits from today on that aren't done; past visits and months stay. <b>Delete for good</b> is for mistakes only.</li></ul>
<p>Analytics counts a plan's money when you mark the month paid (Collected says how much came from plans).</p>` },

  { id: "kit", role: "all", title: "Stock & bills", screens: ["kit"], body: `
<p><b>Stock & bills</b> is in the menu (on a phone: More, or Me for washers).</p>
<ul><li><b>Stock</b>: tap <b>−</b> when you use up one (a bottle, a litre, a cloth) and <b>+</b> when you buy more. Items in orange are running low.</li>
<li>Tapped by mistake? <b>Undo</b> on the message at the bottom puts it back.</li>
<li>Owner: <b>Edit list</b> to add or remove items and set <b>Warn at</b>: when what's in hand reaches that number, Home shows "Running low".</li>
<li>Owner: <b>Arrange</b> makes the items wiggle. Drag one by its dots (or tap ↑ ↓) to put the list in the order you like, then tap <b>Done</b>.</li>
<li><b>Add a bill</b>: for fuel or supplies you paid for. Enter the amount, what it was for, and take a photo of the bill. It waits for the owner, and you can delete it until then (<b>Delete</b>, then <b>Undo</b> within a few seconds if that was a mistake).</li>
<li>Owner: <b>Approve</b> or <b>Reject</b> each bill; Home shows how many are waiting. Approved bills count as costs in Analytics (don't enter them again in Monthly costs). Your own bills are approved straight away.</li></ul>` },

  { id: "pay", role: "owner", title: "Washer pay (Settings → Pay)", body: `
<ol><li>Set each washer's rate <b>per car wash</b> and <b>per bike wash</b>, then <b>Save rates</b>.</li>
<li>Pick <b>This week</b>, <b>This month</b> or <b>Last month</b>. Each washer shows washes, what they earned and what's still owed. A job counts on the day it was marked washed, for the washer it was given to; a society visit counts each vehicle ticked.</li>
<li><b>Send statement</b> opens WhatsApp to the washer with the count and amounts (add their mobile in Team first).</li>
<li>When you've paid them, tap <b>Mark … paid</b> (twice). <b>Paid before</b> lists past payments; <b>Undo</b> if you marked one by mistake.</li></ol>
<p>Pay you mark paid counts as costs in Analytics, so don't enter washer pay again in Monthly costs. Washers see their own pay under <b>Me → My pay</b>.</p>` },

  { id: "alerts", role: "owner", title: "Phone alerts and nightly backup", body: `
<p><b>Phone alerts</b>: get a notification when a booking comes in from the website, even with the app closed.</p>
<ol><li>One-time setup in Supabase: <b>Edge Functions → Deploy a new function → Via editor</b>, name it <b>push</b>, paste the file <b>supabase/functions/push/index.ts</b>, Deploy. Then in the function's settings switch <b>off</b> "Verify JWT with legacy secret".</li>
<li>iPhone: open the staff app in Safari, tap <b>Share → Add to Home Screen</b>, and open <b>VB Staff</b> from the Home Screen. Android: Chrome works as it is.</li>
<li>Tap your name / <b>More → My account</b> → <b>Phone alerts</b> → <b>Turn on alerts</b>, and allow notifications. A test alert arrives. Do this on each phone you want alerts on.</li></ol>
<p><b>Nightly backup</b>: a copy of the database is saved every night at about 2 am in GitHub (Actions → Nightly database backup), locked with your passphrase and kept for 30 days. Photos aren't in it. Setup needs two secrets added in GitHub (Settings → Secrets and variables → Actions): <b>SUPABASE_DB_URL</b> and <b>BACKUP_PASSPHRASE</b>. Never paste them anywhere else.</p>` },

  { id: "customers", role: "owner", title: "Customers", body: `
<p><b>All customers</b> lists every customer by mobile number: washes, amount paid, last wash and next booking. Tap one to see their bookings, call or message them, or start a <b>New booking</b> with their details filled in.</p>
<p><b>Due for a wash</b> lists people whose last wash was 7, 12, 21 or 30+ days ago and who have nothing booked. Tap <b>Send rebook message</b>.</p>` },

  { id: "assign", role: "owner", title: "Giving jobs to washers", body: `
<p>Open a booking and choose the washer under <b>The job → Washer</b>. They see it under <b>Mine</b>. Choose <b>Nobody yet</b> to take it back. Home shows jobs in the next 3 days with no washer.</p>` },

  { id: "team", role: "owner", title: "Team logins (Settings → Team)", body: `
<p>Everything is done here; you don't need to open Supabase.</p>
<ul><li><b>Add login</b>: name, email, mobile, Washer or Owner, and a password (tap <b>New</b> for a random one). Then tap <b>Send login on WhatsApp</b>. The login works straight away.</li>
<li>Tap a person to change their name, email, mobile or access, <b>Set a new password</b> (then send it on WhatsApp), or switch their login off.</li>
<li><b>Switch off</b> stops them signing in and keeps their history. Use it when someone leaves.</li>
<li><b>Delete login</b> removes the login for good. Their open jobs go back to "nobody"; past bookings stay.</li></ul>
<p>You can't switch off, demote or delete your own login.</p>` },

  { id: "settings", role: "owner", title: "Settings", body: `
<ul><li><b>Slots &amp; days off</b>: how many website bookings each time (6–8 AM, 8–10 AM…) can take in a day; leave it empty for no limit. When a time is full, the website shows it as <b>Full</b> and the customer picks another. Tick a <b>weekly day off</b> if you don't work that day. Use <b>Close a day or a time</b> for holidays, heavy rain or a big society job, and <b>Open again</b> to undo it. Bookings already made on a closed day stay; move or cancel them yourself. You can always add bookings yourself; the app only warns you.</li>
<li><b>WhatsApp messages</b>: change the wording of every ready message. Words in curly brackets are filled in for each customer: {first_name}, {package}, {vehicle}, {date}, {slot}, {address}, {id}, {total}, {review_link}, {book_link}, {days}, {society}, {brand}.</li>
<li><b>Offers</b>: change WELCOME50 and the referral offer (amount, minimum order, first wash only, on/off), or add a new code like DIWALI100. The website uses the new amounts straight away.</li>
<li><b>Monthly costs</b>: ads, supplies, fuel, washer pay and other costs. Analytics then shows profit and cost per wash.</li>
<li><b>Team notice</b>: one line everyone sees at the top of Home and Jobs ("Rain today, carry covers"). Clear it when done.</li>
<li><b>Data &amp; activity</b>: download bookings as a spreadsheet (CSV), the Google Sheet copy key, and the <b>Activity log</b> (who changed logins, offers or messages, downloaded or deleted data; it never shows customers' details).</li></ul>` },

  { id: "analytics", role: "owner", title: "Reading Analytics", body: `
<p>Pick a range (7 days, 30 days, This month, Last month, 90 days). Each box compares it with the same number of days just before: green ▲ is better, red ▼ is worse.</p>
<ul><li><b>Collected</b> counts bookings in the range marked paid. <b>Profit</b> is collected minus your monthly costs for those days.</li>
<li><b>From booking to review</b> shows how many bookings got confirmed, washed, paid and reviewed.</li>
<li>Also: where bookings came from, packages, areas, time slots, washes per washer, offers used, cost per wash and ad cost per new customer.</li>
<li><b>Time per wash</b>: average minutes from Start wash to Mark washed, by package and by washer. Only washes where the timer was used count; under 3 minutes or over 8 hours are left out.</li></ul>` },

  { id: "inbox", role: "owner", title: "Inbox: societies, messages, reviews", body: `
<p><b>Societies</b>: quote requests from the Societies page. Mark them Contacted, Quoted, Won or Lost.</p>
<p><b>Messages</b>: the contact form. Reply on WhatsApp, then mark Replied.</p>
<p><b>Reviews</b>: nothing shows on the website until you tap <b>Show on website</b>.</p>` },

  { id: "delete", role: "owner", title: "Deleting a booking and customers' privacy", body: `
<p>Delete only test or spam bookings: open it → <b>Edit</b> → <b>Delete booking</b>. It removes the booking, its history, its photos and its review for good. The activity log keeps a line without the customer's details.</p>
<p>The app has customers' names, mobiles and addresses. Don't share screenshots or downloads outside the business. If a phone with the app is lost, switch that login off in Settings → Team.</p>` },

  { id: "account", role: "all", title: "My account and password", body: `
<p>Tap your name (laptop menu) or <b>Me</b> / <b>More → My account</b> (phone) for <b>Change my password</b>, light or dark look, <b>Refresh now</b> and <b>Sign out</b>. The sun/moon button switches the look too.</p>
<p><b>Feedback</b> (phone): turn <b>Vibrate on taps</b> (Android only; iPhones don't let web apps vibrate) and <b>Shake to undo</b> on or off. On an iPhone, Shake to undo asks for motion access the first time.</p>
<p>Any sheet (like this one) closes when you pull it down by the handle or the title.</p>
<p>Washers: <b>My pay</b> shows this month's washes and pay, what's still to be paid and your last payment. The owner sees <b>Phone alerts</b> here.</p>
<p>Forgot your password? On the sign-in screen tap <b>Forgot password?</b> for an email link, or ask the owner to set a new one in Settings → Team.</p>` },

  { id: "problems", role: "all", title: "Something looks wrong?", body: `
<ul><li>Tap <b>Refresh now</b> in your account.</li>
<li><b>No internet</b>: keep working. Taps like On the way, Washed, Paid and notes are kept on your phone; an orange bar says how many are waiting. They send by themselves when the internet is back (or tap <b>Try now</b>). Don't sign out or clear the browser while the bar is showing. Photos and new bookings need internet.</li>
<li>"Couldn't save": the server refused the change (for example someone else already changed the booking). Check the booking and try again.</li>
<li>Still stuck: send a screenshot to the owner.</li></ul>` }
];
