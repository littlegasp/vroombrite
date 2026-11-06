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

/* Vroombrite Staff — staff app on Supabase (plain fetch, no libraries).
   - Shows the last saved data instantly, then refreshes in the background.
   - Buttons update the screen immediately and roll back if the save fails.
   - PKG, PRICE, ADDONS, DETAIL, SLOTS, SIZE_LABEL, AREAS come from app.js (added by build.py);
     GUIDE and WHATS_NEW from ops-guide.js. */
(function(){
"use strict";
const BUILD_ID = "5b72731715";
const $ = id => document.getElementById(id);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];
const URL_ = (SITE.supabaseUrl||"").replace(/\/$/,""), KEY = SITE.supabaseKey||"";
const BASE = location.href.replace(/[^/]*([?#].*)?$/, "");
const store = {
  get(k){ try{ return JSON.parse(localStorage.getItem(k)); }catch(e){ return null; } },
  set(k,v){ try{ v==null ? localStorage.removeItem(k) : localStorage.setItem(k, JSON.stringify(v)); }catch(e){} }
};
const esc = t => String(t==null?"":t).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const rupee = n => (n<0?"−₹":"₹") + Math.abs(Number(n||0)).toLocaleString("en-IN");
const first = n => String(n||"").trim().split(/\s+/)[0] || "there";
const istToday = () => new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Kolkata"}).format(new Date());
const addDays = (iso, n) => { const d=new Date(iso+"T12:00:00Z"); d.setUTCDate(d.getUTCDate()+n); return d.toISOString().slice(0,10); };
const fmtDay = (iso, o) => new Date(iso+"T12:00:00Z").toLocaleDateString("en-IN", Object.assign({timeZone:"UTC"}, o||{weekday:"short", day:"numeric", month:"short"}));
const relDay = iso => { const t=istToday(); return iso===t ? "Today" : iso===addDays(t,1) ? "Tomorrow" : iso===addDays(t,-1) ? "Yesterday" : fmtDay(iso); };
const fmtTime = ts => new Date(ts).toLocaleString("en-IN",{timeZone:"Asia/Kolkata", day:"numeric", month:"short", hour:"numeric", minute:"2-digit"});
const ago = ts => { if(!ts) return ""; const m=Math.round((Date.now()-new Date(ts))/6e4); return m<1?"just now":m<60?m+" min ago":m<1440?Math.round(m/60)+" h ago":Math.round(m/1440)+" d ago"; };
const digits = p => String(p||"").replace(/\D/g,"").slice(-10);
const tel = p => "tel:+91"+digits(p);
const wa  = (p, text) => "https://wa.me/91"+digits(p)+(text?"?text="+encodeURIComponent(text):"");
const mapUrl = j => "https://www.google.com/maps/search/?api=1&query="+encodeURIComponent([j.address, j.area, j.pin, "Mumbai"].filter(Boolean).join(", "));
const vehShort = v => String(v||"").replace(/^Car · /,"");
const monthStart = iso => iso.slice(0,8)+"01";
const I = {
  call:'<svg viewBox="0 0 24 24"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/></svg>',
  map:'<svg viewBox="0 0 24 24"><path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>',
  chat:'<svg viewBox="0 0 24 24"><path d="M4 20l1.3-3.9A8 8 0 1 1 8 19z"/></svg>',
  more:'<svg viewBox="0 0 24 24"><circle cx="5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="19" cy="12" r="1.3"/></svg>',
  pin:'<svg viewBox="0 0 24 24"><path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>',
  plus:'<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
  day:'<svg viewBox="0 0 24 24"><rect x="4" y="5" width="16" height="15" rx="3"/><path d="M8 3v4M16 3v4M4 10h16"/></svg>',
  list:'<svg viewBox="0 0 24 24"><path d="M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01"/></svg>',
  users:'<svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M21.5 20a6.5 6.5 0 0 0-4-6"/></svg>',
  inbox:'<svg viewBox="0 0 24 24"><path d="M4 13l2.5-8h11L20 13v6H4z"/><path d="M4 13h5l1 2h4l1-2h5"/></svg>',
  chart:'<svg viewBox="0 0 24 24"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>',
  team:'<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>',
  cog:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>',
  help:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14M12 17.5h.01"/></svg>',
  menu:'<svg viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16"/></svg>'
};

/* ============================== Supabase ============================== */
let session = store.get("vb.session");
async function auth(path, body, method){
  const r = await fetch(URL_+"/auth/v1/"+path, {method:method||"POST", headers:Object.assign({"Content-Type":"application/json", apikey:KEY}, session&&method==="PUT"?{Authorization:"Bearer "+session.access_token}:{}), body:JSON.stringify(body)});
  const j = await r.json().catch(()=>({}));
  if(!r.ok) throw new Error(j.error_description || j.msg || j.message || "Something went wrong");
  return j;
}
function keep(j){ session = {access_token:j.access_token, refresh_token:j.refresh_token, expires_at:j.expires_at || Math.floor(Date.now()/1000)+(+j.expires_in||3600), email:(j.user||{}).email || (session||{}).email}; store.set("vb.session", session); }
let refreshing = null;
async function refresh(){
  if(!session) throw new Error("signed out");
  refreshing = refreshing || auth("token?grant_type=refresh_token", {refresh_token:session.refresh_token}).then(keep).finally(()=>refreshing=null);
  return refreshing;
}
async function fresh(){ if(session && session.expires_at*1000 - Date.now() < 60e3){ try{ await refresh(); }catch(e){ signedOut(); } } }
async function rpc(fn, args, retried){
  await fresh();
  const r = await fetch(URL_+"/rest/v1/rpc/"+fn, {method:"POST",
    headers:{"Content-Type":"application/json", apikey:KEY, Authorization:"Bearer "+(session?session.access_token:KEY)}, body:JSON.stringify(args||{})});
  if(r.status===401 && !retried && session){ try{ await refresh(); return rpc(fn, args, true); }catch(e){ return signedOut(); } }
  const j = await r.json().catch(()=>null);
  if(!r.ok){ const e=new Error((j&&j.message)||("Error "+r.status)); e.status=r.status; throw e; }
  return j;
}
const NOFN = 'The login manager isn\'t set up yet. In Supabase: Edge Functions → Deploy a new function → Via editor, name it team-admin, paste supabase/functions/team-admin/index.ts and Deploy (see Help → Team logins).';
async function teamAdmin(body){
  await fresh();
  let r; try{ r = await fetch(URL_+"/functions/v1/team-admin", {method:"POST", headers:{"Content-Type":"application/json", apikey:KEY, Authorization:"Bearer "+session.access_token}, body:JSON.stringify(body)}); }
  catch(e){ throw new Error("Couldn't reach the login manager. Check your internet. If it keeps happening: "+NOFN); }
  if(r.status===404) throw new Error(NOFN);
  const j = await r.json().catch(()=>({}));
  if(!r.ok) throw new Error(j.error || j.message || NOFN);
  return j;
}
function signedOut(){ session=null; store.set("vb.session",null); show("login"); throw new Error("signed out"); }
const quiet = e => { if(e && e.message!=="signed out") sync("err"); };

/* ============================== state ============================== */
const S = { me: store.get("vb.me"), view: "day", day: istToday(), open: new Set(), dueDays: 12, inTab: "leads", q: "", cq: "",
  bkMode: "list", cuMode: "all", calMonth: monthStart(istToday()), mine: store.get("vb.mine")!==false, setMonth: monthStart(istToday()) };
let SET = store.get("vb.c.settings") || {templates:[], notice:null, team:[]};
const cache = { get:k => store.get("vb.c."+k), set:(k,v) => store.set("vb.c."+k, v) };
function sync(s){ const el=$("sync"); el.className="sync "+s; el.title={ok:"Up to date",busy:"Updating…",err:"Offline – showing saved data"}[s]; }
function toast(t, bad){ const el=$("toast"); el.textContent=t; el.classList.toggle("bad",!!bad); el.classList.add("on"); clearTimeout(el._t); el._t=setTimeout(()=>el.classList.remove("on"), bad?4200:2400); }
const isOwner = () => S.me && S.me.role==="owner";

/* ============================== theme ============================== */
function applyTheme(){ const t=store.get("vb.theme")||"auto"; if(t==="auto") document.documentElement.removeAttribute("data-theme"); else document.documentElement.setAttribute("data-theme", t);
  const meta=document.querySelector('meta[name="theme-color"]'); if(meta) meta.content = getComputedStyle(document.documentElement).getPropertyValue("--bg").trim()||"#0F1214"; }
applyTheme();
matchMedia("(prefers-color-scheme: light)").addEventListener("change", applyTheme);

/* ============================== screens ============================== */
function show(which){
  ["setup","login","forgot","recover","wait"].forEach(n => $("scr"+n[0].toUpperCase()+n.slice(1)).hidden = which!==n);
  $("shell").hidden = which!=="app";
}
document.addEventListener("click", e => { const g=e.target.closest("[data-goto]"); if(g) show(g.dataset.goto); });
document.addEventListener("click", e => { const b=e.target.closest("[data-eye]"); if(!b) return; const i=$(b.dataset.eye); i.type = i.type==="password"?"text":"password"; b.textContent = i.type==="password"?"Show":"Hide"; });

const VIEWS = [
  {id:"day", label:"Day", icon:I.day, all:true},
  {id:"bookings", label:"Bookings", icon:I.list, all:true},
  {id:"customers", label:"Customers", icon:I.users},
  {id:"inbox", label:"Inbox", icon:I.inbox},
  {id:"numbers", label:"Numbers", icon:I.chart},
  {id:"team", label:"Team", icon:I.team},
  {id:"settings", label:"Settings", icon:I.cog},
  {id:"help", label:"Help", icon:I.help, all:true}
];
const allowed = id => VIEWS.some(v => v.id===id && (v.all || isOwner()));
function drawNav(){
  $("views").innerHTML = VIEWS.filter(v => v.all || isOwner()).map(v =>
    `<button type="button" data-v="${v.id}" ${v.id===S.view?'aria-current="page"':""}>${v.label}${v.id==="inbox"&&S.inboxNew?'<span class="dot"></span>':""}</button>`).join("");
  const moreViews = ["inbox","numbers","team","settings","help"];
  const tabs = isOwner()
    ? [["day","Day",I.day],["bookings","Bookings",I.list],["new","New",I.plus],["customers","Customers",I.users],["more","More",I.menu]]
    : [["day","Day",I.day],["bookings","Bookings",I.list],["new","New",I.plus],["help","Help",I.help],["me","Me",I.team]];
  $("tabbar").innerHTML = tabs.map(([id,l,ic]) => `<button type="button" data-tab="${id}" class="${id==="new"?"tb-new":""}" ${id===S.view || (id==="more" && moreViews.includes(S.view))?'aria-current="page"':""}>${ic}<span>${l}</span>${id==="more"&&S.inboxNew?'<i class="dot"></i>':""}</button>`).join("");
  $("meBtn").textContent = (S.me&&S.me.name||"?").trim().charAt(0).toUpperCase();
}
$("views").addEventListener("click", e => { const b=e.target.closest("[data-v]"); if(b) go(b.dataset.v); });
$("tabbar").addEventListener("click", e => {
  const b=e.target.closest("[data-tab]"); if(!b) return; const t=b.dataset.tab;
  if(t==="new") return newBooking();
  if(t==="me") return accountSheet();
  if(t==="more") return openSheet("More", `<div class="menu grid2">${VIEWS.filter(v=>!["day","bookings","customers"].includes(v.id)).map(v=>`<button class="b b-ghost tile-btn" type="button" data-goview="${v.id}">${v.icon}<span>${v.label}</span>${v.id==="inbox"&&S.inboxNew?'<i class="dot"></i>':""}</button>`).join("")}
    <button class="b b-ghost tile-btn" type="button" data-account>${I.team}<span>My account</span></button></div>`);
  go(t);
});
document.addEventListener("click", e => { const b=e.target.closest("[data-goview]"); if(b){ closeSheet(); go(b.dataset.goview); } const a=e.target.closest("[data-account]"); if(a) accountSheet(); const n=e.target.closest("[data-new]"); if(n) newBooking(); });
function go(v){
  if(!allowed(v)) v="day";
  S.view=v; drawNav();
  $$("[data-view]").forEach(s => s.hidden = s.dataset.view!==v);
  const titles={day:relDay(S.day), bookings:"Bookings", customers:"Customers", inbox:"Inbox", numbers:"Numbers", team:"Team", settings:"Settings", help:"Help"};
  $("title").textContent = titles[v];
  $("subtitle").textContent = v==="day" ? fmtDay(S.day,{weekday:"long", day:"numeric", month:"long"}) : (S.me ? S.me.name+" · "+(isOwner()?"Owner":"Washer") : "");
  ({day:loadDay, bookings:loadBookings, customers:loadCustomers, inbox:loadInbox, numbers:loadNumbers, team:loadTeam, settings:loadSettingsView, help:drawHelp})[v]();
  scrollTo(0,0);
}

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

/* ============================== job card ============================== */
const STATUS_LABEL = {new:"New", confirmed:"Confirmed", on_way:"On the way", done:"Washed", cancelled:"Cancelled"};
const SOURCE_LABEL = {website:"Website", phone:"Phone", whatsapp:"WhatsApp", walk_in:"Walk-in", society:"Society", instagram:"Instagram", repeat:"Repeat", other:"Other"};
const isPaid = j => /^paid/.test(j.payment);
function nextStep(j){
  if(j.status==="cancelled") return `<button class="b b-ghost" data-act="reopen">Reopen booking</button>`;
  if(j.status==="new") return `<a class="b b-wa b-lg" data-act="confirm" target="_blank" rel="noopener" href="${wa(j.phone, fill("confirm", jobCtx(j)))}">Confirm on WhatsApp</a>`;
  if(j.status==="confirmed") return `<a class="b b-wa b-lg" data-act="on_way" target="_blank" rel="noopener" href="${wa(j.phone, fill("onway", jobCtx(j)))}">Send "On my way"</a>`;
  if(j.status==="on_way") return `<button class="b b-lime b-lg" data-act="done">Mark washed</button>`;
  if(!isPaid(j)) return `<button class="b b-coral b-lg" data-act="paid_upi">Paid by UPI</button><button class="b b-coral b-lg" data-act="paid_cash">Paid in cash</button>`;
  if(!j.review_asked_at) return `<a class="b b-ghost b-lg" data-act="review_asked" target="_blank" rel="noopener" href="${wa(j.phone, fill("review", jobCtx(j)))}">Ask for a review</a>`;
  return `<button class="b b-ghost b-lg" disabled>All done ✓</button>`;
}
function payTag(j){
  if(isPaid(j)) return `<span class="tag t-lime">${j.payment==="paid_upi"?"Paid · UPI":"Paid · cash"}</span>`;
  if(j.payment==="refunded") return `<span class="tag">Refunded</span>`;
  return j.pay_mode==="online" ? `<span class="tag t-coral">UPI pending</span>` : `<span class="tag">Pay after</span>`;
}
function steps(j){
  const n = j.status==="cancelled" ? 0 : ({new:0, confirmed:1, on_way:2, done:3})[j.status] + (isPaid(j)?1:0);
  return `<ol class="steps">${["Confirmed","On the way","Washed","Paid"].map((s,i)=>`<li class="${i<n?"on":""}">${s}</li>`).join("")}</ol>`;
}
const ord = n => n+(["th","st","nd","rd"][(n%100>10&&n%100<14)?0:n%10]||"th");
function card(j, opts){
  opts=opts||{};
  return `<article class="job${opts.hero?" hero":""}" data-id="${esc(j.id)}">
    <div class="job-top"><span class="slot">${esc(opts.showDate?relDay(j.wash_date)+" · ":"")}${esc(j.slot)}</span>
      ${j.status==="cancelled"?'<span class="tag">Cancelled</span>':j.status==="new"?'<span class="tag t-aqua">New</span>':""}
      ${j.visits>0?`<span class="tag t-blue">${ord(j.visits+1)} visit</span>`:""}${payTag(j)}</div>
    <h3>${esc(j.name)} <small>${esc(j.id)}</small></h3>
    <p class="veh"><b>${esc(j.vehicle)}</b>${j.plate?" · "+esc(j.plate):""} — ${esc(j.package)}${j.extras?" + "+esc(j.extras):""}</p>
    <p class="addr">${I.pin}<span>${esc(j.address)}${j.area?", "+esc(j.area):""} ${esc(j.pin)}</span></p>
    ${j.assigned_name||j.source&&j.source!=="website"?`<p class="meta">${j.assigned_name?`<span>Washer: <b>${esc(j.assigned_name)}</b></span>`:""}${j.source&&j.source!=="website"?`<span>From: ${esc(SOURCE_LABEL[j.source]||j.source)}</span>`:""}</p>`:""}
    ${j.notes?`<p class="note">${esc(j.notes)}</p>`:""}
    ${j.promo_note && j.promo!=="MANUAL"?`<p class="note">${esc(j.promo_note)}</p>`:""}
    ${j.credit>0 && j.status!=="cancelled"?`<div class="credit"><span>${rupee(j.credit)} referral credit — take it off the bill</span><button class="b b-ghost" data-act="use_credit" style="min-height:36px;padding:6px 10px">Mark used</button></div>`:""}
    <div class="money"><span>${j.discount>0?`${esc(j.promo==="REFERRAL"?"Referral":j.promo==="MANUAL"?("Discount"+(j.promo_note?" · "+j.promo_note:"")):j.promo)} −${rupee(j.discount)}`:"To collect"}</span><b class="num">${j.discount>0?`<s>${rupee(j.subtotal)}</s>`:""}${rupee(j.total)}</b></div>
    ${steps(j)}
    <div class="next">${nextStep(j)}</div>
    <div class="quick">
      <a class="b" href="${tel(j.phone)}" data-call>${I.call}Call</a>
      <a class="b" target="_blank" rel="noopener" href="${mapUrl(j)}">${I.map}Map</a>
      <button class="b" type="button" data-chat>${I.chat}Chat</button>
      <button class="b" type="button" data-more>${I.more}More</button>
    </div>
    ${opts.detail?detailHTML(j):""}
  </article>`;
}
function row(j, showDate){
  const cls = j.status==="cancelled" ? " off" : (j.status==="done" && isPaid(j)) ? " done" : "";
  return `<button type="button" class="row${cls}" data-open="${esc(j.id)}">
    <span class="rt">${esc(showDate?relDay(j.wash_date):j.slot)}</span>
    <span class="rm"><b>${esc(j.name)}</b><span>${esc(vehShort(j.vehicle))} · ${esc(j.package)}${j.area?" · "+esc(j.area):""}${j.assigned_name?" · "+esc(first(j.assigned_name)):""}</span></span>
    <span class="rr"><b class="num">${rupee(j.total)}</b>${j.status==="cancelled"?'<span class="tag">Cancelled</span>':j.status==="done"?(isPaid(j)?'<span class="tag t-lime">Done</span>':'<span class="tag t-coral">Collect</span>'):`<span class="tag ${j.status==="new"?"t-aqua":""}">${STATUS_LABEL[j.status]}</span>`}</span>
  </button>`;
}

/* ============================== jobs: one store for every view ============================== */
const JOBS = new Map(), PINGED = new Set();
/* "New booking" alert: only for bookings made after the newest one this phone has already seen. */
let SINCE = store.get("vb.since");
function remember(list, live){
  const fresh=[]; let newest = SINCE;
  (list||[]).forEach(j => { JOBS.set(j.id, j); if(live && SINCE && j.created_at > SINCE) fresh.push(j); if(!newest || j.created_at > newest) newest = j.created_at; });
  if(live && newest && newest !== SINCE){ SINCE = newest; store.set("vb.since", SINCE); }
  const ping = fresh.filter(j => j.created_by!==(S.me&&S.me.id) && !PINGED.has(j.id)); ping.forEach(j=>PINGED.add(j.id));
  if(ping.length){ toast(ping.length===1?`New booking: ${ping[0].name} · ${relDay(ping[0].wash_date)}, ${ping[0].slot}`:`${ping.length} new bookings`); try{ navigator.vibrate && navigator.vibrate([60,40,60]); }catch(e){} }
}
const OPTIMISTIC = {
  confirm: j => ({status: j.status==="new"?"confirmed":j.status, confirmed_at: j.confirmed_at||new Date().toISOString()}),
  on_way: () => ({status:"on_way"}), done: () => ({status:"done"}),
  paid_upi: () => ({payment:"paid_upi"}), paid_cash: () => ({payment:"paid_cash"}), unpaid: () => ({payment:"pending"}),
  cancel: () => ({status:"cancelled"}), reopen: j => ({status: j.confirmed_at?"confirmed":"new"}),
  reminded: () => ({reminder_sent_at:new Date().toISOString()}), review_asked: () => ({review_asked_at:new Date().toISOString()}),
  use_credit: () => ({credit:0})
};
const DONE_MSG = {confirm:"Confirmed", on_way:"Marked on the way", done:"Marked washed", paid_upi:"Paid by UPI", paid_cash:"Paid in cash", unpaid:"Marked unpaid",
  cancel:"Booking cancelled", reopen:"Booking reopened", reminded:"Reminder logged", review_asked:"Review request logged", use_credit:"Credit marked used"};
async function act(id, action){
  const before = JOBS.get(id); if(!before) return;
  JOBS.set(id, Object.assign({}, before, OPTIMISTIC[action](before)));
  redraw(); toast(DONE_MSG[action]);
  try{ const f = await rpc("staff_update", {p_id:id, p_action:action}); JOBS.set(id, f); redraw(true); }
  catch(e){ if(e.message==="signed out") return; JOBS.set(id, before); redraw(); toast("Couldn't save. Check your internet and try again.", true); }
}
function setJob(j){ JOBS.set(j.id, j); redraw(true); }
document.addEventListener("click", e => {
  const host = e.target.closest("[data-id]");
  const a = e.target.closest("[data-act]");
  if(a && host){
    if(a.dataset.act==="cancel" && !a.dataset.sure){ a.dataset.sure="1"; a.textContent="Tap again to cancel"; setTimeout(()=>{ delete a.dataset.sure; a.textContent="Cancel booking"; }, 3000); e.preventDefault(); return; }
    act(host.dataset.id, a.dataset.act);
    if(a.tagName==="BUTTON") e.preventDefault();
    if(a.closest(".menu")) closeSheet();
    return;
  }
  if(host && e.target.closest("[data-more]")) return moreSheet(host.dataset.id);
  if(host && e.target.closest("[data-chat]")) return chatSheet(host.dataset.id);
  if(host && e.target.closest("[data-call]")) return setTimeout(()=>callSheet(host.dataset.id), 400);
  const o = e.target.closest("[data-open]");
  if(o){ const id=o.dataset.open; if(S.view==="day" && !o.closest(".sheet")){ S.open.has(id)?S.open.delete(id):S.open.add(id); drawDay(); } else openJob(id); }
});

/* ============================== Day ============================== */
let DAY = null;
function stripHTML(strip){
  const t=istToday();
  return (strip||[]).map(d => `<button type="button" class="day${d.date===t?" today":""}" role="tab" aria-selected="${d.date===S.day}" data-day="${d.date}">
    <small>${fmtDay(d.date,{weekday:"short"})}</small><b>${fmtDay(d.date,{day:"numeric"})}</b>
    <i>${d.count>3?`<em>${d.count}</em>`:Array.from({length:d.count},(_,k)=>`<span class="${k<d.open?"open":""}"></span>`).join("")}</i></button>`).join("");
}
$("strip").addEventListener("click", e => { const b=e.target.closest("[data-day]"); if(!b) return; S.day=b.dataset.day; S.open.clear(); drawDay._scrolled=false; go("day"); });
$("daybar").addEventListener("click", e => { const b=e.target.closest("[data-mine]"); if(!b) return; S.mine = b.dataset.mine==="1"; store.set("vb.mine", S.mine); drawDay(); });
async function loadDay(){
  drawNotice();
  const k="day."+S.day, c=cache.get(k);
  DAY = c||null; if(c) remember(c.jobs); drawDay();
  sync("busy");
  try{ const d=await rpc("staff_day",{p_date:S.day}); DAY=d; remember(d.jobs, true); cache.set(k,d); drawDay(); sync("ok"); }
  catch(e){ quiet(e); }
}
function drawNotice(){ const n=SET.notice, el=$("notice"); el.hidden=!(n&&n.body); if(n&&n.body) el.innerHTML=`<b>Notice</b><span>${esc(n.body)}</span><small>${esc(n.by||"")} · ${ago(n.updated_at)}</small>`; }
function drawDay(){
  if(!DAY){
    $("strip").innerHTML = Array.from({length:7},()=>'<div class="day sk" style="height:66px"></div>').join("");
    $("daybar").innerHTML=""; $("dayBody").innerHTML='<div class="sk" style="height:300px"></div><div class="sk" style="height:64px;margin-top:10px"></div>'; return;
  }
  $("strip").innerHTML = stripHTML(DAY.strip);
  const sel=$("strip").querySelector('[aria-selected="true"]'); if(sel && !drawDay._scrolled){ sel.scrollIntoView({inline:"center", block:"nearest"}); drawDay._scrolled=true; }
  let jobs = DAY.jobs.map(j => JOBS.get(j.id) || j).filter(j => j.wash_date===S.day);
  const meId = S.me && S.me.id, anyMine = jobs.some(j=>j.assigned_to===meId);
  const filterOn = !isOwner() && anyMine && S.mine;
  if(filterOn) jobs = jobs.filter(j => j.assigned_to===meId || !j.assigned_to);
  const live = jobs.filter(j=>j.status!=="cancelled"), done = live.filter(j=>j.status==="done").length;
  const toCollect = live.filter(j=>!isPaid(j)).reduce((s,j)=>s+j.total,0);
  $("daybar").innerHTML = (live.length ? `<div class="prog"><i style="width:${Math.round(done/live.length*100)}%"></i></div>
    <p><b>${done}/${live.length}</b> washed · ${toCollect?`<span class="due"><b class="num">${rupee(toCollect)}</b> to collect</span>`:"all paid"}</p>` : "")
    + (!isOwner() && anyMine ? `<div class="seg mini"><button type="button" data-mine="1" aria-pressed="${S.mine}">Mine</button><button type="button" data-mine="0" aria-pressed="${!S.mine}">Everyone</button></div>` : "");
  if(!jobs.length){ $("dayBody").innerHTML = `<div class="empty"><b>No bookings ${S.day===istToday()?"today":"on "+fmtDay(S.day)}</b>New bookings from the website appear here automatically.<br><button class="b b-lime" type="button" data-new style="margin-top:14px">${I.plus}New booking</button></div>`; return; }
  const open = live.filter(j => ["new","confirmed","on_way"].includes(j.status));
  const collect = live.filter(j => j.status==="done" && !isPaid(j));
  const finished = live.filter(j => j.status==="done" && isPaid(j));
  const cancelled = jobs.filter(j => j.status==="cancelled");
  const hero = open[0];
  const sec = (title, list, body) => list.length ? `<div class="grp"><h2>${title} · ${list.length}</h2></div><div class="list cols">${body}</div>` : "";
  const many = list => list.map(j => S.open.has(j.id) ? card(j) : row(j)).join("");
  $("dayBody").innerHTML =
    (hero ? `<div class="grp"><h2>Up next</h2></div>${card(hero,{hero:true})}` : "") +
    sec("To collect", collect, collect.map(j=>card(j)).join("")) +
    sec("Coming up", open.slice(1), many(open.slice(1))) +
    sec("Finished", finished, many(finished)) +
    sec("Cancelled", cancelled, many(cancelled));
}

/* ============================== Bookings: list + calendar ============================== */
let BK = null, qTimer=0, CAL=null;
$("q").addEventListener("input", () => { clearTimeout(qTimer); qTimer=setTimeout(()=>{ S.q=$("q").value.trim(); loadBookings(); }, 300); });
$("bkMode").addEventListener("click", e => { const b=e.target.closest("[data-m]"); if(!b) return; S.bkMode=b.dataset.m; loadBookings(); });
async function loadBookings(){
  $("bkMode").innerHTML = `<button type="button" data-m="list" aria-pressed="${S.bkMode==="list"}">List</button><button type="button" data-m="cal" aria-pressed="${S.bkMode==="cal"}">Calendar</button>`;
  $("bkList").hidden = S.bkMode!=="list"; $("calBody").hidden = S.bkMode!=="cal";
  if(S.bkMode==="cal") return loadCal();
  const k="bk."+S.q; BK = cache.get(k); if(BK) remember(BK); drawBookings();
  sync("busy");
  try{ BK = await rpc("staff_bookings",{p_query:S.q, p_from:istToday(), p_limit:150}); remember(BK, true); cache.set(k,BK); drawBookings(); sync("ok"); }
  catch(e){ quiet(e); }
}
function drawBookings(){
  const el=$("bkBody");
  if(!BK){ el.innerHTML='<div class="sk" style="height:60px;margin-bottom:8px"></div>'.repeat(4); return; }
  const list = BK.map(j=>JOBS.get(j.id)||j);
  if(!list.length){ el.innerHTML=`<div class="empty"><b>${S.q?"Nothing found":"No upcoming bookings"}</b>${S.q?"Try a name, phone number, plate or booking ID.":"New website bookings appear here."}</div>`; return; }
  let html="", last="";
  list.forEach(j => { if(j.wash_date!==last){ last=j.wash_date; html+=`${html?"</div>":""}<div class="grp"><h2>${esc(relDay(j.wash_date))}${relDay(j.wash_date)!==fmtDay(j.wash_date)?" · "+fmtDay(j.wash_date):""}</h2></div><div class="list cols">`; } html+=row(j,false); });
  el.innerHTML = html+"</div>";
}
$("calBody").addEventListener("click", e => {
  const m=e.target.closest("[data-cm]"); if(m){ const d=new Date(S.calMonth+"T12:00:00Z"); d.setUTCMonth(d.getUTCMonth()+(+m.dataset.cm)); S.calMonth=d.toISOString().slice(0,8)+"01"; loadCal(); return; }
  const d=e.target.closest("[data-cday]"); if(d){ S.day=d.dataset.cday; S.open.clear(); drawDay._scrolled=false; go("day"); }
});
async function loadCal(){
  const k="cal."+S.calMonth; CAL=cache.get(k); drawCal(); sync("busy");
  try{ CAL=await rpc("staff_month",{p_month:S.calMonth}); cache.set(k,CAL); drawCal(); sync("ok"); } catch(e){ quiet(e); }
}
function drawCal(){
  const m=S.calMonth, d0=new Date(m+"T12:00:00Z"), days=new Date(Date.UTC(d0.getUTCFullYear(), d0.getUTCMonth()+1, 0)).getUTCDate();
  const lead=(d0.getUTCDay()+6)%7, by={}; (CAL||[]).forEach(x=>by[x.date]=x); const t=istToday();
  let cells=""; for(let i=0;i<lead;i++) cells+='<span class="cd pad"></span>';
  for(let i=1;i<=days;i++){ const iso=m.slice(0,8)+String(i).padStart(2,"0"), x=by[iso];
    cells+=`<button type="button" class="cd${iso===t?" today":""}${x&&x.count?" has":""}" data-cday="${iso}"><b>${i}</b>${x&&x.count?`<span>${x.count}</span>${x.open?`<i>${x.open} open</i>`:""}`:""}</button>`; }
  $("calBody").innerHTML = `<div class="calhead"><button class="b b-icon" type="button" data-cm="-1" aria-label="Previous month">‹</button><h3>${fmtDay(m,{month:"long", year:"numeric"})}</h3><button class="b b-icon" type="button" data-cm="1" aria-label="Next month">›</button></div>
    <div class="cal">${["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(w=>`<span class="cw">${w}</span>`).join("")}${cells}</div>${CAL?"":'<div class="sk" style="height:20px;margin-top:8px"></div>'}`;
}

/* ============================== sheet (bottom panel) ============================== */
let sheetFor=null;
function openSheet(title, html, id){ sheetFor=id||null; $("sheetTitle").textContent=title; $("sheetBody").innerHTML=html; $("sheet").hidden=false; $("sheet").querySelector(".sheet-panel").scrollTop=0; }
function closeSheet(){ $("sheet").hidden=true; sheetFor=null; }
$("sheet").addEventListener("click", e => { if(e.target.closest("[data-close]")) closeSheet(); });
addEventListener("keydown", e => { if(e.key==="Escape" && !$("sheet").hidden) closeSheet(); });
let HIST={};
function detailHTML(j){
  const team = SET.team||[];
  return `<div class="detail">
    ${isOwner()?`<label class="fld inline"><span>Washer</span><select data-assign>${`<option value="">Nobody yet</option>`+team.map(t=>`<option value="${t.id}" ${t.id===j.assigned_to?"selected":""}>${esc(t.name)}${t.role==="owner"?" (owner)":""}</option>`).join("")}</select></label>`:""}
    <form class="notebox" data-noteform><input name="note" placeholder="Add a note (gate code, parking slot…)" maxlength="500" autocomplete="off"><button class="b b-ghost" type="submit">Add</button></form>
    <div class="acts"><button class="b b-ghost" type="button" data-edit>Edit booking</button><a class="b b-ghost" href="${tel(j.phone)}" data-call>${I.call}Call</a></div>
    <h4>History</h4><ol class="hist" data-hist>${histHTML(j.id)}</ol>
  </div>`;
}
function histHTML(id){
  const h=HIST[id]; if(!h) return '<li class="sk" style="height:40px"></li>';
  if(!h.length) return '<li class="muted">Nothing yet.</li>';
  return h.map(x=>`<li class="k-${x.kind}"><span>${esc(x.detail)}</span><small>${esc(x.who||"Website")} · ${fmtTime(x.at)}</small></li>`).join("");
}
async function loadHist(id){ try{ HIST[id]=await rpc("booking_history",{p_id:id}); }catch(e){ HIST[id]=HIST[id]||[]; } const el=$("sheetBody").querySelector("[data-hist]"); if(el && sheetFor==="job:"+id) el.innerHTML=histHTML(id); }
function openJob(id){ const j=JOBS.get(id); if(!j) return; openSheet(relDay(j.wash_date)+" · "+j.slot, `<div data-id="${esc(id)}">${card(j,{detail:true})}</div>`, "job:"+id); loadHist(id); }
$("sheetBody").addEventListener("change", async e => {
  const s=e.target.closest("[data-assign]"); if(!s) return; const id=s.closest("[data-id]").dataset.id;
  try{ setJob(await rpc("owner_assign",{p_id:id, p_staff:s.value||null})); toast(s.value?"Given to "+s.selectedOptions[0].text:"Unassigned"); loadHist(id); }
  catch(err){ toast(err.message, true); }
});
$("sheetBody").addEventListener("submit", async e => {
  const f=e.target.closest("[data-noteform]"); if(!f) return; e.preventDefault(); const id=f.closest("[data-id]").dataset.id, v=f.note.value.trim(); if(!v) return;
  f.note.value=""; (HIST[id]=HIST[id]||[]).unshift({at:new Date().toISOString(), who:S.me.name, kind:"note", detail:v}); redraw();
  try{ await rpc("staff_log",{p_id:id, p_kind:"note", p_detail:v}); toast("Note added"); } catch(err){ toast("Couldn't save the note", true); loadHist(id); }
});
$("sheetBody").addEventListener("click", e => { const b=e.target.closest("[data-edit]"); if(b){ const id=b.closest("[data-id]").dataset.id; bookingForm(JOBS.get(id)); } });
function moreSheet(id){
  const j=JOBS.get(id); if(!j) return;
  openSheet("More for "+first(j.name), `<div class="menu" data-id="${esc(id)}">
    <button class="b b-ghost" type="button" data-openjob="${esc(id)}">Details, notes and history</button>
    <a class="b b-ghost" data-act="reminded" target="_blank" rel="noopener" href="${wa(j.phone, fill("remind", jobCtx(j)))}">Send reminder on WhatsApp${j.reminder_sent_at?` · sent ${ago(j.reminder_sent_at)}`:""}</a>
    ${j.status==="done"?`<a class="b b-ghost" data-act="review_asked" target="_blank" rel="noopener" href="${wa(j.phone, fill("review", jobCtx(j)))}">Ask for a review${j.review_asked_at?` · asked ${ago(j.review_asked_at)}`:""}</a>`:""}
    ${j.status!=="done"&&j.status!=="cancelled"?`<button class="b b-ghost" data-act="done">Mark washed</button>`:""}
    ${isPaid(j)?`<button class="b b-ghost" data-act="unpaid">Mark as not paid</button>`:`<button class="b b-ghost" data-act="paid_upi">Paid by UPI</button><button class="b b-ghost" data-act="paid_cash">Paid in cash</button>`}
    <button class="b b-ghost" type="button" data-edit>Edit booking</button>
    ${j.status==="cancelled"?`<button class="b b-ghost" data-act="reopen">Reopen booking</button>`:`<button class="b b-danger" data-act="cancel">Cancel booking</button>`}
  </div>`);
}
document.addEventListener("click", e => { const b=e.target.closest("[data-openjob]"); if(b) openJob(b.dataset.openjob); });
function chatSheet(id){
  const j=JOBS.get(id); if(!j) return; const ctx=jobCtx(j);
  openSheet("Message "+first(j.name), `<div class="menu" data-msgfor="${esc(id)}">${templates().filter(t=>!["rebook","lead","enquiry"].includes(t.key)).map(t=>
    `<a class="b b-ghost msgpick" target="_blank" rel="noopener" data-msg="${t.key}" href="${wa(j.phone, fill(t.key, ctx))}"><b>${esc(t.title)}</b><small>${esc(fill(t.key, ctx)).slice(0,110)}…</small></a>`).join("")}
    <a class="b b-ghost" target="_blank" rel="noopener" data-msg="" href="${wa(j.phone)}">Open chat without a message</a></div>`);
}
$("sheetBody").addEventListener("click", e => {
  const a=e.target.closest("[data-msg]"); if(!a) return; const id=a.closest("[data-msgfor]").dataset.msgfor, k=a.dataset.msg, j=JOBS.get(id); closeSheet(); if(!k) return;
  const action = MSG_ACTION[k];
  if(action==="confirm" && j.status!=="new") return rpc("staff_log",{p_id:id,p_kind:"message",p_detail:"Sent: "+templates().find(t=>t.key===k).title}).catch(()=>{});
  if(action==="on_way" && ["on_way","done","cancelled"].includes(j.status)) return rpc("staff_log",{p_id:id,p_kind:"message",p_detail:"Sent: On my way"}).catch(()=>{});
  if(action) return act(id, action);
  rpc("staff_log",{p_id:id, p_kind:"message", p_detail:"Sent: "+templates().find(t=>t.key===k).title}).then(()=>toast("Noted in history")).catch(()=>{});
});
function callSheet(id){
  const j=JOBS.get(id); if(!j) return;
  openSheet("How did the call go?", `<div class="menu" data-callfor="${esc(id)}">
    <button class="b b-ghost" type="button" data-out="Talked">Talked</button>
    <a class="b b-ghost" target="_blank" rel="noopener" data-out="No answer" href="${wa(j.phone, fill("noanswer", jobCtx(j)))}">No answer · send "Couldn't reach you" on WhatsApp</a>
    <button class="b b-ghost" type="button" data-out="No answer">No answer</button>
    <button class="b b-ghost" type="button" data-out="Busy, call later">Busy, call later</button>
    <button class="b b-text" type="button" data-close>Skip</button></div>`);
}
$("sheetBody").addEventListener("click", e => {
  const b=e.target.closest("[data-out]"); if(!b) return; const id=b.closest("[data-callfor]").dataset.callfor; closeSheet();
  rpc("staff_log",{p_id:id, p_kind:"call", p_detail:"Call: "+b.dataset.out}).then(()=>{ toast("Call noted"); delete HIST[id]; }).catch(()=>toast("Couldn't save", true));
});
function redraw(keepHist){
  if(S.view==="day") drawDay(); if(S.view==="bookings" && S.bkMode==="list") drawBookings();
  if(sheetFor && sheetFor.startsWith("job:")){ const id=sheetFor.slice(4), j=JOBS.get(id); if(j){ const v=$("sheetBody").querySelector("[data-noteform] input"); const typed=v&&v.value;
    $("sheetBody").innerHTML=`<div data-id="${esc(id)}">${card(j,{detail:true})}</div>`; if(typed) $("sheetBody").querySelector("[data-noteform] input").value=typed; if(keepHist) loadHist(id); } }
}

/* ============================== New / edit booking ============================== */
const VEH = [["hatch","Car · Hatchback","Hatchback"],["sedan","Car · Sedan","Sedan"],["suv","Car · SUV / MUV","SUV / MUV"],["bike","Bike / Scooter","Bike / Scooter"]];
const SOURCES = ["phone","whatsapp","walk_in","society","instagram","repeat","other"];
function sizeOf(v){ const x=VEH.find(a=>a[1]===v); return x?x[0]: /bike|scooter/i.test(v)?"bike": /suv|muv/i.test(v)?"suv": /sedan/i.test(v)?"sedan":"hatch"; }
function areaFor(pin){ const a=(AREAS||[]).find(x=>(x.pins||[]).includes(String(pin))); return a?a.a:""; }
let F=null;   // form state
function newBooking(pre){ bookingForm(null, pre); }
function bookingForm(j, pre){
  const editing=!!j, own=isOwner(), limited = editing && !own;
  const v = j ? j : Object.assign({vehicle:"Car · Hatchback", package:"", extras:"", wash_date:istToday(), slot:"", source:"phone", subtotal:0, discount:0}, pre||{});
  const size=sizeOf(v.vehicle), type=size==="bike"?"bike":"car";
  F={editing, id:j&&j.id, size, type, auto: !editing, pkg: PKG[type].findIndex(p=>p.n===v.package), extras: String(v.extras||"").split(/\s*,\s*/).filter(Boolean)};
  const sec=(t,h)=>`<fieldset class="fs"><legend>${t}</legend>${h}</fieldset>`;
  const html = `<form id="bform" class="bform" novalidate>
    ${!editing?`<div class="paste"><textarea id="fPaste" rows="3" placeholder="Paste the customer's WhatsApp message here and tap Fill"></textarea><button class="b b-ghost" type="button" id="fFill">Fill</button></div><p class="msg" id="fPasteMsg" hidden></p>`:""}
    ${limited?"":sec("Customer",`<div class="g2"><label class="fld"><span>Mobile</span><input id="fPhone" type="tel" inputmode="numeric" maxlength="14" value="${esc(v.phone||"")}" autocomplete="off"></label>
      <label class="fld"><span>Name</span><input id="fName" value="${esc(v.name||"")}" maxlength="80" autocomplete="off"></label></div><p class="msg" id="fCust" hidden></p>`)}
    ${sec("Vehicle",`${limited?"":`<div class="chips" id="fVeh">${VEH.map(x=>`<button type="button" class="chip" data-veh="${x[0]}" aria-pressed="${x[0]===size}">${x[2]}</button>`).join("")}</div>`}
      <label class="fld"><span>Number plate</span><input id="fPlate" value="${esc(v.plate||"")}" maxlength="20" autocomplete="off" style="text-transform:uppercase"></label>`)}
    ${limited?"":sec("Package and price",`<div class="opts" id="fPkg"></div><div class="opts" id="fAdd"></div>
      <div class="g3"><label class="fld"><span>Price ₹</span><input id="fSub" type="number" inputmode="numeric" min="0" value="${v.subtotal||""}"></label>
      <label class="fld"><span>Discount ₹</span><input id="fDisc" type="number" inputmode="numeric" min="0" value="${v.discount||""}"></label>
      <label class="fld"><span>Reason</span><input id="fWhy" maxlength="120" value="${esc(v.promo==="MANUAL"?v.promo_note:"")}" placeholder="e.g. regular"></label></div>
      <p class="total" id="fTotal"></p>`)}
    ${limited?"":sec("When",`<div class="g2"><label class="fld"><span>Day</span><input id="fDate" type="date" value="${esc(v.wash_date)}"></label>
      <div class="chips" style="align-self:end"><button type="button" class="chip" data-dq="0">Today</button><button type="button" class="chip" data-dq="1">Tomorrow</button></div></div>
      <div class="chips" id="fSlot">${SLOTS.map(s=>`<button type="button" class="chip" data-slot="${esc(s)}" aria-pressed="${s===v.slot}">${esc(s)}</button>`).join("")}</div>`)}
    ${limited?"":sec("Where",`<label class="fld"><span>Address (flat, building, society, landmark)</span><textarea id="fAddr" rows="2" maxlength="300">${esc(v.address||"")}</textarea></label>
      <div class="g2"><label class="fld"><span>PIN code</span><input id="fPin" inputmode="numeric" maxlength="6" value="${esc(v.pin||"")}"></label>
      <label class="fld"><span>Area</span><input id="fArea" maxlength="60" value="${esc(v.area||"")}" list="fAreas"></label></div><datalist id="fAreas">${(AREAS||[]).map(a=>`<option value="${esc(a.a)}">`).join("")}</datalist>`)}
    ${sec("Notes",`<label class="fld"><span>Notes for the washer</span><textarea id="fNotes" rows="2" maxlength="500">${esc(v.notes||"")}</textarea></label>`)}
    ${!editing?sec("Came from",`<div class="chips" id="fSrc">${SOURCES.map(s=>`<button type="button" class="chip" data-src="${s}" aria-pressed="${s===v.source}">${SOURCE_LABEL[s]}</button>`).join("")}</div>`):""}
    ${!editing&&own?sec("Washer",`<label class="fld"><select id="fWho"><option value="">Nobody yet</option>${(SET.team||[]).map(t=>`<option value="${t.id}">${esc(t.name)}</option>`).join("")}</select></label>`):""}
    ${!editing?`<label class="tick"><input type="checkbox" id="fConf" checked> Already confirmed with the customer</label>`:""}
    <p class="msg bad" id="fErr" hidden></p>
    <button class="b b-lime b-lg" type="submit" id="fSave">${editing?"Save changes":"Save booking"}</button>
    ${editing&&own?`<button class="b b-danger" type="button" id="fDel">Delete booking</button>`:""}
  </form>`;
  openSheet(editing?"Edit "+first(j.name)+"'s booking":"New booking", html, editing?"edit:"+j.id:"new");
  if(!limited){ drawPkg(); calc(); }
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
$("sheetBody").addEventListener("click", e => {
  if(!$("bform")) return;
  const vb=e.target.closest("[data-veh]"); if(vb){ F.size=vb.dataset.veh; const t=F.size==="bike"?"bike":"car"; if(t!==F.type){ F.type=t; F.pkg=-1; F.extras=[]; } $$("#fVeh .chip").forEach(c=>c.setAttribute("aria-pressed", c===vb)); drawPkg(); calc(); return; }
  const sl=e.target.closest("[data-slot]"); if(sl){ $$("#fSlot .chip").forEach(c=>c.setAttribute("aria-pressed", c===sl)); return; }
  const sr=e.target.closest("[data-src]"); if(sr){ $$("#fSrc .chip").forEach(c=>c.setAttribute("aria-pressed", c===sr)); return; }
  const dq=e.target.closest("[data-dq]"); if(dq){ $("fDate").value = addDays(istToday(), +dq.dataset.dq); return; }
  if(e.target.id==="fFill") return fillFromPaste();
  if(e.target.id==="fDel") return delBooking(e.target);
});
$("sheetBody").addEventListener("change", e => {
  if(!$("bform")) return;
  if(e.target.name==="fpkg"){ F.pkg=+e.target.value; F.auto=true; calc(); }
  if(e.target.name==="fadd"){ F.extras=$$('#fAdd input:checked').map(c=>c.value); F.auto=true; calc(); }
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
    m.hidden=false; m.className="msg ok"; m.innerHTML=`Returning customer: <b>${esc(c.name)}</b> · ${c.washes} wash${c.washes===1?"":"es"}${c.credit?` · ${rupee(c.credit)} referral credit`:""}`;
    const last=(await rpc("owner_customer",{p_phone:ph}))[0];
    if(last){ if(!$("fName").value) $("fName").value=last.name; if(!$("fAddr").value) $("fAddr").value=last.address; if(!$("fPin").value) $("fPin").value=last.pin; if(!$("fArea").value) $("fArea").value=last.area; if(!$("fPlate").value) $("fPlate").value=last.plate;
      const s=sizeOf(last.vehicle); const b=$("fVeh").querySelector(`[data-veh="${s}"]`); if(b && s!==F.size) b.click(); }
  }catch(e){}
}
function parsePaste(t){
  const out={}, lab=k=>{ const m=t.match(new RegExp("^\\s*\\*?(?:"+k+")\\*?\\s*[:\\-]\\s*(.+)$","im")); return m?m[1].trim():""; };
  const id=t.match(/\bVB-\d{6}-[A-Z0-9]{4,8}\b/); if(id) out.existing=id[0];
  const ph=(lab("(?:mobile|phone|number|contact)")||t).match(/(?:\+?91[\s-]?)?([6-9]\d{4}[\s-]?\d{5})/); if(ph) out.phone=digits(ph[1]);
  out.name = lab("name");
  const pin=t.match(/\b4\d{5}\b/); if(pin) out.pin=pin[0];
  const plate=t.match(/\b[A-Z]{2}[\s-]?\d{1,2}[\s-]?[A-Z]{0,3}[\s-]?\d{3,4}\b/i); if(plate) out.plate=plate[0].toUpperCase().replace(/[\s-]+/g," ");
  let addr = lab("address|location"); if(!addr){ const l=t.split(/\n/).find(x=>/(flat|wing|bldg|building|society|soc\.|tower|apartment|apt|road|rd\.|nagar|complex|chs|plot|sector|lane)/i.test(x)); if(l) addr=l.trim(); }
  if(addr){ addr=addr.replace(/\b4\d{5}\b/,"").replace(/[,\s]+$/,""); out.address=addr; }
  const low=t.toLowerCase();
  out.size = /\b(bike|scooter|scooty|activa|splendor|pulsar|motorcycle|two.?wheeler|jupiter|access|ntorq|royal enfield|bullet|classic 350|ktm|duke)\b/.test(low)?"bike"
    : /\b(suv|muv|creta|seltos|innova|xuv|scorpio|fortuner|ertiga|thar|nexon|brezza|harrier|hector|xl6|carens|venue|sonet)\b/.test(low)?"suv"
    : /\b(sedan|city|verna|dzire|ciaz|amaze|aura|slavia|virtus|honda city|ciaz)\b/.test(low)?"sedan"
    : /\b(car|hatch|swift|i10|i20|baleno|wagon ?r|alto|tiago|altroz|polo|celerio|kwid|glanza)\b/.test(low)?"hatch":"";
  const type = out.size==="bike"?"bike":"car";
  const pk = lab("package"); const pkgs=PKG[type].map(p=>p.n.toLowerCase());
  let pi = pk ? pkgs.findIndex(n=>pk.toLowerCase().includes(n)) : -1;
  if(pi<0) pi = type==="car" ? (/deep|interior|full/.test(low)?2:/foam|glow|vacuum/.test(low)?1:/essential|basic|exterior|normal/.test(low)?0:-1)
                             : (/chain|shine|engine/.test(low)?2:/detail|polish/.test(low)?1:/quick|basic|normal/.test(low)?0:-1);
  out.pkg=pi;
  const when = lab("when|date|day")||low;
  if(/\btomorrow\b|\bkal\b/.test(when)) out.date=addDays(istToday(),1); else if(/\btoday\b|\baaj\b/.test(when)) out.date=istToday();
  else if(when.match(/\b(\d{1,2})\s*(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/)){ const mm=when.match(/\b(\d{1,2})\s*(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/); const mo="janfebmaraprmayjunjulaugsepoctnovdec".indexOf(mm[2])/3+1; let y=+istToday().slice(0,4); let iso=`${y}-${String(mo).padStart(2,"0")}-${String(mm[1]).padStart(2,"0")}`; if(iso<addDays(istToday(),-7)) iso=`${y+1}`+iso.slice(4); out.date=iso; }
  else { const dm=when.match(/\b(\d{1,2})[\/\-.](\d{1,2})(?:[\/\-.](\d{2,4}))?\b/); if(dm){ const y=dm[3]?(dm[3].length===2?"20"+dm[3]:dm[3]):istToday().slice(0,4); out.date=`${y}-${String(dm[2]).padStart(2,"0")}-${String(dm[1]).padStart(2,"0")}`; }
    else { const wd=["sun","mon","tue","wed","thu","fri","sat"].findIndex(d=>new RegExp("\\b"+d).test(when)); if(wd>=0){ const t0=new Date(istToday()+"T12:00:00Z"); let n=(wd-t0.getUTCDay()+7)%7||7; out.date=addDays(istToday(),n); } } }
  const exact = SLOTS.find(sl=>t.includes(sl));
  const tm = exact ? null : when.match(/\b(\d{1,2})(?::\d{2})?\s*(am|pm)\b/) || low.match(/\b(\d{1,2})(?::\d{2})?\s*(am|pm)\b/);
  if(exact) out.slot=exact;
  else if(tm){ let h=+tm[1]%12+(tm[2]==="pm"?12:0); out.slot = h<8?SLOTS[0]:h<10?SLOTS[1]:h<13?SLOTS[2]:h<17?SLOTS[3]:SLOTS[4]; }
  else if(/morning/.test(low)) out.slot=SLOTS[1]; else if(/evening/.test(low)) out.slot=SLOTS[4]; else if(/afternoon/.test(low)) out.slot=SLOTS[3];
  out.notes = lab("notes");
  return out;
}
function fillFromPaste(){
  const t=$("fPaste").value, m=$("fPasteMsg"); if(!t.trim()){ m.hidden=false; m.className="msg bad"; m.textContent="Paste a message first."; return; }
  const p=parsePaste(t), got=[];
  if(p.existing){ m.hidden=false; m.className="msg bad"; m.innerHTML=`This message has booking ID <b>${esc(p.existing)}</b>, so it's probably already a website booking. <button class="linkish" type="button" data-findbk="${esc(p.existing)}">Find it</button>`; }
  const setv=(id,v,l)=>{ if(v){ $(id).value=v; got.push(l); } };
  setv("fPhone",p.phone,"mobile"); setv("fName",p.name,"name"); setv("fPlate",p.plate,"plate"); setv("fAddr",p.address,"address"); setv("fPin",p.pin,"PIN");
  if(p.pin){ const a=areaFor(p.pin); if(a) $("fArea").value=a; }
  if(p.notes) setv("fNotes",p.notes,"notes");
  if(p.size){ const b=$("fVeh").querySelector(`[data-veh="${p.size}"]`); if(b) b.click(); got.push("vehicle"); }
  if(p.pkg>=0){ F.pkg=p.pkg; F.auto=true; drawPkg(); calc(); got.push("package"); }
  if(p.date){ $("fDate").value=p.date; got.push("day"); }
  if(p.slot){ const b=$("fSlot").querySelector(`[data-slot="${p.slot}"]`); if(b) b.click(); got.push("time"); }
  if(digits(p.phone).length===10 && isOwner()) lookupCustomer(p.phone);
  if(!p.existing){ m.hidden=false; m.className="msg "+(got.length?"ok":"bad"); m.textContent = got.length ? "Filled: "+got.join(", ")+". Check them, then add anything missing." : "Couldn't find details in that message. Fill the form below."; }
}
document.addEventListener("click", e => { const b=e.target.closest("[data-findbk]"); if(b){ closeSheet(); S.q=b.dataset.findbk; S.bkMode="list"; go("bookings"); $("q").value=S.q; } });
$("sheetBody").addEventListener("submit", async e => {
  if(e.target.id!=="bform") return; e.preventDefault();
  const err=$("fErr"), btn=$("fSave"); err.hidden=true;
  const val=id=>$(id)?$(id).value.trim():undefined;
  const limited = F.editing && !isOwner();
  let p;
  if(limited) p={plate:val("fPlate"), notes:val("fNotes")};
  else {
    const slot=($("fSlot").querySelector('[aria-pressed="true"]')||{}).dataset, src=$("fSrc")?($("fSrc").querySelector('[aria-pressed="true"]')||{}).dataset:null;
    const veh=VEH.find(x=>x[0]===F.size)[1];
    p={phone:digits(val("fPhone")), name:val("fName"), vehicle:veh, plate:val("fPlate"), package:F.pkg>=0?PKG[F.type][F.pkg].n:"", extras:F.extras.join(", "),
       date:val("fDate"), slot:slot&&slot.slot||"", address:val("fAddr"), pin:val("fPin"), area:val("fArea"), notes:val("fNotes"),
       subtotal:+val("fSub")||0, discount:+val("fDisc")||0, discount_reason:val("fWhy")};
    const miss=[]; if(p.phone.length!==10) miss.push("10-digit mobile"); if(!p.name) miss.push("name"); if(!p.package) miss.push("package"); if(!p.date) miss.push("day"); if(!p.slot) miss.push("time"); if(!p.address) miss.push("address");
    if(miss.length){ err.hidden=false; err.textContent="Add: "+miss.join(", ")+"."; return; }
    if(p.discount>p.subtotal){ err.hidden=false; err.textContent="The discount is more than the price."; return; }
    if(!F.editing){ p.source=src&&src.src||"phone"; p.confirmed=$("fConf").checked; if($("fWho")) p.assigned_to=$("fWho").value||null; }
  }
  btn.disabled=true; btn.textContent="Saving…";
  try{
    const j = F.editing ? await rpc("staff_edit_booking",{p_id:F.id, p}) : await rpc("staff_add_booking",{p});
    JOBS.set(j.id, j); PINGED.add(j.id); delete HIST[j.id];
    ["day."+j.wash_date].forEach(k=>cache.set(k,null));
    if(F.editing){ toast("Saved"); openJob(j.id); }
    else { openSheet("Booking saved", `<div class="menu" data-id="${esc(j.id)}"><p class="sub">${esc(j.name)} · ${relDay(j.wash_date)}, ${esc(j.slot)} · ${rupee(j.total)}<br><small>${esc(j.id)}</small></p>
      <a class="b b-wa" target="_blank" rel="noopener" href="${wa(j.phone, fill("confirm", jobCtx(j)))}" ${j.status==="new"?'data-act="confirm"':""} data-sentconf>Send confirmation on WhatsApp</a>
      <button class="b b-ghost" type="button" data-openjob="${esc(j.id)}">Open the booking</button><button class="b b-ghost" type="button" data-new>Add another</button></div>`); }
    if(S.view==="day"){ if(j.wash_date!==S.day){ S.day=j.wash_date; drawDay._scrolled=false; } loadDay(); } else if(S.view==="bookings") loadBookings();
  }catch(x){ if(x.message==="signed out") return; err.hidden=false; err.textContent=x.message||"Couldn't save. Try again."; btn.disabled=false; btn.textContent=F.editing?"Save changes":"Save booking"; }
});
document.addEventListener("click", e => { const b=e.target.closest("[data-sentconf]"); if(b && !b.dataset.act){ const id=b.closest("[data-id]").dataset.id; rpc("staff_log",{p_id:id,p_kind:"message",p_detail:"Sent: Confirm booking"}).catch(()=>{}); } });
async function delBooking(b){
  if(!b.dataset.sure){ b.dataset.sure="1"; b.textContent="Tap again to delete for good"; setTimeout(()=>{ if(b.isConnected){ delete b.dataset.sure; b.textContent="Delete booking"; } },4000); return; }
  try{ await rpc("owner_delete_booking",{p_id:F.id}); const j=JOBS.get(F.id); JOBS.delete(F.id); if(j) cache.set("day."+j.wash_date,null); closeSheet(); toast("Booking deleted"); go(S.view); }
  catch(e){ toast(e.message, true); }
}

/* ============================== Customers (owner) ============================== */
let CU=null, DUE=null, cqTimer=0;
$("cuMode").addEventListener("click", e => { const b=e.target.closest("[data-m]"); if(!b) return; S.cuMode=b.dataset.m; loadCustomers(); });
$("cq").addEventListener("input", () => { clearTimeout(cqTimer); cqTimer=setTimeout(()=>{ S.cq=$("cq").value.trim(); loadAllCustomers(); }, 300); });
function loadCustomers(){
  $("cuMode").innerHTML = `<button type="button" data-m="all" aria-pressed="${S.cuMode==="all"}">All customers</button><button type="button" data-m="due" aria-pressed="${S.cuMode==="due"}">Due for a wash</button>`;
  $("cuAll").hidden=S.cuMode!=="all"; $("cuDue").hidden=S.cuMode!=="due";
  return S.cuMode==="all" ? loadAllCustomers() : loadDue();
}
async function loadAllCustomers(){
  const k="cu."+S.cq; CU=cache.get(k); drawCustomers(); sync("busy");
  try{ CU=await rpc("owner_customers",{p_query:S.cq, p_limit:300}); cache.set(k,CU); drawCustomers(); sync("ok"); } catch(e){ quiet(e); }
}
function drawCustomers(){
  const el=$("cuBody"); if(!CU){ el.innerHTML='<div class="sk" style="height:60px;margin-bottom:8px"></div>'.repeat(4); return; }
  if(!CU.length){ el.innerHTML=`<div class="empty"><b>${S.cq?"Nobody found":"No customers yet"}</b></div>`; return; }
  el.innerHTML = `<p class="lead">${CU.length} customer${CU.length===1?"":"s"}${S.cq?"":" · newest wash first"}</p><div class="list cols">${CU.map(c=>`<button type="button" class="row" data-cust="${c.phone}">
    <span class="av">${esc((c.name||"?")[0].toUpperCase())}</span>
    <span class="rm"><b>${esc(c.name)}</b><span>${esc(c.vehicle||"")}${c.area?" · "+esc(c.area):""}</span></span>
    <span class="rr"><b class="num">${rupee(c.spent)}</b><span class="tag ${c.next_date?"t-aqua":c.washes>1?"t-blue":""}">${c.next_date?"Booked "+relDay(c.next_date):c.washes+" wash"+(c.washes===1?"":"es")}</span></span></button>`).join("")}</div>`;
}
document.addEventListener("click", e => { const b=e.target.closest("[data-cust]"); if(b) custSheet(b.dataset.cust); });
async function custSheet(ph){
  const c=(CU||[]).find(x=>x.phone===ph)||{phone:ph,name:"Customer"};
  const head = `<div class="custhead"><p class="sub">+91 ${ph.slice(0,5)} ${ph.slice(5)}${c.area?" · "+esc(c.area):""}</p>
    ${c.washes!=null?`<div class="tiles mini"><div class="tile"><b class="num">${c.washes}</b><span>Washes</span></div><div class="tile"><b class="num">${rupee(c.spent)}</b><span>Paid</span></div><div class="tile"><b class="num">${rupee(c.credit)}</b><span>Credit</span></div><div class="tile"><b class="num">${c.referred||0}</b><span>Friends referred</span></div></div>`:""}
    <div class="acts"><a class="b b-ghost" href="${tel(ph)}">${I.call}Call</a><a class="b b-ghost" target="_blank" rel="noopener" href="${wa(ph)}">${I.chat}WhatsApp</a><button class="b b-lime" type="button" data-newfor="${ph}">${I.plus}New booking</button></div></div>`;
  openSheet(c.name, head+'<div id="custList"><div class="sk" style="height:60px"></div></div>', "cust:"+ph);
  try{ const list=await rpc("owner_customer",{p_phone:ph}); remember(list); if(sheetFor!=="cust:"+ph) return;
    $("custList").innerHTML = `<div class="grp"><h2>Bookings · ${list.length}</h2></div><div class="list">${list.map(j=>row(j,true)).join("")}</div>`; }
  catch(e){ $("custList").innerHTML='<p class="msg bad">Couldn\'t load bookings.</p>'; }
}
document.addEventListener("click", e => { const b=e.target.closest("[data-newfor]"); if(!b) return; const ph=b.dataset.newfor; const last=[...JOBS.values()].filter(j=>j.phone===ph).sort((a,b)=>b.wash_date.localeCompare(a.wash_date))[0];
  newBooking(last?{phone:ph, name:last.name, vehicle:last.vehicle, plate:last.plate, address:last.address, area:last.area, pin:last.pin, source:"repeat"}:{phone:ph, source:"repeat"}); });
$("dueChips").addEventListener("click", e => { const b=e.target.closest("[data-days]"); if(!b) return; S.dueDays=+b.dataset.days; loadDue(); });
async function loadDue(){
  $("dueChips").innerHTML=[7,12,21,30].map(d=>`<button type="button" class="chip" data-days="${d}" aria-pressed="${d===S.dueDays}">${d}+ days</button>`).join("");
  const k="due."+S.dueDays; DUE=cache.get(k); drawDue(); sync("busy");
  try{ DUE=await rpc("owner_due",{p_days:S.dueDays}); cache.set(k,DUE); drawDue(); sync("ok"); } catch(e){ quiet(e); }
}
function drawDue(){
  const el=$("dueBody");
  if(!DUE){ el.innerHTML='<div class="sk" style="height:120px"></div>'; $("dueLead").textContent=""; return; }
  $("dueLead").textContent = DUE.length ? `${DUE.length} customer${DUE.length>1?"s":""} with nothing booked whose last wash was ${S.dueDays}+ days ago. Send a rebook message.` : "";
  el.innerHTML = DUE.length ? `<div class="list cols">${DUE.map((d,i)=>`<div class="card">
      <div class="job-top"><span class="slot">${d.days_ago} days ago</span><span class="tag t-blue">${d.washes} wash${d.washes>1?"es":""}</span>${d.reminder_sent_at?`<span class="tag t-coral">Reminded ${ago(d.reminder_sent_at)}</span>`:""}</div>
      <h3>${esc(d.name)}</h3><p class="sub">${esc(d.vehicle)} · last: ${esc(d.package)} on ${fmtDay(d.last_date)}${d.area?" · "+esc(d.area):""}</p>
      <div class="acts"><a class="b b-wa" target="_blank" rel="noopener" data-rebook="${i}" href="${wa(d.phone, fill("rebook", {first_name:first(d.name), brand:SITE.name, days:d.days_ago, package:d.package, book_link:BASE+"book.html"}))}">Send rebook message</a><a class="b b-ghost" href="${tel(d.phone)}">Call</a><button class="b b-ghost" type="button" data-newfor="${d.phone}">New booking</button></div></div>`).join("")}</div>`
    : `<div class="empty"><b>Nobody is due</b>Customers show up here ${S.dueDays} days after their last wash.</div>`;
}
$("dueBody").addEventListener("click", e => { const a=e.target.closest("[data-rebook]"); if(!a) return; const d=DUE[+a.dataset.rebook];
  rpc("staff_update",{p_id:d.id, p_action:"reminded"}).then(()=>{ d.reminder_sent_at=new Date().toISOString(); drawDue(); }).catch(()=>{}); });

/* ============================== Inbox (owner) ============================== */
let INB=null;
const LEAD_ST=["new","contacted","quoted","won","lost"], ENQ_ST=["new","replied","closed"];
$("inTabs").addEventListener("click", e => { const b=e.target.closest("[data-tab]"); if(!b) return; S.inTab=b.dataset.tab; drawInbox(); });
async function loadInbox(){
  INB=cache.get("inbox"); drawInbox(); sync("busy");
  try{ INB=await rpc("owner_inbox"); cache.set("inbox",INB); drawInbox(); sync("ok"); } catch(e){ quiet(e); }
}
function drawInbox(){
  const c = INB ? {leads:INB.leads.filter(x=>x.status==="new").length, enquiries:INB.enquiries.filter(x=>x.status==="new").length, reviews:INB.reviews.filter(x=>!x.approved).length} : {};
  $("inTabs").innerHTML = [["leads","Societies"],["enquiries","Messages"],["reviews","Reviews"]].map(([k,l])=>`<button type="button" data-tab="${k}" aria-pressed="${S.inTab===k}">${l}${c[k]?`<em>${c[k]}</em>`:""}</button>`).join("");
  const el=$("inBody"); if(!INB){ el.innerHTML='<div class="sk" style="height:140px"></div>'; return; }
  const pills = (kind,id,cur,list) => `<div class="pills">${list.map(s=>`<button type="button" class="pill" data-set="${kind}" data-sid="${id}" data-val="${s}" aria-pressed="${s===cur}">${s[0].toUpperCase()+s.slice(1)}</button>`).join("")}</div>`;
  const empty = t => `<div class="empty"><b>${t}</b></div>`;
  if(S.inTab==="leads") el.innerHTML = INB.leads.length ? `<div class="list cols">${INB.leads.map(l=>`<div class="card">
      <div class="job-top"><span class="slot">${fmtDay(String(l.created_at).slice(0,10))}</span><span class="tag">${l.cars} cars · ${l.bikes} bikes</span></div>
      <h3>${esc(l.society)}</h3><p class="sub">${esc(l.contact_name)}${l.role?" · "+esc(l.role):""}${l.area?" · "+esc(l.area):""} ${esc(l.pin)}</p>
      ${l.days?`<p class="txt">Prefers: ${esc(l.days)}</p>`:""}${l.notes?`<p class="txt">${esc(l.notes)}</p>`:""}
      ${pills("lead",l.id,l.status,LEAD_ST)}
      <div class="acts"><a class="b b-wa" target="_blank" rel="noopener" href="${wa(l.phone, fill("lead",{first_name:first(l.contact_name), brand:SITE.name, society:l.society}))}">WhatsApp</a><a class="b b-ghost" href="${tel(l.phone)}">Call</a></div></div>`).join("")}</div>` : empty("No society requests yet");
  if(S.inTab==="enquiries") el.innerHTML = INB.enquiries.length ? `<div class="list cols">${INB.enquiries.map(q=>`<div class="card">
      <div class="job-top"><span class="slot">${fmtDay(String(q.created_at).slice(0,10))}</span></div>
      <h3>${esc(q.name||"Customer")}</h3><p class="txt">${esc(q.message)}</p>${pills("enquiry",q.id,q.status,ENQ_ST)}
      <div class="acts"><a class="b b-wa" target="_blank" rel="noopener" href="${wa(q.phone, fill("enquiry",{first_name:first(q.name), brand:SITE.name}))}">Reply on WhatsApp</a><a class="b b-ghost" href="${tel(q.phone)}">Call</a><button class="b b-ghost" type="button" data-newfor="${q.phone}">New booking</button></div></div>`).join("")}</div>` : empty("No messages yet");
  if(S.inTab==="reviews") el.innerHTML = INB.reviews.length ? `<div class="list cols">${INB.reviews.map(r=>`<div class="card">
      <div class="job-top"><span class="slot stars">${"★".repeat(r.rating)}<i>${"★".repeat(5-r.rating)}</i></span>${r.approved?'<span class="tag t-lime">On website</span>':'<span class="tag t-coral">Waiting</span>'}</div>
      <h3>${esc(r.name||"Customer")}</h3><p class="sub">${esc(r.customer||"")} · ${esc(r.area||"")} · ${fmtDay(String(r.created_at).slice(0,10))}</p>
      ${r.text?`<p class="txt">${esc(r.text)}</p>`:""}
      <div class="acts">${r.approved?`<button class="b b-ghost" data-set="review" data-sid="${r.id}" data-val="hidden">Hide from website</button>`:`<button class="b b-lime" data-set="review" data-sid="${r.id}" data-val="approved">Show on website</button>`}
      <button class="b b-danger" data-set="review_delete" data-sid="${r.id}" data-val="x">Delete</button></div></div>`).join("")}</div>` : empty("No reviews yet");
}
$("inBody").addEventListener("click", async e => {
  const b=e.target.closest("[data-set]"); if(!b) return;
  const kind=b.dataset.set, id=+b.dataset.sid, val=b.dataset.val;
  if(kind==="review_delete" && !b.dataset.sure){ b.dataset.sure="1"; b.textContent="Tap again to delete"; return; }
  const list = kind==="lead"?INB.leads:kind==="enquiry"?INB.enquiries:INB.reviews, item=list.find(x=>x.id===id), before=Object.assign({},item);
  if(kind==="lead"||kind==="enquiry") item.status=val; else if(kind==="review") item.approved = val==="approved"; else INB.reviews=INB.reviews.filter(x=>x.id!==id);
  drawInbox(); S.inboxNew = INB.leads.some(x=>x.status==="new")||INB.enquiries.some(x=>x.status==="new")||INB.reviews.some(x=>!x.approved); drawNav();
  try{ await rpc("owner_set",{p_kind:kind, p_id:id, p_value:val}); cache.set("inbox",INB); toast("Saved"); }
  catch(err){ Object.assign(item,before); if(kind==="review_delete") loadInbox(); drawInbox(); toast("Couldn't save. Try again.", true); }
});

/* ============================== Numbers (owner) ============================== */
async function loadNumbers(){
  let N=cache.get("numbers"); drawNumbers(N); sync("busy");
  try{ N=await rpc("owner_overview"); cache.set("numbers",N); drawNumbers(N); sync("ok"); S.inboxNew = (N.new_leads+N.new_enquiries+N.pending_reviews)>0; drawNav(); }
  catch(e){ quiet(e); }
}
function drawNumbers(N){
  const el=$("numBody"); if(!N){ el.innerHTML='<div class="tiles">'+'<div class="tile sk" style="height:86px"></div>'.repeat(8)+'</div>'; return; }
  const tile=(v,l,s,cls)=>`<div class="tile${cls?" "+cls:""}"><b class="num">${v}</b><span>${l}</span>${s?`<small>${s}</small>`:""}</div>`;
  const max=Math.max(1,...N.last14.map(d=>d.count)), t=istToday();
  const hb = (list, lab) => list && list.length ? list.map(p=>`<div class="hbar"><span>${esc(lab?lab(p.name):p.name)}</span><b class="num">${p.count}${p.amount!=null?` · ${rupee(p.amount)}`:""}</b><i style="--w:${Math.round(p.count/Math.max(...list.map(x=>x.count))*100)}%"></i></div>`).join("") : '<p class="sub">Nothing yet this month</p>';
  const todo=[]; if(N.new_leads) todo.push(`<button class="linkish" data-goview="inbox">${N.new_leads} new society request${N.new_leads>1?"s":""}</button>`); if(N.new_enquiries) todo.push(`<button class="linkish" data-goview="inbox">${N.new_enquiries} new message${N.new_enquiries>1?"s":""}</button>`);
  if(N.pending_reviews) todo.push(`<button class="linkish" data-goview="inbox">${N.pending_reviews} review${N.pending_reviews>1?"s":""} to approve</button>`); if(N.inactive_staff) todo.push(`<button class="linkish" data-goview="team">${N.inactive_staff} login${N.inactive_staff>1?"s":""} switched off</button>`);
  const profit = N.collected_month - (N.month_costs||0);
  const mname = fmtDay(istToday(),{month:"long"});
  el.innerHTML = `${todo.length?`<div class="card todo"><h3>To do</h3><p class="sub">${todo.join(" · ")}</p></div>`:""}
    <div class="tiles">${tile(N.today,"Bookings today")}${tile(N.upcoming,"Upcoming")}${tile(rupee(N.collected_week),"Collected, 7 days")}${tile(rupee(N.unpaid_amount),"Washed, not paid", N.unpaid_count+" job"+(N.unpaid_count===1?"":"s"), N.unpaid_amount>0?"warn":"")}</div>
    <div class="grp"><h2>${mname} so far</h2><button type="button" data-goview="settings" data-anchor="costs">Edit costs</button></div>
    <div class="tiles">${tile(rupee(N.collected_month),"Collected")}${tile(rupee(N.month_costs||0),"Costs", N.month_costs?"":"Add them in Settings")}${tile(rupee(profit),"Profit","collected − costs", profit<0?"warn":"good")}
      ${tile(N.month_done?rupee(Math.round((N.month_costs||0)/N.month_done)):"–","Cost per wash", N.month_done+" washed")}
      ${tile(N.month_booked,"Booked", N.month_cancelled+" cancelled")}${tile(rupee(N.month_discounts||0),"Discounts given")}${tile(N.month_new_customers||0,"New customers")}
      ${tile(N.month_new_customers&&N.month_ads?rupee(Math.round(N.month_ads/N.month_new_customers)):"–","Ad cost per new customer")}</div>
    <div class="card" style="margin-top:10px"><h3>Bookings, last 14 days</h3><div class="chart">${N.last14.map(d=>`<div class="bar${d.date===t?" now":""}" title="${fmtDay(d.date)}: ${d.count} bookings, ${rupee(d.amount)} paid"><b class="num">${d.count||""}</b><i class="${d.count?"has":""}" style="height:${Math.round(d.count/max*100)}%"></i><span>${fmtDay(d.date,{day:"numeric"})}</span></div>`).join("")}</div></div>
    <div class="two"><div class="card"><h3>Where bookings came from (${mname})</h3><div class="hbars">${hb(N.sources, s=>SOURCE_LABEL[s]||s)}</div></div><div class="card"><h3>Washes per washer (${mname})</h3><div class="hbars">${hb(N.washers)}</div></div></div>
    <div class="two"><div class="card"><h3>Top packages</h3><div class="hbars">${hb(N.packages)}</div></div><div class="card"><h3>Top areas</h3><div class="hbars">${hb(N.areas)}</div></div></div>
    <div class="tiles" style="margin-top:10px">${tile(N.customers,"Customers", N.repeat+" came back")}${tile(rupee(N.avg_ticket),"Average bill")}${tile(N.done_week,"Washed, 7 days")}${tile(rupee(N.collected_month),"Collected this month")}</div>`;
}

/* ============================== Team (owner) ============================== */
let TEAM=null;
async function loadTeam(){
  TEAM=cache.get("team"); drawTeam(); sync("busy");
  try{ TEAM=await rpc("owner_team"); cache.set("team",TEAM); drawTeam(); sync("ok"); } catch(e){ quiet(e); }
}
function drawTeam(){
  const el=$("teamBody"); if(!TEAM){ el.innerHTML='<div class="sk" style="height:160px"></div>'; return; }
  el.innerHTML = `<div class="grp"><h2>Logins · ${TEAM.staff.length}</h2><button type="button" id="addLogin">+ Add login</button></div>
    <div class="list">${TEAM.staff.map(p=>`<button type="button" class="row person-row${p.active?"":" off-soft"}" data-person="${p.id}">
      <span class="av">${esc((p.name||"?")[0].toUpperCase())}</span>
      <span class="rm"><b>${esc(p.name)} <span class="tag ${p.role==="owner"?"t-lime":""}">${p.role==="owner"?"Owner":"Washer"}</span>${p.id===S.me.id?' <span class="tag">You</span>':""}</b>
        <span>${esc(p.email||"")}${p.phone?" · "+esc(p.phone):""}</span><span>${p.active?(p.last_seen_at?"Last opened "+ago(p.last_seen_at):"Not signed in yet"):"Switched off"}${p.jobs?` · ${p.jobs} open job${p.jobs>1?"s":""}`:""}</span></span>
      <span class="rr">${p.active?'<span class="tag t-lime">On</span>':'<span class="tag t-coral">Off</span>'}</span></button>`).join("")}</div>
    <p class="hint" style="margin-top:10px">Tap a person to change their details, access or password, switch them off or delete them.</p>`;
}
$("teamBody").addEventListener("click", e => { if(e.target.id==="addLogin") return loginForm(null); const b=e.target.closest("[data-person]"); if(b) loginForm(TEAM.staff.find(x=>x.id===b.dataset.person)); });
const genPw = () => { const a="abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789"; const r=crypto.getRandomValues(new Uint32Array(10)); return [...r].map(x=>a[x%a.length]).join(""); };
function loginForm(p){
  const me = p && p.id===S.me.id;
  openSheet(p?p.name:"Add a login", `<form id="lform" class="bform" novalidate data-pid="${p?p.id:""}">
    <label class="fld"><span>Name</span><input id="lfName" maxlength="60" value="${esc(p?p.name:"")}" autocomplete="off"></label>
    <label class="fld"><span>Email (they sign in with this)</span><input id="lfEmail" type="email" inputmode="email" value="${esc(p?p.email||"":"")}" autocomplete="off"></label>
    <label class="fld"><span>Mobile (optional)</span><input id="lfPhone" type="tel" inputmode="numeric" maxlength="14" value="${esc(p?p.phone||"":"")}"></label>
    <div class="fld"><span>Access</span><div class="seg" id="lfRole"><button type="button" data-role="washer" aria-pressed="${!p||p.role==="washer"}" ${me?"disabled":""}>Washer</button><button type="button" data-role="owner" aria-pressed="${!!p&&p.role==="owner"}" ${me?"disabled":""}>Owner</button></div>
      <small class="hint">Washer: Day, Bookings, New booking; can change only plate and notes. Owner: everything, including money and logins.</small></div>
    ${p?`<label class="tick"><input type="checkbox" id="lfActive" ${p.active?"checked":""} ${me?"disabled":""}> Login switched on (can sign in)</label>`
       :`<label class="fld"><span>Password (8 or more characters)</span><span class="pw"><input id="lfPw" type="text" value="${genPw()}" autocomplete="off"><button type="button" class="pw-eye" id="lfGen">Make one</button></span></label>`}
    <p class="msg bad" id="lfErr" hidden></p>
    <button class="b b-lime b-lg" type="submit" id="lfSave">${p?"Save changes":"Add login"}</button>
    ${p?`<div class="fs"><p class="opt-h">Set a new password</p><div class="pw-row"><span class="pw"><input id="lfNewPw" type="text" placeholder="8 or more characters" autocomplete="off"><button type="button" class="pw-eye" id="lfGen2">Make one</button></span><button class="b b-ghost" type="button" id="lfSetPw">Set</button></div></div>`:""}
    ${p&&!me?`<button class="b b-danger" type="button" id="lfDel">Delete login</button>`:""}
  </form>`, "login");
}
$("sheetBody").addEventListener("click", async e => {
  if(!$("lform")) return;
  const r=e.target.closest("[data-role]"); if(r){ $$("#lfRole button").forEach(b=>b.setAttribute("aria-pressed", b===r)); return; }
  if(e.target.id==="lfGen") { $("lfPw").value=genPw(); return; }
  if(e.target.id==="lfGen2") { $("lfNewPw").value=genPw(); return; }
  const id=$("lform").dataset.pid, err=$("lfErr");
  if(e.target.id==="lfSetPw"){ const pw=$("lfNewPw").value; if(pw.length<8){ err.hidden=false; err.textContent="The new password needs 8 or more characters."; return; }
    e.target.disabled=true; try{ await teamAdmin({action:"password", id, password:pw}); err.hidden=true; const who=TEAM.staff.find(x=>x.id===id);
      openSheet("Password changed", `<div class="menu"><p class="sub">New password for <b>${esc(who.name)}</b>:</p><div class="keybox"><span>${esc(pw)}</span></div>
      ${who.phone?`<a class="b b-wa" target="_blank" rel="noopener" href="${wa(who.phone, `Hi ${first(who.name)}, your ${SITE.name} staff app password is now: ${pw}\nSign in at ${BASE}ops.html`)}">Send it on WhatsApp</a>`:""}<button class="b b-ghost" type="button" data-close>Done</button></div>`); }
    catch(x){ err.hidden=false; err.textContent=x.message; e.target.disabled=false; } return; }
  if(e.target.id==="lfDel"){ const b=e.target; if(!b.dataset.sure){ b.dataset.sure="1"; b.textContent="Tap again to delete this login for good"; return; }
    b.disabled=true; try{ await teamAdmin({action:"delete", id}); closeSheet(); toast("Login deleted"); loadTeam(); refreshSettings(); } catch(x){ err.hidden=false; err.textContent=x.message; b.disabled=false; } }
});
$("sheetBody").addEventListener("submit", async e => {
  if(e.target.id!=="lform") return; e.preventDefault();
  const id=e.target.dataset.pid, err=$("lfErr"), btn=$("lfSave"); err.hidden=true;
  const body={name:$("lfName").value.trim(), email:$("lfEmail").value.trim(), phone:digits($("lfPhone").value), role:($("lfRole").querySelector('[aria-pressed="true"]')||{}).dataset.role||"washer"};
  if(!body.name || !/^\S+@\S+\.\S+$/.test(body.email)){ err.hidden=false; err.textContent="Enter a name and a valid email."; return; }
  if(body.phone && body.phone.length!==10){ err.hidden=false; err.textContent="Mobile must be 10 digits."; return; }
  btn.disabled=true; btn.textContent="Saving…";
  try{
    if(id){
      const p=TEAM.staff.find(x=>x.id===id), active=$("lfActive").checked;
      if(p.email!==body.email) await teamAdmin(Object.assign({action:"update", id, active}, body));
      else await rpc("owner_edit_staff",{p_id:id, p_name:body.name, p_phone:body.phone, p_role:body.role, p_active:active});
      closeSheet(); toast("Saved");
    } else {
      const pw=$("lfPw").value; if(pw.length<8) throw new Error("The password needs 8 or more characters.");
      await teamAdmin(Object.assign({action:"add", password:pw}, body));
      openSheet("Login added", `<div class="menu"><p class="sub"><b>${esc(body.name)}</b> can sign in now:</p><div class="keybox"><span>${esc(BASE)}ops.html<br>${esc(body.email)}<br>${esc(pw)}</span></div>
        ${body.phone?`<a class="b b-wa" target="_blank" rel="noopener" href="${wa(body.phone, `Hi ${first(body.name)}, here is your ${SITE.name} staff app login.\nOpen: ${BASE}ops.html\nEmail: ${body.email}\nPassword: ${pw}\nAdd it to your home screen after signing in.`)}">Send login on WhatsApp</a>`:""}
        <button class="b b-ghost" type="button" data-close>Done</button></div>`);
    }
    loadTeam(); refreshSettings();
  }catch(x){ if(x.message==="signed out") return; err.hidden=false; err.textContent=x.message; btn.disabled=false; btn.textContent=id?"Save changes":"Add login"; }
});

/* ============================== Settings (owner) ============================== */
let OFFERS=null, COSTS=null, AUDIT=null;
async function loadSettingsView(){
  drawSettings(); sync("busy");
  try{ const [o,c,a]=await Promise.all([rpc("owner_offers"), rpc("owner_costs",{p_month:S.setMonth}), rpc("owner_audit",{p_limit:100})]); OFFERS=o; COSTS=c; AUDIT=a; await refreshSettings(); drawSettings(); sync("ok"); }
  catch(e){ quiet(e); }
}
const AUD = {export:"Downloaded bookings", booking_deleted:"Deleted a booking", login_added:"Added a login", login_switched_on:"Switched a login on", login_switched_off:"Switched a login off",
  login_role:"Changed access", login_password:"Set a new password", login_edited:"Changed a login", login_deleted:"Deleted a login", messages_saved:"Changed WhatsApp messages",
  notice_posted:"Posted the team notice", notice_cleared:"Cleared the team notice", offers_saved:"Changed an offer", costs_saved:"Saved monthly costs"};
const COST_CATS=[["ads","Ads (Meta, Google)"],["supplies","Shampoo, cloths, supplies"],["fuel","Fuel and travel"],["pay","Washer pay"],["other","Other"]];
function drawSettings(){
  const sec=(id,t,h)=>`<section class="card set" id="set-${id}"><h3>${t}</h3>${h}</section>`;
  const n=SET.notice;
  const months=[]; for(let i=0;i<6;i++){ const d=new Date(monthStart(istToday())+"T12:00:00Z"); d.setUTCMonth(d.getUTCMonth()-i); months.push(d.toISOString().slice(0,8)+"01"); }
  $("setBody").innerHTML = `<div class="chips jump">${[["notice","Team notice"],["msgs","WhatsApp messages"],["offers","Offers"],["costs","Monthly costs"],["export","Download"],["log","Activity log"],["sheet","Google Sheet"]].map(([k,l])=>`<button type="button" class="chip" data-jump="${k}">${l}</button>`).join("")}</div>
  ${sec("notice","Team notice",`<p class="sub">One line everyone sees at the top of Day.</p><textarea id="stNotice" rows="2" maxlength="280" placeholder="e.g. Rain today, carry seat covers">${esc(n&&n.body||"")}</textarea>
    <div class="acts"><button class="b b-lime" type="button" id="stNoticeSave">Post</button>${n&&n.body?'<button class="b b-ghost" type="button" id="stNoticeClear">Clear</button>':""}</div>`)}
  ${sec("msgs","WhatsApp messages",`<p class="sub">Words in curly brackets are filled in for each customer: {first_name} {package} {vehicle} {date} {slot} {address} {id} {total} {review_link} {book_link} {days} {society} {brand}</p>
    ${templates().map(t=>`<label class="fld"><span>${esc(t.title)}</span><textarea rows="3" data-tpl="${t.key}" maxlength="1000">${esc(t.body)}</textarea></label>`).join("")}
    <div class="acts"><button class="b b-lime" type="button" id="stTplSave">Save messages</button></div>`)}
  ${sec("offers","Offers",`<p class="sub">The website and bookings use these straight away. Minimum order is the package plus add-ons before the discount.</p>
    ${OFFERS?OFFERS.map(o=>offerRow(o)).join("")+offerRow(null):'<div class="sk" style="height:80px"></div>'}`)}
  ${sec("costs","Monthly costs",`<p class="sub">Used for profit and cost per wash in Numbers.</p>
    <label class="fld inline"><span>Month</span><select id="stMonth">${months.map(m=>`<option value="${m}" ${m===S.setMonth?"selected":""}>${fmtDay(m,{month:"long", year:"numeric"})}</option>`).join("")}</select></label>
    <div class="g2">${COST_CATS.map(([k,l])=>`<label class="fld"><span>${l} ₹</span><input type="number" min="0" inputmode="numeric" data-cost="${k}" value="${COSTS&&COSTS.costs[k]!=null?COSTS.costs[k]:""}"></label>`).join("")}</div>
    <div class="acts"><button class="b b-lime" type="button" id="stCostSave">Save costs</button></div>`)}
  ${sec("export","Download bookings",`<p class="sub">A spreadsheet (CSV) with customers' details. Keep it private. The download is noted in the activity log.</p>
    <div class="g2"><label class="fld"><span>From</span><input type="date" id="stFrom" value="${monthStart(istToday())}"></label><label class="fld"><span>To</span><input type="date" id="stTo" value="${addDays(monthStart(addDays(monthStart(istToday()),32)),-1)}"></label></div>
    <div class="acts"><button class="b b-lime" type="button" id="stExport">Download CSV</button></div>`)}
  ${sec("log","Activity log",`<p class="sub">Who changed logins, offers, messages, downloaded or deleted data. Customers' details are never shown here.</p>
    ${AUDIT?(AUDIT.length?`<ol class="hist">${AUDIT.map(a=>`<li><span>${esc(AUD[a.action]||a.action)}${a.detail?" · "+esc(a.detail):""}</span><small>${esc(a.actor_name||"")} · ${fmtTime(a.at)}</small></li>`).join("")}</ol>`:'<p class="sub">Nothing yet.</p>'):'<div class="sk" style="height:80px"></div>'}`)}
  ${sec("sheet","Google Sheet copy",`<p class="sub">Paste this key into the Google Sheet copy script (Vroombrite → Set copy key) so it can copy bookings every night. Keep it private.</p>
    <div class="keybox"><span id="sheetKey" style="flex:1">${TEAM?esc(TEAM.sheet_copy_key):'<button class="linkish" type="button" id="showKey">Show key</button>'}</span>${TEAM?'<button class="b b-ghost" type="button" id="copyKey" style="min-height:36px">Copy</button>':""}</div>`)}`;
  if(S.anchor && OFFERS){ const el=$("set-"+S.anchor); S.anchor=null; if(el) setTimeout(()=>el.scrollIntoView({block:"start"}),50); }
}
function offerRow(o){
  const isRef = o && o.code==="REFERRAL";
  return `<div class="offer" data-offer="${o?esc(o.code):""}">
    <div class="offer-h">${o?`<b>${isRef?"Friend referral":esc(o.code)}</b><span class="tag ${o.active?"t-lime":""}">${o.active?"On":"Off"}</span><small>${o.used} used</small>`:"<b>New code</b>"}</div>
    <div class="g4">${o?"":`<label class="fld"><span>Code</span><input data-k="code" maxlength="20" style="text-transform:uppercase" placeholder="DIWALI100"></label>`}
      <label class="fld"><span>${isRef?"Friend gets ₹ off":"₹ off"}</span><input type="number" min="1" data-k="amount" value="${o?o.amount:""}"></label>
      <label class="fld"><span>Min. order ₹</span><input type="number" min="0" data-k="min_order" value="${o?o.min_order:299}"></label>
      ${isRef?`<label class="fld"><span>Referrer credit ₹</span><input type="number" min="0" data-k="referrer_credit" value="${o.referrer_credit}"></label>`:""}</div>
    <label class="tick"><input type="checkbox" data-k="first_wash_only" ${!o||o.first_wash_only?"checked":""}> First wash only</label>
    <label class="tick"><input type="checkbox" data-k="active" ${!o||o.active?"checked":""}> On</label>
    <button class="b b-ghost" type="button" data-saveoffer>${o?"Save":"Add code"}</button></div>`;
}
$("setBody").addEventListener("click", async e => {
  const j=e.target.closest("[data-jump]"); if(j){ $("set-"+j.dataset.jump).scrollIntoView({behavior:"smooth", block:"start"}); return; }
  const t=e.target;
  try{
    if(t.id==="stNoticeSave"||t.id==="stNoticeClear"){ const body=t.id==="stNoticeClear"?"":$("stNotice").value.trim(); await rpc("owner_set_notice",{p_body:body}); await refreshSettings(); toast(body?"Notice posted":"Notice cleared"); AUDIT=await rpc("owner_audit",{p_limit:100}); S.anchor="notice"; drawSettings(); }
    if(t.id==="stTplSave"){ const p=$$("[data-tpl]").map(x=>({key:x.dataset.tpl, body:x.value})); if(p.some(x=>!x.body.trim())) return toast("A message can't be empty", true);
      t.disabled=true; await rpc("owner_save_templates",{p}); await refreshSettings(); toast("Messages saved"); t.disabled=false; }
    if(t.closest("[data-saveoffer]")){ const box=t.closest("[data-offer]"), v=k=>box.querySelector(`[data-k="${k}"]`);
      const p={code:box.dataset.offer||v("code").value.trim().toUpperCase(), amount:+v("amount").value, min_order:+v("min_order").value||0, first_wash_only:v("first_wash_only").checked, active:v("active").checked};
      if(v("referrer_credit")) p.referrer_credit=+v("referrer_credit").value||0;
      OFFERS=await rpc("owner_save_offer",{p}); toast("Offer saved"); S.anchor="offers"; drawSettings(); }
    if(t.id==="stCostSave"){ const p={}; $$("[data-cost]").forEach(x=>p[x.dataset.cost]=x.value===""?0:+x.value); COSTS=await rpc("owner_save_costs",{p_month:S.setMonth, p}); cache.set("numbers",null); toast("Costs saved"); }
    if(t.id==="stExport") return exportCsv(t);
    if(t.id==="showKey"){ TEAM=await rpc("owner_team"); S.anchor="sheet"; drawSettings(); }
    if(t.id==="copyKey") navigator.clipboard.writeText($("sheetKey").textContent).then(()=>toast("Key copied")).catch(()=>{});
  }catch(x){ if(x.message!=="signed out") toast(x.message||"Couldn't save", true); t.disabled=false; }
});
$("setBody").addEventListener("change", async e => { if(e.target.id!=="stMonth") return; S.setMonth=e.target.value; COSTS=null; S.anchor="costs"; drawSettings(); try{ COSTS=await rpc("owner_costs",{p_month:S.setMonth}); S.anchor="costs"; drawSettings(); }catch(x){} });
document.addEventListener("click", e => { const b=e.target.closest("[data-anchor]"); if(b) S.anchor=b.dataset.anchor; }, true);
async function exportCsv(btn){
  const from=$("stFrom").value, to=$("stTo").value; if(!from||!to||from>to) return toast("Pick a start and end date", true);
  btn.disabled=true; btn.textContent="Preparing…";
  try{
    const rows=await rpc("owner_export",{p_from:from, p_to:to});
    const cols=[["id","Booking ID"],["created_at","Booked on"],["wash_date","Wash date"],["slot","Slot"],["status","Status"],["payment","Payment"],["paid_at","Paid on"],["name","Name"],["phone","Mobile"],
      ["vehicle","Vehicle"],["plate","Plate"],["package","Package"],["extras","Add-ons"],["address","Address"],["area","Area"],["pin","PIN"],["notes","Notes"],["subtotal","Price"],["discount","Discount"],["total","Total"],
      ["promo","Offer"],["promo_note","Offer note"],["referred_by","Referred by"],["pay_mode","Pay mode"],["source","Came from"],["washer","Washer"]];
    const cell=v=>{ let s=v==null?"":String(v); if(/^[=+\-@]/.test(s)) s="'"+s; return /[",\n]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s; };
    const csv="﻿"+[cols.map(c=>c[1]).join(","), ...rows.map(r=>cols.map(c=>cell(r[c[0]])).join(","))].join("\r\n");
    const a=document.createElement("a"); a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8"})); a.download=`vroombrite-bookings-${from}-to-${to}.csv`; document.body.appendChild(a); a.click(); setTimeout(()=>{ URL.revokeObjectURL(a.href); a.remove(); },500);
    toast(rows.length+" bookings downloaded"); AUDIT=await rpc("owner_audit",{p_limit:100}); S.anchor="export"; drawSettings();
  }catch(x){ toast(x.message||"Couldn't download", true); }
  btn.disabled=false; btn.textContent="Download CSV";
}
async function refreshSettings(){ try{ SET=await rpc("staff_settings"); cache.set("settings",SET); drawNotice(); }catch(e){} }

/* ============================== Help ============================== */
let helpQ="";
function drawHelp(){
  const role=isOwner()?"owner":"all";
  const list=GUIDE.filter(g=>g.role==="all"||role==="owner").filter(g=>!helpQ || (g.title+" "+g.body.replace(/<[^>]+>/g," ")).toLowerCase().includes(helpQ.toLowerCase()));
  $("helpBody").innerHTML = `<label class="search"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg><input id="hq" type="search" placeholder="Search help" value="${esc(helpQ)}" autocomplete="off"></label>
    <details class="card whatsnew" ${helpQ?"":"open"}><summary><h3>What's new</h3></summary><ul>${WHATS_NEW.map(([d,t])=>`<li><small>${esc(d)}</small> ${esc(t)}</li>`).join("")}</ul></details>
    ${list.map(g=>`<details class="card guide" id="g-${g.id}" ${helpQ?"open":""}><summary><h3>${esc(g.title)}</h3>${g.role==="owner"?'<span class="tag t-lime">Owner</span>':""}</summary><div class="gb">${g.body}</div></details>`).join("") || '<div class="empty"><b>Nothing found</b>Try another word.</div>'}`;
}
$("helpBody").addEventListener("input", e => { if(e.target.id!=="hq") return; helpQ=e.target.value; const pos=e.target.selectionStart; drawHelp(); const i=$("hq"); i.focus(); i.setSelectionRange(pos,pos); });

/* ============================== account ============================== */
function accountSheet(){
  const th=store.get("vb.theme")||"auto";
  openSheet(S.me.name, `<div class="menu">
    <p class="sub">${esc(session&&session.email||"")} · ${isOwner()?"Owner":"Washer"}</p>
    <div class="fld"><span>Look</span><div class="seg" id="themeSeg">${[["auto","Phone setting"],["light","Light"],["dark","Dark"]].map(([k,l])=>`<button type="button" data-theme="${k}" aria-pressed="${k===th}">${l}</button>`).join("")}</div></div>
    <form id="pwForm" class="fs"><p class="opt-h">Change my password</p><div class="pw-row"><span class="pw"><input id="myPw" type="password" placeholder="New password, 8+ characters" autocomplete="new-password"><button type="button" class="pw-eye" data-eye="myPw">Show</button></span><button class="b b-ghost" type="submit">Save</button></div><p class="msg" id="pwMsg" hidden></p></form>
    <button class="b b-ghost" type="button" id="refreshNow">Refresh now</button>
    <button class="b b-ghost" type="button" data-goview="help">Help</button>
    <button class="b b-danger" type="button" data-signout>Sign out</button></div>`, "account");
}
$("meBtn").addEventListener("click", accountSheet);
$("sheetBody").addEventListener("click", e => { const b=e.target.closest("[data-theme]"); if(!b) return; store.set("vb.theme", b.dataset.theme); applyTheme(); $$("#themeSeg button").forEach(x=>x.setAttribute("aria-pressed", x===b)); });
$("sheetBody").addEventListener("submit", async e => {
  if(e.target.id!=="pwForm") return; e.preventDefault(); const pw=$("myPw").value, m=$("pwMsg"); m.hidden=false;
  if(pw.length<8){ m.className="msg bad"; m.textContent="Use 8 or more characters."; return; }
  try{ await fresh(); await auth("user",{password:pw},"PUT"); m.className="msg ok"; m.textContent="Password changed. Use it next time you sign in."; $("myPw").value=""; }
  catch(x){ m.className="msg bad"; m.textContent=/different|same/i.test(x.message)?"That's your current password. Pick a new one.":x.message; }
});
document.addEventListener("click", e => {
  if(e.target.closest("#refreshNow")){ closeSheet(); refreshSettings(); go(S.view); }
  if(e.target.closest("[data-signout]")){ if(session) fetch(URL_+"/auth/v1/logout",{method:"POST",headers:{apikey:KEY,Authorization:"Bearer "+session.access_token}}).catch(()=>{});
    Object.keys(localStorage).filter(k=>k.startsWith("vb.") && k!=="vb.theme").forEach(k=>localStorage.removeItem(k)); session=null; S.me=null; S.view="day"; S.day=istToday(); S.open.clear(); S.q=""; S.cq=""; drawDay._scrolled=false; DAY=null; SET={templates:[],notice:null,team:[]}; JOBS.clear(); SINCE=null; closeSheet(); show("login"); }
});

/* ============================== sign in, forgot, recover ============================== */
$("loginForm").addEventListener("submit", async e => {
  e.preventDefault(); const btn=$("lgBtn"), err=$("lgErr"); err.hidden=true; btn.disabled=true; btn.textContent="Signing in…";
  try{ keep(await auth("token?grant_type=password", {email:$("lgEmail").value.trim(), password:$("lgPass").value})); await start(); }
  catch(x){ err.textContent = /invalid/i.test(x.message) ? "Wrong email or password." : x.message; err.hidden=false; }
  finally{ btn.disabled=false; btn.textContent="Sign in"; }
});
$("forgotBtn").addEventListener("click", () => { $("fgEmail").value=$("lgEmail").value; $("fgMsg").hidden=true; show("forgot"); });
$("forgotForm").addEventListener("submit", async e => {
  e.preventDefault(); const m=$("fgMsg"), em=$("fgEmail").value.trim(); m.hidden=false;
  if(!/^\S+@\S+\.\S+$/.test(em)){ m.className="msg bad"; m.textContent="Enter your login email."; return; }
  $("fgBtn").disabled=true;
  try{ await auth("recover?redirect_to="+encodeURIComponent(BASE+"ops.html"), {email:em}); m.className="msg ok"; m.textContent="If that email has a login, a link is on its way. Open it on this phone."; }
  catch(x){ m.className="msg bad"; m.textContent=/rate|seconds/i.test(x.message)?"Too many tries. Wait a few minutes, or ask the owner to set a new password in Team.":x.message; }
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
  if(!$("shell").hidden){ drawNav(); refreshSettings().then(()=>{ if(S.view==="day") drawDay(); }); return; }
  boot(); refreshSettings().then(()=>{ if(S.view==="day") drawDay(); });
}
function boot(){ show("app"); if(!allowed(S.view)) S.view="day"; drawNav(); go(S.view); pingCheck(); }

/* live: refresh the open screen every 30 s while visible, and when coming back to the app */
async function pingCheck(){ try{ remember(await rpc("staff_bookings",{p_query:"", p_from:istToday(), p_limit:200}), true); }catch(e){} }
setInterval(() => { if(document.hidden || !session || !S.me || $("shell").hidden) return; pingCheck(); if(["day","bookings"].includes(S.view) && $("sheet").hidden) go(S.view); }, 30000);
document.addEventListener("visibilitychange", () => { if(!document.hidden && session && S.me && !$("shell").hidden){ refreshSettings(); pingCheck(); if($("sheet").hidden) go(S.view); checkVersion(); } });

/* "A new version is ready" */
async function checkVersion(){
  if(!BUILD_ID) return;
  try{ const r=await fetch("version.json?t="+Date.now(),{cache:"no-store"}); const j=await r.json(); if(j.build && j.build!==BUILD_ID) $("updBar").hidden=false; }catch(e){}
}
setInterval(checkVersion, 5*60e3);
$("updBtn").addEventListener("click", () => location.reload());

/* ============================== go ============================== */
const hash = new URLSearchParams(location.hash.slice(1));
if(!URL_ || !KEY){ show("setup"); }
else if(hash.get("type")==="recovery" && hash.get("access_token")){ keep({access_token:hash.get("access_token"), refresh_token:hash.get("refresh_token"), expires_in:hash.get("expires_in")}); show("recover"); }
else if(hash.get("error_description")){ show("login"); $("lgErr").hidden=false; $("lgErr").textContent=hash.get("error_description").replace(/\+/g," ")+". Ask for a new link."; history.replaceState(null,"",location.pathname); }
else if(session && S.me && S.me.active){ boot(); start(); }
else if(session){ start(); }
else show("login");
})();
