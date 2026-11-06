/* Vroombrite Staff — fast staff app on Supabase.
   - Talks to Supabase directly (auth + database functions), no libraries.
   - Shows the last saved data instantly, then refreshes in the background.
   - Buttons update the screen immediately and sync behind the scenes. */
(function(){
"use strict";
const $ = id => document.getElementById(id);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];
const URL_ = (SITE.supabaseUrl||"").replace(/\/$/,""), KEY = SITE.supabaseKey||"";
const BASE = location.href.replace(/[^/]*([?#].*)?$/, "");
const store = {
  get(k){ try{ return JSON.parse(localStorage.getItem(k)); }catch(e){ return null; } },
  set(k,v){ try{ v==null ? localStorage.removeItem(k) : localStorage.setItem(k, JSON.stringify(v)); }catch(e){} }
};
const esc = t => String(t==null?"":t).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const rupee = n => "₹" + Number(n||0).toLocaleString("en-IN");
const first = n => String(n||"").trim().split(/\s+/)[0] || "there";
const istToday = () => new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Kolkata"}).format(new Date());
const addDays = (iso, n) => { const d=new Date(iso+"T12:00:00Z"); d.setUTCDate(d.getUTCDate()+n); return d.toISOString().slice(0,10); };
const fmtDay = (iso, o) => new Date(iso+"T12:00:00Z").toLocaleDateString("en-IN", Object.assign({timeZone:"UTC"}, o||{weekday:"short", day:"numeric", month:"short"}));
const relDay = iso => { const t=istToday(); return iso===t ? "Today" : iso===addDays(t,1) ? "Tomorrow" : iso===addDays(t,-1) ? "Yesterday" : fmtDay(iso); };
const ago = ts => { if(!ts) return ""; const m=Math.round((Date.now()-new Date(ts))/6e4); return m<1?"just now":m<60?m+" min ago":m<1440?Math.round(m/60)+" h ago":Math.round(m/1440)+" d ago"; };
const tel = p => "tel:+91"+String(p).replace(/\D/g,"").slice(-10);
const wa  = (p, text) => "https://wa.me/91"+String(p).replace(/\D/g,"").slice(-10)+(text?"?text="+encodeURIComponent(text):"");
const mapUrl = j => "https://www.google.com/maps/search/?api=1&query="+encodeURIComponent([j.address, j.area, j.pin, "Mumbai"].filter(Boolean).join(", "));
const I = {
  call:'<svg viewBox="0 0 24 24"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/></svg>',
  map:'<svg viewBox="0 0 24 24"><path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>',
  chat:'<svg viewBox="0 0 24 24"><path d="M4 20l1.3-3.9A8 8 0 1 1 8 19z"/></svg>',
  more:'<svg viewBox="0 0 24 24"><circle cx="5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="19" cy="12" r="1.3"/></svg>',
  pin:'<svg viewBox="0 0 24 24"><path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>'
};

/* ============================== Supabase ============================== */
let session = store.get("vb.session");
async function auth(path, body){
  const r = await fetch(URL_+"/auth/v1/"+path, {method:"POST", headers:{"Content-Type":"application/json", apikey:KEY}, body:JSON.stringify(body)});
  const j = await r.json().catch(()=>({}));
  if(!r.ok) throw new Error(j.error_description || j.msg || j.message || "Sign-in failed");
  return j;
}
function keep(j){ session = {access_token:j.access_token, refresh_token:j.refresh_token, expires_at:j.expires_at || Math.floor(Date.now()/1000)+(j.expires_in||3600), email:(j.user||{}).email || (session||{}).email}; store.set("vb.session", session); }
let refreshing = null;
async function refresh(){
  if(!session) throw new Error("signed out");
  refreshing = refreshing || auth("token?grant_type=refresh_token", {refresh_token:session.refresh_token}).then(keep).finally(()=>refreshing=null);
  return refreshing;
}
async function rpc(fn, args, retried){
  if(session && session.expires_at*1000 - Date.now() < 60e3){ try{ await refresh(); }catch(e){ return signedOut(); } }
  const r = await fetch(URL_+"/rest/v1/rpc/"+fn, {method:"POST",
    headers:{"Content-Type":"application/json", apikey:KEY, Authorization:"Bearer "+(session?session.access_token:KEY)}, body:JSON.stringify(args||{})});
  if(r.status===401 && !retried && session){ try{ await refresh(); return rpc(fn, args, true); }catch(e){ return signedOut(); } }
  const j = await r.json().catch(()=>null);
  if(!r.ok){ const e=new Error((j&&j.message)||("Error "+r.status)); e.status=r.status; throw e; }
  return j;
}
function signedOut(){ session=null; store.set("vb.session",null); show("login"); throw new Error("signed out"); }

/* ============================== state ============================== */
const S = { me: store.get("vb.me"), view: "day", day: istToday(), open: new Set(), dueDays: 12, inTab: "leads", q: "" };
const cache = { get:k => store.get("vb.c."+k), set:(k,v) => store.set("vb.c."+k, v) };
let syncState = "ok";
function sync(s){ syncState=s; const el=$("sync"); el.className="sync "+s; el.title={ok:"Up to date",busy:"Updating…",err:"Offline – showing saved data"}[s]; }
function toast(t, bad){ const el=$("toast"); el.textContent=t; el.classList.toggle("bad",!!bad); el.classList.add("on"); clearTimeout(el._t); el._t=setTimeout(()=>el.classList.remove("on"), 2400); }

/* ============================== screens ============================== */
function show(which){
  ["setup","login","wait"].forEach(n => $("scr"+n[0].toUpperCase()+n.slice(1)).hidden = which!==n);
  $("shell").hidden = which!=="app";
}

const VIEWS = [
  {id:"day", label:"Day", all:true},
  {id:"bookings", label:"Bookings", all:true},
  {id:"customers", label:"Customers"},
  {id:"inbox", label:"Inbox"},
  {id:"numbers", label:"Numbers"},
  {id:"team", label:"Team"}
];
const isOwner = () => S.me && S.me.role==="owner";
function drawNav(){
  $("views").innerHTML = VIEWS.filter(v => v.all || isOwner()).map(v =>
    `<button type="button" data-v="${v.id}" ${v.id===S.view?'aria-current="page"':""}>${v.label}${v.id==="inbox"&&S.inboxNew?'<span class="dot"></span>':""}</button>`).join("");
  $("views").hidden = !isOwner() && VIEWS.filter(v=>v.all).length<2 ? true : false;
  $("meBtn").textContent = (S.me&&S.me.name||"?").trim().charAt(0).toUpperCase();
}
$("views").addEventListener("click", e => { const b=e.target.closest("[data-v]"); if(b) go(b.dataset.v); });
function go(v){
  S.view=v; drawNav();
  $$("[data-view]").forEach(s => s.hidden = s.dataset.view!==v);
  const titles={day:relDay(S.day), bookings:"Bookings", customers:"Customers", inbox:"Inbox", numbers:"Numbers", team:"Team"};
  $("title").textContent = titles[v];
  $("subtitle").textContent = v==="day" ? fmtDay(S.day,{weekday:"long", day:"numeric", month:"long"}) : (S.me ? S.me.name+" · "+(isOwner()?"Owner":"Washer") : "");
  ({day:loadDay, bookings:loadBookings, customers:loadDue, inbox:loadInbox, numbers:loadNumbers, team:loadTeam})[v]();
  scrollTo(0,0);
}

/* ============================== messages ============================== */
const MSG = {
  confirm: j => `Hi ${first(j.name)}, this is ${SITE.name}. Your ${j.package} for your ${String(j.vehicle).replace(/^Car · /,"").toLowerCase()} is confirmed for ${fmtDay(j.wash_date)}, ${j.slot}. We'll message you when we're on the way.\nBooking ID: ${j.id}`,
  remind:  j => `Hi ${first(j.name)}, a reminder from ${SITE.name}: your ${j.package} is on ${fmtDay(j.wash_date)}, ${j.slot}, at ${j.address}. Please keep the vehicle accessible${/glow|refresh|interior/i.test(j.package+j.extras)?" and the keys ready for the interior":""}. Reply here to reschedule.`,
  onway:   j => `Hi ${first(j.name)}, your ${SITE.name} washer is on the way and will reach in about 20 minutes.`,
  review:  j => `Hi ${first(j.name)}, thank you for choosing ${SITE.name}! How did we do? Rate your wash here, it takes 20 seconds: ${BASE}review.html?b=${encodeURIComponent(j.id)}`,
  rebook:  d => `Hi ${first(d.name)}, it's been ${d.days_ago} days since your last ${SITE.name} wash. Shall we book your ${d.package} again? Reply with a day and time that suits you, or book here: ${BASE}book.html`,
  lead:    l => `Hi ${first(l.contact_name)}, this is ${SITE.name}. Thanks for your society quote request for ${l.society}. When can we visit to see the parking and share a group price?`,
  enquiry: e => `Hi ${first(e.name)}, this is ${SITE.name}. Thanks for your message. `
};

/* ============================== job card ============================== */
const STATUS_LABEL = {new:"New", confirmed:"Confirmed", on_way:"On the way", done:"Washed", cancelled:"Cancelled"};
const isPaid = j => /^paid/.test(j.payment);
function nextStep(j){
  if(j.status==="cancelled") return {html:`<button class="b b-ghost" data-act="reopen">Reopen booking</button>`};
  if(j.status==="new") return {html:`<a class="b b-wa b-lg" data-act="confirm" target="_blank" rel="noopener" href="${wa(j.phone, MSG.confirm(j))}">Confirm on WhatsApp</a>`};
  if(j.status==="confirmed") return {html:`<a class="b b-wa b-lg" data-act="on_way" target="_blank" rel="noopener" href="${wa(j.phone, MSG.onway(j))}">Send "On my way"</a>`};
  if(j.status==="on_way") return {html:`<button class="b b-lime b-lg" data-act="done">Mark washed</button>`};
  if(!isPaid(j)) return {html:`<button class="b b-coral b-lg" data-act="paid_upi">Paid by UPI</button><button class="b b-coral b-lg" data-act="paid_cash">Paid in cash</button>`};
  if(!j.review_asked_at) return {html:`<a class="b b-ghost b-lg" data-act="review_asked" target="_blank" rel="noopener" href="${wa(j.phone, MSG.review(j))}">Ask for a review</a>`};
  return {html:`<button class="b b-ghost b-lg" disabled>All done ✓</button>`};
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
function card(j, opts){
  opts=opts||{};
  return `<article class="job${opts.hero?" hero":""}" data-id="${esc(j.id)}">
    <div class="job-top"><span class="slot">${esc(opts.showDate?relDay(j.wash_date)+" · ":"")}${esc(j.slot)}</span>
      ${j.status==="cancelled"?'<span class="tag">Cancelled</span>':j.status==="new"?'<span class="tag t-aqua">New</span>':""}
      ${j.visits>0?`<span class="tag t-blue">${j.visits+1}${["","st","nd","rd"][j.visits+1]||"th"} visit</span>`:""}${payTag(j)}</div>
    <h3>${esc(j.name)} <small>${esc(j.id)}</small></h3>
    <p class="veh"><b>${esc(j.vehicle)}</b>${j.plate?" · "+esc(j.plate):""} — ${esc(j.package)}${j.extras?" + "+esc(j.extras):""}</p>
    <p class="addr">${I.pin}<span>${esc(j.address)}${j.area?", "+esc(j.area):""} ${esc(j.pin)}</span></p>
    ${j.notes?`<p class="note">${esc(j.notes)}</p>`:""}
    ${j.promo_note?`<p class="note">${esc(j.promo_note)}</p>`:""}
    ${j.credit>0 && j.status!=="cancelled"?`<div class="credit"><span>${rupee(j.credit)} referral credit — take it off the bill</span><button class="b b-ghost" data-act="use_credit" style="min-height:36px;padding:6px 10px">Mark used</button></div>`:""}
    <div class="money"><span>${j.discount>0?`${esc(j.promo==="REFERRAL"?"Referral":j.promo)} −${rupee(j.discount)}`:"To collect"}</span><b class="num">${j.discount>0?`<s>${rupee(j.subtotal)}</s>`:""}${rupee(j.total)}</b></div>
    ${steps(j)}
    <div class="next">${nextStep(j).html}</div>
    <div class="quick">
      <a class="b" href="${tel(j.phone)}">${I.call}Call</a>
      <a class="b" target="_blank" rel="noopener" href="${mapUrl(j)}">${I.map}Map</a>
      <a class="b" target="_blank" rel="noopener" href="${wa(j.phone)}">${I.chat}Chat</a>
      <button class="b" type="button" data-more>${I.more}More</button>
    </div>
  </article>`;
}
function row(j, showDate){
  const cls = j.status==="cancelled" ? " off" : (j.status==="done" && isPaid(j)) ? " done" : "";
  return `<button type="button" class="row${cls}" data-open="${esc(j.id)}">
    <span class="rt">${esc(showDate?relDay(j.wash_date):j.slot)}</span>
    <span class="rm"><b>${esc(j.name)}</b><span>${esc(j.vehicle.replace(/^Car · /,""))} · ${esc(j.package)}${j.area?" · "+esc(j.area):""}</span></span>
    <span class="rr"><b class="num">${rupee(j.total)}</b>${j.status==="cancelled"?'<span class="tag">Cancelled</span>':j.status==="done"?(isPaid(j)?'<span class="tag t-lime">Done</span>':'<span class="tag t-coral">Collect</span>'):`<span class="tag ${j.status==="new"?"t-aqua":""}">${STATUS_LABEL[j.status]}</span>`}</span>
  </button>`;
}

/* ============================== jobs: one store for every view ============================== */
const JOBS = new Map();   // id -> booking
function remember(list){ (list||[]).forEach(j => JOBS.set(j.id, j)); }
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
  try{ const fresh = await rpc("staff_update", {p_id:id, p_action:action}); JOBS.set(id, fresh); redraw(); }
  catch(e){ if(e.message==="signed out") return; JOBS.set(id, before); redraw(); toast("Couldn't save. Check your internet and try again.", true); }
}
document.addEventListener("click", e => {
  const a = e.target.closest("[data-act]"); const host = e.target.closest("[data-id]");
  if(a && host){
    if(a.dataset.act==="cancel" && !a.dataset.sure){ a.dataset.sure="1"; a.textContent="Tap again to cancel"; setTimeout(()=>{ delete a.dataset.sure; a.textContent="Cancel booking"; }, 3000); e.preventDefault(); return; }
    act(host.dataset.id, a.dataset.act);
    if(a.tagName==="BUTTON") e.preventDefault();
    if(a.closest(".menu")) closeSheet();
    return;
  }
  const m = e.target.closest("[data-more]"); if(m && host){ moreSheet(host.dataset.id); return; }
  const o = e.target.closest("[data-open]");
  if(o){ const id=o.dataset.open; if(S.view==="day"){ S.open.has(id)?S.open.delete(id):S.open.add(id); drawDay(); } else openJob(id); }
});

/* ============================== Day ============================== */
let DAY = null;
function stripHTML(strip){
  const t=istToday();
  return (strip||[]).map(d => `<button type="button" class="day${d.date===t?" today":""}" role="tab" aria-selected="${d.date===S.day}" data-day="${d.date}">
    <small>${fmtDay(d.date,{weekday:"short"})}</small><b>${fmtDay(d.date,{day:"numeric"})}</b>
    <i>${d.count>3?`<em>${d.count}</em>`:Array.from({length:d.count},(_,k)=>`<span class="${k<d.open?"open":""}"></span>`).join("")}</i></button>`).join("");
}
$("strip").addEventListener("click", e => { const b=e.target.closest("[data-day]"); if(!b) return; S.day=b.dataset.day; S.open.clear(); go("day"); });
async function loadDay(){
  const k="day."+S.day, c=cache.get(k);
  if(c){ DAY=c; remember(c.jobs); drawDay(); } else { DAY=null; drawDay(); }
  sync("busy");
  try{ const d=await rpc("staff_day",{p_date:S.day}); DAY=d; remember(d.jobs); cache.set(k,d); drawDay(); sync("ok"); }
  catch(e){ if(e.message!=="signed out") sync("err"); }
}
function drawDay(){
  if(!DAY){
    $("strip").innerHTML = Array.from({length:7},()=>'<div class="day sk" style="height:66px"></div>').join("");
    $("daybar").innerHTML=""; $("dayBody").innerHTML='<div class="sk" style="height:300px"></div><div class="sk" style="height:64px;margin-top:10px"></div>'; return;
  }
  $("strip").innerHTML = stripHTML(DAY.strip);
  const sel=$("strip").querySelector('[aria-selected="true"]'); if(sel && !drawDay._scrolled){ sel.scrollIntoView({inline:"center", block:"nearest"}); drawDay._scrolled=true; }
  const jobs = DAY.jobs.map(j => JOBS.get(j.id) || j);
  const live = jobs.filter(j=>j.status!=="cancelled"), done = live.filter(j=>j.status==="done").length;
  const toCollect = live.filter(j=>!isPaid(j)).reduce((s,j)=>s+j.total,0);
  $("daybar").innerHTML = live.length ? `<div class="prog"><i style="width:${Math.round(done/live.length*100)}%"></i></div>
    <p><b>${done}/${live.length}</b> washed · ${toCollect?`<span class="due"><b class="num">${rupee(toCollect)}</b> to collect</span>`:"all paid"}</p>` : "";
  if(!jobs.length){ $("dayBody").innerHTML = `<div class="empty"><b>No bookings ${S.day===istToday()?"today":"on "+fmtDay(S.day)}</b>New bookings from the website appear here automatically.</div>`; return; }
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

/* ============================== Bookings ============================== */
let BK = null, qTimer=0;
$("q").addEventListener("input", () => { clearTimeout(qTimer); qTimer=setTimeout(()=>{ S.q=$("q").value.trim(); loadBookings(); }, 300); });
async function loadBookings(){
  const k="bk."+S.q; BK = cache.get(k); if(BK) remember(BK); drawBookings();
  sync("busy");
  try{ BK = await rpc("staff_bookings",{p_query:S.q, p_from:istToday(), p_limit:100}); remember(BK); cache.set(k,BK); drawBookings(); sync("ok"); }
  catch(e){ if(e.message!=="signed out") sync("err"); }
}
function drawBookings(){
  const el=$("bkBody");
  if(!BK){ el.innerHTML='<div class="sk" style="height:60px"></div>'.repeat(4).replace(/<\/div>/g,'</div><div style="height:8px"></div>'); return; }
  const list = BK.map(j=>JOBS.get(j.id)||j);
  if(!list.length){ el.innerHTML=`<div class="empty"><b>${S.q?"Nothing found":"No upcoming bookings"}</b>${S.q?"Try a name, phone number, plate or booking ID.":"New website bookings appear here."}</div>`; return; }
  let html="", last="";
  list.forEach(j => { if(j.wash_date!==last){ last=j.wash_date; html+=`${html?"</div>":""}<div class="grp"><h2>${esc(relDay(j.wash_date))}${relDay(j.wash_date)!==fmtDay(j.wash_date)?" · "+fmtDay(j.wash_date):""}</h2></div><div class="list cols">`; } html+=row(j,false); });
  el.innerHTML = html+"</div>";
}

/* ============================== sheet (bottom panel) ============================== */
let sheetFor=null;
function openSheet(title, html, id){ sheetFor=id||null; $("sheetTitle").textContent=title; $("sheetBody").innerHTML=html; $("sheet").hidden=false; }
function closeSheet(){ $("sheet").hidden=true; sheetFor=null; }
$("sheet").addEventListener("click", e => { if(e.target.closest("[data-close]")) closeSheet(); });
addEventListener("keydown", e => { if(e.key==="Escape" && !$("sheet").hidden) closeSheet(); });
function openJob(id){ const j=JOBS.get(id); if(j) openSheet(relDay(j.wash_date)+" · "+j.slot, `<div data-id="${esc(id)}">${card(j)}</div>`, "job:"+id); }
function moreSheet(id){
  const j=JOBS.get(id); if(!j) return;
  openSheet("More for "+first(j.name), `<div class="menu" data-id="${esc(id)}">
    <a class="b b-ghost" data-act="reminded" target="_blank" rel="noopener" href="${wa(j.phone, MSG.remind(j))}">Send reminder on WhatsApp${j.reminder_sent_at?` · sent ${ago(j.reminder_sent_at)}`:""}</a>
    ${j.status==="done"?`<a class="b b-ghost" data-act="review_asked" target="_blank" rel="noopener" href="${wa(j.phone, MSG.review(j))}">Ask for a review${j.review_asked_at?` · asked ${ago(j.review_asked_at)}`:""}</a>`:""}
    ${j.status!=="done"&&j.status!=="cancelled"?`<button class="b b-ghost" data-act="done">Mark washed</button>`:""}
    ${isPaid(j)?`<button class="b b-ghost" data-act="unpaid">Mark as not paid</button>`:`<button class="b b-ghost" data-act="paid_upi">Paid by UPI</button><button class="b b-ghost" data-act="paid_cash">Paid in cash</button>`}
    ${j.status==="cancelled"?`<button class="b b-ghost" data-act="reopen">Reopen booking</button>`:`<button class="b b-danger" data-act="cancel">Cancel booking</button>`}
  </div>`);
}
function redraw(){
  if(S.view==="day") drawDay(); if(S.view==="bookings") drawBookings();
  if(sheetFor && sheetFor.startsWith("job:")){ const id=sheetFor.slice(4), j=JOBS.get(id); if(j) $("sheetBody").innerHTML=`<div data-id="${esc(id)}">${card(j)}</div>`; }
}

/* ============================== Customers (owner) ============================== */
let DUE=null;
$("dueChips").addEventListener("click", e => { const b=e.target.closest("[data-days]"); if(!b) return; S.dueDays=+b.dataset.days; loadDue(); });
async function loadDue(){
  $("dueChips").innerHTML=[7,12,21,30].map(d=>`<button type="button" class="chip" data-days="${d}" aria-pressed="${d===S.dueDays}">${d}+ days</button>`).join("");
  const k="due."+S.dueDays; DUE=cache.get(k); drawDue(); sync("busy");
  try{ DUE=await rpc("owner_due",{p_days:S.dueDays}); cache.set(k,DUE); drawDue(); sync("ok"); } catch(e){ if(e.message!=="signed out") sync("err"); }
}
function drawDue(){
  const el=$("dueBody");
  if(!DUE){ el.innerHTML='<div class="sk" style="height:120px"></div>'; $("dueLead").textContent=""; return; }
  $("dueLead").textContent = DUE.length ? `${DUE.length} customer${DUE.length>1?"s":""} with nothing booked whose last wash was ${S.dueDays}+ days ago. Send a rebook message.` : "";
  el.innerHTML = DUE.length ? `<div class="list cols">${DUE.map((d,i)=>`<div class="card">
      <div class="job-top"><span class="slot">${d.days_ago} days ago</span><span class="tag t-blue">${d.washes} wash${d.washes>1?"es":""}</span>${d.reminder_sent_at?`<span class="tag t-coral">Reminded ${ago(d.reminder_sent_at)}</span>`:""}</div>
      <h3>${esc(d.name)}</h3><p class="sub">${esc(d.vehicle)} · last: ${esc(d.package)} on ${fmtDay(d.last_date)}${d.area?" · "+esc(d.area):""}</p>
      <div class="acts"><a class="b b-wa" target="_blank" rel="noopener" data-rebook="${i}" href="${wa(d.phone, MSG.rebook(d))}">Send rebook message</a><a class="b b-ghost" href="${tel(d.phone)}">Call</a></div></div>`).join("")}</div>`
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
  try{ INB=await rpc("owner_inbox"); cache.set("inbox",INB); drawInbox(); sync("ok"); } catch(e){ if(e.message!=="signed out") sync("err"); }
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
      <div class="acts"><a class="b b-wa" target="_blank" rel="noopener" href="${wa(l.phone, MSG.lead(l))}">WhatsApp</a><a class="b b-ghost" href="${tel(l.phone)}">Call</a></div></div>`).join("")}</div>` : empty("No society requests yet");
  if(S.inTab==="enquiries") el.innerHTML = INB.enquiries.length ? `<div class="list cols">${INB.enquiries.map(q=>`<div class="card">
      <div class="job-top"><span class="slot">${fmtDay(String(q.created_at).slice(0,10))}</span></div>
      <h3>${esc(q.name||"Customer")}</h3><p class="txt">${esc(q.message)}</p>${pills("enquiry",q.id,q.status,ENQ_ST)}
      <div class="acts"><a class="b b-wa" target="_blank" rel="noopener" href="${wa(q.phone, MSG.enquiry(q))}">Reply on WhatsApp</a><a class="b b-ghost" href="${tel(q.phone)}">Call</a></div></div>`).join("")}</div>` : empty("No messages yet");
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
  catch(e){ if(e.message!=="signed out") sync("err"); }
}
function drawNumbers(N){
  const el=$("numBody"); if(!N){ el.innerHTML='<div class="tiles">'+'<div class="tile sk" style="height:86px"></div>'.repeat(8)+'</div>'; return; }
  const tile=(v,l,s,warn)=>`<div class="tile${warn?" warn":""}"><b class="num">${v}</b><span>${l}</span>${s?`<small>${s}</small>`:""}</div>`;
  const max=Math.max(1,...N.last14.map(d=>d.count)), t=istToday();
  const hb = list => list.length ? list.map(p=>`<div class="hbar"><span>${esc(p.name)}</span><b class="num">${p.count}</b><i style="--w:${Math.round(p.count/list[0].count*100)}%"></i></div>`).join("") : '<p class="sub">No bookings yet</p>';
  const todo=[]; if(N.new_leads) todo.push(`${N.new_leads} new society request${N.new_leads>1?"s":""}`); if(N.new_enquiries) todo.push(`${N.new_enquiries} new message${N.new_enquiries>1?"s":""}`);
  if(N.pending_reviews) todo.push(`${N.pending_reviews} review${N.pending_reviews>1?"s":""} to approve`); if(N.inactive_staff) todo.push(`${N.inactive_staff} login${N.inactive_staff>1?"s":""} waiting in Team`);
  el.innerHTML = `${todo.length?`<div class="card" style="margin-bottom:10px;border-color:rgba(255,137,92,.35)"><h3>To do</h3><p class="sub">${todo.join(" · ")}</p></div>`:""}
    <div class="tiles">${tile(N.today,"Bookings today")}${tile(N.upcoming,"Upcoming")}${tile(rupee(N.collected_week),"Collected, 7 days")}${tile(rupee(N.collected_month),"Collected this month")}
    ${tile(rupee(N.unpaid_amount),"Washed, not paid", N.unpaid_count+" job"+(N.unpaid_count===1?"":"s"), N.unpaid_amount>0)}${tile(N.done_week,"Washed, 7 days")}${tile(N.customers,"Customers", N.repeat+" came back")}${tile(rupee(N.avg_ticket),"Average bill")}</div>
    <div class="card" style="margin-top:10px"><h3>Bookings, last 14 days</h3><div class="chart">${N.last14.map(d=>`<div class="bar${d.date===t?" now":""}" title="${fmtDay(d.date)}: ${d.count} bookings, ${rupee(d.amount)} paid"><b class="num">${d.count||""}</b><i class="${d.count?"has":""}" style="height:${Math.round(d.count/max*100)}%"></i><span>${fmtDay(d.date,{day:"numeric"})}</span></div>`).join("")}</div></div>
    <div class="two"><div class="card"><h3>Top packages</h3><div class="hbars">${hb(N.packages)}</div></div><div class="card"><h3>Top areas</h3><div class="hbars">${hb(N.areas)}</div></div></div>`;
}

/* ============================== Team (owner) ============================== */
async function loadTeam(){
  let T=cache.get("team"); drawTeam(T); sync("busy");
  try{ T=await rpc("owner_team"); cache.set("team",T); drawTeam(T); sync("ok"); } catch(e){ if(e.message!=="signed out") sync("err"); }
}
function drawTeam(T){
  const el=$("teamBody"); if(!T){ el.innerHTML='<div class="sk" style="height:160px"></div>'; return; }
  el.innerHTML = `<div class="card"><h3>Logins</h3>${T.staff.map(p=>`<div class="person"><span class="av">${esc((p.name||"?")[0].toUpperCase())}</span>
      <span class="pm"><b><button type="button" class="linkish" data-rename="${p.id}" data-name="${esc(p.name)}" title="Change name">${esc(p.name)}</button> <span class="tag ${p.role==="owner"?"t-lime":""}">${p.role==="owner"?"Owner":"Washer"}</span></b><span>${esc(p.email||"")}</span></span>
      ${p.id===S.me.id?'<span class="tag">You</span>':`<label class="switch" title="${p.active?"Switch off":"Switch on"}"><input type="checkbox" data-staff="${p.id}" ${p.active?"checked":""} aria-label="Login active for ${esc(p.name)}"><span></span></label>`}</div>`).join("")}
    </div>
    <div class="card" style="margin-top:10px"><h3>Add a washer login</h3><ol class="steps-txt">
      <li>Open supabase.com → your project → <b>Authentication → Users</b>.</li>
      <li><b>Add user → Create new user</b>, enter their email and a password, tick <b>Auto Confirm User</b>.</li>
      <li>Come back here and switch their login on.</li></ol></div>
    <div class="card" style="margin-top:10px"><h3>Google Sheet copy key</h3><p class="sub">Paste this into the Google Sheet script once, so it can copy bookings every night. Keep it private.</p>
      <div class="keybox"><span id="sheetKey" style="flex:1">${esc(T.sheet_copy_key)}</span><button class="b b-ghost" type="button" id="copyKey" style="min-height:36px">Copy</button></div></div>`;
}
$("teamBody").addEventListener("change", async e => {
  const c=e.target.closest("[data-staff]"); if(!c) return;
  try{ await rpc("owner_set_staff",{p_id:c.dataset.staff, p_active:c.checked}); toast(c.checked?"Login switched on":"Login switched off"); cache.set("team",null); }
  catch(err){ c.checked=!c.checked; toast(err.message||"Couldn't save", true); }
});
$("teamBody").addEventListener("click", e => {
  const r=e.target.closest("[data-rename]"); if(r){ openSheet("Change name", `<form class="menu" id="renameForm" data-sid="${r.dataset.rename}">
    <label class="fld"><span>Name shown in the app</span><input id="renameIn" maxlength="60" value="${r.dataset.name}" autocomplete="off"></label>
    <button class="b b-lime" type="submit">Save</button></form>`); setTimeout(()=>$("renameIn").select(),50); return; }
  if(e.target.id!=="copyKey") return;
  navigator.clipboard.writeText($("sheetKey").textContent).then(()=>toast("Key copied")).catch(()=>{ const r=document.createRange(); r.selectNodeContents($("sheetKey")); const s=getSelection(); s.removeAllRanges(); s.addRange(r); }); });

$("sheetBody").addEventListener("submit", async e => {
  if(e.target.id!=="renameForm") return; e.preventDefault();
  const id=e.target.dataset.sid, name=$("renameIn").value.trim(), row=$("teamBody").querySelector(`[data-staff="${id}"]`); if(!name) return;
  try{ await rpc("owner_set_staff",{p_id:id, p_active: row ? row.checked : true, p_name:name}); closeSheet(); toast("Name saved");
    if(id===S.me.id){ S.me.name=name; store.set("vb.me",S.me); drawNav(); } loadTeam(); }
  catch(err){ toast(err.message||"Couldn't save", true); }
});

/* ============================== account ============================== */
$("meBtn").addEventListener("click", () => openSheet(S.me.name, `<div class="menu">
  <p class="sub" style="color:var(--mu)">${esc(session&&session.email||"")} · ${isOwner()?"Owner":"Washer"}</p>
  <button class="b b-ghost" type="button" id="refreshNow">Refresh now</button>
  <button class="b b-danger" type="button" data-signout>Sign out</button></div>`));
document.addEventListener("click", e => {
  if(e.target.closest("#refreshNow")){ closeSheet(); go(S.view); }
  if(e.target.closest("[data-signout]")){ if(session) fetch(URL_+"/auth/v1/logout",{method:"POST",headers:{apikey:KEY,Authorization:"Bearer "+session.access_token}}).catch(()=>{});
    Object.keys(localStorage).filter(k=>k.startsWith("vb.")).forEach(k=>localStorage.removeItem(k)); session=null; S.me=null; closeSheet(); show("login"); }
});

/* ============================== sign in ============================== */
$("loginForm").addEventListener("submit", async e => {
  e.preventDefault(); const btn=$("lgBtn"), err=$("lgErr"); err.hidden=true; btn.disabled=true; btn.textContent="Signing in…";
  try{ keep(await auth("token?grant_type=password", {email:$("lgEmail").value.trim(), password:$("lgPass").value})); await start(); }
  catch(x){ err.textContent = /invalid/i.test(x.message) ? "Wrong email or password." : x.message; err.hidden=false; }
  finally{ btn.disabled=false; btn.textContent="Sign in"; }
});
$("waitRetry").addEventListener("click", () => start());

async function start(){
  try{ S.me = await rpc("staff_me"); store.set("vb.me", S.me); }
  catch(e){ if(e.message==="signed out") return; if(!S.me){ show("login"); $("lgErr").textContent="Couldn't reach the server. Check your internet."; $("lgErr").hidden=false; return; } }
  if(!S.me.active){ show("wait"); return; }
  boot();
}
function boot(){ show("app"); if(!VIEWS.some(v => v.id===S.view && (v.all || isOwner()))) S.view="day"; drawNav(); go(S.view); }

/* live: refresh the open screen every 30 s while it's visible, and when coming back to the app */
setInterval(() => { if(!document.hidden && session && S.me && ["day","bookings"].includes(S.view) && $("sheet").hidden) go(S.view); }, 30000);
document.addEventListener("visibilitychange", () => { if(!document.hidden && session && S.me && !$("shell").hidden) go(S.view); });

/* ============================== go ============================== */
if(!URL_ || !KEY){ show("setup"); }
else if(session && S.me && S.me.active){ boot(); start(); }    // instant: draw from saved data, confirm in background
else if(session){ start(); }
else show("login");
})();
