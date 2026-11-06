/* Price list and areas, copied from app.js by build.py */
const PKG = {
  car: [
    {n:"Essential wash", d:"A thorough exterior refresh to bring back that just-cleaned feel.", t:"~30 MIN", i:["Snow-foam pre-wash","Hand wash with microfibre mitt","Tyres and rims","Glass and mirrors"]},
    {n:"Foam & glow",    d:"Foam wash, careful rinse and finishing touches for a brilliant shine.", t:"~45 MIN", i:["Everything in Essential","Interior vacuum: seats, mats, boot","Dashboard and door wipe-down","Tyre dressing"]},
    {n:"Deep refresh",   d:"Extra attention for the details, inside and out. A complete reset.", t:"~90 MIN", i:["Everything in Foam & glow","Seat and roof shampoo","Spray wax coat","AC vents and crevices"]}
  ],
  bike: [
    {n:"Quick bike wash", d:"A neat exterior clean for your everyday ride.", t:"~20 MIN", i:["Foam wash and rinse","Wheels and spokes","Seat wipe","Microfibre dry"]},
    {n:"Foam & detail",   d:"Foam wash with careful cleaning around the details.", t:"~35 MIN", i:["Everything in Quick","Body polish","Chain clean and lube","Plastic and tyre dressing"]},
    {n:"Chain & shine",   d:"A detailed clean for your bike's hardest-working parts.", t:"~50 MIN", i:["Everything in Foam & detail","Engine degrease","Wax coat on tank","Chrome and visor polish"]}
  ]
};
const PRICE = { hatch:[299,499,999], sedan:[349,599,1199], suv:[399,699,1399], bike:[149,249,449] };
const ADDONS = {
  car: [
    {id:"vac",   n:"Interior vacuum",       d:"Seats, mats and boot. Included in Foam & glow and above.", p:199},
    {id:"rim",   n:"Tyre & rim deep clean", d:"Brake dust and road tar removed.", p:149},
    {id:"odour", n:"Odour removal",         d:"Cabin steam and fragrance treatment.", p:249},
    {id:"wax",   n:"Spray wax coat",        d:"Extra gloss and water beading.", p:299}
  ],
  bike: [
    {id:"brim",   n:"Tyre & rim deep clean", d:"Brake dust and chain grime off the wheels.", p:99},
    {id:"bwax",   n:"Spray wax coat",        d:"Extra gloss on tank and panels.", p:149},
    {id:"helmet", n:"Helmet clean",          d:"Shell, visor and liner freshened.", p:99}
  ]
};
const DETAIL = [
  {id:"int",   ic:"◫", n:"Interior deep clean",   d:"For stained seats, sticky dashboards and that stale-cabin smell.", tags:["Seat & roof shampoo","Carpet extraction","Vents & crevices"], t:"~3 hrs",  p:1499},
  {id:"pol",   ic:"◎", n:"Paint polish & wax",    d:"Machine polish to lift light swirls and dullness, finished with wax.", tags:["Machine polish","Wax coat","Trim dressing"], t:"~4 hrs",  p:2499},
  {id:"cer",   ic:"◇", n:"Ceramic spray sealant", d:"A slick protective layer for deep gloss and water beading.", tags:["Decontamination wash","Sealant coat","Glass treatment"], t:"~2 hrs",  p:1999},
  {id:"eng",   ic:"⚙", n:"Engine bay detailing",  d:"Safe degrease and dressing of plastics and hoses.", tags:["Degrease","Low-pressure rinse","Plastic dressing"], t:"~45 min", p:699},
  {id:"san",   ic:"✳", n:"Odour & sanitisation",  d:"For pets, food spills, damp monsoon smells.", tags:["AC vent steam","Cabin fogging","Mat sanitise"], t:"~45 min", p:599},
  {id:"head",  ic:"◐", n:"Headlight restoration", d:"Clears yellowed, cloudy lenses for better night visibility.", tags:["Wet sanding","Polish","UV protect"], t:"~45 min", p:799}
];
const PLANS = {
  car:  [{s:"STARTER",n:"Fresh Start",d:"For the occasional refresh.",p:599,w:4,i:["4 Essential washes a month","Fixed weekday slot","Same washer each visit"]},
         {s:"EVERYDAY FAVOURITE",n:"Stay Sharp",d:"For cars that deserve regular care.",p:999,w:8,i:["8 Essential washes a month","1 interior vacuum","Priority slots"],hl:1},
         {s:"ALL IN",n:"Always Glossy",d:"For the truly clean-conscious.",p:1499,w:12,i:["12 Essential washes a month","2 interior vacuums","Free re-wash if it rains"]}],
  bike: [{s:"STARTER",n:"Fresh Start",d:"For the occasional refresh.",p:299,w:4,i:["4 Quick washes a month","Fixed weekday slot","Same washer each visit"]},
         {s:"EVERYDAY FAVOURITE",n:"Stay Sharp",d:"For bikes that ride every day.",p:499,w:8,i:["8 Quick washes a month","Chain lube twice a month","Priority slots"],hl:1},
         {s:"ALL IN",n:"Always Glossy",d:"For the truly clean-conscious.",p:699,w:12,i:["12 Quick washes a month","Chain lube every week","Free re-wash if it rains"]}]
};
/* Service areas and the PIN codes we accept. Confirm this list before launch. */
const AREAS = [{"a": "Andheri East", "slug": "andheri-east", "pins": ["400069", "400093", "400099"]}, {"a": "Marol", "slug": "marol", "pins": ["400059"]}, {"a": "Sakinaka & Chandivali", "slug": "sakinaka-chandivali", "pins": ["400072"]}, {"a": "Andheri West", "slug": "andheri-west", "pins": ["400053", "400058", "400061"]}, {"a": "Powai", "slug": "powai", "pins": ["400076"]}, {"a": "Vile Parle", "slug": "vile-parle", "pins": ["400056", "400057"]}, {"a": "Jogeshwari", "slug": "jogeshwari", "pins": ["400060", "400102"]}, {"a": "Goregaon", "slug": "goregaon", "pins": ["400062", "400063"]}, {"a": "Santacruz", "slug": "santacruz", "pins": ["400054", "400055"]}, {"a": "Kurla", "slug": "kurla", "pins": ["400070"]}, {"a": "Ghatkopar", "slug": "ghatkopar", "pins": ["400077", "400086"]}, {"a": "Vikhroli", "slug": "vikhroli", "pins": ["400079", "400083"]}];   // filled from src/areas.json by build.py — edit the areas there
const SLOTS = ["6–8 AM","8–10 AM","10 AM–1 PM","2–5 PM","5–8 PM"];
/* Offers — starting values only. With the database on, the owner changes offers in the staff app
   (Settings → Offers) and the amounts and minimums below are replaced by the database's answer. */
/* min = minimum order value (package + add-ons, before discount) for the ₹50 to apply */
const PROMOS = { WELCOME50: { off: 50, min: 299, label: "₹50 off your first wash" } };
const REFERRAL = { friendOff: 50, referrerCredit: 50, min: 299 };
const SIZE_LABEL = {hatch:"Hatchback", sedan:"Sedan", suv:"SUV / MUV"};

/* Help guide for the staff app. Keep it in step with the app: every change people can see
   updates its section here and adds a line to WHATS_NEW, in the same commit.
   role: "all" (everyone) or "owner". Write for washers: short steps, button names as on screen. */
