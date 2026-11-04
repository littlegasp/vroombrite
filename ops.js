/* Vroombrite staff app — jobs, dashboard, due-for-wash reminders, society leads.
   Talks to the Apps Script web app (SITE.sheetUrl). Sign-in PIN is checked by the script. */
(function(){
const BASE = location.href.replace(/[^/]*([?#].*)?$/, "");
const store = { get(k){ try{ return localStorage.getItem(k); }catch(e){ return null; } }, set(k,v){ try{ v==null?localStorage.removeItem(k):localStorage.setItem(k,v); }catch(e){} } };
let KEY = store.get("vbStaffPin"), ROLE = null, DAY = todayISO();
const esc = t => String(t==null?"":t).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const first = n => String(n||"").trim().split(/\s+/)[0] || "there";
function todayISO(){ const d=new Date(); return new Date(d.getTime()-d.getTimezoneOffset()*6e4).toISOString().slice(0,10); }
function shift(iso, n){ const d=new Date(iso+"T12:00"); d.setDate(d.getDate()+n); return new Date(d.getTime()-d.getTimezoneOffset()*6e4).toISOString().slice(0,10); }
const niceDate = iso => new Date(iso+"T12:00").toLocaleDateString("en-IN",{weekday:"short",day:"numeric",month:"short"});
const custWa = (phone, text) => "https://wa.me/91"+String(phone).replace(/\D/g,"").slice(-10)+"?text="+encodeURIComponent(text);
const mapUrl = j => "https://www.google.com/maps/search/?api=1&query="+encodeURIComponent([j.address, j.area, j.pin, "Mumbai"].filter(Boolean).join(", "));

const MSG = {
  confirm: j => `Hi ${first(j.name)}, this is ${SITE.name}. Your ${j.pkg} for your ${j.vehicle.replace(/^Car · /,"").toLowerCase()} is confirmed for ${niceDate(j.date)}, ${j.slot}. Our washer will message you when on the way.\nBooking ID: ${j.id}`,
  remind:  j => `Hi ${first(j.name)}, a reminder from ${SITE.name}: your ${j.pkg} is on ${niceDate(j.date)}, ${j.slot}, at ${j.address}. Please keep the vehicle accessible${/interior|glow|refresh|clean/i.test(j.pkg+j.extras)?" and the keys ready for the interior":""}. Reply here to reschedule.`,
  onway:   j => `Hi ${first(j.name)}, your ${SITE.name} washer is on the way and will reach in about 20 minutes.`,
  review:  j => `Hi ${first(j.name)}, thank you for choosing ${SITE.name}! How did we do? Rate your wash here, it takes 20 seconds: ${BASE}review.html?b=${encodeURIComponent(j.id)}`,
  rebook:  d => `Hi ${first(d.name)}, it's been ${d.daysAgo} days since your last ${SITE.name} wash. Shall we book your ${d.pkg} again? Reply with a day and time that suits you, or book here: ${BASE}book.html`,
  lead:    l => `Hi ${first(l.name)}, this is ${SITE.name}. Thanks for your society quote request for ${l.society}. When can we visit to see the parking and share a group price?`
};

async function get(params){ const r = await apiGet(Object.assign({key:KEY}, params)); return r; }
async function op(action, id, extra){
  try{ const r=await fetch(SITE.sheetUrl,{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify(Object.assign({type:"op",key:KEY,action,id},extra||{}))}); const j=await r.json(); return j&&j.ok; }catch(e){ return false; }
}
function toast(t, bad){ let el=$("opsToast"); if(!el){ el=document.createElement("div"); el.id="opsToast"; el.className="ops-toast"; document.body.appendChild(el); }
  el.textContent=t; el.classList.toggle("bad",!!bad); el.classList.add("on"); clearTimeout(el._t); el._t=setTimeout(()=>el.classList.remove("on"),2600); }

/* ---------- sign in ---------- */
async function signIn(pin){
  if(!SITE.sheetUrl){ return "The bookings Sheet isn't connected yet (SITE.sheetUrl is empty)."; }
  KEY=pin; const r=await get({action:"me"});
  if(!r) return "Couldn't reach the bookings Sheet. Check your internet and try again.";
  if(!r.ok) return r.error==="auth" ? "That PIN isn't right." : "Sign-in failed: "+r.error;
  ROLE=r.role; store.set("vbStaffPin",pin);
  $("login").hidden=true; $("app").hidden=false; $("who").hidden=false;
  $("roleChip").textContent = ROLE==="owner" ? "Owner" : "Washer";
  $$("[data-owner]").forEach(b=>b.hidden = ROLE!=="owner");
  show("jobs"); return null;
}
$("pinForm").addEventListener("submit", async e=>{ e.preventDefault(); const btn=e.target.querySelector("button"); btn.disabled=true;
  const err=await signIn($("ops-pin").value.trim()); btn.disabled=false;
  $("loginErr").hidden=!err; $("loginErr").textContent=err||""; });
$("signOut").addEventListener("click",()=>{ store.set("vbStaffPin",null); KEY=null; ROLE=null; $("app").hidden=true; $("who").hidden=true; $("login").hidden=false; $("ops-pin").value=""; });

/* ---------- tabs ---------- */
function show(tab){
  $$("[data-tab]").forEach(b=>b.setAttribute("aria-selected", b.dataset.tab===tab));
  $$("[data-panel]").forEach(p=>p.hidden = p.dataset.panel!==tab);
  ({jobs:loadJobs, dash:loadDash, due:loadDue, leads:loadLeads})[tab]();
}
$$("[data-tab]").forEach(b=>b.addEventListener("click",()=>show(b.dataset.tab)));

/* ---------- jobs ---------- */
$("dPick").value=DAY;
$("dPick").addEventListener("change",()=>{ DAY=$("dPick").value||todayISO(); loadJobs(); });
$("dPrev").addEventListener("click",()=>{ DAY=shift(DAY,-1); $("dPick").value=DAY; loadJobs(); });
$("dNext").addEventListener("click",()=>{ DAY=shift(DAY,1); $("dPick").value=DAY; loadJobs(); });
$("dToday").addEventListener("click",()=>{ DAY=todayISO(); $("dPick").value=DAY; loadJobs(); });
$("dRefresh").addEventListener("click",()=>loadJobs());
const pill = (t, cls) => `<span class="pill ${cls||""}">${esc(t)}</span>`;
const stCls = s => ({New:"p-new",Confirmed:"p-conf",Done:"p-done",Cancelled:"p-off"})[s]||"";
const payCls = p => /^Paid/.test(p) ? "p-done" : /pending/.test(p) ? "p-warn" : "";
let JOBS=[];
async function loadJobs(){
  const list=$("jobs"); list.innerHTML=`<p class="ops-empty">Loading ${esc(niceDate(DAY))}…</p>`; $("jobsSum").textContent="";
  const r=await get({action:"jobs", date:DAY});
  if(!r||!r.ok){ list.innerHTML=`<p class="ops-empty">Couldn't load jobs. Check your internet and tap Refresh.</p>`; return; }
  JOBS=r.jobs||[];
  const live=JOBS.filter(j=>j.status!=="Cancelled"), due=live.filter(j=>!/^Paid/.test(j.payment)).reduce((s,j)=>s+j.total,0);
  $("jobsSum").textContent = live.length ? `${live.length} job${live.length>1?"s":""} on ${niceDate(DAY)} · ${live.filter(j=>j.status==="Done").length} done · ${rupee(due)} still to collect` : "";
  if(!JOBS.length){ list.innerHTML=`<p class="ops-empty">No bookings on ${esc(niceDate(DAY))}.</p>`; return; }
  list.innerHTML=JOBS.map((j,i)=>`<article class="job${j.status==="Cancelled"?" off":""}" data-i="${i}">
    <div class="job-h"><span class="slot">${esc(j.slot)}</span>${pill(j.status,stCls(j.status))}${pill(j.payment||"After service",payCls(j.payment||""))}</div>
    <h3>${esc(j.name)} <small>${esc(j.id)}</small></h3>
    <p class="job-v"><b>${esc(j.vehicle)}</b>${j.plate?" · "+esc(j.plate):""} — ${esc(j.pkg)}${j.extras&&j.extras!=="None"?" + "+esc(j.extras):""}</p>
    <p class="job-a">${esc(j.address)}, ${esc(j.area)} ${esc(j.pin)}</p>
    ${j.notes?`<p class="job-n">Note: ${esc(j.notes)}</p>`:""}
    ${j.promo?`<p class="job-n">Offer: ${esc(j.promo)}</p>`:""}
    ${j.credit?`<p class="job-c">₹${j.credit} referral credit available — take it off the bill. <button type="button" class="copy" data-act="use_credit">Mark credit used</button></p>`:""}
    <div class="job-t"><span>Total</span><b>${rupee(j.total)}</b></div>
    <div class="job-btns">
      <a class="btn btn-ghost sm" href="tel:+91${esc(j.phone)}">Call</a>
      <a class="btn btn-ghost sm" target="_blank" rel="noopener" href="${mapUrl(j)}">Map</a>
      <a class="btn btn-wa sm" target="_blank" rel="noopener" data-wamsg="confirm" href="#">Confirm</a>
      <a class="btn btn-wa sm" target="_blank" rel="noopener" data-wamsg="remind" href="#">Reminder</a>
      <a class="btn btn-wa sm" target="_blank" rel="noopener" data-wamsg="onway" href="#">On my way</a>
    </div>
    <div class="job-btns">
      <button type="button" class="btn btn-lime sm" data-act="done"${j.status==="Done"?" disabled":""}>Job done</button>
      <button type="button" class="btn btn-ghost sm" data-act="paid_upi"${/^Paid/.test(j.payment)?" disabled":""}>Paid · UPI</button>
      <button type="button" class="btn btn-ghost sm" data-act="paid_cash"${/^Paid/.test(j.payment)?" disabled":""}>Paid · cash</button>
      <a class="btn btn-wa sm" target="_blank" rel="noopener" data-wamsg="review" href="#">Ask for review</a>
      <button type="button" class="btn btn-ghost sm danger" data-act="cancel"${j.status==="Cancelled"?" disabled":""}>Cancel</button>
    </div>
  </article>`).join("");
  $$("[data-wamsg]",list).forEach(a=>{ const j=JOBS[+a.closest(".job").dataset.i]; a.href=custWa(j.phone, MSG[a.dataset.wamsg](j)); });
}
$("jobs").addEventListener("click", async e=>{
  const w=e.target.closest("[data-wamsg]");
  if(w && w.dataset.wamsg==="confirm"){ const j=JOBS[+w.closest(".job").dataset.i]; if(j.status==="New") op("confirm", j.id).then(ok=>ok&&loadJobs()); return; }
  const b=e.target.closest("[data-act]"); if(!b) return;
  const j=JOBS[+b.closest(".job").dataset.i], act=b.dataset.act;
  if(act==="cancel" && b.dataset.sure!=="1"){ b.dataset.sure="1"; b.textContent="Tap again to cancel"; setTimeout(()=>{ b.dataset.sure=""; b.textContent="Cancel"; },3000); return; }
  b.disabled=true;
  const ok=await op(act, j.id, act==="use_credit"?{phone:j.phone}:null);
  toast(ok ? ({done:"Marked done",paid_upi:"Marked paid · UPI",paid_cash:"Marked paid · cash",cancel:"Booking cancelled",use_credit:"Credit marked used"})[act] : "Couldn't update. Check your internet and try again.", !ok);
  loadJobs();
});

/* ---------- dashboard (owner) ---------- */
async function loadDash(){
  $("tiles").innerHTML=`<p class="ops-empty">Loading…</p>`;
  const r=await get({action:"stats"}); if(!r||!r.ok){ $("tiles").innerHTML=`<p class="ops-empty">Couldn't load the dashboard.</p>`; return; }
  const s=r.stats, tile=(n,l,sub)=>`<div class="tile"><b>${n}</b><span>${l}</span>${sub?`<small>${sub}</small>`:""}</div>`;
  $("tiles").innerHTML=[tile(s.today,"Bookings today"), tile(s.upcoming,"Upcoming"), tile(s.doneWeek,"Done in 7 days"), tile(rupee(s.revenueMonth),"Collected this month"),
    tile(rupee(s.pendingAmount),"Done, not yet paid", s.pendingCount+" job"+(s.pendingCount===1?"":"s")), tile(s.customers,"Customers", s.repeat+" booked more than once")].join("");
  const max=Math.max(1,...s.last7.map(d=>d.count));
  $("bars").innerHTML=s.last7.map(d=>`<div class="bar"><i style="height:${Math.round(d.count/max*100)}%"></i><b>${d.count}</b><span>${new Date(d.date+"T12:00").toLocaleDateString("en-IN",{weekday:"short"})}</span></div>`).join("");
  $("pkgs").innerHTML=s.packages.length ? s.packages.map(p=>`<div><span>${esc(p.name)}</span><span>${p.count}</span></div>`).join("") : `<div><span>No bookings yet</span><span></span></div>`;
  const todo=[]; if(s.newLeads) todo.push(`${s.newLeads} new society lead${s.newLeads>1?"s":""} (Societies tab)`); if(s.pendingReviews) todo.push(`${s.pendingReviews} review${s.pendingReviews>1?"s":""} waiting for approval (Sheet → Reviews → tick Approved)`);
  $("todo").textContent = todo.length ? "To do: "+todo.join(" · ") : "";
}

/* ---------- due for a wash (owner) ---------- */
let DUE=[];
$("dueDays").addEventListener("change",()=>loadDue());
async function loadDue(){
  const list=$("due"); list.innerHTML=`<p class="ops-empty">Loading…</p>`;
  const r=await get({action:"due", days:$("dueDays").value}); if(!r||!r.ok){ list.innerHTML=`<p class="ops-empty">Couldn't load the list.</p>`; return; }
  DUE=r.due||[]; $("dueSum").textContent = DUE.length ? `${DUE.length} customer${DUE.length>1?"s":""} with nothing booked whose last wash was ${$("dueDays").value}+ days ago.` : "";
  if(!DUE.length){ list.innerHTML=`<p class="ops-empty">Nobody is due right now.</p>`; return; }
  list.innerHTML=DUE.map((d,i)=>`<article class="job" data-i="${i}">
    <div class="job-h"><span class="slot">${d.daysAgo} days ago</span>${pill(d.washes+" wash"+(d.washes>1?"es":""))}${d.reminded?pill("Reminded "+niceDate(d.reminded),"p-warn"):""}</div>
    <h3>${esc(d.name)}</h3><p class="job-v"><b>${esc(d.vehicle)}</b> — last: ${esc(d.pkg)} on ${esc(niceDate(d.lastDate))}</p><p class="job-a">${esc(d.area)}</p>
    <div class="job-btns"><a class="btn btn-wa sm" target="_blank" rel="noopener" data-due="${i}" href="${custWa(d.phone, MSG.rebook(d))}">Send rebook message</a><a class="btn btn-ghost sm" href="tel:+91${esc(d.phone)}">Call</a></div>
  </article>`).join("");
}
$("due").addEventListener("click", e=>{ const a=e.target.closest("[data-due]"); if(!a) return; const d=DUE[+a.dataset.due]; op("reminded", d.id).then(ok=>ok&&setTimeout(loadDue,800)); });

/* ---------- society leads (owner) ---------- */
async function loadLeads(){
  const list=$("leads"); list.innerHTML=`<p class="ops-empty">Loading…</p>`;
  const r=await get({action:"leads"}); if(!r||!r.ok){ list.innerHTML=`<p class="ops-empty">Couldn't load leads.</p>`; return; }
  const L=r.leads||[]; if(!L.length){ list.innerHTML=`<p class="ops-empty">No society requests yet.</p>`; return; }
  list.innerHTML=L.map(l=>`<article class="job"><div class="job-h"><span class="slot">${esc(niceDate(l.received))}</span>${pill(l.status||"New", l.status==="New"?"p-new":"")}</div>
    <h3>${esc(l.society)} <small>${esc(l.area)}</small></h3><p class="job-v"><b>${esc(l.name)}</b> · about ${esc(l.cars||0)} cars, ${esc(l.bikes||0)} bikes</p>
    ${l.days?`<p class="job-a">Prefers: ${esc(l.days)}</p>`:""}${l.notes?`<p class="job-n">${esc(l.notes)}</p>`:""}
    <div class="job-btns"><a class="btn btn-wa sm" target="_blank" rel="noopener" href="${custWa(l.phone, MSG.lead(l))}">WhatsApp</a><a class="btn btn-ghost sm" href="tel:+91${esc(l.phone)}">Call</a></div></article>`).join("");
}

if(KEY) signIn(KEY).then(err=>{ if(err){ store.set("vbStaffPin",null); $("loginErr").hidden=false; $("loginErr").textContent=err; } });
})();
