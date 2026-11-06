/* Help guide for the staff app. Keep it in step with the app: every change people can see
   updates its section here and adds a line to WHATS_NEW, in the same commit.
   role: "all" (everyone) or "owner". Write for washers: short steps, button names as on screen. */
const WHATS_NEW = [
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
<li>Open it from the home screen icon from then on. It opens straight to today's jobs.</li></ol>
<p>The small dot next to your initial shows the connection: <b>green</b> up to date, <b>blue</b> updating, <b>orange</b> offline (you are seeing the last saved data; buttons try again when you're back online).</p>
<p>When a new version is published you'll see <b>A new version of the staff app is ready</b>. Tap <b>Update</b>.</p>` },

  { id: "day", role: "all", title: "Today's jobs (Day)", body: `
<p>Pick a day in the strip at the top. Dots show how many jobs are on each day.</p>
<p><b>Up next</b> is the next job, shown big. Its main button moves the job along, one tap at a time:</p>
<ol><li><b>Confirm on WhatsApp</b>: opens WhatsApp with the confirmation filled in. Press send.</li>
<li><b>Send "On my way"</b>: when you leave for the customer.</li>
<li><b>Mark washed</b>: when the job is finished.</li>
<li><b>Paid by UPI</b> or <b>Paid in cash</b>: once the money is with you.</li>
<li><b>Ask for a review</b>: sends the rating link.</li></ol>
<p><b>Call</b>, <b>Map</b> (opens Google Maps at the address), <b>Chat</b> (pick a ready message) and <b>More</b> are on every card.</p>
<p>Washers see <b>Mine</b> (jobs given to you) and <b>Everyone</b>. Tap a short row to open the full card.</p>
<p>If a customer has <b>referral credit</b>, the card says so. Take it off the bill, then tap <b>Mark used</b>.</p>` },

  { id: "new", role: "all", title: "Adding a booking (phone, WhatsApp, walk-in)", body: `
<ol><li>Tap <b>+ New</b> (bottom of the screen) or <b>New booking</b> (laptop).</li>
<li>Fastest: copy the customer's WhatsApp message, paste it in the box at the top and tap <b>Fill</b>. Check what it filled.</li>
<li>Choose the vehicle, package and any add-ons. The price fills in by itself; you can change it. To give a discount, enter it with a reason.</li>
<li>Pick the day and time, and enter the address and PIN code (the area fills in by itself).</li>
<li>Choose where the booking came from (Phone, WhatsApp, Walk-in…) and tap <b>Save booking</b>.</li></ol>
<p>After saving you can send the confirmation on WhatsApp in one tap. Bookings a washer adds are given to that washer.</p>` },

  { id: "job", role: "all", title: "A booking's details, notes and history", body: `
<p>Tap a booking to open it. Below the card:</p>
<ul><li><b>Add a note</b>: gate codes, parking slot, "customer wants extra care on seats".</li>
<li><b>History</b>: every step with who did it and when, including messages, calls and changes.</li>
<li><b>Edit</b>: washers can change the number plate and notes. The owner can change everything: day and time, address, package and price.</li></ul>
<p><b>After a call</b> the app asks how it went: <b>Talked</b>, <b>No answer</b> (offers the "Couldn't reach you" WhatsApp message) or <b>Busy</b>. It's saved in the history.</p>
<p>Under <b>More</b>: send a reminder, mark washed or paid, undo "paid", cancel or reopen.</p>` },

  { id: "bookings", role: "all", title: "Finding bookings and the calendar", body: `
<p><b>Bookings → List</b> shows everything coming up. Search by name, mobile, number plate, area or booking ID (searching also finds past bookings).</p>
<p><b>Bookings → Calendar</b> shows a month. Each day shows its number of bookings; tap a day to open it in Day.</p>` },

  { id: "messages-use", role: "all", title: "WhatsApp messages", body: `
<p>The app never sends messages by itself. It opens WhatsApp with the message ready; you press send.</p>
<p><b>Chat</b> on a card lets you pick any ready message (confirmation, reminder, on my way, review, couldn't reach you…). Sending one is noted in the booking's history.</p>` },

  { id: "customers", role: "owner", title: "Customers", body: `
<p><b>Customers → All</b> lists every customer by mobile number: washes, amount paid, last wash, next booking and referral credit. Tap one to see all their bookings, call or message them, or start a <b>New booking</b> with their details filled in.</p>
<p><b>Customers → Due for a wash</b> lists people whose last wash was 7, 12, 21 or 30+ days ago and who have nothing booked. Tap <b>Send rebook message</b>.</p>` },

  { id: "assign", role: "owner", title: "Giving jobs to washers", body: `
<p>Open a booking and choose the washer under <b>Washer</b>. They see it under <b>Mine</b>. Choose <b>Nobody</b> to take it back.</p>
<p>New website bookings start with nobody. Bookings a washer adds are given to them.</p>` },

  { id: "team", role: "owner", title: "Team logins", body: `
<p>Everything is done in <b>Team</b>; you don't need to open Supabase.</p>
<ul><li><b>+ Add login</b>: name, email, mobile, Washer or Owner, and a password (8+ characters; tap <b>Make one</b> for a random one). Share the email and password with them on WhatsApp. The login works straight away.</li>
<li>Tap a person to change their name, email, mobile or access (Washer / Owner), <b>Set a new password</b>, or switch their login off.</li>
<li><b>Switch off</b> stops them signing in, and keeps their history. Use it when someone leaves.</li>
<li><b>Delete login</b> removes the login for good. Their open jobs go back to "nobody"; past bookings stay.</li></ul>
<p>You can't switch off, demote or delete your own login.</p>
<p><b>Washer</b> sees Day, Bookings and New booking, and can change only plate and notes. <b>Owner</b> sees everything.</p>` },

  { id: "settings", role: "owner", title: "Settings", body: `
<ul><li><b>Team notice</b>: one line everyone sees at the top of Day ("Rain today, carry covers"). Clear it when done.</li>
<li><b>WhatsApp messages</b>: change the wording of every ready message. Words in curly brackets are filled in for each customer: {first_name}, {package}, {vehicle}, {date}, {slot}, {address}, {id}, {total}, {review_link}, {book_link}, {days}, {society}, {brand}.</li>
<li><b>Offers</b>: change WELCOME50 and the referral offer (amount, minimum order, first wash only, on/off), or add a new code like DIWALI100. The website uses the new amounts straight away.</li>
<li><b>Monthly costs</b>: ads, supplies, fuel, washer pay and other costs for a month. Numbers then shows profit and cost per wash.</li>
<li><b>Download bookings</b>: a spreadsheet (CSV) of bookings between two dates. Keep it private; it has customers' details.</li>
<li><b>Activity log</b>: who downloaded data, deleted a booking, changed logins, offers or messages, and when. It never shows customers' details.</li>
<li><b>Google Sheet copy</b>: the key for the nightly copy into Google Sheets.</li></ul>` },

  { id: "numbers", role: "owner", title: "Reading Numbers", body: `
<ul><li><b>Collected</b> counts bookings marked paid (by the day they were paid).</li>
<li><b>Washed, not paid</b> is money still to collect. Chase these first.</li>
<li><b>This month</b>: bookings, washes, cancellations, discounts given, money collected, your costs (from Settings → Monthly costs), <b>profit</b> (collected minus costs) and <b>cost per wash</b>.</li>
<li><b>Ad cost per new customer</b>: ad spend this month ÷ customers whose first booking was this month.</li>
<li><b>Where bookings came from</b> and <b>washes per washer</b> are for this month.</li></ul>` },

  { id: "inbox", role: "owner", title: "Inbox: societies, messages, reviews", body: `
<p><b>Societies</b>: quote requests from the Societies page. Mark them Contacted, Quoted, Won or Lost.</p>
<p><b>Messages</b>: the contact form. Reply on WhatsApp, then mark Replied.</p>
<p><b>Reviews</b>: nothing shows on the website until you tap <b>Show on website</b>.</p>` },

  { id: "delete", role: "owner", title: "Deleting a booking and customers' privacy", body: `
<p>Delete only test or spam bookings: open it → <b>Edit</b> → <b>Delete booking</b>. It removes the booking, its history and its review for good. The activity log keeps a line without the customer's details.</p>
<p>The app has customers' names, mobiles and addresses. Don't share screenshots or downloads outside the business. If a phone with the app is lost, switch that login off in Team.</p>` },

  { id: "account", role: "all", title: "My account and password", body: `
<p>Tap your initial (top right) for <b>Change my password</b>, light or dark look, <b>Refresh now</b> and <b>Sign out</b>.</p>
<p>Forgot your password? On the sign-in screen tap <b>Forgot password?</b> for an email link, or ask the owner to set a new one in Team.</p>` },

  { id: "problems", role: "all", title: "Something looks wrong?", body: `
<ul><li>Pull down or tap <b>Refresh now</b> in your account menu.</li>
<li>"Couldn't save": check your internet and tap again. The card goes back to how it was until it saves.</li>
<li>Still stuck: send a screenshot to the owner.</li></ul>` }
];