const WHATS_NEW = [
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
<li><b>Mark washed</b>: when the job is finished.</li>
<li><b>Paid by UPI</b> or <b>Paid in cash</b>: once the money is with you.</li>
<li><b>Ask for a review</b>: sends the rating link.</li></ol>
<p><b>Call</b>, <b>Map</b>, <b>Chat</b> (pick a ready message) and <b>Open</b> are on every card. Tap a short row to open its full card; tap the name to open the booking's page.</p>
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
<li><b>Customer</b>: Call, WhatsApp, Map and <b>Calendar</b> (adds the job to your phone's calendar).</li>
<li><b>History and notes</b>: every step with who did it and when, including messages, calls and changes. Add notes like gate codes here.</li>
<li><b>More</b>: send a reminder, ask for a review, cancel or reopen.</li></ul>
<p><b>After a call</b> the app asks how it went: <b>Talked</b>, <b>No answer</b> (offers the "Couldn't reach you" WhatsApp message) or <b>Busy</b>. It's saved in the history.</p>` },

  { id: "new", role: "all", title: "Adding a booking (phone, WhatsApp, walk-in)", body: `
<ol><li>Tap <b>+</b> (phone) or <b>New booking</b> (laptop).</li>
<li>Fastest: copy the customer's WhatsApp message, paste it in the box at the top and tap <b>Fill</b>. Check what it filled.</li>
<li>Choose the vehicle, package and any add-ons. The price fills in by itself; you can change it. To give a discount, enter it with a reason.</li>
<li>Pick the day and time. If that time already has bookings, a yellow note says who.</li>
<li>Enter the address and PIN code (the area fills in by itself), choose where the booking came from and tap <b>Save booking</b>.</li></ol>
<p>After saving you can send the confirmation on WhatsApp in one tap. Bookings a washer adds are given to that washer.</p>` },

  { id: "messages-use", role: "all", title: "WhatsApp messages", body: `
<p>The app never sends messages by itself. It opens WhatsApp with the message ready; you press send. <b>Chat</b> lets you pick any ready message; sending one is noted in the booking's history.</p>` },

  { id: "search", role: "all", title: "Search and the bell", body: `
<p><b>Search</b> (Ctrl K on a laptop, the magnifier on a phone) finds bookings, customers and screens. Use the arrow keys and Enter on a laptop.</p>
<p>The <b>bell</b> lists new bookings that came in since you last looked (the owner also sees new Inbox items). The app also shows a note at the bottom and vibrates when a new booking arrives.</p>` },

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
<ul><li><b>WhatsApp messages</b>: change the wording of every ready message. Words in curly brackets are filled in for each customer: {first_name}, {package}, {vehicle}, {date}, {slot}, {address}, {id}, {total}, {review_link}, {book_link}, {days}, {society}, {brand}.</li>
<li><b>Offers</b>: change WELCOME50 and the referral offer (amount, minimum order, first wash only, on/off), or add a new code like DIWALI100. The website uses the new amounts straight away.</li>
<li><b>Monthly costs</b>: ads, supplies, fuel, washer pay and other costs. Analytics then shows profit and cost per wash.</li>
<li><b>Team notice</b>: one line everyone sees at the top of Home and Jobs ("Rain today, carry covers"). Clear it when done.</li>
<li><b>Data &amp; activity</b>: download bookings as a spreadsheet (CSV), the Google Sheet copy key, and the <b>Activity log</b> (who changed logins, offers or messages, downloaded or deleted data; it never shows customers' details).</li></ul>` },

  { id: "analytics", role: "owner", title: "Reading Analytics", body: `
<p>Pick a range (7 days, 30 days, This month, Last month, 90 days). Each box compares it with the same number of days just before: green ▲ is better, red ▼ is worse.</p>
<ul><li><b>Collected</b> counts bookings in the range marked paid. <b>Profit</b> is collected minus your monthly costs for those days.</li>
<li><b>From booking to review</b> shows how many bookings got confirmed, washed, paid and reviewed.</li>
<li>Also: where bookings came from, packages, areas, time slots, washes per washer, offers used, cost per wash and ad cost per new customer.</li></ul>` },

  { id: "inbox", role: "owner", title: "Inbox: societies, messages, reviews", body: `
<p><b>Societies</b>: quote requests from the Societies page. Mark them Contacted, Quoted, Won or Lost.</p>
<p><b>Messages</b>: the contact form. Reply on WhatsApp, then mark Replied.</p>
<p><b>Reviews</b>: nothing shows on the website until you tap <b>Show on website</b>.</p>` },

  { id: "delete", role: "owner", title: "Deleting a booking and customers' privacy", body: `
<p>Delete only test or spam bookings: open it → <b>Edit</b> → <b>Delete booking</b>. It removes the booking, its history and its review for good. The activity log keeps a line without the customer's details.</p>
<p>The app has customers' names, mobiles and addresses. Don't share screenshots or downloads outside the business. If a phone with the app is lost, switch that login off in Settings → Team.</p>` },

  { id: "account", role: "all", title: "My account and password", body: `
<p>Tap your name (laptop menu) or <b>Me</b> / <b>More → My account</b> (phone) for <b>Change my password</b>, light or dark look, <b>Refresh now</b> and <b>Sign out</b>. The sun/moon button switches the look too.</p>
<p>Forgot your password? On the sign-in screen tap <b>Forgot password?</b> for an email link, or ask the owner to set a new one in Settings → Team.</p>` },

  { id: "problems", role: "all", title: "Something looks wrong?", body: `
<ul><li>Tap <b>Refresh now</b> in your account.</li>
<li>"Couldn't save": check your internet and tap again. The screen goes back to how it was until it saves.</li>
<li>Still stuck: send a screenshot to the owner.</li></ul>` }
];

/* Vroombrite Staff — Studio CRM layout on Supabase (plain fetch, no libraries).
   Screens: Home, Jobs, Bookings (board/table), booking page, Customers, Inbox, Analytics, Settings, Help.
   Shows saved data instantly, refreshes in the background; buttons update at once and roll back on failure.
   PKG, PRICE, ADDONS, DETAIL, SLOTS, SIZE_LABEL, AREAS come from app.js (added by build.py);
   GUIDE and WHATS_NEW from ops-guide.js. */
(function(){
"use strict";
const BUILD_ID = "c96555ca08";
const $ = id => document.getElementById(id);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];
const URL_ = (SITE.supabaseUrl||"").replace(/\/$/,""), KEY = SITE.supabaseKey||"";
const BASE = location.href.replace(/[#?].*$/,"").replace(/[^/]*$/, "");
const store = {
  get(k){ try{ return JSON.parse(localStorage.getItem(k)); }catch(e){ return null; } },
  set(k,v){ try{ v==null ? localStorage.removeItem(k) : localStorage.setItem(k, JSON.stringify(v)); }catch(e){} }
};
const esc = t => String(t==null?"":t).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const rupee = n => (n<0?"−₹":"₹") + Math.abs(Math.round(Number(n||0))).toLocaleString("en-IN");
const first = n => String(n||"").trim().split(/\s+/)[0] || "there";
const istToday = () => new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Kolkata"}).format(new Date());
const addDays = (iso, n) => { const d=new Date(iso+"T12:00:00Z"); d.setUTCDate(d.getUTCDate()+n); return d.toISOString().slice(0,10); };
const fmtDay = (iso, o) => new Date(iso+"T12:00:00Z").toLocaleDateString("en-IN", Object.assign({timeZone:"UTC"}, o||{weekday:"short", day:"numeric", month:"short"}));
const relDay = iso => { const t=istToday(); return iso===t ? "Today" : iso===addDays(t,1) ? "Tomorrow" : iso===addDays(t,-1) ? "Yesterday" : fmtDay(iso); };
const fmtTime = ts => new Date(ts).toLocaleString("en-IN",{timeZone:"Asia/Kolkata", day:"numeric", month:"short", hour:"numeric", minute:"2-digit"});
const ago = ts => { if(!ts) return ""; const m=Math.round((Date.now()-new Date(ts))/6e4); return m<1?"just now":m<60?m+" min ago":m<1440?Math.round(m/60)+" h ago":Math.round(m/1440)+" d ago"; };
const digits = p => String(p||"").replace(/\D/g,"").slice(-10);
const fmtPhone = p => { const d=digits(p); return d.length===10 ? "+91 "+d.slice(0,5)+" "+d.slice(5) : p; };
const tel = p => "tel:+91"+digits(p);
const wa  = (p, text) => "https://wa.me/91"+digits(p)+(text?"?text="+encodeURIComponent(text):"");
const mapUrl = j => "https://www.google.com/maps/search/?api=1&query="+encodeURIComponent([j.address, j.area, j.pin, "Mumbai"].filter(Boolean).join(", "));
const vehShort = v => String(v||"").replace(/^Car · /,"");
const monthStart = iso => iso.slice(0,8)+"01";
const monthEnd = iso => addDays(monthStart(addDays(monthStart(iso),32)),-1);
const hour = () => +new Intl.DateTimeFormat("en-GB",{timeZone:"Asia/Kolkata", hour:"numeric", hourCycle:"h23"}).format(new Date());
const ic = d => `<svg viewBox="0 0 24 24">${d}</svg>`;
const I = {
  home: ic('<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>'),
  jobs: ic('<path d="M4 17h2l2-6h8l2 6h2"/><circle cx="8" cy="17" r="2"/><circle cx="16" cy="17" r="2"/><path d="M9 7c0-1.5 1-3 3-3s3 1.5 3 3"/>'),
  board: ic('<rect x="3" y="4" width="5" height="16" rx="1.5"/><rect x="10" y="4" width="5" height="11" rx="1.5"/><rect x="17" y="4" width="4" height="7" rx="1.5"/>'),
  users: ic('<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M21.5 20a6.5 6.5 0 0 0-4-6"/>'),
  inbox: ic('<path d="M4 13l2.5-8h11L20 13v6H4z"/><path d="M4 13h5l1 2h4l1-2h5"/>'),
  chart: ic('<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>'),
  cog: ic('<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>'),
  help: ic('<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14M12 17.5h.01"/>'),
  plus: ic('<path d="M12 5v14M5 12h14"/>'),
  menu: ic('<path d="M4 7h16M4 12h16M4 17h16"/>'),
  bell: ic('<path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20a2 2 0 0 0 4 0"/>'),
  sun: ic('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>'),
  moon: ic('<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>'),
  call: ic('<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>'),
  map: ic('<path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>'),
  chat: ic('<path d="M4 20l1.3-3.9A8 8 0 1 1 8 19z"/>'),
  more: ic('<circle cx="5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="19" cy="12" r="1.3"/>'),
  cal: ic('<rect x="4" y="5" width="16" height="15" rx="3"/><path d="M8 3v4M16 3v4M4 10h16"/>'),
  user: ic('<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>'),
  back: ic('<path d="M15 18l-6-6 6-6"/>'),
  fwd: ic('<path d="M9 18l6-6-6-6"/>'),
  note: ic('<path d="M12 3l9 16H3z"/><path d="M12 10v4M12 17h.01"/>'),
  search: ic('<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>')
};

/* ============================== Supabase ============================== */
let session = store.get("vb.session");
async function auth(path, body, method){
  const h = {"Content-Type":"application/json", apikey:KEY}; if(session && method==="PUT") h.Authorization="Bearer "+session.access_token;
  const r = await fetch(URL_+"/auth/v1/"+path, {method:method||"POST", headers:h, body:JSON.stringify(body)});
  const j = await r.json().catch(()=>({}));
  if(!r.ok) throw new Error(j.error_description || j.msg || j.message || "Something went wrong");
  return j;
}
function keep(j){ session = {access_token:j.access_token, refresh_token:j.refresh_token, expires_at:j.expires_at || Math.floor(Date.now()/1000)+(+j.expires_in||3600), email:(j.user||{}).email || (session||{}).email}; store.set("vb.session", session); }
let refreshing = null;
async function refresh(){ if(!session) throw new Error("signed out"); refreshing = refreshing || auth("token?grant_type=refresh_token", {refresh_token:session.refresh_token}).then(keep).finally(()=>refreshing=null); return refreshing; }
async function fresh(){ if(session && session.expires_at*1000 - Date.now() < 60e3){ try{ await refresh(); }catch(e){ signedOut(); } } }
let offlineSaid=false;
async function rpc(fn, args, retried){
  await fresh();
  let r;
  try{ r = await fetch(URL_+"/rest/v1/rpc/"+fn, {method:"POST", headers:{"Content-Type":"application/json", apikey:KEY, Authorization:"Bearer "+(session?session.access_token:KEY)}, body:JSON.stringify(args||{})}); }
  catch(e){ if(!offlineSaid){ offlineSaid=true; toast("You're offline. Showing saved data.", true); setTimeout(()=>offlineSaid=false, 60e3); } throw e; }
  if(r.status===401 && !retried && session){ try{ await refresh(); return rpc(fn, args, true); }catch(e){ return signedOut(); } }
  const j = await r.json().catch(()=>null);
  if(!r.ok){ const e=new Error((j&&j.message)||("Error "+r.status)); e.status=r.status; throw e; }
  return j;
}
const NOFN = "The login manager isn't set up yet. In Supabase: Edge Functions → Deploy a new function → Via editor, name it team-admin, paste supabase/functions/team-admin/index.ts and Deploy.";
async function teamAdmin(body){
  await fresh(); let r;
  try{ r = await fetch(URL_+"/functions/v1/team-admin", {method:"POST", headers:{"Content-Type":"application/json", apikey:KEY, Authorization:"Bearer "+session.access_token}, body:JSON.stringify(body)}); }
  catch(e){ throw new Error("Couldn't reach the login manager. Check your internet. If it keeps happening: "+NOFN); }
  if(r.status===404) throw new Error(NOFN);
  const j = await r.json().catch(()=>({}));
  if(!r.ok) throw new Error(j.error || j.message || NOFN);
  return j;
}
function signedOut(){ session=null; store.set("vb.session",null); show("login"); throw new Error("signed out"); }
const quiet = e => { if(e && e.message!=="signed out" && e.status) toast(e.message, true); };

/* ============================== state ============================== */
const S = { me: store.get("vb.me"), v:"", arg:"", day: istToday(), open: new Set(), mine: store.get("vb.mine")!==false,
  bk: Object.assign({mode:"board", range:"week", washer:"", q:"", sort:"date", dir:1}, store.get("vb.bk")||{}),
  cu: {mode:"all", q:"", due:12}, inTab:"leads", an: store.get("vb.an")||"month", setTab:"team", helpQ:"", calMonth: monthStart(istToday()), setMonth: monthStart(istToday()) };
let SET = store.get("vb.c.settings") || {templates:[], notice:null, team:[]};
const cache = { get:k => store.get("vb.c."+k), set:(k,v) => store.set("vb.c."+k, v) };
const isOwner = () => !!(S.me && S.me.role==="owner");
function toast(t, bad){ const el=$("toast"); el.textContent=t; el.classList.toggle("bad",!!bad); el.classList.add("on"); clearTimeout(el._t); el._t=setTimeout(()=>el.classList.remove("on"), bad?4200:2600); }

/* ============================== look: theme + folded menu ============================== */
function applyTheme(){
  const t = store.get("vb.theme") || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  document.documentElement.setAttribute("data-theme", t);
  $$("[data-themebtn]").forEach(b => { b.innerHTML = t==="dark" ? I.sun : I.moon; b.title = t==="dark" ? "Light look" : "Dark look"; });
  const meta=document.querySelector('meta[name="theme-color"]'); if(meta) meta.content = t==="dark" ? "#0D1012" : "#EDF1E8";
}
applyTheme();
matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => { if(!store.get("vb.theme")) applyTheme(); });
document.addEventListener("click", e => { if(e.target.closest("[data-themebtn]")){ store.set("vb.theme", document.documentElement.getAttribute("data-theme")==="dark"?"light":"dark"); applyTheme(); } });
if(store.get("vb.menu")==="folded") document.documentElement.setAttribute("data-menu","folded");
$("foldBtn").addEventListener("click", () => { const f=document.documentElement.getAttribute("data-menu")==="folded"; if(f) document.documentElement.removeAttribute("data-menu"); else document.documentElement.setAttribute("data-menu","folded"); store.set("vb.menu", f?null:"folded"); });
$("kbdHint").textContent = /Mac|iPhone|iPad/.test(navigator.platform) ? "⌘K" : "Ctrl K";

/* ============================== gates ============================== */
function show(which){
  ["setup","login","forgot","recover","wait"].forEach(n => $("scr"+n[0].toUpperCase()+n.slice(1)).hidden = which!==n);
  $("shell").hidden = which!=="app";
}
document.addEventListener("click", e => { const g=e.target.closest("[data-goto]"); if(g) show(g.dataset.goto); });
document.addEventListener("click", e => { const b=e.target.closest("[data-eye]"); if(!b) return; const i=$(b.dataset.eye); i.type = i.type==="password"?"text":"password"; b.textContent = i.type==="password"?"Show":"Hide"; });

/* ============================== navigation ============================== */
const NAV = [
  {label:"Work"},
  {id:"home", t:"Home", i:I.home, owner:true},
  {id:"jobs", t:"Jobs", i:I.jobs},
  {id:"bookings", t:"Bookings", i:I.board},
  {id:"customers", t:"Customers", i:I.users, owner:true},
  {id:"inbox", t:"Inbox", i:I.inbox, owner:true, badge:()=>S.inboxCount||0},
  {label:"Business", owner:true},
  {id:"analytics", t:"Analytics", i:I.chart, owner:true},
  {id:"settings", t:"Settings", i:I.cog, owner:true},
  {label:"Support"},
  {id:"help", t:"Help", i:I.help}
];
const allowed = id => id==="b" || NAV.some(n => n.id===id && (!n.owner || isOwner()));
const homeView = () => isOwner() ? "home" : "jobs";
function setHTML(el, h){ if(el._h!==h){ el.innerHTML=h; el._h=h; } }
/* same for a part of a screen: writes to .innerHTML are skipped when nothing changed */
const box = el => new Proxy({}, { get:(t,k)=>{ const v=el[k]; return typeof v==="function" ? v.bind(el) : v; }, set:(t,k,v)=>{ if(k==="innerHTML") setHTML(el, v); else el[k]=v; return true; } });
function drawNav(){
  const cur = S.v==="b" ? (S.from||"bookings") : S.v;
  setHTML($("nav"), NAV.filter(n => !n.owner || isOwner()).map(n => n.label ? `<div class="nav-label">${n.label}</div>`
    : `<button type="button" class="nav-link${n.id===cur?" on":""}" data-go="${n.id}" title="${n.t}"><span class="nav-ic">${n.i}</span><span class="nav-tx">${n.t}</span>${n.badge&&n.badge()?`<span class="nav-badge">${n.badge()}</span>`:""}</button>`).join(""));
  const tabs = isOwner()
    ? [["home","Home",I.home],["jobs","Jobs",I.jobs],["new","New",I.plus],["bookings","Bookings",I.board],["more","More",I.menu]]
    : [["jobs","Jobs",I.jobs],["bookings","Bookings",I.board],["new","New",I.plus],["help","Help",I.help],["more","Me",I.user]];
  const inMore = ["customers","inbox","analytics","settings"].concat(isOwner()?["help"]:[]);
  setHTML($("tabbar"), tabs.map(([id,l,i]) => `<button type="button" data-tab="${id}" class="${id==="new"?"tb-new":""}${id===cur||(id==="more"&&inMore.includes(cur))?" on":""}">${i}<span>${l}</span>${id==="more"&&S.inboxCount?`<i class="tb-dot">${S.inboxCount}</i>`:""}${id==="home"&&S.attnCount?`<i class="tb-dot">${S.attnCount}</i>`:""}</button>`).join(""));
  $("whoAv").textContent = (S.me&&S.me.name||"?").trim().charAt(0).toUpperCase();
  $("whoName").textContent = S.me ? S.me.name : ""; $("whoRole").textContent = isOwner() ? "Owner" : "Washer";
  drawBell();
}
document.addEventListener("click", e => {
  const g=e.target.closest("[data-go]"); if(g && !g.matches("tr")){ e.preventDefault(); if(g.dataset.cumode) S.cu.mode=g.dataset.cumode; closeSheet(); closePop(); go(g.dataset.go); return; }
  const h=e.target.closest("[data-home]"); if(h){ e.preventDefault(); go(homeView()); return; }
  const t=e.target.closest("[data-tab]"); if(t){ const k=t.dataset.tab; if(k==="new") return bookingForm(null); if(k==="more") return moreSheet(); go(k); return; }
  if(e.target.closest("[data-account]")) accountSheet();
  if(e.target.closest("[data-new]")) bookingForm(null);
});
function moreSheet(){
  if(!isOwner()) return accountSheet();
  openSheet("More", `<div class="more-grid">${NAV.filter(n=>n.id && ["customers","inbox","analytics","settings","help"].includes(n.id)).map(n=>`<button class="btn" type="button" data-go="${n.id}">${n.i}<span>${n.t}</span>${n.badge&&n.badge()?`<span class="nav-badge">${n.badge()}</span>`:""}</button>`).join("")}
    <button class="btn" type="button" data-account>${I.user}<span>My account</span></button></div>`);
}
function go(path){ const h="#"+path; if(location.hash===h) route(); else location.hash=h; }
addEventListener("hashchange", () => route());
function route(){
  if($("shell").hidden) return;
  const [v, ...rest] = location.hash.slice(1).split("/"); const arg = decodeURIComponent(rest.join("/"));
  let view = v || homeView(); if(!allowed(view)) view = homeView();
  if(view==="b" && S.v!=="b") S.from = S.v || homeView();
  S.v=view; S.arg=arg; closePop(); drawNav();
  if(view==="settings" && arg) S.setTab=arg;
  const fn = {home:vHome, jobs:vJobs, bookings:vBookings, b:vBooking, customers:vCustomers, inbox:vInbox, analytics:vAnalytics, settings:vSettings, help:vHelp}[view];
  if(painted!==S.v+"/"+S.arg){ painted=""; $("view")._h=""; scrollTo(0,0); } fn();
}
/* Draw a screen only when its content changed. The entrance animation and count-up play only the
   first time a screen is opened, not on background refreshes, so nothing jumps or flashes twice.
   Every "V().innerHTML = …" in this file goes through paint(). */
let painted="";
function paint(html, el){
  const root = !el; el = el || $("view");
  if(el._h === html) return false;
  if(root){ const key=S.v+"/"+S.arg; el.classList.toggle("norise", painted===key); painted=key; }
  const y = scrollY; el.innerHTML = html; el._h = html;
  if(root && painted && Math.abs(scrollY-y)>2) scrollTo(0,y);
  return true;
}
const VIEW = new Proxy({}, { get:(t,k)=>{ const el=$("view"), v=el[k]; return typeof v==="function" ? v.bind(el) : v; },
  set:(t,k,v)=>{ if(k==="innerHTML") paint(v); else $("view")[k]=v; return true; } });
const V = () => VIEW;
const firstPaint = () => !$("view").classList.contains("norise");
const pageHead = (title, sub, acts, back) => `<div class="page-head"><div>${back?`<button class="back" type="button" data-back>${I.back}${back}</button>`:""}<h1>${title}</h1>${sub?`<p class="sub">${sub}</p>`:""}</div>${acts?`<div class="acts">${acts}</div>`:""}</div>`;
const newBtn = () => `<button class="btn primary" type="button" data-new>${I.plus}New booking</button>`;
document.addEventListener("click", e => { if(e.target.closest("[data-back]")) go(S.from||homeView()); });
const skel = (n, h) => Array.from({length:n||3}, () => `<div class="skel" style="height:${h||90}px"></div>`).join("");

/* ============================== sheet, pop ============================== */
let sheetFor=null;
function openSheet(title, html, id){ sheetFor=id||null; $("sheetTitle").textContent=title; $("sheetBody").innerHTML=html; $("sheet").hidden=false; $("sheet").querySelector(".sheet-panel").scrollTop=0; }
function closeSheet(){ $("sheet").hidden=true; sheetFor=null; }
$("sheet").addEventListener("click", e => { if(e.target.closest("[data-close]")) closeSheet(); });
function closePop(){ $("pop").hidden=true; }
addEventListener("keydown", e => {
  if(e.key==="Escape"){ if(!$("finder").hidden) return closeFinder(); if(!$("pop").hidden) return closePop(); if(!$("sheet").hidden) closeSheet(); }
  if((e.ctrlKey||e.metaKey) && e.key.toLowerCase()==="k" && !$("shell").hidden){ e.preventDefault(); openFinder(); }
  if(e.key==="/" && !$("shell").hidden && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName) && $("sheet").hidden){ e.preventDefault(); openFinder(); }
});
document.addEventListener("click", e => { if(!$("pop").hidden && !e.target.closest("#pop") && !e.target.closest("[data-bell]")) closePop(); });

/* ============================== messages ============================== */
const DEFAULT_T = {
  confirm:["Confirm booking","Hi {first_name}, this is {brand}. Your {package} for your {vehicle} is confirmed for {date}, {slot}. We'll message you when we're on the way.\nBooking ID: {id}"],
  remind:["Reminder","Hi {first_name}, a reminder from {brand}: your {package} is on {date}, {slot}, at {address}. Please keep the vehicle accessible. Reply here to reschedule."],
  onway:["On my way","Hi {first_name}, your {brand} washer is on the way and will reach in about 20 minutes."],
  review:["Ask for a review","Hi {first_name}, thank you for choosing {brand}! How did we do? Rate your wash here, it takes 20 seconds: {review_link}"],
  rebook:["Rebook (due customers)","Hi {first_name}, it's been {days} days since your last {brand} wash. Shall we book your {package} again? Reply with a day and time that suits you, or book here: {book_link}"],
  lead:["Society request","Hi {first_name}, this is {brand}. Thanks for your society quote request for {society}. When can we visit to see the parking and share a group price?"],
  enquiry:["Reply to a message","Hi {first_name}, this is {brand}. Thanks for your message. "],
  noanswer:["Couldn't reach you","Hi {first_name}, this is {brand}. We tried calling about your {package} on {date}. Please reply here or call us back when free."]
};
function templates(){ const map={}; Object.keys(DEFAULT_T).forEach((k,i)=>map[k]={key:k,title:DEFAULT_T[k][0],body:DEFAULT_T[k][1],position:i}); (SET.templates||[]).forEach(t=>map[t.key]=t); return Object.values(map).sort((a,b)=>a.position-b.position); }
function fill(key, ctx){ const t=templates().find(x=>x.key===key); return (t?t.body:"").replace(/\{(\w+)\}/g, (m,k) => ctx[k]!=null && ctx[k]!=="" ? ctx[k] : m); }
const jobCtx = j => ({first_name:first(j.name), name:j.name, brand:SITE.name, package:j.package, vehicle:vehShort(j.vehicle).toLowerCase(), date:fmtDay(j.wash_date), slot:j.slot,
  address:[j.address, j.area].filter(Boolean).join(", "), id:j.id, total:rupee(j.total), review_link:BASE+"review.html?b="+encodeURIComponent(j.id), book_link:BASE+"book.html"});
const MSG_ACTION = {confirm:"confirm", onway:"on_way", review:"review_asked", remind:"reminded"};

/* ============================== bookings: shared bits ============================== */
const SOURCE = {website:"Website", phone:"Phone", whatsapp:"WhatsApp", walk_in:"Walk-in", society:"Society", instagram:"Instagram", repeat:"Repeat", other:"Other"};
const isPaid = j => /^paid/.test(j.payment);
const colOf = j => j.status==="cancelled" ? "cancelled" : j.status==="done" ? (isPaid(j)?"done":"collect") : j.status;
const PILL = {new:["st-new","New"], confirmed:["st-confirmed","Confirmed"], on_way:["st-on_way","On the way"], collect:["st-collect","To collect"], done:["st-done","Done"], cancelled:["st-cancelled","Cancelled"]};
const pill = j => { const p=PILL[colOf(j)]; return `<span class="pill ${p[0]}">${p[1]}</span>`; };
const payPill = j => isPaid(j) ? `<span class="pill st-done">${j.payment==="paid_upi"?"Paid · UPI":"Paid · cash"}</span>` : j.payment==="refunded" ? `<span class="tag">Refunded</span>` : j.pay_mode==="online" ? `<span class="pill st-collect">UPI pending</span>` : `<span class="tag">Pay after</span>`;
const ord = n => n+(["th","st","nd","rd"][(n%100>10&&n%100<14)?0:n%10]||"th");
function nextStep(j, big){
  const lg = big?" lg":"";
  if(j.status==="cancelled") return `<button class="btn${lg}" data-act="reopen">Reopen booking</button>`;
  if(j.status==="new") return `<a class="btn wa${lg}" data-act="confirm" target="_blank" rel="noopener" href="${wa(j.phone, fill("confirm", jobCtx(j)))}">Confirm on WhatsApp</a>`;
  if(j.status==="confirmed") return `<a class="btn wa${lg}" data-act="on_way" target="_blank" rel="noopener" href="${wa(j.phone, fill("onway", jobCtx(j)))}">Send "On my way"</a>`;
  if(j.status==="on_way") return `<button class="btn primary${lg}" data-act="done">Mark washed</button>`;
  if(!isPaid(j)) return `<button class="btn coral${lg}" data-act="paid_upi">Paid by UPI</button><button class="btn coral${lg}" data-act="paid_cash">Paid in cash</button>`;
  if(!j.review_asked_at) return `<a class="btn${lg}" data-act="review_asked" target="_blank" rel="noopener" href="${wa(j.phone, fill("review", jobCtx(j)))}">Ask for a review</a>`;
  return `<button class="btn${lg}" disabled>All done ✓</button>`;
}
const nextLabel = j => j.status==="cancelled" ? "Cancelled" : j.status==="new" ? "Confirm with the customer" : j.status==="confirmed" ? "Leave for the job" : j.status==="on_way" ? "Finish the wash" : !isPaid(j) ? "Collect "+rupee(j.total) : !j.review_asked_at ? "Ask for a review" : "All done";
function steps(j){ const n = j.status==="cancelled" ? 0 : ({new:0, confirmed:1, on_way:2, done:3})[j.status] + (isPaid(j)?1:0); return `<ol class="steps">${["Confirmed","On the way","Washed","Paid"].map((s,i)=>`<li class="${i<n?"on":""}">${s}</li>`).join("")}</ol>`; }
const discLabel = j => j.promo==="REFERRAL" ? "Referral" : j.promo==="MANUAL" ? ("Discount"+(j.promo_note?" · "+j.promo_note:"")) : j.promo;
function card(j, hero){
  return `<article class="job${hero?" hero":""}" data-id="${esc(j.id)}">
    <div class="job-top"><span class="slot">${esc(j.slot)}</span>${j.status==="new"?'<span class="pill st-new">New</span>':""}${j.visits>0?`<span class="pill st-confirmed">${ord(j.visits+1)} visit</span>`:""}${payPill(j)}</div>
    <h3><button type="button" data-open="${esc(j.id)}">${esc(j.name)}</button> <small>${esc(j.id)}</small></h3>
    <p class="veh"><b>${esc(j.vehicle)}</b>${j.plate?" · "+esc(j.plate):""} — ${esc(j.package)}${j.extras?" + "+esc(j.extras):""}</p>
    <p class="addr">${I.map}<span>${esc(j.address)}${j.area?", "+esc(j.area):""} ${esc(j.pin)}</span></p>
    ${j.assigned_name||(j.source&&j.source!=="website")?`<p class="meta">${j.assigned_name?`<span>Washer: <b>${esc(j.assigned_name)}</b></span>`:""}${j.source&&j.source!=="website"?`<span>From: ${esc(SOURCE[j.source]||j.source)}</span>`:""}</p>`:""}
    ${j.notes?`<p class="note">${esc(j.notes)}</p>`:""}
    ${j.credit>0 && j.status!=="cancelled"?`<div class="credit"><span>${rupee(j.credit)} referral credit — take it off the bill</span><button class="btn sm" data-act="use_credit">Mark used</button></div>`:""}
    <div class="money"><span>${j.discount>0?esc(discLabel(j))+" −"+rupee(j.discount):"To collect"}</span><b class="num">${j.discount>0?`<s>${rupee(j.subtotal)}</s>`:""}${rupee(j.total)}</b></div>
    ${steps(j)}
    <div class="next">${nextStep(j, true)}</div>
    <div class="quick"><a class="btn" href="${tel(j.phone)}" data-call>${I.call}Call</a><a class="btn" target="_blank" rel="noopener" href="${mapUrl(j)}">${I.map}Map</a><button class="btn" type="button" data-chat>${I.chat}Chat</button><button class="btn" type="button" data-open="${esc(j.id)}">${I.more}Open</button></div>
  </article>`;
}
function jrow(j, showDate){
  const cls = j.status==="cancelled" ? " off" : (j.status==="done" && isPaid(j)) ? " done" : "";
  return `<button type="button" class="jrow${cls}" data-open="${esc(j.id)}"><span class="rt">${esc(showDate?relDay(j.wash_date):j.slot)}</span>
    <span class="lr-main"><b>${esc(j.name)}</b><span>${esc(vehShort(j.vehicle))} · ${esc(j.package)}${j.area?" · "+esc(j.area):""}${j.assigned_name?" · "+esc(first(j.assigned_name)):""}</span></span>
    <span class="lr-end"><b class="num">${rupee(j.total)}</b>${pill(j)}</span></button>`;
}

/* one store of bookings for every screen */
const JOBS = new Map(), PINGED = new Set();
let SINCE = store.get("vb.since"), NOTES = store.get("vb.notes")||[];
function remember(list, live){
  const fresh=[]; let newest = SINCE;
  (list||[]).forEach(j => { JOBS.set(j.id, j); if(live && SINCE && j.created_at > SINCE) fresh.push(j); if(!newest || j.created_at > newest) newest = j.created_at; });
  if(live && newest && newest !== SINCE){ SINCE = newest; store.set("vb.since", SINCE); }
  const ping = fresh.filter(j => j.created_by!==(S.me&&S.me.id) && !PINGED.has(j.id)); ping.forEach(j=>PINGED.add(j.id));
  if(ping.length){ NOTES.unshift(...ping.map(j=>({id:j.id, at:j.created_at, text:`New booking: ${j.name}`, sub:`${relDay(j.wash_date)}, ${j.slot} · ${j.package}`}))); NOTES=NOTES.slice(0,30); store.set("vb.notes", NOTES);
    toast(ping.length===1?`New booking: ${ping[0].name} · ${relDay(ping[0].wash_date)}, ${ping[0].slot}`:`${ping.length} new bookings`); try{ navigator.vibrate && navigator.vibrate([60,40,60]); }catch(e){} drawBell(true); }
}
const OPTIMISTIC = {
  confirm: j => ({status: j.status==="new"?"confirmed":j.status, confirmed_at: j.confirmed_at||new Date().toISOString()}),
  on_way: () => ({status:"on_way"}), done: () => ({status:"done"}),
  paid_upi: () => ({payment:"paid_upi"}), paid_cash: () => ({payment:"paid_cash"}), unpaid: () => ({payment:"pending"}),
  cancel: () => ({status:"cancelled"}), reopen: j => ({status: j.confirmed_at?"confirmed":"new"}),
  reminded: () => ({reminder_sent_at:new Date().toISOString()}), review_asked: () => ({review_asked_at:new Date().toISOString()}), use_credit: () => ({credit:0})
};
const DONE_MSG = {confirm:"Confirmed", on_way:"Marked on the way", done:"Marked washed", paid_upi:"Paid by UPI", paid_cash:"Paid in cash", unpaid:"Marked not paid",
  cancel:"Booking cancelled", reopen:"Booking reopened", reminded:"Reminder noted", review_asked:"Review request noted", use_credit:"Credit marked used"};
async function act(id, action, from){
  const before = JOBS.get(id); if(!before) return false;
  JOBS.set(id, Object.assign({}, before, OPTIMISTIC[action](before)));
  redraw(); toast(DONE_MSG[action] + (/^paid/.test(action)?" · "+rupee(before.total):""));
  if(/^paid/.test(action)) celebrate(from);
  try{ const f = await rpc("staff_update", {p_id:id, p_action:action}); JOBS.set(id, f); delete HIST[id]; redraw(); if(S.v==="b") loadHist(id); return true; }
  catch(e){ if(e.message==="signed out") return false; JOBS.set(id, before); redraw(); toast("Couldn't save. Check your internet and try again.", true); return false; }
}
document.addEventListener("click", e => {
  const host = e.target.closest("[data-id]"), a = e.target.closest("[data-act]");
  if(a && host){
    if(a.dataset.act==="cancel" && !a.dataset.sure){ a.dataset.sure="1"; const t=a.textContent; a.textContent="Tap again to cancel"; setTimeout(()=>{ if(a.isConnected){ delete a.dataset.sure; a.textContent=t; } }, 3000); e.preventDefault(); return; }
    act(host.dataset.id, a.dataset.act, a); if(a.tagName==="BUTTON") e.preventDefault(); if(a.closest("#sheet")) closeSheet(); return;
  }
  if(host && e.target.closest("[data-chat]")) return chatSheet(host.dataset.id);
  if(host && e.target.closest("[data-call]")) return setTimeout(()=>callSheet(host.dataset.id), 400);
  const o = e.target.closest("[data-open]"); if(o && !o.classList.contains("jrow-inplace")){ closeSheet(); closePop(); go("b/"+encodeURIComponent(o.dataset.open)); }
});
const DRAW = () => ({home:dHome, jobs:dJobs, bookings:dBookings, b:dBooking});
function redraw(){ const f=DRAW()[S.v]; if(f) f(); }

/* celebration (Studio "booked" confetti) */
function celebrate(from){
  const r = from && from.getBoundingClientRect ? from.getBoundingClientRect() : {left:innerWidth/2, top:innerHeight/2, width:0, height:0};
  const cx=r.left+r.width/2, cy=r.top+r.height/2, cols=["#C9F36A","#55D6C2","#FF895C","#9BCB2E","#F7F8F5"];
  for(let i=0;i<26;i++){ const d=document.createElement("i"); d.className="confetti"; const a=Math.random()*Math.PI*2, s=60+Math.random()*120;
    d.style.cssText=`left:${cx}px;top:${cy}px;background:${cols[i%5]};--x:${Math.cos(a)*s}px;--y:${Math.sin(a)*s-60}px;--r:${Math.random()*720-360}deg`; document.body.appendChild(d); setTimeout(()=>d.remove(),1200); }
}

/* ============================== HOME (owner) ============================== */
let OV=null, ATTN=null, CAL=null, DAYC={};
async function vHome(){
  OV=cache.get("numbers"); ATTN=cache.get("attn"); CAL=cache.get("cal."+S.calMonth); if(ATTN){ remember(ATTN.recent); remember(ATTN.unconfirmed); remember(ATTN.unpaid); } dHome();
  try{ const [o,a,c]=await Promise.all([rpc("owner_overview"), rpc("owner_attention"), rpc("staff_month",{p_month:S.calMonth})]); OV=o; ATTN=a; CAL=c;
    cache.set("numbers",o); cache.set("attn",a); cache.set("cal."+S.calMonth,c); remember(a.recent, true); remember(a.unconfirmed); remember(a.unpaid); setCounts(); if(S.v==="home") dHome(); }
  catch(e){ quiet(e); }
}
function setCounts(){ if(OV) S.inboxCount=(OV.new_leads||0)+(OV.new_enquiries||0)+(OV.pending_reviews||0); if(ATTN) S.attnCount=ATTN.unconfirmed.length+ATTN.unpaid.length; drawNav(); }
const kpi=(l,v,note,cls,goTo)=>`<${goTo?`button type="button" data-go="${goTo}"`:"div"} class="kpi${cls?" "+cls:""}"><div class="label">${l}</div><div class="value num"${typeof v==="number"?` data-count="${v}"`:""}>${v}</div>${note?`<div class="knote">${note}</div>`:""}</${goTo?"button":"div"}>`;
function dHome(){
  if(S.v!=="home") return;
  const h=hour(), greet = h<12?"Good morning":h<17?"Good afternoon":"Good evening", n=SET.notice;
  if(!OV||!ATTN){ V().innerHTML = pageHead(`${greet}, ${esc(first(S.me.name))}`, fmtDay(istToday(),{weekday:"long", day:"numeric", month:"long"}), newBtn()) + `<div class="grid grid-kpi">${skel(5,96)}</div><div class="grid grid-2">${skel(2,300)}</div>`; return; }
  const uc=ATTN.unconfirmed.map(j=>JOBS.get(j.id)||j).filter(j=>j.status==="new"), up=ATTN.unpaid.map(j=>JOBS.get(j.id)||j).filter(j=>j.status==="done"&&!isPaid(j));
  const attn = [
    ...uc.map(j=>`<div class="list-row" data-id="${esc(j.id)}"><span class="lr-main" data-open="${esc(j.id)}"><b>${esc(j.name)} <span class="pill st-new">Not confirmed</span></b><span>${relDay(j.wash_date)}, ${esc(j.slot)} · ${esc(j.package)}</span></span><a class="btn wa sm" data-act="confirm" target="_blank" rel="noopener" href="${wa(j.phone, fill("confirm", jobCtx(j)))}">Confirm</a></div>`),
    ...up.map(j=>`<div class="list-row" data-id="${esc(j.id)}"><span class="lr-main" data-open="${esc(j.id)}"><b>${esc(j.name)} <span class="pill st-collect">Collect ${rupee(j.total)}</span></b><span>Washed ${relDay(j.wash_date)} · ${esc(j.package)}</span></span><button class="btn sm" type="button" data-open="${esc(j.id)}">Open</button></div>`),
    ATTN.unassigned?`<button class="list-row" type="button" data-go="bookings"><span class="lr-main"><b>${ATTN.unassigned} job${ATTN.unassigned>1?"s":""} in the next 3 days with no washer</b><span>Open a booking and choose a washer</span></span>${I.fwd}</button>`:"",
    ATTN.due?`<button class="list-row" type="button" data-go="customers" data-cumode="due"><span class="lr-main"><b>${ATTN.due} customer${ATTN.due>1?"s":""} due for a wash</b><span>Last wash 12+ days ago, nothing booked</span></span><span class="pill st-confirmed">Rebook</span></button>`:"",
    S.inboxCount?`<button class="list-row" type="button" data-go="inbox"><span class="lr-main"><b>${S.inboxCount} new in Inbox</b><span>${[OV.new_leads?OV.new_leads+" society":"",OV.new_enquiries?OV.new_enquiries+" message":"",OV.pending_reviews?OV.pending_reviews+" review":""].filter(Boolean).join(" · ")}</span></span><span class="nav-badge">${S.inboxCount}</span></button>`:""
  ].filter(Boolean);
  const recent = ATTN.recent.map(j=>JOBS.get(j.id)||j);
  V().innerHTML = `<div class="rise" style="display:flex;flex-direction:column;gap:18px">` + pageHead(`${greet}, ${esc(first(S.me.name))}`, fmtDay(istToday(),{weekday:"long", day:"numeric", month:"long"})+` · ${OV.today} job${OV.today===1?"":"s"} today`, newBtn()+`<button class="btn" type="button" data-go="jobs">${I.jobs}Today's jobs</button>`)
    + (n&&n.body?`<div class="notice">${I.note}<div><b>${esc(n.body)}</b><small>${esc(n.by||"")} · ${ago(n.updated_at)}</small></div></div>`:"")
    + `<div class="grid grid-kpi">${kpi("Jobs today",OV.today,"tap to open","","jobs")}${kpi("Upcoming",OV.upcoming,"after today","","bookings")}${kpi("Collected, 7 days",rupee(OV.collected_week))}${kpi("Washed, not paid",rupee(OV.unpaid_amount),OV.unpaid_count+" job"+(OV.unpaid_count===1?"":"s"),OV.unpaid_amount>0?"warn":"")}${kpi("Collected this month",rupee(OV.collected_month),"see Analytics","good","analytics")}</div>`
    + `<div class="grid grid-2"><section class="card"><div class="card-head"><h2>Needs attention</h2>${uc.length+up.length?`<span class="pill st-collect">${uc.length+up.length}</span>`:""}</div>${attn.length?attn.join(""):`<div class="empty"><b>All clear</b>Every booking is confirmed and every finished wash is paid.</div>`}</section>
      <section class="card" id="calCard">${calHTML()}</section></div>`
    + `<section class="card"><div class="card-head"><h2>Recent bookings</h2><button class="link-btn" type="button" data-go="bookings">See all</button></div>${recent.length?`<div style="overflow-x:auto"><table class="data"><thead><tr><th>Booked</th><th>Name</th><th>When</th><th class="hide-sm">Package</th><th class="r">Total</th><th>Status</th></tr></thead><tbody>${recent.map(j=>`<tr data-go="b/${encodeURIComponent(j.id)}"><td class="nw muted small">${ago(j.created_at)}</td><td><b>${esc(j.name)}</b><div class="tiny muted">${esc(SOURCE[j.source]||"")}</div></td><td class="nw">${relDay(j.wash_date)}<div class="tiny muted">${esc(j.slot)}</div></td><td class="hide-sm">${esc(j.package)}</td><td class="r num">${rupee(j.total)}</td><td>${pill(j)}</td></tr>`).join("")}</tbody></table></div>`:'<div class="empty">No bookings yet.</div>'}</section></div>`;
  if(firstPaint()) countUp($("view"));
}
function calHTML(){
  const m=S.calMonth, d0=new Date(m+"T12:00:00Z"), days=new Date(Date.UTC(d0.getUTCFullYear(), d0.getUTCMonth()+1, 0)).getUTCDate();
  const lead=(d0.getUTCDay()+6)%7, t=istToday(); DAYC={}; (CAL||[]).forEach(x=>DAYC[x.date]=x);
  let cells=""; for(let i=0;i<lead;i++) cells+='<span class="cd pad"></span>';
  for(let i=1;i<=days;i++){ const iso=m.slice(0,8)+String(i).padStart(2,"0"), x=DAYC[iso];
    cells+=`<button type="button" class="cd${iso===t?" today":""}${x&&x.count>=3?" busy":""}" data-cday="${iso}" title="${x?x.count+" bookings":"No bookings"}"><b>${i}</b>${x&&x.count?`<span>${x.count}</span>${x.open?`<i>${x.open} open</i>`:""}`:""}</button>`; }
  return `<div class="cal-head"><button class="menu-icon" type="button" data-cm="-1" aria-label="Previous month">${I.back}</button><h3>${fmtDay(m,{month:"long", year:"numeric"})}</h3><button class="menu-icon" type="button" data-cm="1" aria-label="Next month">${I.fwd}</button></div>
    <div class="cal">${["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(w=>`<span class="cw">${w}</span>`).join("")}${cells}</div>`;
}
document.addEventListener("click", async e => {
  const m=e.target.closest("[data-cm]"); if(m){ const d=new Date(S.calMonth+"T12:00:00Z"); d.setUTCMonth(d.getUTCMonth()+(+m.dataset.cm)); S.calMonth=d.toISOString().slice(0,8)+"01";
    CAL=cache.get("cal."+S.calMonth); if($("calCard")) $("calCard").innerHTML=calHTML(); try{ CAL=await rpc("staff_month",{p_month:S.calMonth}); cache.set("cal."+S.calMonth,CAL); if($("calCard")) $("calCard").innerHTML=calHTML(); }catch(x){} return; }
  const d=e.target.closest("[data-cday]"); if(d){ S.day=d.dataset.cday; S.open.clear(); go("jobs"); }
  const cm=e.target.closest("[data-cumode]"); if(cm) S.cu.mode=cm.dataset.cumode;
});
function countUp(root){
  $$("[data-count]", root).forEach(el => { const n=+el.dataset.count; if(!n || el.dataset.done) return; el.dataset.done=1; const t0=performance.now(), dur=600;
    const step=t=>{ const p=Math.min(1,(t-t0)/dur); el.textContent=Math.round(n*(1-Math.pow(1-p,3))); if(p<1) requestAnimationFrame(step); }; requestAnimationFrame(step); });
}

/* ============================== JOBS (day runner) ============================== */
let DAY=null;
async function vJobs(){
  const k="day."+S.day; DAY=cache.get(k); if(DAY) remember(DAY.jobs); dJobs(painted!=="jobs/" || S.dayDrawn!==S.day); S.dayDrawn=S.day;
  try{ const d=await rpc("staff_day",{p_date:S.day}); DAY=d; remember(d.jobs, true); cache.set(k,d); if(S.v==="jobs") dJobs(); } catch(e){ quiet(e); }
}
function dJobs(scroll){
  if(S.v!=="jobs") return;
  const n=SET.notice, meId=S.me&&S.me.id;
  let jobs = DAY ? DAY.jobs.map(j => JOBS.get(j.id) || j).filter(j => j.wash_date===S.day) : [];
  const anyMine = jobs.some(j=>j.assigned_to===meId), filterOn = !isOwner() && anyMine && S.mine;
  if(filterOn) jobs = jobs.filter(j => j.assigned_to===meId || !j.assigned_to);
  const live = jobs.filter(j=>j.status!=="cancelled"), done = live.filter(j=>j.status==="done").length, toCollect = live.filter(j=>!isPaid(j)).reduce((s,j)=>s+j.total,0);
  const acts = (!isOwner()&&anyMine?`<div class="seg"><button type="button" data-mine="1" class="${S.mine?"on":""}">Mine</button><button type="button" data-mine="0" class="${!S.mine?"on":""}">Everyone</button></div>`:"") + newBtn();
  let html = pageHead(relDay(S.day), fmtDay(S.day,{weekday:"long", day:"numeric", month:"long"}) + (live.length?` · ${done}/${live.length} washed`:""), acts)
    + (n&&n.body?`<div class="notice">${I.note}<div><b>${esc(n.body)}</b><small>${esc(n.by||"")} · ${ago(n.updated_at)}</small></div></div>`:"")
    + `<div class="daystrip" id="strip">${DAY?DAY.strip.map(d=>`<button type="button" class="day${d.date===istToday()?" today":""}${d.date===S.day?" sel":""}" data-sday="${d.date}"><small>${fmtDay(d.date,{weekday:"short"})}</small><b>${fmtDay(d.date,{day:"numeric"})}</b><i>${d.count>3?`<em>${d.count}</em>`:Array.from({length:d.count},(_,k)=>`<span class="${k<d.open?"open":""}"></span>`).join("")}</i></button>`).join(""):Array.from({length:8},()=>'<div class="skel" style="flex:none;width:58px;height:66px"></div>').join("")}</div>`;
  if(!DAY){ V().innerHTML = html + skel(2,260); return; }
  if(live.length) html += `<div class="row"><div class="prog"><i style="width:${Math.round(done/live.length*100)}%"></i></div><span class="small muted"><b style="color:var(--ink)">${done}/${live.length}</b> washed · ${toCollect?`<b style="color:var(--coral)">${rupee(toCollect)}</b> to collect`:"all paid"}</span></div>`;
  if(!jobs.length) html += `<section class="card empty"><b>No jobs ${S.day===istToday()?"today":"on "+fmtDay(S.day)}</b>New bookings from the website appear here by themselves.<div style="margin-top:14px">${newBtn()}</div></section>`;
  else {
    const open = live.filter(j => ["new","confirmed","on_way"].includes(j.status)), collect = live.filter(j => j.status==="done" && !isPaid(j)),
      finished = live.filter(j => j.status==="done" && isPaid(j)), cancelled = jobs.filter(j => j.status==="cancelled"), hero = open[0];
    const sec = (t, list, body) => list.length ? `<div class="grp"><h2>${t} · ${list.length}</h2></div><div class="jobs">${body}</div>` : "";
    const many = list => list.map(j => S.open.has(j.id) ? card(j) : jrow(j).replace('class="jrow', 'class="jrow jrow-inplace')).join("");
    html += (hero?`<div class="grp"><h2>Up next</h2></div><div class="jobs">${card(hero,true)}</div>`:"") + sec("To collect", collect, collect.map(j=>card(j)).join(""))
      + sec("Coming up", open.slice(1), many(open.slice(1))) + sec("Finished", finished, many(finished)) + sec("Cancelled", cancelled, many(cancelled));
  }
  V().innerHTML = html;
  const st=$("strip"), sel=st&&st.querySelector(".sel"); if(sel && (scroll||!st._did)){ st.scrollLeft = sel.offsetLeft - st.clientWidth/2 + sel.offsetWidth/2; st._did=1; }
}
document.addEventListener("click", e => {
  const d=e.target.closest("[data-sday]"); if(d){ S.day=d.dataset.sday; S.open.clear(); vJobs(); }
  const m=e.target.closest("[data-mine]"); if(m){ S.mine=m.dataset.mine==="1"; store.set("vb.mine",S.mine); dJobs(); }
  const r=e.target.closest(".jrow-inplace"); if(r){ const id=r.dataset.open; S.open.has(id)?S.open.delete(id):S.open.add(id); dJobs(); }
});

/* ============================== BOOKINGS: board + table ============================== */
let BK=null, bkTimer=0;
const RANGES = {today:["Today",()=>[istToday(),istToday()]], week:["Next 7 days",()=>[istToday(),addDays(istToday(),6)]], month:["Next 30 days",()=>[istToday(),addDays(istToday(),29)]], past:["Last 30 days",()=>[addDays(istToday(),-30),addDays(istToday(),-1)]], all:["±60 days",()=>[addDays(istToday(),-60),addDays(istToday(),60)]]};
async function vBookings(){
  dBookings(!$("bkBody") || painted!=="bookings/");
  const k="bk."+S.bk.range+"."+S.bk.q; BK=cache.get(k); if(BK){ remember(BK); dBookings(); }
  try{ BK = S.bk.q ? await rpc("staff_bookings",{p_query:S.bk.q, p_from:addDays(istToday(),-365), p_limit:200}) : await rpc("staff_range",{p_from:RANGES[S.bk.range][1]()[0], p_to:RANGES[S.bk.range][1]()[1]});
    remember(BK, true); cache.set(k,BK); if(S.v==="bookings") dBookings(); } catch(e){ quiet(e); }
}
function bkList(){ let list=(BK||[]).map(j=>JOBS.get(j.id)).filter(Boolean); if(S.bk.washer) list=list.filter(j=>S.bk.washer==="none"?!j.assigned_to:j.assigned_to===S.bk.washer); return list; }
function dBookings(shell){
  if(S.v!=="bookings") return;
  if(shell || !$("bkBody")){
    V().innerHTML = pageHead("Bookings", "<span id='bkSub'></span>", newBtn()) + `<div class="toolbar">
      <div class="seg" id="bkMode"><button type="button" data-bkmode="board" class="${S.bk.mode==="board"?"on":""}">${I.board} Board</button><button type="button" data-bkmode="table" class="${S.bk.mode==="table"?"on":""}">${I.menu} Table</button></div>
      <div class="seg">${Object.keys(RANGES).map(k=>`<button type="button" data-bkrange="${k}" class="${S.bk.range===k&&!S.bk.q?"on":""}">${RANGES[k][0]}</button>`).join("")}</div>
      ${isOwner()?`<select class="input" id="bkWasher" aria-label="Washer"><option value="">Every washer</option><option value="none" ${S.bk.washer==="none"?"selected":""}>No washer yet</option>${(SET.team||[]).map(t=>`<option value="${t.id}" ${S.bk.washer===t.id?"selected":""}>${esc(t.name)}</option>`).join("")}</select>`:""}
      <label class="search-in grow">${I.search}<input class="input" id="bkQ" type="search" placeholder="Search name, mobile, plate, area, ID" value="${esc(S.bk.q)}" autocomplete="off"></label></div>
      <div id="bkBody"></div>`;
  }
  const el=box($("bkBody")), list=bkList();
  $("bkSub").textContent = !BK ? "" : S.bk.q ? `${list.length} found for “${S.bk.q}”` : `${list.length} booking${list.length===1?"":"s"} · ${RANGES[S.bk.range][0].toLowerCase()} · ${rupee(list.filter(j=>j.status!=="cancelled").reduce((s,j)=>s+j.total,0))}`;
  if(!BK){ el.innerHTML = `<div class="grid grid-3">${skel(3,240)}</div>`; return; }
  if(S.bk.mode==="board"){
    const cols=[["new","New"],["confirmed","Confirmed"],["on_way","On the way"],["collect","To collect"],["done","Done"],["cancelled","Cancelled"]];
    el.innerHTML = `<div class="board-wrap"><div class="board">${cols.map(([k,t])=>{ const items=list.filter(j=>colOf(j)===k); const sum=items.reduce((s,j)=>s+j.total,0);
      return `<div class="col" data-col="${k}"><div class="col-head">${t}<span>${items.length}${items.length&&k!=="cancelled"?" · "+rupee(sum):""}</span></div>${items.map(j=>`<button type="button" class="lead-card" draggable="true" data-card="${esc(j.id)}" data-open="${esc(j.id)}">
        <span class="name">${esc(j.name)}</span><span class="meta">${relDay(j.wash_date)}, ${esc(j.slot)}</span><span class="meta">${esc(vehShort(j.vehicle))} · ${esc(j.package)}</span>
        <span class="foot"><b class="num">${rupee(j.total)}</b>${j.assigned_name?`<span class="tag">${esc(first(j.assigned_name))}</span>`:`<span class="tag">${esc(SOURCE[j.source]||"")}</span>`}</span>
        ${k==="new"||k==="collect"?`<span class="next meta${k==="collect"?" late":""}">${esc(nextLabel(j))}</span>`:""}</button>`).join("")}</div>`; }).join("")}</div></div>
      <p class="tiny muted">${matchMedia("(pointer:fine)").matches?"Drag a card to another column to move it along. ":"Scroll sideways to see every column. "}Tap a card to open the booking.</p>`;
  } else {
    const cols=[["date","When"],["name","Name"],["vehicle","Vehicle"],["package","Package"],["area","Area"],["washer","Washer"],["total","Total"],["status","Status"]];
    const val={date:j=>j.wash_date+(SLOTS.indexOf(j.slot)), name:j=>j.name.toLowerCase(), vehicle:j=>j.vehicle, package:j=>j.package, area:j=>j.area, washer:j=>j.assigned_name||"", total:j=>j.total, status:j=>Object.keys(PILL).indexOf(colOf(j))};
    const sorted=list.slice().sort((a,b)=>{ const x=val[S.bk.sort](a), y=val[S.bk.sort](b); return (x>y?1:x<y?-1:0)*S.bk.dir; });
    el.innerHTML = sorted.length ? `<div class="table-wrap"><table class="data"><thead><tr>${cols.map(([k,t])=>`<th data-sort="${k}" class="${k==="total"?"r":""}${["vehicle","area","washer"].includes(k)?" hide-sm":""}">${t}${S.bk.sort===k?`<span class="ar">${S.bk.dir>0?" ↑":" ↓"}</span>`:""}</th>`).join("")}</tr></thead>
      <tbody>${sorted.map(j=>`<tr data-go="b/${encodeURIComponent(j.id)}"><td class="nw"><b>${relDay(j.wash_date)}</b><div class="tiny muted">${esc(j.slot)}</div></td><td><b>${esc(j.name)}</b><div class="tiny muted">${esc(fmtPhone(j.phone))}</div></td><td class="hide-sm">${esc(vehShort(j.vehicle))}${j.plate?`<div class="tiny muted">${esc(j.plate)}</div>`:""}</td><td>${esc(j.package)}</td><td class="hide-sm">${esc(j.area)}</td><td class="hide-sm">${esc(j.assigned_name||"—")}</td><td class="r num">${rupee(j.total)}</td><td>${pill(j)}</td></tr>`).join("")}</tbody></table></div>`
      : `<section class="card empty"><b>${S.bk.q?"Nothing found":"No bookings"}</b>${S.bk.q?"Try a name, mobile, plate or booking ID.":"Pick another range."}</section>`;
  }
}
document.addEventListener("click", e => {
  const m=e.target.closest("[data-bkmode]"); if(m){ S.bk.mode=m.dataset.bkmode; store.set("vb.bk",{mode:S.bk.mode, range:S.bk.range}); $$("#bkMode button").forEach(b=>b.classList.toggle("on", b===m)); dBookings(); }
  const r=e.target.closest("[data-bkrange]"); if(r){ S.bk.range=r.dataset.bkrange; S.bk.q=""; store.set("vb.bk",{mode:S.bk.mode, range:S.bk.range}); BK=null; vBookings(); }
  const s=e.target.closest("th[data-sort]"); if(s){ const k=s.dataset.sort; S.bk.dir = S.bk.sort===k ? -S.bk.dir : 1; S.bk.sort=k; dBookings(); }
  const tr=e.target.closest("tr[data-go]"); if(tr) go(tr.dataset.go);
});
document.addEventListener("change", e => { if(e.target.id==="bkWasher"){ S.bk.washer=e.target.value; dBookings(); } });
document.addEventListener("input", e => { if(e.target.id==="bkQ"){ clearTimeout(bkTimer); bkTimer=setTimeout(async()=>{ S.bk.q=e.target.value.trim(); BK=null; await vBookings(); const q=$("bkQ"); if(q){ q.focus(); q.setSelectionRange(q.value.length,q.value.length); } }, 350); } });
let dragId=null;
document.addEventListener("dragstart", e => { const c=e.target.closest&&e.target.closest("[data-card]"); if(!c) return; dragId=c.dataset.card; c.classList.add("dragging"); e.dataTransfer.effectAllowed="move"; e.dataTransfer.setData("text/plain", dragId); });
document.addEventListener("dragend", e => { const c=e.target.closest&&e.target.closest("[data-card]"); if(c) c.classList.remove("dragging"); $$(".col.drop").forEach(x=>x.classList.remove("drop")); });
document.addEventListener("dragover", e => { const col=e.target.closest&&e.target.closest("[data-col]"); if(!col||!dragId) return; e.preventDefault(); $$(".col.drop").forEach(x=>x!==col&&x.classList.remove("drop")); col.classList.add("drop"); });
document.addEventListener("drop", e => { const col=e.target.closest&&e.target.closest("[data-col]"); if(!col||!dragId) return; e.preventDefault(); col.classList.remove("drop"); const id=dragId; dragId=null; moveTo(id, col.dataset.col, col); });
async function moveTo(id, to, el){
  const j=JOBS.get(id); if(!j) return; const from=colOf(j); if(from===to) return;
  const order=["new","confirmed","on_way","collect","done"];
  if(to==="cancelled") return confirmSheet(`Cancel ${first(j.name)}'s booking?`, `${relDay(j.wash_date)}, ${j.slot} · ${j.package}`, "Cancel booking", () => act(id,"cancel"));
  if(from==="cancelled"){ if(to==="new"||to==="confirmed") return act(id,"reopen"); return toast("Reopen it first: move it to New or Confirmed.", true); }
  if(to==="done"){ if(j.status!=="done"){ if(!await act(id,"done")) return; } return paySheet(id); }
  if(from==="done" && to==="collect") return act(id,"unpaid");
  if(order.indexOf(to) < order.indexOf(from)) return toast("It can't move back. Open the booking to change it.", true);
  const seq = {confirmed:["confirm"], on_way:["on_way"], collect:["done"]}[to].slice();
  if(to==="on_way" && from==="new") seq.unshift("confirm");
  for(const a of seq){ if(!await act(id,a)) return; }
}
function paySheet(id){ const j=JOBS.get(id); openSheet(`How did ${first(j.name)} pay?`, `<div class="menu" data-id="${esc(id)}"><p class="muted">${rupee(j.total)} · ${esc(j.package)}</p><button class="btn coral" data-act="paid_upi">Paid by UPI</button><button class="btn coral" data-act="paid_cash">Paid in cash</button><button class="btn" type="button" data-close>Not paid yet</button></div>`); }
function confirmSheet(title, sub, label, fn){ openSheet(title, `<div class="menu"><p class="muted">${esc(sub)}</p><button class="btn danger" type="button" id="cfYes">${esc(label)}</button><button class="btn" type="button" data-close>Keep it</button></div>`); $("cfYes").onclick=()=>{ closeSheet(); fn(); }; }

/* ============================== BOOKING PAGE ============================== */
let HIST={};
async function vBooking(){
  const id=S.arg; dBooking();
  if(!JOBS.has(id)){ try{ const r=await rpc("staff_bookings",{p_query:id, p_from:addDays(istToday(),-365), p_limit:5}); remember(r); }catch(e){ quiet(e); } if(!JOBS.has(id)){ V().innerHTML = pageHead("Booking not found", "It may have been deleted.", "", "Back"); return; } dBooking(); }
  loadHist(id);
}
async function loadHist(id){ try{ HIST[id]=await rpc("booking_history",{p_id:id}); }catch(e){ HIST[id]=HIST[id]||[]; } if(S.v==="b" && S.arg===id && $("hist")) $("hist").innerHTML=histHTML(id); }
function histHTML(id){ const h=HIST[id]; if(!h) return '<li><div class="skel" style="height:40px;width:100%"></div></li>'; if(!h.length) return '<li class="muted">Nothing yet.</li>';
  return h.map(x=>`<li class="k-${x.kind}"><span class="dot"></span><div>${esc(x.detail)}<small>${esc(x.who||"Website")} · ${fmtTime(x.at)}</small></div></li>`).join(""); }
function dBooking(){
  if(S.v!=="b") return;
  const j=JOBS.get(S.arg);
  if(!j){ V().innerHTML = pageHead("Booking", "Loading…", "", "Back") + `<div class="split"><div class="wide">${skel(2,200)}</div><div class="narrow">${skel(1,200)}</div></div>`; return; }
  const typed = $("noteIn") && $("noteIn").value;
  const stops=[["new","New"],["confirmed","Confirmed"],["on_way","On the way"],["done","Washed"],["paid","Paid"]];
  const at = j.status==="cancelled" ? -1 : isPaid(j) && j.status==="done" ? 4 : ["new","confirmed","on_way","done"].indexOf(j.status);
  V().innerHTML = `<div style="display:flex;flex-direction:column;gap:16px" data-id="${esc(j.id)}">`
    + pageHead(esc(j.name), `${esc(j.id)} · ${esc(SOURCE[j.source]||j.source)} · booked ${ago(j.created_at)}`, `${pill(j)} ${payPill(j)}`, "Back")
    + `<ol class="stepper${j.status==="cancelled"?" off":""}">${stops.map(([k,t],i)=>`<li><button type="button" data-stop="${k}" class="${i<at?"done":i===at?"on":""}">${t}${i===at&&k!=="paid"?"<small>now</small>":""}</button></li>`).join("")}</ol>`
    + `<div class="split"><div class="wide">
        <section class="dark-card"><div class="label">Next step</div><div class="big" style="font-size:22px">${esc(nextLabel(j))}</div><div class="next">${nextStep(j)}</div></section>
        <section class="card"><div class="card-head"><h2>The job</h2><button class="btn sm" type="button" data-edit>Edit</button></div>
          <dl class="dl"><dt>When</dt><dd><b>${relDay(j.wash_date)}</b>, ${fmtDay(j.wash_date,{day:"numeric", month:"long"})} · ${esc(j.slot)}</dd>
          <dt>Vehicle</dt><dd>${esc(j.vehicle)}${j.plate?" · <b>"+esc(j.plate)+"</b>":""}</dd>
          <dt>Package</dt><dd>${esc(j.package)}${j.extras?"<br><span class='muted'>+ "+esc(j.extras)+"</span>":""}</dd>
          <dt>Address</dt><dd>${esc(j.address)}${j.area?", "+esc(j.area):""} ${esc(j.pin)} · <a href="${mapUrl(j)}" target="_blank" rel="noopener">Map</a></dd>
          ${j.notes?`<dt>Notes</dt><dd><span class="note" style="display:inline-block">${esc(j.notes)}</span></dd>`:""}
          <dt>Washer</dt><dd>${isOwner()?`<select class="input" data-assign style="max-width:260px"><option value="">Nobody yet</option>${(SET.team||[]).map(t=>`<option value="${t.id}" ${t.id===j.assigned_to?"selected":""}>${esc(t.name)}${t.role==="owner"?" (owner)":""}</option>`).join("")}</select>`:esc(j.assigned_name||"Nobody yet")}</dd>
          <dt>Came from</dt><dd>${esc(SOURCE[j.source]||j.source)}</dd>
          ${j.promo_note&&j.promo!=="MANUAL"?`<dt>Offer note</dt><dd>${esc(j.promo_note)}</dd>`:""}</dl></section>
        <section class="card"><div class="card-head"><h2>History and notes</h2></div>
          <form class="row" id="noteForm" style="margin-bottom:16px"><input class="input" id="noteIn" placeholder="Add a note (gate code, parking slot…)" maxlength="500" autocomplete="off" style="flex:1;min-width:180px"><button class="btn" type="submit">Add note</button></form>
          <ol class="timeline" id="hist">${histHTML(j.id)}</ol></section>
      </div><div class="narrow">
        <section class="dark-card"><div class="label">${isPaid(j)?"Paid":"To collect"}</div><div class="big num">${rupee(j.total)}${j.discount>0?`<s>${rupee(j.subtotal)}</s>`:""}</div>
          ${j.discount>0?`<div class="muted small">${esc(discLabel(j))} −${rupee(j.discount)}</div>`:""}
          ${j.credit>0&&j.status!=="cancelled"?`<div class="alert ok">${rupee(j.credit)} referral credit. Take it off the bill. <button class="btn sm" data-act="use_credit" style="margin-top:6px">Mark used</button></div>`:""}
          ${j.status!=="cancelled"?(isPaid(j)?`<div class="row"><span class="pill st-done">${j.payment==="paid_upi"?"Paid by UPI":"Paid in cash"}</span><button class="btn sm" data-act="unpaid">Undo</button></div>`:`<div class="row"><button class="btn coral sm" data-act="paid_upi">Paid by UPI</button><button class="btn coral sm" data-act="paid_cash">Paid in cash</button></div>`):""}
          <div class="muted small">${j.pay_mode==="online"?"Customer chose to pay online (UPI)":"Pay after the wash"}</div></section>
        <section class="card"><div class="card-head"><h2>Customer</h2>${j.visits?`<span class="pill st-confirmed">${ord(j.visits+1)} visit</span>`:""}</div>
          <p><b>${esc(j.name)}</b><br><span class="muted">${esc(fmtPhone(j.phone))}</span></p>
          <div class="contact-acts" style="margin-top:12px"><a class="btn" href="${tel(j.phone)}" data-call>${I.call}Call</a><button class="btn wa" type="button" data-chat>${I.chat}WhatsApp</button><a class="btn" target="_blank" rel="noopener" href="${mapUrl(j)}">${I.map}Map</a><button class="btn" type="button" data-ics>${I.cal}Calendar</button></div>
          ${isOwner()?`<button class="link-btn small" type="button" data-cust="${j.phone}" style="margin-top:12px">All bookings for this customer</button>`:""}</section>
        <section class="card"><div class="card-head"><h2>More</h2></div><div class="menu">
          <a class="btn" data-act="reminded" target="_blank" rel="noopener" href="${wa(j.phone, fill("remind", jobCtx(j)))}">Send reminder${j.reminder_sent_at?` · sent ${ago(j.reminder_sent_at)}`:""}</a>
          ${j.status==="done"?`<a class="btn" data-act="review_asked" target="_blank" rel="noopener" href="${wa(j.phone, fill("review", jobCtx(j)))}">Ask for a review${j.review_asked_at?` · asked ${ago(j.review_asked_at)}`:""}</a>`:""}
          ${j.status==="cancelled"?`<button class="btn" data-act="reopen">Reopen booking</button>`:`<button class="btn danger" data-act="cancel">Cancel booking</button>`}</div></section>
      </div></div></div>`;
  if(typed) $("noteIn").value=typed;
}
document.addEventListener("click", e => {
  const s=e.target.closest("[data-stop]"); if(s && S.v==="b"){ const j=JOBS.get(S.arg), k=s.dataset.stop; if(!j||s.classList.contains("on")) return;
    if(j.status==="cancelled") return toast("This booking is cancelled. Reopen it under More.", true);
    moveTo(j.id, {new:"new", confirmed:"confirmed", on_way:"on_way", done:"collect", paid:"done"}[k], s); }
  if(e.target.closest("[data-edit]")){ const h=e.target.closest("[data-id]"); if(h) bookingForm(JOBS.get(h.dataset.id)); }
  if(e.target.closest("[data-ics]")){ const h=e.target.closest("[data-id]"); if(h) ics(JOBS.get(h.dataset.id)); }
});
document.addEventListener("change", async e => {
  const s=e.target.closest("[data-assign]"); if(!s) return; const id=s.closest("[data-id]").dataset.id;
  try{ const j=await rpc("owner_assign",{p_id:id, p_staff:s.value||null}); JOBS.set(j.id,j); toast(s.value?"Given to "+s.selectedOptions[0].text:"Unassigned"); dBooking(); loadHist(id); } catch(err){ toast(err.message, true); }
});
document.addEventListener("submit", async e => {
  if(e.target.id!=="noteForm") return; e.preventDefault(); const id=S.arg, v=$("noteIn").value.trim(); if(!v) return;
  $("noteIn").value=""; (HIST[id]=HIST[id]||[]).unshift({at:new Date().toISOString(), who:S.me.name, kind:"note", detail:v}); $("hist").innerHTML=histHTML(id);
  try{ await rpc("staff_log",{p_id:id, p_kind:"note", p_detail:v}); toast("Note added"); } catch(err){ toast("Couldn't save the note", true); loadHist(id); }
});
const SLOT_H = {"6–8 AM":[6,8], "8–10 AM":[8,10], "10 AM–1 PM":[10,13], "2–5 PM":[14,17], "5–8 PM":[17,20]};
function ics(j){
  const [a,b]=SLOT_H[j.slot]||[9,10], d=j.wash_date.replace(/-/g,""), pad=n=>String(n).padStart(2,"0"), clean=s=>String(s).replace(/[,;\n]/g," ");
  const body=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Vroombrite//Staff//EN","BEGIN:VEVENT","UID:"+j.id+"@vroombrite","DTSTAMP:"+new Date().toISOString().replace(/[-:]/g,"").slice(0,15)+"Z",
    "DTSTART;TZID=Asia/Kolkata:"+d+"T"+pad(a)+"0000","DTEND;TZID=Asia/Kolkata:"+d+"T"+pad(b)+"0000","SUMMARY:"+clean(j.package+" · "+j.name),"LOCATION:"+clean([j.address,j.area,j.pin].filter(Boolean).join(" ")),
    "DESCRIPTION:"+clean(j.id+" · "+j.vehicle+(j.plate?" "+j.plate:"")+" · "+fmtPhone(j.phone)+(j.notes?" · "+j.notes:"")),"END:VEVENT","END:VCALENDAR"].join("\r\n");
  const el=document.createElement("a"); el.href=URL.createObjectURL(new Blob([body],{type:"text/calendar"})); el.download=j.id+".ics"; document.body.appendChild(el); el.click(); setTimeout(()=>{ URL.revokeObjectURL(el.href); el.remove(); },500);
}
function chatSheet(id){
  const j=JOBS.get(id); if(!j) return; const ctx=jobCtx(j);
  openSheet("Message "+first(j.name), `<div class="menu" data-msgfor="${esc(id)}">${templates().filter(t=>!["rebook","lead","enquiry"].includes(t.key)).map(t=>
    `<a class="btn msgpick" target="_blank" rel="noopener" data-msg="${t.key}" href="${wa(j.phone, fill(t.key, ctx))}"><b>${esc(t.title)}</b><small>${esc(fill(t.key, ctx).slice(0,120))}…</small></a>`).join("")}
    <a class="btn" target="_blank" rel="noopener" data-msg="" href="${wa(j.phone)}">Open chat without a message</a></div>`);
}
$("sheetBody").addEventListener("click", e => {
  const a=e.target.closest("[data-msg]"); if(!a) return; const id=a.closest("[data-msgfor]").dataset.msgfor, k=a.dataset.msg, j=JOBS.get(id); closeSheet(); if(!k) return;
  const action=MSG_ACTION[k], title=templates().find(t=>t.key===k).title, log=()=>rpc("staff_log",{p_id:id,p_kind:"message",p_detail:"Sent: "+title}).then(()=>{ delete HIST[id]; if(S.v==="b") loadHist(id); }).catch(()=>{});
  if(action==="confirm" && j.status!=="new") return log();
  if(action==="on_way" && ["on_way","done","cancelled"].includes(j.status)) return log();
  if(action) return act(id, action);
  log(); toast("Noted in history");
});
function callSheet(id){
  const j=JOBS.get(id); if(!j) return;
  openSheet("How did the call go?", `<div class="menu" data-callfor="${esc(id)}"><button class="btn" type="button" data-out="Talked">Talked</button>
    <a class="btn" target="_blank" rel="noopener" data-out="No answer" href="${wa(j.phone, fill("noanswer", jobCtx(j)))}">No answer · send "Couldn't reach you" on WhatsApp</a>
    <button class="btn" type="button" data-out="No answer">No answer</button><button class="btn" type="button" data-out="Busy, call later">Busy, call later</button><button class="link-btn" type="button" data-close>Skip</button></div>`);
}
$("sheetBody").addEventListener("click", e => {
  const b=e.target.closest("[data-out]"); if(!b) return; const id=b.closest("[data-callfor]").dataset.callfor; closeSheet();
  rpc("staff_log",{p_id:id, p_kind:"call", p_detail:"Call: "+b.dataset.out}).then(()=>{ toast("Call noted"); delete HIST[id]; if(S.v==="b") loadHist(id); }).catch(()=>toast("Couldn't save", true));
});

/* ============================== NEW / EDIT BOOKING ============================== */
const VEH = [["hatch","Car · Hatchback","Hatchback"],["sedan","Car · Sedan","Sedan"],["suv","Car · SUV / MUV","SUV / MUV"],["bike","Bike / Scooter","Bike / Scooter"]];
const SOURCES = ["phone","whatsapp","walk_in","society","instagram","repeat","other"];
const sizeOf = v => { const x=VEH.find(a=>a[1]===v); return x?x[0]: /bike|scooter/i.test(v)?"bike": /suv|muv/i.test(v)?"suv": /sedan/i.test(v)?"sedan":"hatch"; };
const areaFor = pin => { const a=(AREAS||[]).find(x=>(x.pins||[]).includes(String(pin))); return a?a.a:""; };
let F=null;
function bookingForm(j, pre){
  const editing=!!j, own=isOwner(), limited = editing && !own;
  const v = j ? j : Object.assign({vehicle:"Car · Hatchback", package:"", extras:"", wash_date: S.v==="jobs"&&S.day>=istToday()?S.day:istToday(), slot:"", source:"phone", subtotal:0, discount:0}, pre||{});
  const size=sizeOf(v.vehicle), type=size==="bike"?"bike":"car";
  F={editing, id:j&&j.id, size, type, auto:!editing, pkg:PKG[type].findIndex(p=>p.n===v.package), extras:String(v.extras||"").split(/\s*,\s*/).filter(Boolean)};
  const sec=(t,h)=>`<fieldset class="fs"><legend>${t}</legend>${h}</fieldset>`;
  openSheet(editing?"Edit "+first(j.name)+"'s booking":"New booking", `<form id="bform" class="form-section" novalidate>
    ${!editing?`<div class="paste"><textarea class="input" id="fPaste" rows="3" placeholder="Paste the customer's WhatsApp message here and tap Fill"></textarea><button class="btn" type="button" id="fFill">Fill</button></div><div class="alert" id="fPasteMsg" hidden></div>`:""}
    ${limited?"":sec("Customer",`<div class="form-grid"><label class="field">Mobile<input id="fPhone" type="tel" inputmode="numeric" maxlength="14" value="${esc(v.phone||"")}" autocomplete="off"></label><label class="field">Name<input id="fName" value="${esc(v.name||"")}" maxlength="80" autocomplete="off"></label></div><div class="alert ok" id="fCust" hidden></div>`)}
    ${sec("Vehicle",`${limited?"":`<div class="chips" id="fVeh">${VEH.map(x=>`<button type="button" class="chip${x[0]===size?" on":""}" data-veh="${x[0]}">${x[2]}</button>`).join("")}</div>`}<label class="field">Number plate<input id="fPlate" value="${esc(v.plate||"")}" maxlength="20" autocomplete="off" style="text-transform:uppercase"></label>`)}
    ${limited?"":sec("Package and price",`<div class="opts" id="fPkg"></div><div class="opts" id="fAdd"></div>
      <div class="form-grid"><label class="field">Price ₹<input id="fSub" type="number" inputmode="numeric" min="0" value="${v.subtotal||""}"></label><label class="field">Discount ₹<input id="fDisc" type="number" inputmode="numeric" min="0" value="${v.discount||""}"></label><label class="field">Reason<input id="fWhy" maxlength="120" value="${esc(v.promo==="MANUAL"?v.promo_note:"")}" placeholder="e.g. regular customer"></label></div><p class="total" id="fTotal"></p>`)}
    ${limited?"":sec("When",`<div class="form-grid"><label class="field">Day<input id="fDate" type="date" value="${esc(v.wash_date)}"></label><div class="chips" style="align-self:end"><button type="button" class="chip" data-dq="0">Today</button><button type="button" class="chip" data-dq="1">Tomorrow</button></div></div>
      <div class="chips" id="fSlot">${SLOTS.map(s=>`<button type="button" class="chip${s===v.slot?" on":""}" data-slot="${esc(s)}">${esc(s)}</button>`).join("")}</div><div class="alert warn" id="fClash" hidden></div>`)}
    ${limited?"":sec("Where",`<label class="field">Address (flat, building, society, landmark)<textarea id="fAddr" rows="2" maxlength="300">${esc(v.address||"")}</textarea></label>
      <div class="form-grid"><label class="field">PIN code<input id="fPin" inputmode="numeric" maxlength="6" value="${esc(v.pin||"")}"></label><label class="field">Area<input id="fArea" maxlength="60" value="${esc(v.area||"")}" list="fAreas"></label></div><datalist id="fAreas">${(AREAS||[]).map(a=>`<option value="${esc(a.a)}">`).join("")}</datalist>`)}
    ${sec("Notes",`<label class="field">Notes for the washer<textarea id="fNotes" rows="2" maxlength="500">${esc(v.notes||"")}</textarea></label>`)}
    ${!editing?sec("Came from",`<div class="chips" id="fSrc">${SOURCES.map(s=>`<button type="button" class="chip${s===v.source?" on":""}" data-src="${s}">${SOURCE[s]}</button>`).join("")}</div>`):""}
    ${!editing&&own?sec("Washer",`<label class="field"><select id="fWho"><option value="">Nobody yet</option>${(SET.team||[]).map(t=>`<option value="${t.id}">${esc(t.name)}</option>`).join("")}</select></label>`):""}
    ${!editing?`<label class="tick"><input type="checkbox" id="fConf" checked> Already confirmed with the customer</label>`:""}
    <div class="alert error" id="fErr" hidden></div>
    <button class="btn primary lg" type="submit" id="fSave">${editing?"Save changes":"Save booking"}</button>
    ${editing&&own?`<button class="btn danger" type="button" id="fDel">Delete booking</button>`:""}</form>`, editing?"edit:"+j.id:"new");
  if(!limited){ drawPkg(); calc(); clash(); }
}
function drawPkg(){
  const pr=PRICE[F.size]||PRICE.hatch;
  $("fPkg").innerHTML = PKG[F.type].map((p,i)=>`<label class="opt"><input type="radio" name="fpkg" value="${i}" ${i===F.pkg?"checked":""}><span><b>${esc(p.n)}</b><small>${esc(p.t)}</small></span><strong>${rupee(pr[i])}</strong></label>`).join("");
  const adds = ADDONS[F.type].map(a=>({n:a.n,p:a.p})).concat(F.type==="car"?DETAIL.map(d=>({n:d.n,p:d.p})):[]);
  $("fAdd").innerHTML = `<p class="opt-h">Add-ons${F.type==="car"?" and detailing":""}</p>` + adds.map(a=>`<label class="opt sm"><input type="checkbox" name="fadd" value="${esc(a.n)}" data-p="${a.p}" ${F.extras.includes(a.n)?"checked":""}><span>${esc(a.n)}</span><strong>+${rupee(a.p)}</strong></label>`).join("");
}
function calc(){
  if(F.auto){ const pr=PRICE[F.size]||PRICE.hatch; let s = F.pkg>=0 ? pr[F.pkg] : 0; $$('#fAdd input:checked').forEach(c=>s+=+c.dataset.p); $("fSub").value = s||""; }
  const sub=+$("fSub").value||0, d=Math.min(+$("fDisc").value||0, sub);
  $("fTotal").innerHTML = sub ? `Customer pays <b class="num">${rupee(sub-d)}</b>${d?` <s>${rupee(sub)}</s>`:""}` : "Pick a package";
}
async function clash(){
  const el=$("fClash"); if(!el) return; const d=$("fDate").value, sl=($("fSlot").querySelector(".on")||{}).dataset; if(!d||!sl||!sl.slot){ el.hidden=true; return; }
  let day=cache.get("day."+d); try{ day=await rpc("staff_day",{p_date:d}); cache.set("day."+d,day); }catch(e){}
  if(!$("fClash")) return;
  const same=((day&&day.jobs)||[]).filter(x=>x.slot===sl.slot && x.status!=="cancelled" && x.id!==F.id);
  el.hidden=!same.length; if(same.length) el.innerHTML=`Already ${same.length} booking${same.length>1?"s":""} at ${esc(sl.slot)} on ${fmtDay(d)}: ${same.map(x=>esc(first(x.name))+(x.assigned_name?" ("+esc(first(x.assigned_name))+")":"")).join(", ")}`;
}
$("sheetBody").addEventListener("click", e => {
  if(!$("bform")) return;
  const vb=e.target.closest("[data-veh]"); if(vb){ F.size=vb.dataset.veh; const t=F.size==="bike"?"bike":"car"; if(t!==F.type){ F.type=t; F.pkg=-1; F.extras=[]; } $$("#fVeh .chip").forEach(c=>c.classList.toggle("on", c===vb)); drawPkg(); calc(); return; }
  const sl=e.target.closest("[data-slot]"); if(sl){ $$("#fSlot .chip").forEach(c=>c.classList.toggle("on", c===sl)); clash(); return; }
  const sr=e.target.closest("[data-src]"); if(sr){ $$("#fSrc .chip").forEach(c=>c.classList.toggle("on", c===sr)); return; }
  const dq=e.target.closest("[data-dq]"); if(dq){ $("fDate").value = addDays(istToday(), +dq.dataset.dq); clash(); return; }
  if(e.target.id==="fFill") return fillFromPaste();
  if(e.target.id==="fDel") return delBooking(e.target);
});
$("sheetBody").addEventListener("change", e => {
  if(!$("bform")) return;
  if(e.target.name==="fpkg"){ F.pkg=+e.target.value; F.auto=true; calc(); }
  if(e.target.name==="fadd"){ F.extras=$$('#fAdd input:checked').map(c=>c.value); F.auto=true; calc(); }
  if(e.target.id==="fDate") clash();
});
$("sheetBody").addEventListener("input", e => {
  if(!$("bform")) return;
  if(e.target.id==="fSub"){ F.auto=false; calc(); }
  if(e.target.id==="fDisc") calc();
  if(e.target.id==="fPin"){ const a=areaFor(e.target.value.trim()); if(a) $("fArea").value=a; }
  if(e.target.id==="fPhone" && !F.editing && isOwner() && digits(e.target.value).length===10) lookupCustomer(digits(e.target.value));
});
async function lookupCustomer(ph){
  try{ const list=await rpc("owner_customers",{p_query:ph, p_limit:1}); const c=(list||[]).find(x=>x.phone===ph); const m=$("fCust"); if(!m) return;
    if(!c){ m.hidden=true; return; }
    m.hidden=false; m.innerHTML=`Returning customer: <b>${esc(c.name)}</b> · ${c.washes} wash${c.washes===1?"":"es"}${c.credit?` · ${rupee(c.credit)} referral credit`:""}`;
    const last=(await rpc("owner_customer",{p_phone:ph}))[0];
    if(last){ if(!$("fName").value) $("fName").value=last.name; if(!$("fAddr").value) $("fAddr").value=last.address; if(!$("fPin").value) $("fPin").value=last.pin; if(!$("fArea").value) $("fArea").value=last.area; if(!$("fPlate").value) $("fPlate").value=last.plate;
      const s=sizeOf(last.vehicle); const b=$("fVeh").querySelector(`[data-veh="${s}"]`); if(b && s!==F.size) b.click(); }
  }catch(e){}
}
function parsePaste(t){
  const out={}, lab=k=>{ const m=t.match(new RegExp("^\\s*\\*?(?:"+k+")\\*?\\s*[:\\-]\\s*(.+)$","im")); return m?m[1].trim():""; };
  const id=t.match(/\bVB-\d{6}-[A-Z0-9]{4,8}\b/); if(id) out.existing=id[0];
  const ph=(lab("mobile|phone|number|contact")||t).match(/(?:\+?91[\s-]?)?([6-9]\d{4}[\s-]?\d{5})/); if(ph) out.phone=digits(ph[1]);
  out.name = lab("name");
  const pin=t.match(/\b4\d{5}\b/); if(pin) out.pin=pin[0];
  const plate=t.match(/\b[A-Z]{2}[\s-]?\d{1,2}[\s-]?[A-Z]{0,3}[\s-]?\d{3,4}\b/i); if(plate) out.plate=plate[0].toUpperCase().replace(/[\s-]+/g," ");
  let addr = lab("address|location"); if(!addr){ const l=t.split(/\n/).find(x=>/(flat|wing|bldg|building|society|soc\.|tower|apartment|apt|road|rd\.|nagar|complex|chs|plot|sector|lane)/i.test(x)); if(l) addr=l.trim(); }
  if(addr){ addr=addr.replace(/\b4\d{5}\b/,"").replace(/[,\s]+$/,""); out.address=addr; }
  const low=t.toLowerCase();
  out.size = /\b(bike|scooter|scooty|activa|splendor|pulsar|motorcycle|two.?wheeler|jupiter|access|ntorq|royal enfield|bullet|classic 350|ktm|duke)\b/.test(low)?"bike"
    : /\b(suv|muv|creta|seltos|innova|xuv|scorpio|fortuner|ertiga|thar|nexon|brezza|harrier|hector|xl6|carens|venue|sonet)\b/.test(low)?"suv"
    : /\b(sedan|city|verna|dzire|ciaz|amaze|aura|slavia|virtus)\b/.test(low)?"sedan"
    : /\b(car|hatch|swift|i10|i20|baleno|wagon ?r|alto|tiago|altroz|polo|celerio|kwid|glanza)\b/.test(low)?"hatch":"";
  const type = out.size==="bike"?"bike":"car", pk = lab("package"), pkgs=PKG[type].map(p=>p.n.toLowerCase());
  let pi = pk ? pkgs.findIndex(n=>pk.toLowerCase().includes(n)) : -1;
  if(pi<0) pi = type==="car" ? (/deep|interior|full/.test(low)?2:/foam|glow|vacuum/.test(low)?1:/essential|basic|exterior|normal/.test(low)?0:-1) : (/chain|shine|engine/.test(low)?2:/detail|polish/.test(low)?1:/quick|basic|normal/.test(low)?0:-1);
  out.pkg=pi;
  const when = (lab("when|date|day")||low).toLowerCase();
  const mm=when.match(/\b(\d{1,2})\s*(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/);
  if(/\btomorrow\b|\bkal\b/.test(when)) out.date=addDays(istToday(),1); else if(/\btoday\b|\baaj\b/.test(when)) out.date=istToday();
  else if(mm){ const mo="janfebmaraprmayjunjulaugsepoctnovdec".indexOf(mm[2])/3+1, y=+istToday().slice(0,4); let iso=`${y}-${String(mo).padStart(2,"0")}-${String(mm[1]).padStart(2,"0")}`; if(iso<addDays(istToday(),-7)) iso=`${y+1}`+iso.slice(4); out.date=iso; }
  else { const dm=when.match(/\b(\d{1,2})[\/\-.](\d{1,2})(?:[\/\-.](\d{2,4}))?\b/); if(dm){ const y=dm[3]?(dm[3].length===2?"20"+dm[3]:dm[3]):istToday().slice(0,4); out.date=`${y}-${String(dm[2]).padStart(2,"0")}-${String(dm[1]).padStart(2,"0")}`; }
    else { const wd=["sun","mon","tue","wed","thu","fri","sat"].findIndex(d=>new RegExp("\\b"+d).test(when)); if(wd>=0){ const t0=new Date(istToday()+"T12:00:00Z"); out.date=addDays(istToday(),(wd-t0.getUTCDay()+7)%7||7); } } }
  const exact = SLOTS.find(sl=>t.includes(sl)), tm = exact ? null : (when.match(/\b(\d{1,2})(?::\d{2})?\s*(am|pm)\b/) || low.match(/\b(\d{1,2})(?::\d{2})?\s*(am|pm)\b/));
  if(exact) out.slot=exact; else if(tm){ const h=+tm[1]%12+(tm[2]==="pm"?12:0); out.slot = h<8?SLOTS[0]:h<10?SLOTS[1]:h<13?SLOTS[2]:h<17?SLOTS[3]:SLOTS[4]; }
  else if(/morning/.test(low)) out.slot=SLOTS[1]; else if(/evening/.test(low)) out.slot=SLOTS[4]; else if(/afternoon/.test(low)) out.slot=SLOTS[3];
  out.notes = lab("notes");
  return out;
}
function fillFromPaste(){
  const t=$("fPaste").value, m=$("fPasteMsg"); m.hidden=false;
  if(!t.trim()){ m.className="alert error"; m.textContent="Paste a message first."; return; }
  const p=parsePaste(t), got=[], setv=(id,v,l)=>{ if(v){ $(id).value=v; got.push(l); } };
  setv("fPhone",p.phone,"mobile"); setv("fName",p.name,"name"); setv("fPlate",p.plate,"plate"); setv("fAddr",p.address,"address"); setv("fPin",p.pin,"PIN");
  if(p.pin){ const a=areaFor(p.pin); if(a) $("fArea").value=a; }
  if(p.notes) setv("fNotes",p.notes,"notes");
  if(p.size){ const b=$("fVeh").querySelector(`[data-veh="${p.size}"]`); if(b) b.click(); got.push("vehicle"); }
  if(p.pkg>=0){ F.pkg=p.pkg; F.auto=true; drawPkg(); calc(); got.push("package"); }
  if(p.date){ $("fDate").value=p.date; got.push("day"); }
  if(p.slot){ const b=$("fSlot").querySelector(`[data-slot="${p.slot}"]`); if(b) b.click(); got.push("time"); }
  if(digits(p.phone).length===10 && isOwner()) lookupCustomer(p.phone);
  if(p.existing){ m.className="alert warn"; m.innerHTML=`This message has booking ID <b>${esc(p.existing)}</b>, so it's probably already a website booking. <button class="link-btn" type="button" data-open="${esc(p.existing)}">Open it</button>`; return; }
  m.className="alert "+(got.length?"ok":"error"); m.textContent = got.length ? "Filled: "+got.join(", ")+". Check them, then add anything missing." : "Couldn't find details in that message. Fill the form below.";
  clash();
}
$("sheetBody").addEventListener("submit", async e => {
  if(e.target.id!=="bform") return; e.preventDefault();
  const err=$("fErr"), btn=$("fSave"), val=id=>$(id)?$(id).value.trim():undefined, limited = F.editing && !isOwner(); err.hidden=true;
  let p;
  if(limited) p={plate:val("fPlate"), notes:val("fNotes")};
  else {
    const slot=($("fSlot").querySelector(".on")||{}).dataset, src=$("fSrc")?($("fSrc").querySelector(".on")||{}).dataset:null;
    p={phone:digits(val("fPhone")), name:val("fName"), vehicle:VEH.find(x=>x[0]===F.size)[1], plate:val("fPlate"), package:F.pkg>=0?PKG[F.type][F.pkg].n:"", extras:F.extras.join(", "),
       date:val("fDate"), slot:slot&&slot.slot||"", address:val("fAddr"), pin:val("fPin"), area:val("fArea"), notes:val("fNotes"), subtotal:+val("fSub")||0, discount:+val("fDisc")||0, discount_reason:val("fWhy")};
    const miss=[]; if(p.phone.length!==10) miss.push("10-digit mobile"); if(!p.name) miss.push("name"); if(!p.package) miss.push("package"); if(!p.date) miss.push("day"); if(!p.slot) miss.push("time"); if(!p.address) miss.push("address");
    if(miss.length){ err.hidden=false; err.textContent="Add: "+miss.join(", ")+"."; return; }
    if(p.discount>p.subtotal){ err.hidden=false; err.textContent="The discount is more than the price."; return; }
    if(!F.editing){ p.source=src&&src.src||"phone"; p.confirmed=$("fConf").checked; if($("fWho")) p.assigned_to=$("fWho").value||null; }
  }
  btn.disabled=true; btn.textContent="Saving…";
  try{
    const j = F.editing ? await rpc("staff_edit_booking",{p_id:F.id, p}) : await rpc("staff_add_booking",{p});
    JOBS.set(j.id, j); PINGED.add(j.id); delete HIST[j.id]; cache.set("day."+j.wash_date,null);
    if(F.editing){ closeSheet(); toast("Saved"); if(S.v==="b"){ dBooking(); loadHist(j.id); } else redraw(); return; }
    openSheet("Booking saved", `<div class="menu" data-id="${esc(j.id)}"><div class="alert ok"><b>${esc(j.name)}</b> · ${relDay(j.wash_date)}, ${esc(j.slot)} · ${rupee(j.total)}<br><span class="small">${esc(j.id)}</span></div>
      <a class="btn wa" target="_blank" rel="noopener" href="${wa(j.phone, fill("confirm", jobCtx(j)))}" ${j.status==="new"?'data-act="confirm"':""} data-sentconf>Send confirmation on WhatsApp</a>
      <button class="btn" type="button" data-open="${esc(j.id)}">Open the booking</button><button class="btn" type="button" data-new>Add another</button></div>`);
    if(S.v==="jobs"){ S.day=j.wash_date; vJobs(); } else if(S.v==="bookings"){ BK=null; vBookings(); } else if(S.v==="home") vHome();
  }catch(x){ if(x.message==="signed out") return; err.hidden=false; err.textContent=x.message||"Couldn't save. Try again."; btn.disabled=false; btn.textContent=F.editing?"Save changes":"Save booking"; }
});
document.addEventListener("click", e => { const b=e.target.closest("[data-sentconf]"); if(b && !b.dataset.act){ const id=b.closest("[data-id]").dataset.id; rpc("staff_log",{p_id:id,p_kind:"message",p_detail:"Sent: Confirm booking"}).catch(()=>{}); } });
async function delBooking(b){
  if(!b.dataset.sure){ b.dataset.sure="1"; b.textContent="Tap again to delete for good"; setTimeout(()=>{ if(b.isConnected){ delete b.dataset.sure; b.textContent="Delete booking"; } },4000); return; }
  try{ await rpc("owner_delete_booking",{p_id:F.id}); const j=JOBS.get(F.id); JOBS.delete(F.id); if(j) cache.set("day."+j.wash_date,null); closeSheet(); toast("Booking deleted"); if(S.v==="b") go(S.from||homeView()); else route(); }
  catch(e){ toast(e.message, true); }
}

/* ============================== CUSTOMERS (owner) ============================== */
let CU=null, DUE=null, cqTimer=0;
async function vCustomers(){
  dCustomers(!$("cuBody") || painted!=="customers/" || S.cu.drawn!==S.cu.mode); S.cu.drawn=S.cu.mode;
  if(S.cu.mode==="all"){ const k="cu."+S.cu.q; CU=cache.get(k); dCustomers(); try{ CU=await rpc("owner_customers",{p_query:S.cu.q, p_limit:300}); cache.set(k,CU); dCustomers(); }catch(e){ quiet(e); } }
  else { const k="due."+S.cu.due; DUE=cache.get(k); dCustomers(); try{ DUE=await rpc("owner_due",{p_days:S.cu.due}); cache.set(k,DUE); dCustomers(); }catch(e){ quiet(e); } }
}
function dCustomers(shell){
  if(S.v!=="customers") return;
  if(shell || !$("cuBody")) V().innerHTML = pageHead("Customers", "Everyone who has booked, by mobile number", newBtn()) + `<div class="toolbar"><div class="seg"><button type="button" data-cumode="all" class="${S.cu.mode==="all"?"on":""}">All customers</button><button type="button" data-cumode="due" class="${S.cu.mode==="due"?"on":""}">Due for a wash</button></div>
    ${S.cu.mode==="all"?`<label class="search-in grow">${I.search}<input class="input" id="cuQ" type="search" placeholder="Search name, mobile, plate, area" value="${esc(S.cu.q)}" autocomplete="off"></label>`:`<div class="seg">${[7,12,21,30].map(d=>`<button type="button" data-due="${d}" class="${d===S.cu.due?"on":""}">${d}+ days</button>`).join("")}</div>`}</div><div id="cuBody"></div>`;
  const el=box($("cuBody"));
  if(S.cu.mode==="all"){
    if(!CU){ el.innerHTML=skel(1,300); return; }
    el.innerHTML = CU.length ? `<div class="table-wrap"><table class="data"><thead><tr><th>Name</th><th class="hide-sm">Vehicle</th><th class="hide-sm">Area</th><th class="r">Washes</th><th class="r">Paid</th><th class="hide-sm">Last wash</th><th>Next</th></tr></thead><tbody>${CU.map(c=>`<tr data-cust="${c.phone}" style="cursor:pointer"><td><b>${esc(c.name)}</b><div class="tiny muted">${esc(fmtPhone(c.phone))}${c.credit?` · <span style="color:var(--sage)">${rupee(c.credit)} credit</span>`:""}</div></td><td class="hide-sm">${esc(c.vehicle||"")}</td><td class="hide-sm">${esc(c.area||"")}</td><td class="r num">${c.washes}</td><td class="r num">${rupee(c.spent)}</td><td class="hide-sm nw">${c.last_date?fmtDay(c.last_date):"—"}</td><td class="nw">${c.next_date?`<span class="pill st-new">${relDay(c.next_date)}</span>`:"—"}</td></tr>`).join("")}</tbody></table></div><p class="tiny muted">${CU.length} customer${CU.length===1?"":"s"}</p>`
      : `<section class="card empty"><b>${S.cu.q?"Nobody found":"No customers yet"}</b></section>`;
  } else {
    if(!DUE){ el.innerHTML=skel(2,120); return; }
    el.innerHTML = DUE.length ? `<p class="small muted" style="margin-bottom:12px">${DUE.length} customer${DUE.length>1?"s":""} with nothing booked whose last wash was ${S.cu.due}+ days ago.</p><div class="grid grid-3">${DUE.map((d,i)=>`<section class="card"><div class="card-head"><h2>${esc(d.name)}</h2><span class="pill st-collect">${d.days_ago} days</span></div>
      <p class="small muted">${esc(d.vehicle)} · last: ${esc(d.package)} on ${fmtDay(d.last_date)}${d.area?" · "+esc(d.area):""}<br>${d.washes} wash${d.washes>1?"es":""}${d.reminder_sent_at?` · reminded ${ago(d.reminder_sent_at)}`:""}</p>
      <div class="row" style="margin-top:12px"><a class="btn wa sm" target="_blank" rel="noopener" data-rebook="${i}" href="${wa(d.phone, fill("rebook", {first_name:first(d.name), brand:SITE.name, days:d.days_ago, package:d.package, book_link:BASE+"book.html"}))}">Send rebook message</a><a class="btn sm" href="${tel(d.phone)}">Call</a><button class="btn sm" type="button" data-newfor="${d.phone}">New booking</button></div></section>`).join("")}</div>`
      : `<section class="card empty"><b>Nobody is due</b>Customers show up here ${S.cu.due} days after their last wash.</section>`;
  }
}
document.addEventListener("click", e => {
  const m=e.target.closest("[data-cumode]"); if(m && S.v==="customers"){ S.cu.mode=m.dataset.cumode; vCustomers(); }
  const d=e.target.closest("[data-due]"); if(d){ S.cu.due=+d.dataset.due; vCustomers(); }
  const r=e.target.closest("[data-rebook]"); if(r){ const x=DUE[+r.dataset.rebook]; rpc("staff_update",{p_id:x.id, p_action:"reminded"}).then(()=>{ x.reminder_sent_at=new Date().toISOString(); dCustomers(); }).catch(()=>{}); }
  const c=e.target.closest("[data-cust]"); if(c) custSheet(c.dataset.cust);
  const n=e.target.closest("[data-newfor]"); if(n){ const ph=n.dataset.newfor, last=[...JOBS.values()].filter(j=>j.phone===ph).sort((a,b)=>b.wash_date.localeCompare(a.wash_date))[0];
    bookingForm(null, last?{phone:ph, name:last.name, vehicle:last.vehicle, plate:last.plate, address:last.address, area:last.area, pin:last.pin, source:"repeat"}:{phone:ph, source:"repeat"}); }
});
document.addEventListener("input", e => { if(e.target.id==="cuQ"){ clearTimeout(cqTimer); cqTimer=setTimeout(async()=>{ S.cu.q=e.target.value.trim(); CU=cache.get("cu."+S.cu.q); try{ CU=await rpc("owner_customers",{p_query:S.cu.q, p_limit:300}); cache.set("cu."+S.cu.q,CU); }catch(x){} dCustomers(); }, 300); } });
async function custSheet(ph){
  const c=((CU||[]).find(x=>x.phone===ph))||{phone:ph, name:([...JOBS.values()].find(j=>j.phone===ph)||{}).name||"Customer"};
  openSheet(c.name, `<p class="muted">${esc(fmtPhone(ph))}${c.area?" · "+esc(c.area):""}</p>
    ${c.washes!=null?`<div class="cust-stats"><div class="kpi"><div class="label">Washes</div><div class="value">${c.washes}</div></div><div class="kpi"><div class="label">Paid</div><div class="value">${rupee(c.spent)}</div></div><div class="kpi"><div class="label">Credit</div><div class="value">${rupee(c.credit)}</div></div><div class="kpi"><div class="label">Referred</div><div class="value">${c.referred||0}</div></div></div>`:""}
    <div class="row"><a class="btn sm" href="${tel(ph)}">${I.call}Call</a><a class="btn wa sm" target="_blank" rel="noopener" href="${wa(ph)}">${I.chat}WhatsApp</a><button class="btn primary sm" type="button" data-newfor="${ph}">${I.plus}New booking</button></div>
    <div id="custList">${skel(1,80)}</div>`, "cust:"+ph);
  try{ const list=await rpc("owner_customer",{p_phone:ph}); remember(list); if(sheetFor!=="cust:"+ph) return;
    $("custList").innerHTML = `<div class="grp"><h2>Bookings · ${list.length}</h2></div><div class="jobs" style="grid-template-columns:1fr;margin-top:8px">${list.map(j=>jrow(j,true)).join("")}</div>`; }
  catch(e){ $("custList").innerHTML='<p class="msg bad">Couldn\'t load bookings.</p>'; }
}

/* ============================== INBOX (owner) ============================== */
let INB=null;
const LEAD_ST=["new","contacted","quoted","won","lost"], ENQ_ST=["new","replied","closed"];
async function vInbox(){ INB=cache.get("inbox"); dInbox(); try{ INB=await rpc("owner_inbox"); cache.set("inbox",INB); dInbox(); }catch(e){ quiet(e); } }
function dInbox(){
  if(S.v!=="inbox") return;
  const c = INB ? {leads:INB.leads.filter(x=>x.status==="new").length, enquiries:INB.enquiries.filter(x=>x.status==="new").length, reviews:INB.reviews.filter(x=>!x.approved).length} : {};
  if(INB){ S.inboxCount=(c.leads||0)+(c.enquiries||0)+(c.reviews||0); drawNav(); }
  let html = pageHead("Inbox", "Society requests, messages from the website and reviews") + `<div class="seg">${[["leads","Societies"],["enquiries","Messages"],["reviews","Reviews"]].map(([k,l])=>`<button type="button" data-intab="${k}" class="${S.inTab===k?"on":""}">${l}${c[k]?`<em>${c[k]}</em>`:""}</button>`).join("")}</div>`;
  if(!INB){ V().innerHTML = html + `<div class="grid grid-3">${skel(3,180)}</div>`; return; }
  const pills=(kind,id,cur,list)=>`<div class="chips">${list.map(s=>`<button type="button" class="chip${s===cur?" on":""}" data-set="${kind}" data-sid="${id}" data-val="${s}">${s[0].toUpperCase()+s.slice(1)}</button>`).join("")}</div>`;
  const empty=t=>`<section class="card empty"><b>${t}</b></section>`;
  if(S.inTab==="leads") html += INB.leads.length ? `<div class="grid grid-3">${INB.leads.map(l=>`<section class="card"><div class="card-head"><h2>${esc(l.society)}</h2><span class="tag">${fmtDay(String(l.created_at).slice(0,10))}</span></div>
      <p class="small">${esc(l.contact_name)}${l.role?" · "+esc(l.role):""}<br><span class="muted">${esc(l.area||"")} ${esc(l.pin)} · ${l.cars} cars · ${l.bikes} bikes</span></p>${l.days?`<p class="small muted">Prefers: ${esc(l.days)}</p>`:""}${l.notes?`<p class="small" style="margin-top:6px">${esc(l.notes)}</p>`:""}
      <div style="margin:12px 0">${pills("lead",l.id,l.status,LEAD_ST)}</div><div class="row"><a class="btn wa sm" target="_blank" rel="noopener" href="${wa(l.phone, fill("lead",{first_name:first(l.contact_name), brand:SITE.name, society:l.society}))}">WhatsApp</a><a class="btn sm" href="${tel(l.phone)}">Call</a></div></section>`).join("")}</div>` : empty("No society requests yet");
  if(S.inTab==="enquiries") html += INB.enquiries.length ? `<div class="grid grid-3">${INB.enquiries.map(q=>`<section class="card"><div class="card-head"><h2>${esc(q.name||"Customer")}</h2><span class="tag">${fmtDay(String(q.created_at).slice(0,10))}</span></div>
      <p style="white-space:pre-wrap">${esc(q.message)}</p><div style="margin:12px 0">${pills("enquiry",q.id,q.status,ENQ_ST)}</div><div class="row"><a class="btn wa sm" target="_blank" rel="noopener" href="${wa(q.phone, fill("enquiry",{first_name:first(q.name), brand:SITE.name}))}">Reply on WhatsApp</a><a class="btn sm" href="${tel(q.phone)}">Call</a><button class="btn sm" type="button" data-newfor="${q.phone}">New booking</button></div></section>`).join("")}</div>` : empty("No messages yet");
  if(S.inTab==="reviews") html += INB.reviews.length ? `<div class="grid grid-3">${INB.reviews.map(r=>`<section class="card"><div class="card-head"><span class="stars">${"★".repeat(r.rating)}<i>${"★".repeat(5-r.rating)}</i></span>${r.approved?'<span class="pill st-done">On website</span>':'<span class="pill st-collect">Waiting</span>'}</div>
      <h3>${esc(r.name||"Customer")}</h3><p class="small muted">${esc(r.customer||"")} · ${esc(r.area||"")} · ${fmtDay(String(r.created_at).slice(0,10))}</p>${r.text?`<p style="margin-top:8px">${esc(r.text)}</p>`:""}
      <div class="row" style="margin-top:12px">${r.approved?`<button class="btn sm" data-set="review" data-sid="${r.id}" data-val="hidden">Hide from website</button>`:`<button class="btn primary sm" data-set="review" data-sid="${r.id}" data-val="approved">Show on website</button>`}<button class="btn danger sm" data-set="review_delete" data-sid="${r.id}" data-val="x">Delete</button></div></section>`).join("")}</div>` : empty("No reviews yet");
  V().innerHTML = html;
}
document.addEventListener("click", async e => {
  const t=e.target.closest("[data-intab]"); if(t){ S.inTab=t.dataset.intab; dInbox(); return; }
  const b=e.target.closest("[data-set]"); if(!b || !INB || S.v!=="inbox") return;
  const kind=b.dataset.set, id=+b.dataset.sid, val=b.dataset.val;
  if(kind==="review_delete" && !b.dataset.sure){ b.dataset.sure="1"; b.textContent="Tap again to delete"; return; }
  const list = kind==="lead"?INB.leads:kind==="enquiry"?INB.enquiries:INB.reviews, item=list.find(x=>x.id===id), before=Object.assign({},item);
  if(kind==="lead"||kind==="enquiry") item.status=val; else if(kind==="review") item.approved = val==="approved"; else INB.reviews=INB.reviews.filter(x=>x.id!==id);
  dInbox();
  try{ await rpc("owner_set",{p_kind:kind, p_id:id, p_value:val}); cache.set("inbox",INB); toast("Saved"); }
  catch(err){ Object.assign(item,before); if(kind==="review_delete") return vInbox(); dInbox(); toast("Couldn't save. Try again.", true); }
});

/* ============================== ANALYTICS (owner) ============================== */
const AN_RANGES = {week:["7 days",()=>[addDays(istToday(),-6),istToday()]], d30:["30 days",()=>[addDays(istToday(),-29),istToday()]], month:["This month",()=>[monthStart(istToday()),istToday()]],
  last:["Last month",()=>{ const e=addDays(monthStart(istToday()),-1); return [monthStart(e),e]; }], d90:["90 days",()=>[addDays(istToday(),-89),istToday()]]};
let AN=null;
async function vAnalytics(){ const k="an."+S.an; AN=cache.get(k); dAnalytics(); try{ const [f,t]=AN_RANGES[S.an][1](); AN=await rpc("owner_analytics",{p_from:f, p_to:t}); cache.set(k,AN); dAnalytics(); }catch(e){ quiet(e); } }
const PAL=["#9BCB2E","#0B7F6F","#F08A5D","#2F4566","#C9A23A","#7E57C2","#38B2AC","#5D666C"];
function delta(cur, prev, lowerBetter, money){
  if(prev==null) return ""; if(!prev && !cur) return `<div class="delta flat">same as before</div>`; if(!prev) return `<div class="delta flat">none in the days before</div>`;
  const d=Math.round((cur-prev)/Math.abs(prev)*100); if(!d) return `<div class="delta flat">same as before</div>`;
  const good = lowerBetter ? d<0 : d>0; return `<div class="delta ${good?"up":"down"}">${d>0?"▲":"▼"} ${Math.abs(d)}% vs ${money?rupee(prev):prev}</div>`;
}
function donut(list){
  const tot=list.reduce((s,x)=>s+x.count,0); let a=0;
  const arcs=list.map((x,i)=>{ const f=x.count/(tot||1), a0=a, a1=a+f*Math.PI*2; a=a1; const big=f>.5?1:0, r=54, cx=64, cy=64;
    if(f>=.999) return `<circle cx="64" cy="64" r="54" fill="none" stroke="${PAL[i%8]}" stroke-width="18"/>`;
    return `<path d="M${cx+r*Math.sin(a0)} ${cy-r*Math.cos(a0)} A${r} ${r} 0 ${big} 1 ${cx+r*Math.sin(a1)} ${cy-r*Math.cos(a1)}" fill="none" stroke="${PAL[i%8]}" stroke-width="18"/>`; }).join("");
  return `<div class="donut-wrap"><svg viewBox="0 0 128 128" width="150" height="150" style="stroke-linecap:butt"><circle cx="64" cy="64" r="54" fill="none" stroke="var(--line)" stroke-width="18"/>${arcs}<text x="64" y="70" text-anchor="middle" style="font:800 20px var(--head);fill:var(--ink);stroke:none">${tot}</text></svg>
    <div class="donut-legend">${list.map((x,i)=>`<div><span><i class="legend-dot" style="background:${PAL[i%8]}"></i>${esc(x.label)}</span><b>${x.count} · ${Math.round(x.count/(tot||1)*100)}%</b></div>`).join("")||'<span class="muted">Nothing yet</span>'}</div></div>`;
}
const hbars = (list, color, money) => list&&list.length ? list.map(x=>`<div class="hbar-row"><span>${esc(x.label||x.name)}</span><div class="hbar-track"><div class="hbar-fill" style="width:${Math.max(2,Math.round(x.count/Math.max(...list.map(y=>y.count))*100))}%;background:${color}"></div></div><b class="num">${x.count}${money&&x.amount!=null?` · ${rupee(x.amount)}`:""}</b></div>`).join("") : '<p class="muted small">Nothing in this range yet.</p>';
function dAnalytics(){
  if(S.v!=="analytics") return;
  const days = AN ? Math.round((new Date(AN.to)-new Date(AN.from))/864e5)+1 : 0;
  let html = pageHead("Analytics", AN?`${fmtDay(AN.from,{day:"numeric", month:"short"})} – ${fmtDay(AN.to,{day:"numeric", month:"short", year:"numeric"})}, compared with the ${days} days before`:"Loading…") + `<div class="seg">${Object.keys(AN_RANGES).map(k=>`<button type="button" data-an="${k}" class="${S.an===k?"on":""}">${AN_RANGES[k][0]}</button>`).join("")}</div>`;
  if(!AN){ V().innerHTML = html + `<div class="grid grid-kpi">${skel(8,100)}</div>`; return; }
  const c=AN.cur, p=AN.prev, profit=c.collected-(c.costs||0), pprofit=p.collected-(p.costs||0);
  const k=(l,v,d,cls)=>`<div class="kpi${cls?" "+cls:""}"><div class="label">${l}</div><div class="value num">${v}</div>${d}</div>`;
  const max=Math.max(1,...AN.series.map(x=>x.count)), t=istToday(), step=Math.ceil(AN.series.length/12);
  const fun=[["Booked",c.booked],["Confirmed",c.confirmed],["Washed",c.washed],["Paid",c.paid],["Review asked",c.review_asked],["Reviewed",c.reviews]], fmax=Math.max(1,c.booked);
  html += `<div class="grid grid-kpi">${k("Bookings",c.booked,delta(c.booked,p.booked))}${k("Washed",c.washed,delta(c.washed,p.washed))}${k("Collected",rupee(c.collected),delta(c.collected,p.collected,false,true))}${k("Average bill",rupee(c.avg_ticket),delta(c.avg_ticket,p.avg_ticket,false,true))}
      ${k("New customers",c.new_customers,delta(c.new_customers,p.new_customers))}${k("Cancelled",c.cancelled,delta(c.cancelled,p.cancelled,true),c.cancelled?"warn":"")}${k("Discounts given",rupee(c.discounts),delta(c.discounts,p.discounts,true,true))}${k("Profit",rupee(profit),delta(profit,pprofit,false,true),profit<0?"warn":"good")}</div>
    <section class="card"><div class="card-head"><h2>Bookings per day</h2><span class="small muted">Booked ${rupee(c.booked_value)} · collected ${rupee(c.collected)}</span></div>
      <div class="bars">${AN.series.map(x=>`<div class="b${x.count?"":" zero"}${x.date===t?" now":""}" title="${fmtDay(x.date)}: ${x.count} booking${x.count===1?"":"s"}, ${rupee(x.amount)} paid"><em>${x.count||""}</em><i style="height:${Math.round(x.count/max*100)}%"></i></div>`).join("")}</div>
      <div class="bar-labels">${AN.series.map((x,i)=>`<span>${i%step===0?fmtDay(x.date,{day:"numeric", month:"short"}):""}</span>`).join("")}</div></section>
    <div class="grid grid-2"><section class="card"><div class="card-head"><h2>From booking to review</h2></div><div class="funnel">${fun.map(([l,n])=>`<div class="f"><span>${l}</span><i style="width:${Math.max(1,Math.round(n/fmax*100))}%"></i><b class="num">${n}</b></div>`).join("")}</div>
        <p class="small muted" style="margin-top:12px">${c.rating?`Average rating <b>${c.rating}★</b> from ${c.reviews} review${c.reviews===1?"":"s"}.`:"No reviews in this range yet."}</p></section>
      <section class="card"><div class="card-head"><h2>Where bookings came from</h2></div>${donut(AN.sources.map(s=>({label:SOURCE[s.name]||s.name, count:s.count})))}</section></div>
    <div class="grid grid-2"><section class="card"><div class="card-head"><h2>Packages</h2></div>${hbars(AN.packages,"#9BCB2E",true)}</section><section class="card"><div class="card-head"><h2>Areas</h2></div>${hbars(AN.areas,"#0B7F6F")}</section></div>
    <div class="grid grid-2"><section class="card"><div class="card-head"><h2>Time slots</h2></div>${hbars(AN.slots,"#F08A5D")}</section><section class="card"><div class="card-head"><h2>Washes per washer</h2></div>${hbars(AN.washers,"#2F4566",true)}</section></div>
    <div class="grid grid-2"><section class="dark-card"><div class="label">Profit in this range</div><div class="big">${rupee(profit)}</div><div class="muted small">collected ${rupee(c.collected)} − costs ${rupee(c.costs||0)}</div>
        <dl class="dl" style="color:#F3F5F1"><dt class="muted">Cost per wash</dt><dd>${c.washed?rupee((c.costs||0)/c.washed):"–"}</dd><dt class="muted">Ad cost per new customer</dt><dd>${c.new_customers&&c.ads?rupee(c.ads/c.new_customers):"–"}</dd><dt class="muted">Car / bike</dt><dd>${AN.vehicles.map(v=>`${v.count} ${v.name}`).join(" · ")||"–"}</dd></dl>
        <button class="btn sm" type="button" data-go="settings/costs" style="align-self:flex-start">Edit monthly costs</button></section>
      <section class="card"><div class="card-head"><h2>Offers used</h2></div>${hbars(AN.offers,"#C9A23A",true)}</section></div>
    <section class="card"><div class="card-head"><h2>How these are counted</h2></div><dl class="dl small"><dt>Bookings</dt><dd>Wash day in the range, not cancelled.</dd><dt>Collected</dt><dd>Bookings in the range marked paid (UPI or cash).</dd><dt>Profit</dt><dd>Collected minus Settings → Monthly costs, shared over the days of each month in the range.</dd><dt>New customers</dt><dd>Mobile numbers whose first booking falls in the range.</dd><dt>Compared with</dt><dd>The same number of days just before the range.</dd></dl></section>`;
  V().innerHTML = `<div class="rise" style="display:flex;flex-direction:column;gap:16px">${html}</div>`;
}
document.addEventListener("click", e => { const a=e.target.closest("[data-an]"); if(a){ S.an=a.dataset.an; store.set("vb.an",S.an); AN=null; vAnalytics(); } });

/* ============================== SETTINGS (owner) — Team inside, like Studio CRM ============================== */
let TEAM=null, OFFERS=null, COSTS=null, AUDIT=null;
const SET_TABS=[["team","Team"],["messages","WhatsApp messages"],["offers","Offers"],["costs","Monthly costs"],["notice","Team notice"],["data","Data & activity"]];
async function vSettings(){
  if(!SET_TABS.some(t=>t[0]===S.setTab)) S.setTab="team";
  TEAM=TEAM||cache.get("team"); dSettings();
  try{
    if(S.setTab==="team"){ TEAM=await rpc("owner_team"); cache.set("team",TEAM); }
    if(S.setTab==="offers") OFFERS=await rpc("owner_offers");
    if(S.setTab==="costs") COSTS=await rpc("owner_costs",{p_month:S.setMonth});
    if(S.setTab==="data"){ const r=await Promise.all([rpc("owner_audit",{p_limit:150}), rpc("owner_team")]); AUDIT=r[0]; TEAM=r[1]; }
    await refreshSettings(); dSettings();
  }catch(e){ quiet(e); }
}
const AUD = {export:"Downloaded bookings", booking_deleted:"Deleted a booking", login_added:"Added a login", login_switched_on:"Switched a login on", login_switched_off:"Switched a login off",
  login_role:"Changed access", login_password:"Set a new password", login_edited:"Changed a login", login_deleted:"Deleted a login", messages_saved:"Changed WhatsApp messages",
  notice_posted:"Posted the team notice", notice_cleared:"Cleared the team notice", offers_saved:"Changed an offer", costs_saved:"Saved monthly costs"};
const COST_CATS=[["ads","Ads (Meta, Google)"],["supplies","Shampoo, cloths, supplies"],["fuel","Fuel and travel"],["pay","Washer pay"],["other","Other"]];
function dSettings(){
  if(S.v!=="settings") return;
  const tab=S.setTab; let body="";
  if(tab==="team"){
    body = !TEAM ? skel(1,200) : `<section class="card"><div class="card-head"><h2>Logins · ${TEAM.staff.length}</h2><button class="btn primary sm" type="button" id="addLogin">${I.plus}Add login</button></div>
      <div style="overflow-x:auto"><table class="data"><thead><tr><th>Name</th><th class="hide-sm">Email</th><th class="hide-sm">Mobile</th><th>Access</th><th class="hide-sm">Last opened</th><th class="r hide-sm">Open jobs</th><th>Login</th></tr></thead>
      <tbody>${TEAM.staff.map(p=>`<tr data-person="${p.id}" style="cursor:pointer"><td><div class="row" style="gap:10px;flex-wrap:nowrap"><span class="av">${esc((p.name||"?")[0].toUpperCase())}</span><div><b>${esc(p.name)}</b>${p.id===S.me.id?' <span class="tag">You</span>':""}</div></div></td>
        <td class="hide-sm">${esc(p.email||"")}</td><td class="hide-sm nw">${p.phone?esc(fmtPhone(p.phone)):"—"}</td><td>${p.role==="owner"?'<span class="pill st-owner">Owner</span>':'<span class="pill st-confirmed">Washer</span>'}</td>
        <td class="hide-sm small muted">${p.last_seen_at?ago(p.last_seen_at):"Not yet"}</td><td class="r hide-sm num">${p.jobs||0}</td><td>${p.active?'<span class="pill st-done">On</span>':'<span class="pill st-off">Off</span>'}</td></tr>`).join("")}</tbody></table></div>
      <p class="small muted" style="margin-top:10px">Tap a person to change their details, access or password, send their login on WhatsApp, switch them off or delete them.</p></section>
      <section class="card"><div class="card-head"><h2>Who can do what</h2></div><dl class="dl small"><dt>Washer</dt><dd>Jobs, Bookings, New booking and Help. Can change only the number plate and notes of a booking. Sees jobs given to them first.</dd><dt>Owner</dt><dd>Everything, including money, customers, Analytics, Settings and logins.</dd></dl></section>`;
  }
  if(tab==="messages") body = `<section class="card"><div class="card-head"><h2>WhatsApp messages</h2><button class="btn primary sm" type="button" id="stTplSave">Save messages</button></div><p class="small muted" style="margin-bottom:12px">Words in curly brackets are filled in for each customer: {first_name} {package} {vehicle} {date} {slot} {address} {id} {total} {review_link} {book_link} {days} {society} {brand}</p>
    <div class="grid grid-2">${templates().map(t=>`<label class="field">${esc(t.title)}<textarea data-tpl="${t.key}" rows="4" maxlength="1000">${esc(t.body)}</textarea></label>`).join("")}</div></section>`;
  if(tab==="offers") body = !OFFERS ? skel(2,140) : `<section class="card"><div class="card-head"><h2>Offers and codes</h2></div><p class="small muted" style="margin-bottom:12px">The website and bookings use these straight away. Minimum order is the package plus add-ons before the discount.</p><div class="grid grid-2">${OFFERS.map(o=>offerRow(o)).join("")+offerRow(null)}</div></section>`;
  if(tab==="costs"){ const months=[]; for(let i=0;i<6;i++){ const d=new Date(monthStart(istToday())+"T12:00:00Z"); d.setUTCMonth(d.getUTCMonth()-i); months.push(d.toISOString().slice(0,8)+"01"); }
    body = `<section class="card"><div class="card-head"><h2>Monthly costs</h2><select class="input" id="stMonth" style="width:auto">${months.map(m=>`<option value="${m}" ${m===S.setMonth?"selected":""}>${fmtDay(m,{month:"long", year:"numeric"})}</option>`).join("")}</select></div><p class="small muted" style="margin-bottom:12px">Used for profit, cost per wash and ad cost per new customer in Analytics.</p>
      ${COSTS?`<div class="form-grid">${COST_CATS.map(([k,l])=>`<label class="field">${l} ₹<input type="number" min="0" inputmode="numeric" data-cost="${k}" value="${COSTS.costs[k]!=null?COSTS.costs[k]:""}"></label>`).join("")}</div><div class="row" style="margin-top:14px"><button class="btn primary" type="button" id="stCostSave">Save costs</button><span class="small muted">Total ${rupee(Object.values(COSTS.costs).reduce((s,x)=>s+x,0))}</span></div>`:skel(1,120)}</section>`; }
  if(tab==="notice"){ const n=SET.notice; body = `<section class="card"><div class="card-head"><h2>Team notice</h2></div><p class="small muted" style="margin-bottom:12px">One line everyone sees at the top of Home and Jobs until you clear it.</p>
    <label class="field">Notice<textarea id="stNotice" rows="2" maxlength="280" placeholder="e.g. Rain today, carry seat covers">${esc(n&&n.body||"")}</textarea></label><div class="row" style="margin-top:12px"><button class="btn primary" type="button" id="stNoticeSave">Post</button>${n&&n.body?'<button class="btn" type="button" id="stNoticeClear">Clear</button>':""}</div></section>`; }
  if(tab==="data") body = `<div class="grid grid-2"><section class="card"><div class="card-head"><h2>Download bookings</h2></div><p class="small muted" style="margin-bottom:12px">A spreadsheet (CSV) with customers' details. Keep it private. The download is noted in the activity log.</p>
      <div class="form-grid"><label class="field">From<input type="date" id="stFrom" value="${monthStart(istToday())}"></label><label class="field">To<input type="date" id="stTo" value="${monthEnd(istToday())}"></label></div><button class="btn primary" type="button" id="stExport" style="margin-top:14px">Download CSV</button></section>
    <section class="card"><div class="card-head"><h2>Google Sheet copy</h2></div><p class="small muted" style="margin-bottom:12px">Paste this key into the Google Sheet copy script (Vroombrite → Set copy key) so it can copy bookings every night. Keep it private.</p>
      <div class="keybox"><span id="sheetKey" style="flex:1">${TEAM?esc(TEAM.sheet_copy_key):"…"}</span><button class="btn sm" type="button" id="copyKey">Copy</button></div></section></div>
    <section class="card"><div class="card-head"><h2>Activity log</h2></div><p class="small muted" style="margin-bottom:12px">Who changed logins, offers or messages, downloaded or deleted data. Customers' details are never shown here.</p>
      ${AUDIT?(AUDIT.length?`<ol class="timeline">${AUDIT.map(a=>`<li><span class="dot"></span><div>${esc(AUD[a.action]||a.action)}${a.detail?" · "+esc(a.detail):""}<small>${esc(a.actor_name||"")} · ${fmtTime(a.at)}</small></div></li>`).join("")}</ol>`:'<p class="muted">Nothing yet.</p>'):skel(1,120)}</section>`;
  V().innerHTML = pageHead("Settings", "Team, messages, offers, costs and data") + `<div class="seg">${SET_TABS.map(([k,l])=>`<button type="button" data-settab="${k}" class="${tab===k?"on":""}">${l}</button>`).join("")}</div>` + body;
}
function offerRow(o){
  const isRef = o && o.code==="REFERRAL";
  return `<div class="offer" data-offer="${o?esc(o.code):""}"><div class="offer-h">${o?`<b>${isRef?"Friend referral":esc(o.code)}</b><span class="pill ${o.active?"st-done":"st-off"}">${o.active?"On":"Off"}</span><small>${o.used} used</small>`:"<b>Add a new code</b>"}</div>
    <div class="form-grid">${o?"":`<label class="field">Code<input data-k="code" maxlength="20" style="text-transform:uppercase" placeholder="DIWALI100"></label>`}
      <label class="field">${isRef?"Friend gets ₹ off":"₹ off"}<input type="number" min="1" data-k="amount" value="${o?o.amount:""}"></label><label class="field">Min. order ₹<input type="number" min="0" data-k="min_order" value="${o?o.min_order:299}"></label>
      ${isRef?`<label class="field">Referrer credit ₹<input type="number" min="0" data-k="referrer_credit" value="${o.referrer_credit}"></label>`:""}</div>
    <div class="row"><label class="tick"><input type="checkbox" data-k="first_wash_only" ${!o||o.first_wash_only?"checked":""}> First wash only</label><label class="tick"><input type="checkbox" data-k="active" ${!o||o.active?"checked":""}> On</label></div>
    <button class="btn sm" type="button" data-saveoffer>${o?"Save":"Add code"}</button></div>`;
}
document.addEventListener("click", async e => {
  if(S.v!=="settings") return;
  const st=e.target.closest("[data-settab]"); if(st){ S.setTab=st.dataset.settab; history.replaceState(null,"","#settings/"+S.setTab); vSettings(); return; }
  if(e.target.closest("#addLogin")) return loginForm(null);
  const pr=e.target.closest("[data-person]"); if(pr) return loginForm(TEAM.staff.find(x=>x.id===pr.dataset.person));
  const t=e.target;
  try{
    if(t.id==="stNoticeSave"||t.id==="stNoticeClear"){ const body=t.id==="stNoticeClear"?"":$("stNotice").value.trim(); await rpc("owner_set_notice",{p_body:body}); await refreshSettings(); toast(body?"Notice posted":"Notice cleared"); dSettings(); }
    if(t.id==="stTplSave"){ const p=$$("[data-tpl]").map(x=>({key:x.dataset.tpl, body:x.value})); if(p.some(x=>!x.body.trim())) return toast("A message can't be empty", true); t.disabled=true; await rpc("owner_save_templates",{p}); await refreshSettings(); toast("Messages saved"); t.disabled=false; }
    if(t.closest("[data-saveoffer]")){ const box=t.closest("[data-offer]"), v=k=>box.querySelector(`[data-k="${k}"]`);
      const p={code:box.dataset.offer||v("code").value.trim().toUpperCase(), amount:+v("amount").value, min_order:+v("min_order").value||0, first_wash_only:v("first_wash_only").checked, active:v("active").checked};
      if(v("referrer_credit")) p.referrer_credit=+v("referrer_credit").value||0; OFFERS=await rpc("owner_save_offer",{p}); toast("Offer saved"); dSettings(); }
    if(t.id==="stCostSave"){ const p={}; $$("[data-cost]").forEach(x=>p[x.dataset.cost]=x.value===""?0:+x.value); COSTS=await rpc("owner_save_costs",{p_month:S.setMonth, p}); cache.set("numbers",null); Object.keys(AN_RANGES).forEach(k=>cache.set("an."+k,null)); toast("Costs saved"); dSettings(); }
    if(t.id==="stExport") return exportCsv(t);
    if(t.id==="copyKey") navigator.clipboard.writeText($("sheetKey").textContent).then(()=>toast("Key copied")).catch(()=>{});
  }catch(x){ if(x.message!=="signed out") toast(x.message||"Couldn't save", true); t.disabled=false; }
});
document.addEventListener("change", async e => { if(e.target.id!=="stMonth") return; S.setMonth=e.target.value; COSTS=null; dSettings(); try{ COSTS=await rpc("owner_costs",{p_month:S.setMonth}); dSettings(); }catch(x){} });
async function exportCsv(btn){
  const from=$("stFrom").value, to=$("stTo").value; if(!from||!to||from>to) return toast("Pick a start and end date", true);
  btn.disabled=true; btn.textContent="Preparing…";
  try{
    const rows=await rpc("owner_export",{p_from:from, p_to:to});
    const cols=[["id","Booking ID"],["created_at","Booked on"],["wash_date","Wash date"],["slot","Slot"],["status","Status"],["payment","Payment"],["paid_at","Paid on"],["name","Name"],["phone","Mobile"],["vehicle","Vehicle"],["plate","Plate"],["package","Package"],["extras","Add-ons"],["address","Address"],["area","Area"],["pin","PIN"],["notes","Notes"],["subtotal","Price"],["discount","Discount"],["total","Total"],["promo","Offer"],["promo_note","Offer note"],["referred_by","Referred by"],["pay_mode","Pay mode"],["source","Came from"],["washer","Washer"]];
    const cell=v=>{ let s=v==null?"":String(v); if(/^[=+\-@]/.test(s)) s="'"+s; return /[",\n]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s; };
    const csv="﻿"+[cols.map(c=>c[1]).join(","), ...rows.map(r=>cols.map(c=>cell(r[c[0]])).join(","))].join("\r\n");
    const a=document.createElement("a"); a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8"})); a.download=`vroombrite-bookings-${from}-to-${to}.csv`; document.body.appendChild(a); a.click(); setTimeout(()=>{ URL.revokeObjectURL(a.href); a.remove(); },500);
    toast(rows.length+" bookings downloaded"); AUDIT=await rpc("owner_audit",{p_limit:150}); dSettings();
  }catch(x){ toast(x.message||"Couldn't download", true); }
  if(btn.isConnected){ btn.disabled=false; btn.textContent="Download CSV"; }
}
async function refreshSettings(){ try{ SET=await rpc("staff_settings"); cache.set("settings",SET); }catch(e){} }

/* logins (Team) */
const genPw = () => { const a="abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789"; const r=crypto.getRandomValues(new Uint32Array(10)); return [...r].map(x=>a[x%a.length]).join(""); };
function loginForm(p){
  const me = p && p.id===S.me.id;
  openSheet(p?p.name:"Add a login", `<form id="lform" class="form-section" novalidate data-pid="${p?p.id:""}">
    <label class="field">Name<input id="lfName" maxlength="60" value="${esc(p?p.name:"")}" autocomplete="off"></label>
    <label class="field">Email (they sign in with this)<input id="lfEmail" type="email" inputmode="email" value="${esc(p?p.email||"":"")}" autocomplete="off"></label>
    <label class="field">Mobile (for sending the login on WhatsApp)<input id="lfPhone" type="tel" inputmode="numeric" maxlength="14" value="${esc(p?p.phone||"":"")}"></label>
    <div class="field">Access<div class="seg" id="lfRole"><button type="button" data-role="washer" class="${!p||p.role==="washer"?"on":""}" ${me?"disabled":""}>Washer</button><button type="button" data-role="owner" class="${p&&p.role==="owner"?"on":""}" ${me?"disabled":""}>Owner</button></div><small>Washer: Jobs, Bookings, New booking; changes only plate and notes. Owner: everything, including money and logins.</small></div>
    ${p?`<label class="tick"><input type="checkbox" id="lfActive" ${p.active?"checked":""} ${me?"disabled":""}> Login switched on (can sign in)</label>`
       :`<label class="field">Password (8 or more characters)<span class="pw-wrap"><input id="lfPw" type="text" value="${genPw()}" autocomplete="off"><button type="button" class="pw-eye" id="lfGen">New</button></span></label>`}
    <div class="alert error" id="lfErr" hidden></div>
    <button class="btn primary lg" type="submit" id="lfSave">${p?"Save changes":"Add login"}</button>
    ${p?`<fieldset class="fs"><legend>Set a new password</legend><div class="pw-row"><span class="pw-wrap"><input class="input" id="lfNewPw" type="text" placeholder="8 or more characters" autocomplete="off"><button type="button" class="pw-eye" id="lfGen2">Make one</button></span><button class="btn" type="button" id="lfSetPw">Set</button></div><small class="muted">Then send it to them on WhatsApp in one tap.</small></fieldset>`:""}
    ${p&&!me?`<button class="btn danger" type="button" id="lfDel">Delete login</button>`:""}</form>`, "login");
}
$("sheetBody").addEventListener("click", async e => {
  if(!$("lform")) return;
  const r=e.target.closest("[data-role]"); if(r){ $$("#lfRole button").forEach(b=>b.classList.toggle("on", b===r)); return; }
  if(e.target.id==="lfGen"){ $("lfPw").value=genPw(); return; }
  if(e.target.id==="lfGen2"){ $("lfNewPw").value=genPw(); return; }
  const id=$("lform").dataset.pid, err=$("lfErr");
  if(e.target.id==="lfSetPw"){ const pw=$("lfNewPw").value; if(pw.length<8){ err.hidden=false; err.textContent="The new password needs 8 or more characters."; return; }
    e.target.disabled=true; try{ await teamAdmin({action:"password", id, password:pw}); const who=TEAM.staff.find(x=>x.id===id); sentLogin("Password changed", who.name, who.email, who.phone, pw); }
    catch(x){ err.hidden=false; err.textContent=x.message; e.target.disabled=false; } return; }
  if(e.target.id==="lfDel"){ const b=e.target; if(!b.dataset.sure){ b.dataset.sure="1"; b.textContent="Tap again to delete this login for good"; return; }
    b.disabled=true; try{ await teamAdmin({action:"delete", id}); closeSheet(); toast("Login deleted"); vSettings(); } catch(x){ err.hidden=false; err.textContent=x.message; b.disabled=false; } }
});
function sentLogin(title, name, email, phone, pw){
  const msg=`Hi ${first(name)}, here is your ${SITE.name} staff app login.\nOpen: ${BASE}ops.html\nEmail: ${email}\nPassword: ${pw}\nAdd it to your home screen after signing in.`;
  openSheet(title, `<div class="menu"><p><b>${esc(name)}</b> can sign in with:</p><div class="keybox"><span>${esc(BASE)}ops.html<br>${esc(email)}<br>${esc(pw)}</span></div>
    ${phone?`<a class="btn wa" target="_blank" rel="noopener" href="${wa(phone, msg)}">Send login on WhatsApp</a>`:`<a class="btn wa" target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent(msg)}">Send on WhatsApp (pick the chat)</a>`}
    <button class="btn" type="button" id="copyLogin">Copy the login</button><button class="link-btn" type="button" data-close>Done</button></div>`);
  $("copyLogin").onclick=()=>navigator.clipboard.writeText(msg).then(()=>toast("Copied")).catch(()=>{});
}
$("sheetBody").addEventListener("submit", async e => {
  if(e.target.id!=="lform") return; e.preventDefault();
  const id=e.target.dataset.pid, err=$("lfErr"), btn=$("lfSave"); err.hidden=true;
  const body={name:$("lfName").value.trim(), email:$("lfEmail").value.trim(), phone:digits($("lfPhone").value), role:($("lfRole").querySelector(".on")||{}).dataset.role||"washer"};
  if(!body.name || !/^\S+@\S+\.\S+$/.test(body.email)){ err.hidden=false; err.textContent="Enter a name and a valid email."; return; }
  if(body.phone && body.phone.length!==10){ err.hidden=false; err.textContent="Mobile must be 10 digits."; return; }
  btn.disabled=true; btn.textContent="Saving…";
  try{
    if(id){ const p=TEAM.staff.find(x=>x.id===id), active=$("lfActive").checked;
      if(p.email!==body.email) await teamAdmin(Object.assign({action:"update", id, active}, body)); else await rpc("owner_edit_staff",{p_id:id, p_name:body.name, p_phone:body.phone, p_role:body.role, p_active:active});
      closeSheet(); toast("Saved"); }
    else { const pw=$("lfPw").value; if(pw.length<8) throw new Error("The password needs 8 or more characters."); await teamAdmin(Object.assign({action:"add", password:pw}, body)); sentLogin("Login added", body.name, body.email, body.phone, pw); }
    TEAM=await rpc("owner_team"); cache.set("team",TEAM); refreshSettings(); dSettings();
  }catch(x){ if(x.message==="signed out") return; err.hidden=false; err.textContent=x.message; btn.disabled=false; btn.textContent=id?"Save changes":"Add login"; }
});

/* ============================== HELP ============================== */
function vHelp(){
  const owner=isOwner(), q=S.helpQ.toLowerCase();
  const list=GUIDE.filter(g=>g.role==="all"||owner).filter(g=>!q || (g.title+" "+g.body.replace(/<[^>]+>/g," ")).toLowerCase().includes(q));
  V().innerHTML = pageHead("Help", "How the staff app works. Search, or open a topic.", `<button class="btn" type="button" id="tourAgain">Show me around</button>`) + `<div class="help">
    <label class="search-in">${I.search}<input class="input" id="hq" type="search" placeholder="Search help" value="${esc(S.helpQ)}" autocomplete="off"></label>
    <details class="card whatsnew" ${q?"":"open"}><summary><h2>What's new</h2></summary><ul>${WHATS_NEW.map(([d,t])=>`<li><small>${esc(d)}</small>${esc(t)}</li>`).join("")}</ul></details>
    ${list.map(g=>`<details class="card" id="g-${g.id}" ${q?"open":""}><summary><h2>${esc(g.title)}</h2>${g.role==="owner"?'<span class="pill st-owner">Owner</span>':""}</summary><div class="help-body">${g.body}</div></details>`).join("") || '<section class="card empty"><b>Nothing found</b>Try another word.</section>'}</div>`;
}
document.addEventListener("input", e => { if(e.target.id!=="hq") return; S.helpQ=e.target.value; const pos=e.target.selectionStart; vHelp(); const i=$("hq"); i.focus(); i.setSelectionRange(pos,pos); });
document.addEventListener("click", e => { if(e.target.closest("#tourAgain")) tour(true); });

/* ============================== account ============================== */
function accountSheet(){
  const th=store.get("vb.theme")||"auto";
  openSheet(S.me.name, `<div class="menu"><p class="muted">${esc(session&&session.email||"")} · ${isOwner()?"Owner":"Washer"}</p>
    <div class="field">Look<div class="seg" id="themeSeg">${[["auto","Phone setting"],["light","Light"],["dark","Dark"]].map(([k,l])=>`<button type="button" data-th="${k}" class="${k===th?"on":""}">${l}</button>`).join("")}</div></div>
    <form id="pwForm" class="fs"><legend>Change my password</legend><div class="pw-row"><span class="pw-wrap"><input class="input" id="myPw" type="password" placeholder="New password, 8+ characters" autocomplete="new-password"><button type="button" class="pw-eye" data-eye="myPw">Show</button></span><button class="btn" type="submit">Save</button></div><p class="msg" id="pwMsg" hidden></p></form>
    <button class="btn" type="button" id="refreshNow">Refresh now</button><button class="btn" type="button" data-go="help">Help</button><button class="btn danger" type="button" data-signout>Sign out</button></div>`, "account");
}
$("sheetBody").addEventListener("click", e => { const b=e.target.closest("[data-th]"); if(!b) return; store.set("vb.theme", b.dataset.th==="auto"?null:b.dataset.th); applyTheme(); $$("#themeSeg button").forEach(x=>x.classList.toggle("on", x===b)); });
$("sheetBody").addEventListener("submit", async e => {
  if(e.target.id!=="pwForm") return; e.preventDefault(); const pw=$("myPw").value, m=$("pwMsg"); m.hidden=false;
  if(pw.length<8){ m.className="msg bad"; m.textContent="Use 8 or more characters."; return; }
  try{ await fresh(); await auth("user",{password:pw},"PUT"); m.className="msg ok"; m.textContent="Password changed. Use it next time you sign in."; $("myPw").value=""; }
  catch(x){ m.className="msg bad"; m.textContent=/different|same/i.test(x.message)?"That's your current password. Pick a new one.":x.message; }
});
document.addEventListener("click", e => {
  if(e.target.closest("#refreshNow")){ closeSheet(); refreshSettings(); route(); }
  if(e.target.closest("[data-signout]")){ if(session) fetch(URL_+"/auth/v1/logout",{method:"POST",headers:{apikey:KEY,Authorization:"Bearer "+session.access_token}}).catch(()=>{});
    Object.keys(localStorage).filter(k=>k.startsWith("vb.") && !["vb.theme","vb.menu"].includes(k) && !k.startsWith("vb.tour")).forEach(k=>localStorage.removeItem(k));
    session=null; S.me=null; S.v=""; S.day=istToday(); S.open.clear(); S.inboxCount=0; S.attnCount=0; SET={templates:[],notice:null,team:[]}; JOBS.clear(); SINCE=null; NOTES=[];
    OV=ATTN=CAL=DAY=BK=CU=DUE=INB=AN=TEAM=null;
    closeSheet(); closePop(); history.replaceState(null,"",location.pathname); $("lgFields").hidden=false; $("lgCer").hidden=true; show("login"); }
});

/* ============================== bell (notifications) ============================== */
function drawBell(ring){
  const seen=store.get("vb.bellSeen")||"", n=NOTES.filter(x=>x.at>seen).length + (isOwner()?(S.inboxCount||0):0);
  $$("[data-bell]").forEach(b=>{ setHTML(b, I.bell + (n?`<span class="bell-count">${n>9?"9+":n}</span>`:"")); if(ring){ b.classList.remove("ring"); void b.offsetWidth; b.classList.add("ring"); } });
}
document.addEventListener("click", e => {
  const b=e.target.closest("[data-bell]"); if(!b) return; if(!$("pop").hidden){ closePop(); return; }
  const r=b.getBoundingClientRect(), pop=$("pop"), seen=store.get("vb.bellSeen")||"", items=[];
  if(isOwner() && S.inboxCount) items.push(`<button class="list-row" type="button" data-go="inbox"><span class="lr-main"><b>${S.inboxCount} new in Inbox</b><span>Society requests, messages and reviews</span></span><span class="nav-badge">${S.inboxCount}</span></button>`);
  if(isOwner() && ATTN && ATTN.unconfirmed.length) items.push(`<button class="list-row" type="button" data-go="home"><span class="lr-main"><b>${ATTN.unconfirmed.length} booking${ATTN.unconfirmed.length>1?"s":""} not confirmed yet</b><span>Confirm them on WhatsApp from Home</span></span></button>`);
  NOTES.slice(0,15).forEach(x=>items.push(`<button class="list-row" type="button" data-open="${esc(x.id)}"><span class="lr-main"><b>${x.at>seen?"● ":""}${esc(x.text)}</b><span>${esc(x.sub)} · ${ago(x.at)}</span></span></button>`));
  pop.innerHTML = `<h3>Notifications</h3>${items.join("")||'<div class="empty">Nothing new. New bookings show up here.</div>'}`;
  pop.hidden=false; const w=pop.offsetWidth;
  pop.style.left=Math.max(12, Math.min(innerWidth-w-12, r.left>innerWidth/2 ? r.right-w : r.left))+"px";
  pop.style.top=(r.top>innerHeight/2 ? Math.max(12, r.top-pop.offsetHeight-8) : r.bottom+8)+"px";
  store.set("vb.bellSeen", new Date().toISOString()); setTimeout(()=>drawBell(),50);
});

/* ============================== search (Ctrl K) ============================== */
let fTimer=0, fSel=0;
function openFinder(){ $("finder").hidden=false; $("findIn").value=""; fSel=0; finderRes("", true); setTimeout(()=>$("findIn").focus(),20); }
function closeFinder(){ $("finder").hidden=true; }
document.addEventListener("click", e => { if(e.target.closest("[data-find]")){ e.preventDefault(); openFinder(); } if(e.target.id==="finder") closeFinder(); });
$("findIn").addEventListener("input", e => { clearTimeout(fTimer); const q=e.target.value.trim(); fSel=0; finderRes(q, true); fTimer=setTimeout(()=>finderRes(q), 250); });
$("findIn").addEventListener("keydown", e => { const rows=$$("#findRes .list-row"); if(e.key==="ArrowDown"||e.key==="ArrowUp"){ e.preventDefault(); fSel=Math.max(0,Math.min(rows.length-1,fSel+(e.key==="ArrowDown"?1:-1))); rows.forEach((r,i)=>r.classList.toggle("sel",i===fSel)); if(rows[fSel]) rows[fSel].scrollIntoView({block:"nearest"}); } if(e.key==="Enter" && rows[fSel]){ e.preventDefault(); rows[fSel].click(); } });
$("findRes").addEventListener("click", e => { if(e.target.closest(".list-row")) setTimeout(closeFinder, 0); });
async function finderRes(q, local){
  const ql=q.toLowerCase(), screens=NAV.filter(n=>n.id && (!n.owner||isOwner()) && (!q || n.t.toLowerCase().includes(ql)));
  const doNew = !q || "new booking".includes(ql);
  let bk=[], cu=[];
  if(q.length>=2){ bk=[...JOBS.values()].filter(j=>(j.name+" "+j.phone+" "+j.id+" "+j.plate+" "+j.area).toLowerCase().includes(ql)).slice(0,8);
    if(!local){ try{ const r=await rpc("staff_bookings",{p_query:q, p_from:addDays(istToday(),-365), p_limit:10}); remember(r); bk=r; }catch(e){}
      if(isOwner()){ try{ cu=await rpc("owner_customers",{p_query:q, p_limit:5}); }catch(e){} } }
    if($("findIn").value.trim()!==q) return; }
  const row=(attr,b,s)=>`<button class="list-row" type="button" ${attr}><span class="lr-main"><b>${b}</b>${s?`<span>${s}</span>`:""}</span></button>`;
  $("findRes").innerHTML = (doNew?`<h4>Do</h4>`+row("data-new","+ New booking",""):"")
    + (screens.length?`<h4>Go to</h4>`+screens.map(n=>row(`data-go="${n.id}"`, n.t, "")).join(""):"")
    + (bk.length?`<h4>Bookings</h4>`+bk.map(j=>row(`data-open="${esc(j.id)}"`, esc(j.name)+` <span class="pill ${PILL[colOf(j)][0]}">${PILL[colOf(j)][1]}</span>`, `${relDay(j.wash_date)}, ${esc(j.slot)} · ${esc(j.package)} · ${esc(j.id)}`)).join(""):"")
    + (cu.length?`<h4>Customers</h4>`+cu.map(c=>row(`data-cust="${c.phone}"`, esc(c.name), `${esc(fmtPhone(c.phone))} · ${c.washes} wash${c.washes===1?"":"es"}`)).join(""):"")
    + (q.length>=2&&!bk.length&&!cu.length&&!screens.length&&!local?'<div class="empty">Nothing found.</div>':"");
  const rows=$$("#findRes .list-row"); if(rows[fSel]) rows[fSel].classList.add("sel");
}

/* ============================== first-time tour ============================== */
function tour(force){
  const key="vb.tour."+(S.me&&S.me.id); if(!force && store.get(key)) return;
  const phone=matchMedia("(max-width:820px)").matches;
  const steps = isOwner() ? [
    ["Welcome to the new staff app", "Home shows what needs doing: bookings to confirm, money to collect, and the month's calendar."],
    ["Jobs: the day, one job at a time", "Each job has one big button that moves it along: confirm, on my way, washed, paid, review. Call, Map and WhatsApp are on every card."],
    ["Bookings: board and table", (phone?"":"Drag a card between columns to move it along. ")+"Tap any booking to open its page with the whole history."],
    ["Add bookings in seconds", (phone?"Tap the green + below. ":"Use New booking. ")+"Paste a customer's WhatsApp message and tap Fill."],
    ["Your business", "Customers, Inbox, Analytics and Settings are "+(phone?"under More.":"in the menu.")+" Add washers and set their passwords in Settings → Team."],
    ["Search and notifications", "Find any booking or customer with "+(phone?"the search button":"Ctrl K")+". The bell shows new bookings."]
  ] : [
    ["Welcome", "Jobs shows your day. Each job has one big button: confirm, on my way, washed, paid."],
    ["Your jobs first", "Mine shows the jobs given to you. Switch to Everyone to see the rest."],
    ["Add a booking", (phone?"Tap the green + below. ":"Use New booking. ")+"Paste the customer's WhatsApp message and tap Fill."],
    ["Need help?", "Help explains every screen. Your password and light or dark look are under "+(phone?"Me.":"your name in the menu.")]
  ];
  let i=0; const el=$("tour");
  const draw=()=>{ el.hidden=false; el.innerHTML=`<div class="tour-card"><div class="dots">${steps.map((_,k)=>`<i class="${k===i?"on":""}"></i>`).join("")}</div><h2>${esc(steps[i][0])}</h2><p class="muted">${esc(steps[i][1])}</p>
    <div class="row" style="justify-content:space-between;margin-top:6px"><button class="link-btn" type="button" data-tskip>Skip</button><button class="btn primary" type="button" data-tnext>${i<steps.length-1?"Next":"Start"}</button></div></div>`; };
  el.onclick = e => { if(e.target.closest("[data-tnext]")){ i++; if(i>=steps.length){ el.hidden=true; store.set(key,1); } else draw(); } if(e.target.closest("[data-tskip]")){ el.hidden=true; store.set(key,1); } };
  draw();
}

/* ============================== sign in, forgot, recover ============================== */
$("loginForm").addEventListener("submit", async e => {
  e.preventDefault(); const btn=$("lgBtn"), err=$("lgErr"), card=e.target; err.hidden=true; btn.disabled=true; btn.textContent="Signing in…";
  try{
    keep(await auth("token?grant_type=password", {email:$("lgEmail").value.trim(), password:$("lgPass").value}));
    $("lgFields").hidden=true; $("lgCer").hidden=false; $("lgCer").classList.remove("ok"); $("lgCerText").textContent="Signing you in…";
    const me = await rpc("staff_me"); S.me=me; store.set("vb.me", me);
    $("lgCer").classList.add("ok"); $("lgCerText").innerHTML=`<strong>Welcome, ${esc(first(me.name))}</strong>${me.active?"Opening your day…":""}`;
    await new Promise(r=>setTimeout(r, 900)); await start();
  }catch(x){ $("lgFields").hidden=false; $("lgCer").hidden=true; err.textContent = /invalid/i.test(x.message) ? "Wrong email or password." : x.message; err.hidden=false; card.classList.remove("shake"); void card.offsetWidth; card.classList.add("shake"); }
  finally{ btn.disabled=false; btn.textContent="Sign in"; }
});
$("forgotBtn").addEventListener("click", () => { $("fgEmail").value=$("lgEmail").value; $("fgMsg").hidden=true; show("forgot"); });
$("forgotForm").addEventListener("submit", async e => {
  e.preventDefault(); const m=$("fgMsg"), em=$("fgEmail").value.trim(); m.hidden=false;
  if(!/^\S+@\S+\.\S+$/.test(em)){ m.className="alert error"; m.textContent="Enter your login email."; return; }
  $("fgBtn").disabled=true;
  try{ await auth("recover?redirect_to="+encodeURIComponent(BASE+"ops.html"), {email:em}); m.className="alert ok"; m.textContent="If that email has a login, a link is on its way. Open it on this phone."; }
  catch(x){ m.className="alert error"; m.textContent=/rate|seconds/i.test(x.message)?"Too many tries. Wait a few minutes, or ask the owner to set a new password in Team.":x.message; }
  $("fgBtn").disabled=false;
});
$("recoverForm").addEventListener("submit", async e => {
  e.preventDefault(); const pw=$("rcPass").value, err=$("rcErr"); err.hidden=true;
  if(pw.length<8){ err.hidden=false; err.textContent="Use 8 or more characters."; return; }
  $("rcBtn").disabled=true;
  try{ await auth("user",{password:pw},"PUT"); history.replaceState(null,"",location.pathname); toast("Password saved"); await start(); }
  catch(x){ err.hidden=false; err.textContent=x.message; $("rcBtn").disabled=false; }
});
$("waitRetry").addEventListener("click", () => start());

async function start(){
  try{ S.me = await rpc("staff_me"); store.set("vb.me", S.me); }
  catch(e){ if(e.message==="signed out") return; if(!S.me){ show("login"); $("lgErr").textContent="Couldn't reach the server. Check your internet."; $("lgErr").hidden=false; return; } }
  if(!S.me.active){ show("wait"); return; }
  const wasOpen = !$("shell").hidden;
  show("app"); drawNav(); if(!wasOpen) route();
  await refreshSettings(); drawNav(); redraw();
  pingCheck(); if(isOwner() && S.v!=="home") rpc("owner_overview").then(o=>{ OV=o; cache.set("numbers",o); setCounts(); }).catch(()=>{});
  setTimeout(()=>tour(), 600);
}

/* live: refresh the open screen every 30 s while visible, and when coming back to the app */
async function pingCheck(){ try{ remember(await rpc("staff_bookings",{p_query:"", p_from:istToday(), p_limit:200}), true); }catch(e){} }
const LIVE = {home:()=>vHome(), jobs:()=>vJobs(), bookings:()=>vBookings()};
setInterval(() => { if(document.hidden || !session || !S.me || $("shell").hidden) return; pingCheck(); if(LIVE[S.v] && $("sheet").hidden && $("finder").hidden && !document.activeElement.matches("input,textarea,select")) LIVE[S.v](); }, 30000);
document.addEventListener("visibilitychange", () => { if(!document.hidden && session && S.me && !$("shell").hidden){ refreshSettings(); pingCheck(); if(LIVE[S.v] && $("sheet").hidden) LIVE[S.v](); checkVersion(); } });
async function checkVersion(){ if(!BUILD_ID) return; try{ const r=await fetch("version.json?t="+Date.now(),{cache:"no-store"}); const j=await r.json(); if(j.build && j.build!==BUILD_ID) $("updBar").hidden=false; }catch(e){} }
setInterval(checkVersion, 5*60e3);
$("updBtn").addEventListener("click", () => location.reload());

/* ============================== go ============================== */
const hash = new URLSearchParams(location.hash.slice(1));
if(!URL_ || !KEY){ show("setup"); }
else if(hash.get("type")==="recovery" && hash.get("access_token")){ keep({access_token:hash.get("access_token"), refresh_token:hash.get("refresh_token"), expires_in:hash.get("expires_in")}); show("recover"); }
else if(hash.get("error_description")){ show("login"); $("lgErr").hidden=false; $("lgErr").textContent=hash.get("error_description").replace(/\+/g," ")+". Ask for a new link."; history.replaceState(null,"",location.pathname); }
else if(session && S.me && S.me.active){ show("app"); drawNav(); route(); start(); }
else if(session){ start(); }
else show("login");
})();
