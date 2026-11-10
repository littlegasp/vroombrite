/* Vroombrite Staff — Studio CRM layout on Supabase (plain fetch, no libraries).
   Screens: Home, Jobs, Bookings (board/table), booking page, Customers, Inbox, Analytics, Settings, Help.
   Shows saved data instantly, refreshes in the background; buttons update at once and roll back on failure.
   PKG, PRICE, ADDONS, DETAIL, SLOTS, SIZE_LABEL, AREAS come from app.js (added by build.py);
   GUIDE and WHATS_NEW from ops-guide.js. */
(function(){
"use strict";
const BUILD_ID = /*@@BUILD@@*/"";
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
  box: ic('<path d="M3 7l9-4 9 4v10l-9 4-9-4z"/><path d="M3 7l9 4 9-4M12 11v10"/>'),
  bell2: ic('<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 20a2 2 0 0 0 4 0"/>'),
  receipt: ic('<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/>'),
  repeat: ic('<path d="M4 9a7 7 0 0 1 12-4l3 3M20 4v4h-4M20 15a7 7 0 0 1-12 4l-3-3M4 20v-4h4"/>'),
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
  search: ic('<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>'),
  qr: ic('<rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><path d="M14 14h2v2h-2zM18 18h2v2h-2zM14 18h2M18 14h2"/>'),
  play: ic('<path d="M8 5v14l11-7z"/>'),
  route: ic('<circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="6" r="2.5"/><path d="M8.5 18H15a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h6.5"/>'),
  move: ic('<path d="M4 12h14M13 6l6 6-6 6"/><path d="M5 5v14" opacity=".5"/>'),
  pin: ic('<path d="M12 21s-6-5.6-6-10a6 6 0 0 1 12 0c0 4.4-6 10-6 10z"/><circle cx="12" cy="11" r="2"/>'),
  cam: ic('<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>'),
  check: ic('<path d="M5 12.5l4.5 4.5L19 7.5"/>'),
  x: ic('<path d="M6 6l12 12M18 6L6 18"/>'),
  cash: ic('<rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6.5 9.5v5M17.5 9.5v5"/>'),
  star: ic('<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z"/>'),
  grip: ic('<path d="M9 6h.01M15 6h.01M9 12h.01M15 12h.01M9 18h.01M15 18h.01" stroke-width="3"/>'),
  rain: ic('<path d="M7 15a4.5 4.5 0 0 1 .4-9 5.5 5.5 0 0 1 10.3 1.6A3.7 3.7 0 0 1 17 15z"/><path d="M8 18l-1 2.5M12 18l-1 2.5M16 18l-1 2.5"/>'),
  arrange: ic('<path d="M8 4v16M4 8l4-4 4 4M16 20V4M12 16l4 4 4-4"/>')
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
async function fresh(){ if(session && session.expires_at*1000 - Date.now() < 60e3){ try{ await refresh(); }catch(e){ if(e instanceof TypeError) return; signedOut(); } } }
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
async function callFn(name, body){
  await fresh(); let r;
  try{ r = await fetch(URL_+"/functions/v1/"+name, {method:"POST", headers:{"Content-Type":"application/json", apikey:KEY, Authorization:"Bearer "+session.access_token}, body:JSON.stringify(body)}); }
  catch(e){ const x=new Error("No internet"); throw x; }
  const j = await r.json().catch(()=>({}));
  if(r.status===404) throw new Error(`The "${name}" function isn't set up in Supabase yet. See Help → Phone alerts.`);
  if(!r.ok) throw new Error(j.error || j.message || ("Error "+r.status));
  return j;
}
async function teamAdmin(body){
  await fresh(); let r;
  try{ r = await fetch(URL_+"/functions/v1/team-admin", {method:"POST", headers:{"Content-Type":"application/json", apikey:KEY, Authorization:"Bearer "+session.access_token}, body:JSON.stringify(body)}); }
  catch(e){ throw new Error("Couldn't reach the login manager. Check your internet. If it keeps happening: "+NOFN); }
  if(r.status===404) throw new Error(NOFN);
  const j = await r.json().catch(()=>({}));
  if(!r.ok) throw new Error(j.error || j.message || NOFN);
  return j;
}
/* Storage (job photos, private bucket) */
const BUCKET = "job-photos";
async function storage(path, opt){
  await fresh();
  const r = await fetch(URL_+"/storage/v1/"+path, Object.assign({}, opt, {headers:Object.assign({apikey:KEY, Authorization:"Bearer "+session.access_token}, (opt||{}).headers)}));
  const j = await r.json().catch(()=>null);
  if(!r.ok){ const e=new Error((j&&(j.message||j.error))||("Error "+r.status)); e.status=r.status; throw e; }
  return j;
}
const signUrls = (paths, secs) => paths.length ? storage("object/sign/"+BUCKET, {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({expiresIn:secs||3600, paths})})
  .then(list => list.map(x => ({path:x.path, url: x.signedURL ? URL_+"/storage/v1"+x.signedURL : ""}))) : Promise.resolve([]);
const removeFiles = paths => paths && paths.length ? storage("object/"+BUCKET, {method:"DELETE", headers:{"Content-Type":"application/json"}, body:JSON.stringify({prefixes:paths})}) : Promise.resolve([]);
function signedOut(){ session=null; store.set("vb.session",null); show("login"); throw new Error("signed out"); }
const quiet = e => { if(e && e.message!=="signed out" && e.status) toast(e.message, true); };

/* ============================== state ============================== */
const S = { me: store.get("vb.me"), v:"", arg:"", day: istToday(), open: new Set(), mine: store.get("vb.mine")!==false,
  bk: Object.assign({mode:"board", range:"week", washer:"", q:"", sort:"date", dir:1}, store.get("vb.bk")||{}),
  cu: {mode:"all", q:"", due:12}, inTab:"leads", an: store.get("vb.an")||"month", setTab:"team", helpQ:"", calMonth: monthStart(istToday()), setMonth: monthStart(istToday()) };
let SET = store.get("vb.c.settings") || {templates:[], notice:null, team:[]};
const cache = { get:k => store.get("vb.c."+k), set:(k,v) => store.set("vb.c."+k, v) };
const isOwner = () => !!(S.me && S.me.role==="owner");
/* Toast. With an undo ({undo, commit?}) it shows an Undo button for 6 s (shaking the phone works too);
   commit() runs when the time is up, for changes that wait before they are sent (deleting a bill). */
let UNDO=null;
function settleUndo(){ const u=UNDO; UNDO=null; if(u && u.commit) try{ u.commit(); }catch(e){} }
function toast(t, bad, undo){
  const el=$("toast"); if(UNDO && UNDO!==undo) settleUndo();
  el.innerHTML=esc(t)+(undo?`<button type="button" class="toast-undo" id="toastUndo">Undo</button>`:""); UNDO=undo||null;
  el.classList.toggle("bad",!!bad); el.classList.toggle("has-undo",!!undo); el.classList.remove("on"); void el.offsetWidth; el.classList.add("on");
  if(bad) buzz([60,50,60]);
  clearTimeout(el._t); el._t=setTimeout(()=>{ el.classList.remove("on"); if(undo && UNDO===undo) settleUndo(); }, undo?6000:bad?4200:2600);
}
function doUndo(){ const u=UNDO; if(!u) return false; UNDO=null; const el=$("toast"); clearTimeout(el._t); el.classList.remove("on"); buzz(15); u.undo(); return true; }
document.addEventListener("click", e => { if(e.target.closest("#toastUndo")) doUndo(); });
addEventListener("pagehide", settleUndo);
/* Vibration (Android; iPhones don't let web apps vibrate). Me → Feedback turns it off. */
function buzz(p){ if(store.get("vb.buzz")===false) return; try{ navigator.vibrate && navigator.vibrate(p); }catch(e){} }
/* A small effect on the thing just changed: used once, by the next drawing of that booking or row. */
const FX = new Map();
/* Added after drawing (so the screen's HTML doesn't change); a redraw while it plays carries on from where it was. */
function fx(key, kind){ const f={kind, t:Date.now()}; FX.set(key, f); setTimeout(()=>{ if(FX.get(key)===f) FX.delete(key); }, 900); applyFx(); }
const fxSel = (key, kind) => { const [a, b]=key.includes(":")?[key.slice(0,key.indexOf(":")), key.slice(key.indexOf(":")+1)]:["job", key], q=v=>CSS.escape(v);
  if(a==="job") return [`#view .job[data-id="${q(b)}"]`, `#view .jrow[data-open="${q(b)}"]`].map(s=>[s, "fx-"+kind]);
  if(a==="ck") return [[`#view [data-id="${q(b)}"] .ck:has(> input[data-check="${q(kind)}"])`, "ck-pop"]];
  if(a==="sup") return [[`#view [data-sid="${q(b)}"] .qty .num`, "bump-"+kind]];
  if(a==="bill") return [[`#view [data-eid="${q(b)}"]`, "fx-"+kind]];
  return []; };
function applyFx(){ FX.forEach((f, key) => fxSel(key, f.kind).forEach(([sel, cls]) => { try{ document.querySelectorAll(sel).forEach(el => { if(el.classList.contains(cls)) return; el.style.setProperty("--fxd", `-${Date.now()-f.t}ms`); el.classList.add(cls); }); }catch(e){} })); }

/* ============================== look: theme + folded menu ============================== */
function applyTheme(){
  const t = store.get("vb.theme") || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  document.documentElement.setAttribute("data-theme", t);
  $$("[data-themebtn]").forEach(b => { b.innerHTML = t==="dark" ? I.sun : I.moon; b.title = t==="dark" ? "Light look" : "Dark look"; });
  const meta=document.querySelector('meta[name="theme-color"]'); if(meta) meta.content = t==="dark" ? "#0D1012" : "#EDF1E8";
}
applyTheme();
matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => { if(!store.get("vb.theme")) applyTheme(); });
document.addEventListener("click", e => { const b=e.target.closest("[data-themebtn]"); if(b) themeSwap(() => { store.set("vb.theme", document.documentElement.getAttribute("data-theme")==="dark"?"light":"dark"); applyTheme(); }, b); });
if(store.get("vb.menu")==="folded") document.documentElement.setAttribute("data-menu","folded");
$("foldBtn").addEventListener("click", () => { setTimeout(()=>{ const g=$("nav").querySelector(".glide"); g._k=g._r=null; glide($("nav")); }, 260); const f=document.documentElement.getAttribute("data-menu")==="folded"; if(f) document.documentElement.removeAttribute("data-menu"); else document.documentElement.setAttribute("data-menu","folded"); store.set("vb.menu", f?null:"folded"); });
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
  {id:"plans", t:"Plans", i:I.repeat, owner:true, badge:()=>S.planCount||0},
  {id:"kit", t:"Stock & bills", i:I.box, badge:()=>S.kitCount||0},
  {id:"inbox", t:"Inbox", i:I.inbox, owner:true, badge:()=>S.inboxCount||0},
  {label:"Business", owner:true},
  {id:"analytics", t:"Analytics", i:I.chart, owner:true},
  {id:"settings", t:"Settings", i:I.cog, owner:true},
  {label:"Support"},
  {id:"help", t:"Help", i:I.help}
];
const allowed = id => id==="b" || (id==="c" && isOwner()) || NAV.some(n => n.id===id && (!n.owner || isOwner()));
const homeView = () => isOwner() ? "home" : "jobs";
function setHTML(el, h){ if(el._h!==h){ el.innerHTML=h; el._h=h; if(FX.size) applyFx(); } }
/* same for a part of a screen: writes to .innerHTML are skipped when nothing changed */
const box = el => new Proxy({}, { get:(t,k)=>{ const v=el[k]; return typeof v==="function" ? v.bind(el) : v; }, set:(t,k,v)=>{ if(k==="innerHTML") setHTML(el, v); else el[k]=v; return true; } });
/* Liquid-glass menu: one glass pill slides to the tab you're on, stretching over both on the way. */
function glide(bar){
  const g=bar && bar.querySelector(":scope > .glide"); if(!g) return;
  const on=bar.querySelector(".on:not(.tb-new)"), r=on && on.offsetWidth ? {x:on.offsetLeft, y:on.offsetTop, w:on.offsetWidth, h:on.offsetHeight} : null;
  bar.classList.toggle("has-glide", !!r);
  if(!r){ g.style.opacity=0; g._r=null; return; }
  const k=r.x+","+r.y+","+r.w+","+r.h; if(g._k===k) return; g._k=k;
  const put=(x, rr, ms)=>{ g.style.transitionDuration=ms+"ms"; g.style.width=rr.w+"px"; g.style.height=rr.h+"px"; g.style.transform=`translate(${rr.x}px,${rr.y}px)`; };
  const from=g._r, moved=from && (from.x!==r.x || from.y!==r.y), sameSize=from && from.w===r.w && from.h===r.h;
  g.style.opacity=1; clearTimeout(g._t);
  if(!from || !moved || !sameSize || matchMedia("(prefers-reduced-motion:reduce)").matches){ put(0, r, from&&!moved?200:0); }
  else {   // stretch over both, then settle on the new one
    const x=Math.min(from.x, r.x), y=Math.min(from.y, r.y);
    put(0, {x, y, w:Math.max(from.x+from.w, r.x+r.w)-x, h:Math.max(from.y+from.h, r.y+r.h)-y}, 170);
    g._t=setTimeout(()=>put(0, r, 260), 150);
    const ic=on.querySelector("svg"); if(ic){ ic.classList.remove("hop"); void ic.offsetWidth; ic.classList.add("hop"); }
  }
  g._r=r;
}
/* Phone bar: the tab you're on rises into a lime button that floats on a wave in the bar's top edge.
   When you change tab the button glides over, the wave follows it like water and settles with a little wobble. */
const SEA_T=28, canWave = typeof CSS!=="undefined" && CSS.supports && CSS.supports("clip-path", "path('M0 0H1V1Z')");
const SEA={x:null, v:0, tx:0, h:0, hv:0, s:30, raf:0, last:0};
function seaPath(W, H, c, h, s){
  const T=SEA_T, R=Math.min(22, H/2), pts=[];
  const top=x => { let y=T; if(x<R) y=T+R-Math.sqrt(Math.max(0, R*R-(R-x)*(R-x))); else if(x>W-R) y=T+R-Math.sqrt(Math.max(0, R*R-(x-(W-R))*(x-(W-R)))); const u=(x-c)/s; return y - h*Math.exp(-u*u); };
  for(let x=0; x<=W; x+=3) pts.push(x.toFixed(1)+","+top(x).toFixed(1)); pts.push(W+","+top(W).toFixed(1));
  return `M0,${T+R} L${pts.join(" L")} L${W},${T+H-R} A${R},${R} 0 0 1 ${W-R},${T+H} L${R},${T+H} A${R},${R} 0 0 1 0,${T+H-R} Z`;
}
function seaDraw(){
  const bar=$("tabbar"), W=bar.offsetWidth, H=bar.offsetHeight; if(!W) return;
  const d=seaPath(W, H, SEA.x, SEA.h, SEA.s), sea=bar.querySelector(".tb-sea");
  sea.querySelector(".tb-bg").style.clipPath=`path('${d}')`;
  sea.querySelectorAll("svg").forEach(g=>{ g.setAttribute("viewBox", `0 0 ${W} ${H+SEA_T}`); g.setAttribute("width", W); g.setAttribute("height", H+SEA_T); g.firstElementChild.setAttribute("d", d); });
  const f=bar.querySelector(".fbtn"); f.style.transform=`translate(${SEA.x}px,${(-(SEA.h-18)*.9).toFixed(1)}px)`;
}
function seaStep(t){
  const dt=Math.min(.033, (t-(SEA.last||t))/1000)||.016; SEA.last=t;
  const ax=240*(SEA.tx-SEA.x)-24*SEA.v; SEA.v+=ax*dt; SEA.x+=SEA.v*dt;
  const speed=Math.abs(SEA.v), hTarget=18-Math.min(8, speed/70), ah=260*(hTarget-SEA.h)-7*SEA.hv; SEA.hv+=ah*dt; SEA.h+=SEA.hv*dt;
  SEA.s=34+Math.min(18, speed/45);
  seaDraw();
  if(Math.abs(SEA.tx-SEA.x)<.3 && speed<1 && Math.abs(18-SEA.h)<.15 && Math.abs(SEA.hv)<1){ SEA.x=SEA.tx; SEA.v=0; SEA.h=18; SEA.hv=0; SEA.s=34; seaDraw(); SEA.raf=0; SEA.last=0; return; }
  SEA.raf=requestAnimationFrame(seaStep);
}
function floatBtn(){
  const bar=$("tabbar"), f=bar && bar.querySelector(":scope > .fbtn"); if(!f) return;
  const on=bar.querySelector("button.on:not(.tb-new)"), vis=!!(on && on.offsetWidth);
  bar.classList.toggle("has-float", vis); bar.classList.toggle("has-sea", vis && canWave);
  if(!vis){ f.style.opacity=0; f._k=null; SEA.x=null; return; }
  const x=on.offsetLeft+on.offsetWidth/2, k=x+"|"+on.dataset.tab+"|"+bar.offsetWidth; if(f._k===k) return; f._k=k;
  const b=f.firstElementChild, icon=on.querySelector("svg").outerHTML, first=SEA.x==null; f.style.opacity=1; SEA.tx=x;
  if(first || matchMedia("(prefers-reduced-motion:reduce)").matches){ cancelAnimationFrame(SEA.raf); SEA.raf=0; Object.assign(SEA, {x, v:0, h:18, hv:0, s:34}); b.innerHTML=icon; seaDraw(); return; }
  if(Math.abs(x-SEA.x)>1){ SEA.hv-=60; buzz(6); }      // the wave dips as it sets off
  clearTimeout(f._t); b.classList.add("swap"); f._t=setTimeout(()=>{ b.innerHTML=icon; b.classList.remove("swap"); }, 170);
  if(!SEA.raf) SEA.raf=requestAnimationFrame(seaStep);
}
addEventListener("resize", () => { const f=$("tabbar").querySelector(".fbtn"); if(f) f._k=null; SEA.x=null; floatBtn(); });
addEventListener("resize", () => { ["tabbar","nav"].forEach(id=>{ const g=$(id).querySelector(".glide"); if(g){ g._k=null; g._r=null; } glide($(id)); }); });
function drawNav(){
  const cur = S.v==="b" ? (S.from||"bookings") : S.v==="c" ? "plans" : S.v;
  setHTML($("navRow"), NAV.filter(n => !n.owner || isOwner()).map(n => n.label ? `<div class="nav-label">${n.label}</div>`
    : `<button type="button" class="nav-link${n.id===cur?" on":""}" data-go="${n.id}" title="${n.t}"><span class="nav-ic">${n.i}</span><span class="nav-tx">${n.t}</span>${n.badge&&n.badge()?`<span class="nav-badge">${n.badge()}</span>`:""}</button>`).join(""));
  const tabs = isOwner()
    ? [["home","Home",I.home],["jobs","Jobs",I.jobs],["new","New",I.plus],["bookings","Bookings",I.board],["more","More",I.menu]]
    : [["jobs","Jobs",I.jobs],["bookings","Bookings",I.board],["new","New",I.plus],["help","Help",I.help],["more","Me",I.user]];
  const inMore = ["customers","plans","kit","inbox","analytics","settings"].concat(isOwner()?["help"]:[]);
  setHTML($("tabRow"), tabs.map(([id,l,i]) => `<button type="button" data-tab="${id}" class="${id==="new"?"tb-new":""}${id===cur||(id==="more"&&inMore.includes(cur))?" on":""}">${i}<span>${l}</span>${id==="more"&&S.inboxCount?`<i class="tb-dot">${S.inboxCount}</i>`:""}${id==="home"&&S.attnCount?`<i class="tb-dot">${S.attnCount}</i>`:""}</button>`).join(""));
  floatBtn(); glide($("nav"));
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
  openSheet("More", `<div class="more-grid">${NAV.filter(n=>n.id && ["customers","plans","kit","inbox","analytics","settings","help"].includes(n.id)).map(n=>`<button class="btn" type="button" data-go="${n.id}">${n.i}<span>${n.t}</span>${n.badge&&n.badge()?`<span class="nav-badge">${n.badge()}</span>`:""}</button>`).join("")}
    <button class="btn" type="button" data-account>${I.user}<span>My account</span></button></div>`);
}
function go(path){ const h="#"+path; if(location.hash===h) route(); else location.hash=h; }
addEventListener("hashchange", () => { ARR=false; closeSwipe(); route(); drawLive(); });
function route(){
  if($("shell").hidden) return;
  const [v, ...rest] = location.hash.slice(1).split("/"); const arg = decodeURIComponent(rest.join("/"));
  let view = v || homeView(); if(!allowed(view)) view = homeView();
  if(view==="b" && S.v!=="b") S.from = S.v || homeView();
  S.v=view; S.arg=arg; closePop(); drawNav();
  if(view==="settings" && arg) S.setTab=arg;
  const fn = {home:vHome, jobs:vJobs, bookings:vBookings, b:vBooking, c:vContract, plans:vPlans, kit:vKit, customers:vCustomers, inbox:vInbox, analytics:vAnalytics, settings:vSettings, help:vHelp}[view];
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
  const y = scrollY; el.innerHTML = html; el._h = html; if(root){ SWO=null; drawLive(); } applyFx();
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
/* Tabs (.seg): the tapped one is marked at once, even when a screen only redraws the part below its toolbar. */
document.addEventListener("click", e => { const b=e.target.closest(".seg > button"); if(!b || b.disabled) return;
  b.parentElement.querySelectorAll(":scope > button").forEach(x=>{ x.classList.toggle("on", x===b); if(x.hasAttribute("aria-pressed")) x.setAttribute("aria-pressed", x===b); }); }, true);
const skel = (n, h) => Array.from({length:n||3}, () => `<div class="skel" style="height:${h||90}px"></div>`).join("");

/* ============================== sheet, pop ============================== */
let sheetFor=null;
function openSheet(title, html, id){ sheetFor=id||null; if(typeof sheetReset==="function" && !SD) sheetReset(); $("sheetTitle").textContent=title; $("sheetBody").innerHTML=html; $("sheet").hidden=false; $("sheet").querySelector(".sheet-panel").scrollTop=0; }
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
  confirm:["Confirm booking","Hi {first_name}, this is {brand}. Your {package} for your {vehicle} is confirmed for {date}, {slot}. We'll message you when we're on the way.\nBooking ID: {id}\nSee, move or cancel it here: {track_link}"],
  remind:["Reminder","Hi {first_name}, a reminder from {brand}: your {package} is on {date}, {slot}, at {address}. Please keep the vehicle accessible. Reply here to reschedule."],
  onway:["On my way","Hi {first_name}, your {brand} washer is on the way and will reach in about 20 minutes."],
  review:["Ask for a review","Hi {first_name}, thank you for choosing {brand}! How did we do? Rate your wash here, it takes 20 seconds: {review_link}"],
  rebook:["Rebook (due customers)","Hi {first_name}, it's been {days} days since your last {brand} wash. Shall we book your {package} again? Reply with a day and time that suits you, or book here: {book_link}"],
  lead:["Society request","Hi {first_name}, this is {brand}. Thanks for your society quote request for {society}. When can we visit to see the parking and share a group price?"],
  enquiry:["Reply to a message","Hi {first_name}, this is {brand}. Thanks for your message. "],
  moved:["Moved (rain day)","Hi {first_name}, this is {brand}. Because of the weather we've moved your {package} to {date}, {slot}. If that doesn't suit you, reply here with a better day and time. Sorry for the change!"],
  plan_renew:["Plan renewal","Hi {first_name}, this is {brand}. Your {plan} plan ends on {end}. Shall we continue next month? It's {price} for {washes}. Just reply YES and we'll keep the same days and time."],
  plan_pay:["Plan payment due","Hi {first_name}, a gentle reminder from {brand}: {price} for your {plan} plan ({period}) is due. You can pay by UPI to {upi}. Thank you!"],
  receipt:["Receipt","Hi {first_name}, thank you for choosing {brand}! Here is your receipt for {amount}: {link}"],
  moved_by_customer:["Customer moved it","Hi {first_name}, got it, your {package} is now on {date}, {slot}. See or change it here: {track_link}"],
  noanswer:["Couldn't reach you","Hi {first_name}, this is {brand}. We tried calling about your {package} on {date}. Please reply here or call us back when free."]
};
function templates(){ const map={}; Object.keys(DEFAULT_T).forEach((k,i)=>map[k]={key:k,title:DEFAULT_T[k][0],body:DEFAULT_T[k][1],position:i}); (SET.templates||[]).forEach(t=>map[t.key]=t); return Object.values(map).sort((a,b)=>a.position-b.position); }
function fill(key, ctx){ const t=templates().find(x=>x.key===key);
  return (t?t.body:"").replace(/\{(\w+)\}/g, (m,k) => ctx[k]!=null && ctx[k]!=="" ? ctx[k] : m)
    .split("\n").filter(l=>!l.includes("{track_link}")).join("\n"); }   // no link yet (older booking): leave that line out
const jobCtx = j => ({first_name:first(j.name), name:j.name, brand:SITE.name, package:j.package, vehicle:vehShort(j.vehicle).toLowerCase(), date:fmtDay(j.wash_date), slot:j.slot,
  address:[j.address, j.area].filter(Boolean).join(", "), id:j.id, total:rupee(j.total), review_link:BASE+"review.html?b="+encodeURIComponent(j.id), book_link:BASE+"book.html", track_link:trackLink(j)});
const trackLink = j => j.track_key ? BASE+"track.html?b="+encodeURIComponent(j.id)+"&k="+j.track_key : "";
const MSG_ACTION = {confirm:"confirm", onway:"on_way", review:"review_asked", remind:"reminded"};

/* ============================== bookings: shared bits ============================== */
const SOURCE = {website:"Website", phone:"Phone", whatsapp:"WhatsApp", walk_in:"Walk-in", society:"Society", instagram:"Instagram", repeat:"Repeat", other:"Other"};
const isPaid = j => /^paid/.test(j.payment) || j.payment==="covered";
const planTag = j => j.plan ? `${esc(j.plan.kind==="society"?"Society":j.plan.name||"Plan")} · visit ${j.plan.n} of ${j.plan.of}` : "Plan";
const colOf = j => j.status==="cancelled" ? "cancelled" : j.status==="done" ? (isPaid(j)?"done":"collect") : j.status;
const PILL = {new:["st-new","New"], confirmed:["st-confirmed","Confirmed"], on_way:["st-on_way","On the way"], collect:["st-collect","To collect"], done:["st-done","Done"], cancelled:["st-cancelled","Cancelled"]};
const pill = j => { const p=PILL[colOf(j)]; return `<span class="pill ${p[0]}">${p[1]}</span>`; };
const payPill = j => j.payment==="covered" ? `<span class="pill st-plan">${planTag(j)}</span>` : isPaid(j) ? `<span class="pill st-done">${j.payment==="paid_upi"?"Paid · UPI":"Paid · cash"}</span>` : j.payment==="refunded" ? `<span class="tag">Refunded</span>` : j.pay_mode==="online" ? `<span class="pill st-collect">UPI pending</span>` : `<span class="tag">Pay after</span>`;
const ord = n => n+(["th","st","nd","rd"][(n%100>10&&n%100<14)?0:n%10]||"th");
function nextStep(j, big){
  const lg = big?" lg":"";
  if(j.status==="cancelled") return `<button class="btn${lg}" data-act="reopen">Reopen booking</button>`;
  if(j.status==="new") return `<a class="btn wa${lg}" data-act="confirm" target="_blank" rel="noopener" href="${wa(j.phone, fill("confirm", jobCtx(j)))}">Confirm on WhatsApp</a>`;
  if(j.status==="confirmed") return `<a class="btn wa${lg}" data-act="on_way" target="_blank" rel="noopener" href="${wa(j.phone, fill("onway", jobCtx(j)))}">Send "On my way"</a>`;
  if(j.status==="on_way") return j.started_at ? `<button class="btn primary${lg}" data-act="done">Mark washed <span class="timer">· ${mins(j.started_at)}</span></button>`
    : `<button class="btn primary${lg}" type="button" data-timer="start">${I.play}Start wash</button><button class="btn${lg}" data-act="done">Mark washed</button>`;
  if(!isPaid(j)) return `<button class="btn${lg}" type="button" data-qr>${I.qr}UPI QR</button><button class="btn coral${lg}" data-act="paid_upi">Paid by UPI</button><button class="btn coral${lg}" data-act="paid_cash">Paid in cash</button>`;
  if(!j.review_asked_at) return `<a class="btn${lg}" data-act="review_asked" target="_blank" rel="noopener" href="${wa(j.phone, fill("review", jobCtx(j)))}">Ask for a review</a>`;
  return `<button class="btn${lg}" disabled>All done ✓</button>`;
}
const mins = iso => { const m=Math.max(0,Math.round((Date.now()-new Date(iso))/6e4)); return m<60 ? m+" min" : Math.floor(m/60)+" h "+(m%60)+" min"; };
const took = j => j.started_at && j.done_at ? Math.round((new Date(j.done_at)-new Date(j.started_at))/6e4) : null;
const nextLabel = j => j.status==="cancelled" ? "Cancelled" : j.status==="new" ? "Confirm with the customer" : j.status==="confirmed" ? "Leave for the job" : j.status==="on_way" ? "Finish the wash" : !isPaid(j) ? "Collect "+rupee(j.total) : !j.review_asked_at ? "Ask for a review" : "All done";
function steps(j){ const n = j.status==="cancelled" ? 0 : ({new:0, confirmed:1, on_way:2, done:3})[j.status] + (isPaid(j)?1:0); return `<ol class="steps">${["Confirmed","On the way","Washed","Paid"].map((s,i)=>`<li class="${i<n?"on":""}">${s}</li>`).join("")}</ol>`; }
const discLabel = j => j.promo==="REFERRAL" ? "Referral" : j.promo==="MANUAL" ? ("Discount"+(j.promo_note?" · "+j.promo_note:"")) : j.promo;
function card(j, hero){
  return `<article class="job${hero?" hero":""}" data-id="${esc(j.id)}">
    <div class="job-top"><span class="slot">${esc(j.slot)}</span>${j.status==="new"?'<span class="pill st-new">New</span>':""}${j.visits>0?`<span class="pill st-confirmed">${ord(j.visits+1)} visit</span>`:""}${payPill(j)}</div>
    <h3><button type="button" data-open="${esc(j.id)}">${esc(j.name)}</button> <small>${esc(j.id)}</small></h3>
    <p class="veh"><b>${esc(j.vehicle)}</b>${j.plate?" · "+esc(j.plate):""} — ${esc(j.package)}${j.extras?" + "+esc(j.extras):""}</p>
    <p class="addr">${I.map}<span>${esc([j.address,j.area].filter(Boolean).join(", "))} ${esc(j.pin)}</span></p>
    ${j.assigned_name||(j.source&&j.source!=="website")?`<p class="meta">${j.assigned_name?`<span>Washer: <b>${esc(j.assigned_name)}</b></span>`:""}${j.source&&j.source!=="website"?`<span>From: ${esc(SOURCE[j.source]||j.source)}</span>`:""}</p>`:""}
    ${j.cust_note?`<p class="note saved">${I.pin}<span>${esc(j.cust_note)}</span></p>`:""}${j.notes?`<p class="note">${esc(j.notes)}</p>`:""}
    ${j.status==="on_way"?checkHTML(j, true):""}
    ${j.credit>0 && j.status!=="cancelled"?`<div class="credit"><span>${rupee(j.credit)} referral credit — take it off the bill</span><button class="btn sm" data-act="use_credit">Mark used</button></div>`:""}
    ${j.payment==="covered"?`<div class="money covered"><span>${j.plan?`${j.plan.left} visit${j.plan.left===1?"":"s"} left this month`:""}${isOwner()&&j.plan&&j.plan.pay==="pending"?' · <b class="warn-tx">month not paid</b>':""}</span><b>Nothing to collect</b></div>`
      :`<div class="money"><span>${j.discount>0?esc(discLabel(j))+" −"+rupee(j.discount):"To collect"}</span><b class="num">${j.discount>0?`<s>${rupee(j.subtotal)}</s>`:""}${rupee(j.total)}</b></div>`}
    ${steps(j)}
    <div class="next">${nextStep(j, true)}</div>
    <div class="quick"><a class="btn" href="${tel(j.phone)}" data-call>${I.call}Call</a><a class="btn" target="_blank" rel="noopener" href="${mapUrl(j)}">${I.map}Map</a><button class="btn" type="button" data-chat>${I.chat}Chat</button><button class="btn" type="button" data-open="${esc(j.id)}">${I.more}Open</button></div>
  </article>`;
}
function jrow(j, showDate){
  const cls = j.status==="cancelled" ? " off" : (j.status==="done" && isPaid(j)) ? " done" : "";
  return `<button type="button" class="jrow${cls}" data-open="${esc(j.id)}"><span class="rt">${esc(showDate?relDay(j.wash_date):j.slot)}</span>
    <span class="lr-main"><b>${esc(j.name)}</b><span>${esc(vehShort(j.vehicle))} · ${esc(j.package)}${j.area?" · "+esc(j.area):""}${j.assigned_name?" · "+esc(first(j.assigned_name)):""}</span></span>
    <span class="lr-end"><b class="num">${j.payment==="covered"?'<span class="muted small">Plan</span>':rupee(j.total)}</b>${pill(j)}</span></button>`;
}

/* one store of bookings for every screen */
const JOBS = new Map(), PINGED = new Set();
let SINCE = store.get("vb.since"), NOTES = store.get("vb.notes")||[];
function remember(list, live){
  const fresh=[]; let newest = SINCE;
  (list||[]).forEach(j => { JOBS.set(j.id, withQueued(j)); if(live && SINCE && j.created_at > SINCE) fresh.push(j); if(!newest || j.created_at > newest) newest = j.created_at; });
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
/* Offline: a change made without internet waits on this phone (in order) and is sent when the internet is back. */
let QUEUE = store.get("vb.queue")||[], flushing=false;
const netDown = e => !!e && !e.status && e.message!=="signed out";
function saveQueue(){ store.set("vb.queue", QUEUE); drawSync(); }
function queueAdd(item){ QUEUE.push(Object.assign({at:new Date().toISOString()}, item)); saveQueue(); }
function withQueued(j){ QUEUE.forEach(q => { if(q.id!==j.id) return; if(q.fn==="staff_update" && OPTIMISTIC[q.action]) j=Object.assign({}, j, OPTIMISTIC[q.action](j)); else if(q.patch) j=Object.assign({}, j, q.patch); }); return j; }
function drawSync(){ const b=$("syncBar"); if(!b) return; const n=QUEUE.length; b.hidden=!n; if(n) $("syncTx").textContent=`${n} change${n>1?"s":""} saved on this phone. ${n>1?"They":"It"} will sync when the internet is back.`; hudVis(); }
async function flush(){
  if(flushing || !QUEUE.length || !session) return; flushing=true; let sent=0;
  try{
    while(QUEUE.length){
      const q=QUEUE[0];
      try{
        if(q.fn==="staff_update"){ const f=await rpc("staff_update",{p_id:q.id, p_action:q.action}); QUEUE.shift(); JOBS.set(f.id, withQueued(f)); }
        else { const r=await rpc(q.fn, q.args); QUEUE.shift(); if(r && r.id && r.wash_date) JOBS.set(r.id, withQueued(r)); }
        sent++;
      }catch(e){
        if(netDown(e) || e.message==="signed out") break;            // still offline: keep it for later
        QUEUE.shift(); toast(`Couldn't save "${q.label}" for ${q.name||q.id}: ${e.message}`, true);   // refused by the server: drop it
      }
      saveQueue();
    }
  } finally { flushing=false; saveQueue(); }
  if(sent){ toast(`Synced ${sent} change${sent>1?"s":""}`); HIST={}; redraw(); if(S.v==="b") loadHist(S.arg); }
}
/* A note, call or message for the history: sent now, or kept for later when offline. */
function logLater(id, kind, detail, label){
  const save = () => queueAdd({fn:"staff_log", id, name:(JOBS.get(id)||{}).name, label:label||"Note", args:{p_id:id, p_kind:kind, p_detail:detail}});
  if(QUEUE.length){ save(); flush(); return Promise.resolve("queued"); }
  return rpc("staff_log",{p_id:id, p_kind:kind, p_detail:detail}).then(()=>"ok", e => { if(netDown(e)){ save(); return "queued"; } throw e; });
}
window.addEventListener("online", () => flush());
/* A change to one booking (timer, checklist…): shown at once, sent now or kept for later when offline, rolled back if refused. */
async function bookCall(id, fn, args, patch, label){
  const before=JOBS.get(id); if(!before) return false;
  JOBS.set(id, Object.assign({}, before, patch)); redraw();
  const later = () => { queueAdd({fn, args, id, patch, name:before.name, label}); return "queued"; };
  if(QUEUE.length){ later(); flush(); return "queued"; }
  try{ const r=await rpc(fn, args); if(r && r.id) JOBS.set(r.id, withQueued(r)); redraw(); return "ok"; }
  catch(e){ if(e.message==="signed out") return false; if(netDown(e)) return later(); JOBS.set(id, before); redraw(); toast(e.message||"Couldn't save", true); return false; }
}
/* Undo for the taps that are easy to make by mistake: paid, washed, cancelled. */
const UNDO_ACT = {paid_upi:["unpaid"], paid_cash:["unpaid"], done:["reopen","on_way"], cancel:["reopen"]};
const UNDO_MSG = {paid_upi:"Payment undone", paid_cash:"Payment undone", done:"Back to On the way", cancel:"Booking reopened"};
function undoFor(id, action){ const back=UNDO_ACT[action]; if(!back) return null;
  return {undo: async () => { for(const a of back){ if(!await act(id, a, null, {quiet:true})) return; } fx(id, "undo"); redraw(); toast(UNDO_MSG[action]); }}; }
async function act(id, action, from, opt){
  const before = JOBS.get(id); if(!before) return false; const quiet = opt && opt.quiet;
  JOBS.set(id, Object.assign({}, before, OPTIMISTIC[action](before)));
  if(!quiet){ fx(id, /^paid/.test(action)?"paid":action); buzz(/^paid/.test(action)?[18,40,18]:action==="done"?25:12); }
  redraw(); if(!quiet) toast(DONE_MSG[action] + (/^paid/.test(action)?" · "+rupee(before.total):""), false, undoFor(id, action));
  if(/^paid/.test(action) && !quiet) celebrate(from);
  const later = () => { queueAdd({fn:"staff_update", id, action, name:before.name, label:DONE_MSG[action]}); if(!quiet) toast(DONE_MSG[action]+" · saved on this phone, will sync when online", false, undoFor(id, action)); return true; };
  if(QUEUE.length){ later(); flush(); return true; }
  try{ const f = await rpc("staff_update", {p_id:id, p_action:action}); JOBS.set(id, f); delete HIST[id]; redraw(); if(S.v==="b") loadHist(id); if(/paid|unpaid/.test(action)) loadCash(); return true; }
  catch(e){ if(e.message==="signed out") return false; if(netDown(e)) return later(); JOBS.set(id, before); redraw(); toast(e.message||"Couldn't save. Try again.", true); return false; }
}
document.addEventListener("click", e => {
  const host = e.target.closest("[data-id]"), a = e.target.closest("[data-act]");
  if(a && host){
    if(a.dataset.act==="cancel"){ e.preventDefault(); return cancelSheet(host.dataset.id); }
    act(host.dataset.id, a.dataset.act, a); if(a.tagName==="BUTTON") e.preventDefault(); if(a.closest("#sheet")) closeSheet(); return;
  }
  if(host && e.target.closest("[data-chat]")) return chatSheet(host.dataset.id);
  if(host && e.target.closest("[data-call]")) return setTimeout(()=>callSheet(host.dataset.id), 400);
  const o = e.target.closest("[data-open]"); if(o && !o.classList.contains("jrow-inplace")){ closeSheet(); closePop(); go("b/"+encodeURIComponent(o.dataset.open)); }
});
const DRAW = () => ({home:dHome, jobs:dJobs, bookings:dBookings, b:dBooking, c:dContract});
function redraw(){ const f=DRAW()[S.v]; if(f) f(); drawLive(); }

/* celebration (Studio "booked" confetti) */
function celebrate(from){
  const r = from && from.getBoundingClientRect ? from.getBoundingClientRect() : {left:innerWidth/2, top:innerHeight/2, width:0, height:0};
  const cx=r.left+r.width/2, cy=r.top+r.height/2, cols=["#C9F36A","#55D6C2","#FF895C","#9BCB2E","#F7F8F5"];
  for(let i=0;i<26;i++){ const d=document.createElement("i"); d.className="confetti"; const a=Math.random()*Math.PI*2, s=60+Math.random()*120;
    d.style.cssText=`left:${cx}px;top:${cy}px;background:${cols[i%5]};--x:${Math.cos(a)*s}px;--y:${Math.sin(a)*s-60}px;--r:${Math.random()*720-360}deg`; document.body.appendChild(d); setTimeout(()=>d.remove(),1200); }
}

/* ============================== PLANS & SOCIETIES (owner) ============================== */
let PLANS_L=store.get("vb.plans")||null, CT={}, PTAB="plan";
const WD=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"], wdText = a => (a||[]).length===7 ? "Every day" : (a||[]).map(d=>WD[d-1]).join(", ");
async function loadPlans(){ try{ PLANS_L=await rpc("owner_contracts"); store.set("vb.plans",PLANS_L); S.planCount=PLANS_L.filter(c=>c.status==="active" && (c.renew||c.due>0)).length; drawNav(); }catch(e){ quiet(e); } }
async function vPlans(){ dPlans(); await loadPlans(); if(S.v==="plans") dPlans(); }
function prog(done, total){ return `<div class="prog sm"><i style="width:${total?Math.round(done/total*100):0}%"></i></div>`; }
function cRow(c){
  const cur=c.cur, payPill = c.due>0 ? `<span class="pill st-collect">Due ${rupee(c.due)}</span>` : cur ? `<span class="pill st-done">Paid</span>` : "";
  const renew = c.status==="active" && c.renew ? `<span class="pill st-new">${c.last_end?"Ends "+relDay(c.last_end).toLowerCase():"Start first month"}</span>` : "";
  return `<button type="button" class="list-row c-row" data-go="c/${c.id}"><span class="lr-main"><b>${esc(c.name)} ${c.status==="ended"?'<span class="tag">Ended</span>':""}</b>
    <span>${esc(c.kind==="society"?c.vehicles+" vehicles":(c.vehicle||"")+(c.plate?" · "+c.plate:""))} · ${esc(c.plan_name||"")} · ${wdText(c.weekdays)}, ${esc(c.slot)}${c.assigned_name?" · "+esc(first(c.assigned_name)):""}</span>
    ${cur?`<span class="c-prog">${prog(cur.done, cur.planned)}<small>${cur.done}/${cur.planned} washed · ${fmtDay(cur.period_start,{day:"numeric",month:"short"})} – ${fmtDay(cur.period_end,{day:"numeric",month:"short"})}</small></span>`:""}</span>
    <span class="lr-end"><b class="num">${rupee(c.price)}<small>/month</small></b><span class="row" style="gap:4px;justify-content:flex-end">${renew}${payPill}</span></span></button>`;
}
function dPlans(){
  if(S.v!=="plans") return;
  const all=PLANS_L||[], list=all.filter(c=>c.kind===PTAB), act=list.filter(c=>c.status==="active"), ended=list.filter(c=>c.status!=="active");
  const n=k=>all.filter(c=>c.kind===k && c.status==="active").length, mrr=all.filter(c=>c.status==="active").reduce((a,c)=>a+c.price,0), due=all.reduce((a,c)=>a+(c.due||0),0);
  let html = pageHead("Plans", "Monthly plans and society contracts", `<button class="btn" type="button" data-cnew="society">${I.plus}Society</button><button class="btn primary" type="button" data-cnew="plan">${I.plus}Plan</button>`)
    + `<div class="seg"><button type="button" data-ptab="plan" class="${PTAB==="plan"?"on":""}">Customer plans<em>${n("plan")||""}</em></button><button type="button" data-ptab="society" class="${PTAB==="society"?"on":""}">Societies<em>${n("society")||""}</em></button></div>`;
  if(!PLANS_L){ V().innerHTML = html + skel(3,90); return; }
  html += `<div class="grid grid-kpi">${kpi("Active",act.length)}${kpi("Monthly value",rupee(mrr),"all active plans and societies")}${kpi("Payment due",rupee(due),"",due?"warn":"")}${kpi("Need next month",all.filter(c=>c.status==="active"&&c.renew).length,"ends in 3 days or less")}</div>`;
  html += act.length ? `<section class="card"><div class="list">${act.map(cRow).join("")}</div></section>`
    : `<section class="card empty"><b>No ${PTAB==="plan"?"customer plans":"society contracts"} yet</b>${PTAB==="plan"?"When a customer takes a monthly plan, add it here. The app books all the month's washes on their fixed days.":"When a society says yes, add its vehicles and days here, or tap Start contract on its request in Inbox."}<div style="margin-top:14px"><button class="btn primary" type="button" data-cnew="${PTAB}">${I.plus}${PTAB==="plan"?"New plan":"New society contract"}</button></div></section>`;
  if(ended.length) html += `<details class="card"><summary class="small muted"><b>Ended · ${ended.length}</b> · tap to show</summary><div class="list">${ended.map(cRow).join("")}</div></details>`;
  V().innerHTML = html;
}
document.addEventListener("click", e => {
  const t=e.target.closest("[data-ptab]"); if(t){ PTAB=t.dataset.ptab; dPlans(); }
  const n=e.target.closest("[data-cnew]"); if(n) contractForm(null, {kind:n.dataset.cnew});
  const l=e.target.closest("[data-lead2c]"); if(l){ const x=(INB&&INB.leads||[]).find(y=>String(y.id)===l.dataset.lead2c); if(x) contractForm(null, {kind:"society", name:x.society, contact_name:x.contact_name, phone:x.phone, area:x.area, pin:x.pin, notes:[x.days?"Prefers: "+x.days:"", x.notes].filter(Boolean).join(" · "), lead_id:x.id, cars:x.cars, bikes:x.bikes}); }
});

/* one plan / society */
async function vContract(){ dContract(); try{ CT[S.arg]=await rpc("owner_contract",{p_id:+S.arg}); remember(CT[S.arg].visits); if(S.v==="c") dContract(); }catch(e){ quiet(e); if(S.v==="c" && !CT[S.arg]) V().innerHTML=pageHead("Not found","","","Back"); } }
const cCtx = (c, per) => ({first_name:first(c.contact_name||c.name), name:c.name, brand:SITE.name, plan:c.plan_name||"monthly", end:per?fmtDay(per.period_end,{day:"numeric",month:"short"}):"",
  price:rupee(per?per.price:c.price), washes:c.kind==="society"?wdText(c.weekdays).toLowerCase()+" washes":c.washes+" washes", period:per?`${fmtDay(per.period_start,{day:"numeric",month:"short"})} – ${fmtDay(per.period_end,{day:"numeric",month:"short"})}`:"", upi:SITE.upiId});
function dContract(){
  if(S.v!=="c") return; const c=CT[S.arg];
  if(!c){ V().innerHTML = pageHead("Plan", "Loading…", "", "Back") + skel(2,200); return; }
  const cur=c.cur, last=(c.periods||[])[0], visits=(c.visits||[]).map(j=>JOBS.get(j.id)||j), up=visits.filter(j=>j.wash_date>=istToday() && j.status!=="cancelled"), active=c.status==="active";
  const dueP=(c.periods||[]).filter(p=>p.payment==="pending" && p.period_start<=istToday());
  V().innerHTML = `<div style="display:flex;flex-direction:column;gap:16px" data-cid="${c.id}">` + pageHead(esc(c.name), `${c.kind==="society"?"Society contract":"Monthly plan"} · ${esc(c.plan_name||"")} · since ${fmtDay(c.start_date,{day:"numeric",month:"short",year:"numeric"})}`,
      `${c.status==="ended"?'<span class="tag">Ended</span>':'<span class="pill st-done">Active</span>'}<button class="btn sm" type="button" data-cedit>Edit</button>`, "Back")
    + `<div class="split"><div class="wide">
      <section class="dark-card"><div class="label">${cur?(cur.period_start>istToday()?"Next month":"This month"):"No month started"}</div>
        ${cur?`<div class="big" style="font-size:22px">${fmtDay(cur.period_start,{day:"numeric",month:"short"})} – ${fmtDay(cur.period_end,{day:"numeric",month:"short"})}</div>
          ${prog(cur.done,cur.planned)}<div class="muted small">${cur.done} of ${cur.planned} washed · ${cur.left} to go</div>
          <div class="row">${cur.payment==="pending"?`<span class="pill st-collect">${rupee(cur.price)} not paid</span><button class="btn coral sm" type="button" data-cpay="${cur.id}" data-how="paid_upi">Paid by UPI</button><button class="btn coral sm" type="button" data-cpay="${cur.id}" data-how="paid_cash">Paid in cash</button><a class="btn sm" target="_blank" rel="noopener" href="${wa(c.phone, fill("plan_pay", cCtx(c,cur)))}">${I.chat}Payment reminder</a>`
            :`<span class="pill st-done">${cur.payment==="paid_upi"?"Paid by UPI":"Paid in cash"} · ${rupee(cur.price)}</span><button class="btn sm" type="button" data-cpay="${cur.id}" data-how="pending">Undo</button>`}</div>`
        :`<p class="muted small">Create the first month to book its visits.</p>`}
        ${active?`<div class="row" style="margin-top:6px"><button class="btn primary" type="button" data-cperiod>${I.repeat}${last?"Create next month":"Create first month"}${last?` (from ${fmtDay(addDays(last.period_end,1),{day:"numeric",month:"short"})})`:""}</button>${last?`<a class="btn" target="_blank" rel="noopener" href="${wa(c.phone, fill("plan_renew", cCtx(c,last)))}">${I.chat}Ask to renew</a>`:""}</div>`:""}</section>
      <section class="card"><div class="card-head"><h2>Visits</h2>${active&&cur?`<button class="btn sm" type="button" data-caddv>${I.plus}Extra visit</button>`:""}</div>
        ${up.length?`<div class="list">${up.map(j=>jrow(j,true)).join("")}</div>`:`<p class="muted small">No upcoming visits.${active?" Create the next month above.":""}</p>`}
        ${visits.length>up.length?`<details style="margin-top:10px"><summary class="small muted">Earlier and cancelled · ${visits.length-up.length}</summary><div class="list">${visits.filter(j=>!up.includes(j)).map(j=>jrow(j,true)).join("")}</div></details>`:""}</section>
      ${c.kind==="society"?`<section class="card"><div class="card-head"><h2>Vehicles · ${c.vehicle_list.length}</h2><button class="btn sm" type="button" data-cedit>Edit list</button></div>
        ${c.vehicle_list.length?`<table class="mini"><tbody>${c.vehicle_list.map(v=>`<tr><td><b>${esc(v.flat)}</b></td><td>${esc(v.vehicle)}</td><td class="muted">${esc(v.plate)}</td></tr>`).join("")}</tbody></table>`:'<p class="muted small">No vehicles yet. Each visit uses this list as its checklist.</p>'}
        <p class="small muted" style="margin-top:8px">Changes apply to months created after the change.</p></section>`:""}
    </div><div class="narrow">
      <section class="card"><div class="card-head"><h2>Details</h2></div><dl class="dl">
        <dt>${c.kind==="society"?"Contact":"Customer"}</dt><dd><b>${esc(c.contact_name||c.name)}</b><br><span class="muted">${esc(fmtPhone(c.phone))}</span></dd>
        <dt>Address</dt><dd>${esc([c.address,c.area,c.pin].filter(Boolean).join(", "))||"–"}</dd>
        ${c.kind==="plan"?`<dt>Vehicle</dt><dd>${esc(c.vehicle)}${c.plate?" · <b>"+esc(c.plate)+"</b>":""}</dd><dt>Washes</dt><dd>${c.washes} a month · ${esc(c.package)}</dd>`:`<dt>Each visit</dt><dd>${esc(c.package)}</dd>`}
        <dt>Days</dt><dd>${wdText(c.weekdays)} · ${esc(c.slot)}</dd><dt>Price</dt><dd><b>${rupee(c.price)}</b> a month</dd><dt>Washer</dt><dd>${esc(c.assigned_name||"Nobody yet")}</dd>
        ${c.notes?`<dt>Notes</dt><dd>${esc(c.notes)}</dd>`:""}</dl>
        <div class="contact-acts" style="margin-top:12px"><a class="btn" href="${tel(c.phone)}">${I.call}Call</a><a class="btn wa" target="_blank" rel="noopener" href="${wa(c.phone,"")}">${I.chat}WhatsApp</a></div></section>
      <section class="card"><div class="card-head"><h2>Months</h2></div>${(c.periods||[]).length?`<div class="list">${c.periods.map(p=>`<div class="list-row" style="cursor:default"><div class="lr-main"><b>${fmtDay(p.period_start,{day:"numeric",month:"short"})} – ${fmtDay(p.period_end,{day:"numeric",month:"short"})}</b><span>${p.done}/${p.planned} washed · ${rupee(p.price)}</span></div>${p.payment==="pending"?(p.period_start<=istToday()?'<span class="pill st-collect">Due</span>':'<span class="tag">Not due yet</span>'):'<span class="pill st-done">Paid</span>'}</div>`).join("")}</div>`:'<p class="muted small">None yet.</p>'}
        ${dueP.length>1?`<p class="small" style="margin-top:8px">${dueP.length} months not paid · ${rupee(c.due)}</p>`:""}</section>
      <section class="card"><div class="card-head"><h2>${active?"End":"Turn back on"}</h2></div><div class="menu">
        ${active?`<button class="btn" type="button" data-cend="end">End ${c.kind==="society"?"contract":"plan"}</button><p class="small muted">Removes visits from today on that aren't done. Past visits and months stay.</p>`
          :`<button class="btn" type="button" data-con>Turn back on</button>`}
        <button class="btn danger" type="button" data-cend="delete">Delete for good</button><p class="small muted">For mistakes only: removes it, its months and its upcoming visits.</p></div></section>
    </div></div></div>`;
}
async function cCall(fn, args, msg){ try{ const r=await rpc(fn,args); if(r && r.id && r.periods){ CT[r.id]=r; remember(r.visits); } if(msg) toast(typeof msg==="function"?msg(r):msg); dContract(); loadPlans(); return r; }catch(x){ toast(x.message, true); } }
document.addEventListener("click", async e => {
  if(S.v!=="c") return; const c=CT[S.arg]; if(!c) return;
  const pay=e.target.closest("[data-cpay]"); if(pay) return cCall("owner_pay_period",{p_period:+pay.dataset.cpay, p_how:pay.dataset.how}, pay.dataset.how==="pending"?"Marked not paid":"Month marked paid");
  if(e.target.closest("[data-cperiod]")){ const b=e.target.closest("[data-cperiod]"); b.disabled=true; return cCall("owner_contract_period",{p_id:c.id, p_start:null}, r=>`Month created · ${r.created} visit${r.created===1?"":"s"} booked`); }
  if(e.target.closest("[data-cedit]")) return contractForm(c);
  if(e.target.closest("[data-con]")) return cCall("owner_save_contract",{p:Object.assign({}, cPayload(c), {status:"active"})}, "Turned back on");
  if(e.target.closest("[data-caddv]")) return openSheet("Extra visit", `<form id="cvForm" class="menu"><p class="muted small">For a make-up wash in this month (after a cancelled or rained-off visit). Nothing to collect.</p>
      <div class="form-grid"><label class="field">Day<input type="date" id="cvDay" min="${istToday()}" max="${c.cur.period_end}" value="${istToday()}"></label><label class="field">Time<select id="cvSlot">${SLOTS.map(x=>`<option${x===c.slot?" selected":""}>${esc(x)}</option>`).join("")}</select></label></div>
      <button class="btn primary lg" type="submit">Add visit</button></form>`);
  const end=e.target.closest("[data-cend]"); if(end){
    if(!end.dataset.sure){ end.dataset.sure="1"; end.textContent=end.dataset.cend==="delete"?"Tap again to delete for good":"Tap again to end it"; setTimeout(()=>{ if(end.isConnected){ delete end.dataset.sure; dContract(); } },4000); return; }
    try{ const r=await rpc("owner_end_contract",{p_id:c.id, p_delete:end.dataset.cend==="delete"}); removeFiles(r.photos).catch(()=>{});
      toast((end.dataset.cend==="delete"?"Deleted":"Ended")+(r.removed?` · ${r.removed} upcoming visit${r.removed>1?"s":""} removed`:"")); DAY=null; cache.set("day."+istToday(), null);
      if(end.dataset.cend==="delete"){ delete CT[c.id]; await loadPlans(); go("plans"); } else { vContract(); loadPlans(); } }catch(x){ toast(x.message, true); }
  }
});
document.addEventListener("submit", async e => {
  if(e.target.id!=="cvForm") return; e.preventDefault(); const c=CT[S.arg];
  try{ const j=await rpc("owner_add_visit",{p_period:c.cur.id, p_day:$("cvDay").value, p_slot:$("cvSlot").value}); remember([j]); closeSheet(); toast("Visit added · "+relDay(j.wash_date)+", "+j.slot); vContract(); }catch(x){ toast(x.message, true); }
});

/* add / edit form */
const cPayload = c => ({id:c.id, kind:c.kind, name:c.name, contact_name:c.contact_name, phone:c.phone, address:c.address, area:c.area, pin:c.pin, vehicle_type:c.vehicle_type, vehicle:c.vehicle, plate:c.plate,
  plan_name:c.plan_name, package:c.package, washes:c.washes, weekdays:c.weekdays, slot:c.slot, price:c.price, assigned_to:c.assigned_to||"", start_date:c.start_date, notes:c.notes, status:c.status});
let CF=null;
function contractForm(c, pre){
  const v=Object.assign({kind:"plan", weekdays:[], slot:SLOTS[1], start_date:istToday(), vehicle_type:"car", vehicle:"Car · Hatchback", status:"active"}, c||{}, pre||{});
  const soc=v.kind==="society", size=sizeOf(v.vehicle||""), type=soc?"car":(v.vehicle_type==="bike"||size==="bike"?"bike":"car");
  CF={id:c&&c.id, kind:v.kind, lead_id:v.lead_id||null, type, size: size||"hatch"};
  const plans=PLANS[type]||[], wd=v.weekdays||[];
  const vehTxt=(c&&c.vehicle_list||[]).map(x=>[x.flat,x.vehicle,x.plate].filter(Boolean).join(" · ")).join("\n");
  openSheet(c?`Edit ${soc?"society contract":"plan"}`:(soc?"New society contract":"New monthly plan"), `<form id="cForm" class="bform">
    <div class="form-grid">
      <label class="field">${soc?"Society name":"Customer name"}<input id="cName" required maxlength="80" value="${esc(v.name||"")}"></label>
      ${soc?`<label class="field">Contact person<input id="cContact" maxlength="80" value="${esc(v.contact_name||"")}" placeholder="Secretary / manager"></label>`:""}
      <label class="field">Mobile<input id="cPhone" required inputmode="tel" maxlength="14" value="${esc(v.phone||"")}"></label>
      <label class="field wide">Address<input id="cAddr" maxlength="300" value="${esc(v.address||"")}"></label>
      <label class="field">Area<input id="cArea" maxlength="60" value="${esc(v.area||"")}" list="areaList"></label><label class="field">PIN<input id="cPin" maxlength="6" inputmode="numeric" value="${esc(v.pin||"")}"></label></div>
    ${soc?"":`<p class="opt-h">Vehicle</p><div class="chips" id="cVeh">${[["hatch","Hatchback"],["sedan","Sedan"],["suv","SUV / MUV"],["bike","Bike"]].map(([k,l])=>`<button type="button" class="chip${(type==="bike"?"bike":CF.size)===k?" on":""}" data-cveh="${k}">${l}</button>`).join("")}</div>
      <div class="form-grid"><label class="field">Number plate<input id="cPlate" maxlength="20" value="${esc(v.plate||"")}"></label>
      <label class="field">Plan<select id="cPlan">${plans.map(x=>`<option value="${esc(x.n)}" data-w="${x.w}" data-p="${x.p}"${x.n===v.plan_name?" selected":""}>${esc(x.n)} · ${x.w} washes · ${rupee(x.p)}</option>`).join("")}<option value="Custom"${v.plan_name&&!plans.some(x=>x.n===v.plan_name)?" selected":""}>Custom</option></select></label>
      <label class="field">Washes a month<input id="cWashes" type="number" min="1" max="31" value="${v.washes||(plans[0]||{}).w||4}"></label>
      <label class="field">Each visit<select id="cPkg">${(PKG[type]||[]).map(x=>`<option${x.n===(v.package||PKG[type][0].n)?" selected":""}>${esc(x.n)}</option>`).join("")}</select></label></div>`}
    <p class="opt-h">Days</p><div class="chips" id="cDays">${WD.map((d,i)=>`<button type="button" class="chip${wd.includes(i+1)?" on":""}" data-cwd="${i+1}">${d}</button>`).join("")}</div>
    <div class="form-grid"><label class="field">Time<select id="cSlot">${SLOTS.map(x=>`<option${x===v.slot?" selected":""}>${esc(x)}</option>`).join("")}</select></label>
      <label class="field">Price a month (₹)<input id="cPrice" type="number" min="0" inputmode="numeric" value="${v.price!=null?v.price:(soc?"":(plans[0]||{}).p||"")}"></label>
      <label class="field">Washer<select id="cWasher"><option value="">Nobody yet</option>${(SET.team||[]).filter(t=>t.active!==false).map(t=>`<option value="${t.id}"${t.id===v.assigned_to?" selected":""}>${esc(t.name)}</option>`).join("")}</select></label>
      <label class="field">Starts<input type="date" id="cStart" value="${esc(v.start_date)}"${c?" disabled":""}></label>
      ${soc?`<label class="field">Each visit<input id="cPkgS" maxlength="60" value="${esc(v.package||"Society wash")}"></label>`:""}</div>
    ${soc?`<label class="field">Vehicles, one per line: flat · vehicle · plate${v.cars||v.bikes?` <span class="muted">(request said ${v.cars||0} cars, ${v.bikes||0} bikes)</span>`:""}<textarea id="cVehicles" rows="6" placeholder="A-101 · Swift · MH02 AB 1234&#10;A-102 · Activa">${esc(vehTxt)}</textarea></label>`:""}
    <label class="field">Notes (shows on every visit)<input id="cNotes" maxlength="500" value="${esc(v.notes||"")}" placeholder="${soc?"Washing area near gate 2, water from the society tap":"Car in B2, slot 14"}"></label>
    ${c?"":`<label class="tick"><input type="checkbox" id="cFirst" checked> Book this month's visits now</label>`}
    <div class="alert warn" id="cErr" hidden></div>
    <button class="btn primary lg" type="submit" id="cSave">${c?"Save":soc?"Add society":"Add plan"}</button></form>`);
}
document.addEventListener("click", e => {
  if(!$("cForm")) return;
  const d=e.target.closest("[data-cwd]"); if(d){ d.classList.toggle("on"); return; }
  const v=e.target.closest("[data-cveh]"); if(v){ const k=v.dataset.cveh, t=k==="bike"?"bike":"car"; if(t!==CF.type){ const keep=cFormValues(); CF.type=t; contractForm(CF.id?CT[CF.id]:null, Object.assign(keep,{vehicle:t==="bike"?"Bike / Scooter":"Car · "+SIZE_LABEL[k], vehicle_type:t, plan_name:"", washes:null, price:null, package:""})); }
    else { $$("[data-cveh]").forEach(x=>x.classList.toggle("on", x===v)); CF.size=k; } }
});
document.addEventListener("change", e => { if(e.target.id==="cPlan"){ const o=e.target.selectedOptions[0]; if(o.dataset.w){ $("cWashes").value=o.dataset.w; $("cPrice").value=o.dataset.p; } } });
function cFormValues(){
  const soc=CF.kind==="society", val=id=>($(id)||{}).value||"";
  return {id:CF.id, kind:CF.kind, lead_id:CF.lead_id, name:val("cName").trim(), contact_name:soc?val("cContact").trim():"", phone:digits(val("cPhone")).slice(-10), address:val("cAddr").trim(), area:val("cArea").trim(), pin:val("cPin").trim(),
    vehicle_type:CF.type, vehicle:soc?"":(CF.type==="bike"?"Bike / Scooter":"Car · "+SIZE_LABEL[CF.size]), plate:soc?"":val("cPlate").trim(),
    plan_name:soc?"Society contract":(val("cPlan")==="Custom"?"Custom plan":val("cPlan")), package:soc?(val("cPkgS").trim()||"Society wash"):val("cPkg"), washes:soc?null:+val("cWashes"),
    weekdays:$$("[data-cwd].on").map(x=>+x.dataset.cwd), slot:val("cSlot"), price:+val("cPrice")||0, assigned_to:val("cWasher"), start_date:val("cStart"), notes:val("cNotes").trim(),
    vehicles: soc ? val("cVehicles").split(/\n/).map(l=>l.trim()).filter(Boolean).map(l=>{ const p=l.split(/\s*[·|,;]\s*|\s{2,}|\t/); return {flat:p[0]||"", vehicle:p[1]||"", plate:p.slice(2).join(" ")}; }) : undefined};
}
document.addEventListener("submit", async e => {
  if(e.target.id!=="cForm") return; e.preventDefault(); const p=cFormValues(), err=$("cErr"), b=$("cSave"), first=$("cFirst")&&$("cFirst").checked;
  const m=[]; if(!p.name) m.push("a name"); if(!/^[6-9]\d{9}$/.test(p.phone)) m.push("a 10-digit mobile"); if(!p.weekdays.length) m.push("at least one day");
  if(p.kind==="plan" && p.weekdays.length*4 < p.washes) m.push(`more days (${p.washes} washes need about ${Math.ceil(p.washes/4)} days a week)`);
  if(m.length){ err.hidden=false; err.textContent="Please add "+m.join(", ")+"."; return; }
  b.disabled=true; b.textContent="Saving…";
  try{ let r=await rpc("owner_save_contract",{p}); if(first) r=await rpc("owner_contract_period",{p_id:r.id, p_start:null});
    CT[r.id]=r; remember(r.visits); closeSheet(); toast(CF.id?"Saved":first?`Added · ${r.created} visit${r.created===1?"":"s"} booked`:"Added"); loadPlans(); if(p.lead_id && INB){ const l=INB.leads.find(x=>x.id===p.lead_id); if(l) l.status="won"; }
    if(S.v==="c" && S.arg===String(r.id)) dContract(); else go("c/"+r.id); }
  catch(x){ b.disabled=false; b.textContent="Try again"; err.hidden=false; err.textContent=x.message; }
});

/* ============================== CANCEL WITH A REASON ============================== */
const CANCEL_WHY=["Customer cancelled","Couldn't reach the customer","Rain","No access or parking","We couldn't make it","Booked by mistake","Other"];
function cancelSheet(id){
  const j=JOBS.get(id); if(!j) return;
  openSheet(`Cancel ${first(j.name)}'s booking?`, `<form id="cxForm" class="menu" data-for="${esc(id)}"><p class="muted small">${relDay(j.wash_date)}, ${esc(j.slot)} · ${esc(j.package)}. Why is it cancelled?</p>
    <div class="chips">${CANCEL_WHY.map(r=>`<button type="button" class="chip" data-cxr="${esc(r)}">${esc(r)}</button>`).join("")}</div>
    <input class="input" id="cxNote" maxlength="60" placeholder="A few words (optional)">
    <button class="btn danger lg" type="submit" id="cxGo" disabled>Pick a reason</button><button class="btn" type="button" data-close>Keep the booking</button></form>`);
}
document.addEventListener("click", e => { const c=e.target.closest("[data-cxr]"); if(!c) return; $$("[data-cxr]").forEach(x=>x.classList.toggle("on", x===c)); const b=$("cxGo"); b.disabled=false; b.textContent="Cancel booking"; });
document.addEventListener("submit", async e => {
  if(e.target.id!=="cxForm") return; e.preventDefault(); const id=e.target.dataset.for, on=document.querySelector("[data-cxr].on"); if(!on) return;
  const note=$("cxNote").value.trim(), reason=on.dataset.cxr+(note?": "+note:""); closeSheet();
  const r=await bookCall(id, "staff_cancel", {p_id:id, p_reason:reason}, {status:"cancelled", cancel_reason:reason, cancelled_at:new Date().toISOString()}, "Cancel");
  if(r){ fx(id, "cancel"); buzz(12); toast(r==="queued"?"Cancelled · saved on this phone, will sync when online":"Booking cancelled", false, undoFor(id, "cancel")); } delete HIST[id]; if(S.v==="b" && r==="ok") loadHist(id);
});

/* ============================== RECEIPT ON WHATSAPP ============================== */
document.addEventListener("click", async e => {
  if(!e.target.closest("[data-receipt]")) return; const h=e.target.closest("[data-id]"), j=h&&JOBS.get(h.dataset.id); if(!j) return;
  openSheet("Send receipt", `<div class="menu"><p class="muted small">A page with the booking, the amount and "Paid". It shows the customer's first name, not their phone or address.</p><a class="btn wa lg" id="rcLink" target="_blank" rel="noopener" aria-disabled="true">Preparing…</a><button class="btn" type="button" id="rcCopy" hidden>Copy link</button></div>`);
  try{ const r=await rpc("staff_receipt",{p_id:j.id}); const link=new URL(`receipt.html?b=${encodeURIComponent(r.id)}&k=${r.key}`, location.href).href; const a=$("rcLink"); if(!a) return;
    a.href=wa(j.phone, fill("receipt", Object.assign(jobCtx(j), {amount:rupee(j.total), link}))); a.removeAttribute("aria-disabled"); a.innerHTML=`${I.chat}Send on WhatsApp`; a.onclick=()=>{ closeSheet(); delete HIST[j.id]; if(S.v==="b") setTimeout(()=>loadHist(j.id),300); };
    const c=$("rcCopy"); c.hidden=false; c.onclick=()=>navigator.clipboard.writeText(link).then(()=>toast("Link copied")); }
  catch(x){ const a=$("rcLink"); if(a) a.textContent=x.message||"Couldn't make the link"; }
});

/* ============================== STOCK & BILLS ============================== */
let KIT=store.get("vb.kit")||null, BILLURL={}, ARR=false;
async function loadKit(){ try{ const [sup,exp]=await Promise.all([rpc("staff_supplies"), rpc("staff_expenses")]); KIT={sup, exp}; store.set("vb.kit",KIT);
  S.kitCount=(isOwner()?exp.filter(x=>x.status==="pending").length:0)+sup.filter(x=>x.is_low).length; drawNav(); }catch(e){ quiet(e); } }
async function vKit(){ if(ARR) return dKit(); dKit(); await loadKit(); const need=(KIT?KIT.exp:[]).filter(x=>x.photo && !BILLURL[x.photo]).map(x=>x.photo); if(need.length){ try{ (await signUrls(need)).forEach(x=>BILLURL[x.path]=x.url); }catch(e){} } if(S.v==="kit") dKit(); }
const EXP_CAT={supplies:"Supplies",fuel:"Fuel",other:"Other"}, qtyTx=n=>String(+(+n).toFixed(2));
function dKit(){
  if(S.v!=="kit") return;
  let html=pageHead("Stock & bills", isOwner()?"Supplies in hand, and bills from the team":"Supplies in hand, and your bills", `<button class="btn primary" type="button" data-expnew>${I.plus}Add a bill</button>`);
  if(!KIT){ V().innerHTML=html+`<div class="grid grid-2">${skel(2,220)}</div>`; return; }
  const exps=KIT.exp.filter(x=>!BILL_GONE.has(x.id)), pend=exps.filter(x=>x.status==="pending"), arr=ARR && isOwner(), n=KIT.sup.length;
  const supAct = arr ? `<button class="btn primary sm" type="button" data-arrdone>${I.check}Done</button>`
    : isOwner() ? `${n>1?`<button class="btn sm" type="button" data-arrange>${I.arrange}<span class="hide-sm">Arrange</span></button>`:""}<button class="btn sm" type="button" data-supedit>Edit list</button>` : "";
  html+=`<div class="grid grid-2"><section class="card${arr?" arranging":""}"><div class="card-head"><h2>Stock</h2><div class="row" style="gap:6px">${supAct}</div></div>
    ${n?`<div class="list" id="supList">${KIT.sup.map((x,i)=>{ return `<div class="list-row sup-row${x.is_low?" low":""}${arr?" jiggle":""}" data-sid="${x.id}" style="cursor:default${arr?`;--jd:${(i%3)*-.09}s`:""}">${arr?`<span class="drag-h" data-dragh aria-hidden="true">${I.grip}</span>`:""}<div class="lr-main"><b>${esc(x.name)} ${x.is_low?'<span class="pill st-collect">Low</span>':""}</b><span>${x.low>0?"Warn at "+qtyTx(x.low)+" "+esc(x.unit):"No warning set"}${x.by?" · "+esc(first(x.by))+" "+ago(x.updated_at):""}</span></div>
      ${arr?`<div class="qty"><button class="btn sm" type="button" data-mv="-1" aria-label="Move ${esc(x.name)} up"${i===0?" disabled":""}>↑</button><button class="btn sm" type="button" data-mv="1" aria-label="Move ${esc(x.name)} down"${i===n-1?" disabled":""}>↓</button></div>`
        :`<div class="qty"><button class="btn sm" type="button" data-qd="-1" aria-label="Used one">−</button><b class="num">${qtyTx(x.qty)}<small>${esc(x.unit)}</small></b><button class="btn sm" type="button" data-qd="1" aria-label="Added one">+</button></div>`}</div>`; }).join("")}</div>`
      :`<p class="muted small">No items yet.${isOwner()?" Tap Edit list to add what you keep in the kit.":""}</p>`}
    <p class="small muted" style="margin-top:10px">${arr?"Drag an item by its dots (or use ↑ ↓) to put the list in the order you like, then tap <b>Done</b>.":`Tap − when you use one up and + when you buy more.${isOwner()?" Set a warning level in Edit list; Home tells you when something runs low.":""}`}</p></section>
  <section class="card"><div class="card-head"><h2>Bills</h2>${pend.length&&isOwner()?`<span class="pill st-collect">${pend.length} to approve</span>`:""}</div>
    ${exps.length?`<div class="list">${exps.map(x=>`<div class="list-row bill" data-eid="${x.id}" style="cursor:default">${x.photo?`<a class="bill-ph" href="${esc(BILLURL[x.photo]||"#")}" target="_blank" rel="noopener">${BILLURL[x.photo]?`<img src="${esc(BILLURL[x.photo])}" alt="Bill photo" loading="lazy">`:I.receipt}</a>`:`<span class="bill-ph">${I.receipt}</span>`}
      <div class="lr-main"><b>${rupee(x.amount)} · ${EXP_CAT[x.category]}</b><span>${fmtDay(x.day,{day:"numeric",month:"short"})}${isOwner()?" · "+esc(first(x.staff_name)):""}${x.note?" · "+esc(x.note):""}</span></div>
      <div class="bill-act">${x.status==="pending"?(isOwner()?`<button class="btn coral sm" type="button" data-er="approved">Approve</button><button class="btn sm" type="button" data-er="rejected">Reject</button>`:'<span class="pill st-new">Waiting</span>'):x.status==="approved"?'<span class="pill st-done">Approved</span>':'<span class="pill st-cancelled">Rejected</span>'}
      ${isOwner()||x.status==="pending"?`<button class="link-btn small" type="button" data-edel>Delete</button>`:""}${isOwner()&&x.status!=="pending"?`<button class="link-btn small" type="button" data-er="pending">Undo</button>`:""}</div></div>`).join("")}</div>`
      :`<p class="muted small">No bills yet. When you buy fuel or supplies for work, tap <b>Add a bill</b> and take a photo of the bill.</p>`}
    ${isOwner()?'<p class="small muted" style="margin-top:10px">Approved bills count as costs in Analytics.</p>':""}</section></div>`;
  V().innerHTML=html;
}
document.addEventListener("click", async e => {
  if(S.v!=="kit") return; const t=e.target;
  const q=t.closest("[data-qd]"); if(q){ const id=+q.closest("[data-sid]").dataset.sid, d=+q.dataset.qd; if(useSupply(id, d)) toast((d>0?"Added 1 · ":"Used 1 · ")+KIT.sup.find(y=>y.id===id).name, false, {undo:()=>useSupply(id, -d, true)}); return; }
  if(t.closest("[data-supedit]")) return supSheet();
  const er=t.closest("[data-er]"); if(er){ const id=+er.closest("[data-eid]").dataset.eid; try{ await rpc("owner_review_expense",{p_id:id, p_status:er.dataset.er}); toast({approved:"Approved",rejected:"Rejected",pending:"Back to waiting"}[er.dataset.er]); vKit(); }catch(x){ toast(x.message,true); } return; }
  const ed=t.closest("[data-edel]"); if(ed){ const id=+ed.closest("[data-eid]").dataset.eid; delBill(id); return; }
});
document.addEventListener("click", e => { if(e.target.closest("[data-expnew]")) expSheet(); });
/* Arrange (owner): the stock items wiggle; drag one by its dots, or use ↑ ↓, then Done saves the order. */
function supOrder(){ const ids=$$("#supList [data-sid]").map(r=>+r.dataset.sid); KIT.sup.sort((a,b)=>ids.indexOf(a.id)-ids.indexOf(b.id)); }
async function saveSupOrder(){
  const list=KIT.sup.map(x=>({id:x.id, name:x.name, unit:x.unit, qty:+x.qty, low:+x.low}));
  ARR=false; dKit();
  try{ KIT.sup=await rpc("owner_save_supplies",{p:list}); store.set("vb.kit",KIT); dKit(); toast("Order saved"); }catch(x){ toast(x.message, true); vKit(); }
}
document.addEventListener("click", e => {
  if(S.v!=="kit") return;
  if(e.target.closest("[data-arrange]")){ ARR=true; buzz(20); dKit(); return; }
  if(e.target.closest("[data-arrdone]")) return saveSupOrder();
  const m=e.target.closest("[data-mv]"); if(m){ const r=m.closest("[data-sid]"), sib=+m.dataset.mv<0?r.previousElementSibling:r.nextElementSibling; if(!sib) return;
    +m.dataset.mv<0 ? sib.before(r) : sib.after(r); supOrder(); buzz(8); dKit(); const b=document.querySelector(`#supList [data-sid="${r.dataset.sid}"] [data-mv="${m.dataset.mv}"]`); (b && !b.disabled ? b : document.querySelector(`#supList [data-sid="${r.dataset.sid}"] [data-mv]:not([disabled])`))?.focus(); }
});
let DRAG=null;
document.addEventListener("pointerdown", e => {
  const h=e.target.closest("[data-dragh]"); if(!h || S.v!=="kit" || !ARR) return; e.preventDefault();
  const row=h.closest("[data-sid]"); DRAG={row, list:row.parentElement, y:e.clientY}; row.classList.add("lift"); try{ h.setPointerCapture(e.pointerId); }catch(x){} buzz(10);
});
document.addEventListener("pointermove", e => {
  if(!DRAG) return; const {row, list}=DRAG;
  const sibs=[...list.children].filter(x=>x!==row), over=sibs.find(x=>{ const r=x.getBoundingClientRect(); return e.clientY < r.top + r.height/2; });
  const before = over || null; if(row.nextElementSibling!==before && !(before===null && row===list.lastElementChild)){ list.insertBefore(row, before); buzz(6); }
});
function dragEnd(){ if(!DRAG) return; DRAG.row.classList.remove("lift"); DRAG=null; supOrder(); dKit(); }
document.addEventListener("pointerup", dragEnd); document.addEventListener("pointercancel", dragEnd);
/* − / + on a stock item: shown at once, sent in the background (kept for later when offline). */
function useSupply(id, d, isUndo){
  const x=KIT && KIT.sup.find(y=>y.id===id); if(!x) return false; if(d<0 && +x.qty<=0 && !isUndo) return toast(x.name+" is already at 0", true), false;
  x.qty=Math.max(0,+x.qty+d); x.is_low=x.low>0&&x.qty<=x.low; fx("sup:"+id, d>0?"up":"down"); buzz(8); dKit();
  rpc("staff_use_supply",{p_id:id, p_delta:d}).then(sup=>{ KIT.sup=sup; store.set("vb.kit",KIT); dKit(); },
    err=>{ if(netDown(err)) queueAdd({fn:"staff_use_supply", args:{p_id:id, p_delta:d}, label:(d>0?"Added ":"Used ")+x.name}); else { toast(err.message, true); vKit(); } });
  return true;
}
/* Deleting a bill waits 6 s so Undo can bring it back; it is deleted when the time is up. */
const BILL_GONE=new Set();
function delBill(id){
  BILL_GONE.add(id); buzz(12); dKit();
  toast("Bill deleted", false, {undo:()=>{ BILL_GONE.delete(id); fx("bill:"+id, "undo"); dKit(); },
    commit:()=>rpc("staff_delete_expense",{p_id:id}).then(r=>{ BILL_GONE.delete(id); if(r.photo) removeFiles([r.photo]).catch(()=>{}); if(KIT) KIT.exp=KIT.exp.filter(x=>x.id!==id); dKit(); }, x=>{ BILL_GONE.delete(id); dKit(); toast("Couldn't delete the bill: "+x.message, true); })});
}
function expSheet(){
  openSheet("Add a bill", `<form id="expForm" class="menu"><div class="chips">${Object.entries(EXP_CAT).map(([k,l],i)=>`<button type="button" class="chip${i===0?" on":""}" data-ecat="${k}">${l}</button>`).join("")}</div>
    <div class="form-grid"><label class="field">Amount ₹<input type="number" id="expAmt" min="1" max="100000" inputmode="numeric" required></label><label class="field">Day<input type="date" id="expDay" max="${istToday()}" min="${addDays(istToday(),-60)}" value="${istToday()}"></label></div>
    <label class="field">What for<input id="expNote" maxlength="200" placeholder="e.g. Petrol, 2 L shampoo"></label>
    <label class="btn" id="expPhLbl">${I.cam}<span id="expPhTx">Take a photo of the bill</span><input type="file" accept="image/*" id="expPh" hidden></label>
    <div class="alert warn" id="expErr" hidden></div><button class="btn primary lg" type="submit" id="expGo">Add bill</button>
    <p class="small muted">${isOwner()?"Your own bills are approved straight away.":"The owner approves it. You can delete it until then."}</p></form>`);
}
document.addEventListener("click", e => { const c=e.target.closest("[data-ecat]"); if(c) $$("[data-ecat]").forEach(x=>x.classList.toggle("on", x===c)); });
document.addEventListener("change", e => { if(e.target.id==="expPh" && e.target.files[0]) $("expPhTx").textContent="Photo added ✓ (tap to change)"; });
document.addEventListener("submit", async e => {
  if(e.target.id!=="expForm") return; e.preventDefault(); const amt=+$("expAmt").value, err=$("expErr"), b=$("expGo"), f=$("expPh").files[0];
  if(!(amt>0)){ err.hidden=false; err.textContent="Enter the amount."; return; }
  b.disabled=true; b.textContent="Saving…"; let photo=null;
  try{ if(f){ const blob=await shrink(f); photo=`bills/${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}.jpg`; await storage("object/"+BUCKET+"/"+photo, {method:"POST", headers:{"Content-Type":"image/jpeg","x-upsert":"false"}, body:blob}); BILLURL[photo]=URL.createObjectURL(blob); }
    await rpc("staff_add_expense",{p:{category:(document.querySelector("[data-ecat].on")||{}).dataset.ecat||"other", amount:amt, day:$("expDay").value, note:$("expNote").value.trim(), photo}});
    closeSheet(); toast(isOwner()?"Bill added":"Bill added · waiting for the owner"); vKit(); }
  catch(x){ if(photo) removeFiles([photo]).catch(()=>{}); b.disabled=false; b.textContent="Try again"; err.hidden=false; err.textContent=netDown(x)?"No internet. Bills need internet to send the photo; try again when you're back online.":x.message; }
});
function supSheet(){
  const row=x=>`<div class="sup-ed" data-sid="${x.id||""}"><label class="se-f se-name"><span>Item</span><input class="input" data-f="name" maxlength="60" value="${esc(x.name||"")}" placeholder="Item"></label><label class="se-f"><span>Unit</span><input class="input" data-f="unit" maxlength="20" value="${esc(x.unit||"")}" placeholder="litre"></label><label class="se-f"><span>In hand</span><input class="input" type="number" min="0" step="0.5" inputmode="decimal" data-f="qty" value="${x.qty!=null?qtyTx(x.qty):""}" placeholder="0"></label><label class="se-f"><span>Warn at</span><input class="input" type="number" min="0" step="0.5" inputmode="decimal" data-f="low" value="${x.low?qtyTx(x.low):""}" placeholder="–"></label><button class="btn sm" type="button" data-supdel aria-label="Remove ${esc(x.name||"item")}">✕</button></div>`;
  openSheet("Stock list", `<form id="supForm" class="menu"><div class="sup-ed head"><span>Item</span><span>Unit</span><span>In hand</span><span>Warn at</span><span></span></div><div id="supRows">${KIT.sup.map(row).join("")}</div>
    <button class="btn" type="button" id="supAdd">${I.plus}Add an item</button><button class="btn primary lg" type="submit">Save list</button><p class="small muted">"Warn at": Home shows the item as low when what's in hand reaches this. Leave it empty for no warning.</p></form>`);
  $("supAdd").onclick=()=>{ $("supRows").insertAdjacentHTML("beforeend", row({})); $("supRows").lastElementChild.querySelector("input").focus(); };
}
document.addEventListener("click", e => { const d=e.target.closest("[data-supdel]"); if(d){ const r=d.closest(".sup-ed"); if(r.dataset.sid){ r.hidden=true; r.dataset.del="1"; } else r.remove(); } });
document.addEventListener("submit", async e => {
  if(e.target.id!=="supForm") return; e.preventDefault();
  const list=$$("#supRows .sup-ed").map(r=>{ const v=f=>r.querySelector(`[data-f="${f}"]`).value; return r.dataset.del?{id:r.dataset.sid, delete:true}:{id:r.dataset.sid||null, name:v("name").trim(), unit:v("unit").trim(), qty:v("qty")===""?0:+v("qty"), low:v("low")===""?0:+v("low")}; });
  try{ KIT.sup=await rpc("owner_save_supplies",{p:list}); store.set("vb.kit",KIT); closeSheet(); toast("Stock list saved"); dKit(); loadKit(); }catch(x){ toast(x.message, true); }
});

/* ============================== PHONE ALERTS (web push) ============================== */
const isIOS=/iPhone|iPad|iPod/.test(navigator.userAgent), standalone=matchMedia("(display-mode: standalone)").matches||navigator.standalone===true;
async function pushState(){
  if(isIOS && !standalone) return "ios-install";
  if(!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) return "unsupported";
  if(Notification.permission==="denied") return "blocked";
  try{ const reg=await navigator.serviceWorker.getRegistration(); const sub=reg && await reg.pushManager.getSubscription(); return sub?"on":"off"; }catch(e){ return "off"; }
}
const b64u = s => { const p="=".repeat((4-s.length%4)%4), b=atob((s+p).replace(/-/g,"+").replace(/_/g,"/")); return Uint8Array.from([...b].map(c=>c.charCodeAt(0))); };
async function pushOn(){
  if(await Notification.requestPermission()!=="granted") throw new Error("Alerts are blocked. Allow notifications for this app in the phone's settings.");
  const reg=await navigator.serviceWorker.register("ops-sw.js"); await navigator.serviceWorker.ready;
  const {key}=await callFn("push",{action:"key"});
  const sub=(await reg.pushManager.getSubscription()) || await reg.pushManager.subscribe({userVisibleOnly:true, applicationServerKey:b64u(key)});
  const j=sub.toJSON(), dev=isIOS?"iPhone":/Android/.test(navigator.userAgent)?"Android":"Computer";
  await rpc("staff_push_subscribe",{p:{endpoint:j.endpoint, p256dh:j.keys.p256dh, auth:j.keys.auth, device:dev}});
  await callFn("push",{action:"test"}).catch(()=>{});
}
async function pushOff(){ const reg=await navigator.serviceWorker.getRegistration(); const sub=reg&&await reg.pushManager.getSubscription(); if(sub){ await rpc("staff_push_unsubscribe",{p_endpoint:sub.endpoint}).catch(()=>{}); await sub.unsubscribe(); } }
async function drawPushBox(){
  const el=$("pushBox"); if(!el) return; const st=await pushState(); if(!$("pushBox")) return;
  el.innerHTML = {on:`<p class="small"><b>On</b> for this phone. You get an alert when a booking comes in from the website.</p><div class="row"><button class="btn sm" type="button" data-push="test">Send a test</button><button class="btn sm" type="button" data-push="off">Turn off</button></div>`,
    off:`<p class="small muted">Get an alert on this phone when a booking comes in from the website, even when the app is closed.</p><button class="btn primary" type="button" data-push="on">${I.bell2}Turn on alerts</button>`,
    blocked:`<p class="small">Notifications are blocked for this app. Allow them in your phone's settings, then come back here.</p>`,
    "ios-install":`<p class="small">On iPhone, alerts work only from the Home Screen app: tap <b>Share</b> → <b>Add to Home Screen</b>, open <b>VB Staff</b> from there, sign in, then turn alerts on here.</p>`,
    unsupported:`<p class="small muted">This browser can't show alerts. Use Chrome on Android, or the Home Screen app on iPhone.</p>`}[st];
}
document.addEventListener("click", async e => {
  const b=e.target.closest("[data-push]"); if(!b) return; b.disabled=true;
  try{ if(b.dataset.push==="on"){ await pushOn(); toast("Alerts are on. A test alert is on its way."); }
    if(b.dataset.push==="off"){ await pushOff(); toast("Alerts are off for this phone"); }
    if(b.dataset.push==="test"){ const r=await callFn("push",{action:"test"}); toast(r.sent?"Test alert sent":"No phone to send to. Turn alerts off and on again.", !r.sent); } }
  catch(x){ toast(x.message||"Couldn't change alerts", true); }
  b.disabled=false; drawPushBox();
});

/* ============================== HOME (owner) ============================== */
let OV=null, ATTN=null, CAL=null, DAYC={};
async function vHome(){
  OV=cache.get("numbers"); ATTN=cache.get("attn"); CAL=cache.get("cal."+S.calMonth); if(ATTN){ remember(ATTN.recent); remember(ATTN.unconfirmed); remember(ATTN.unpaid); } dHome();
  try{ const [o,a,c]=await Promise.all([rpc("owner_overview"), rpc("owner_attention"), rpc("staff_month",{p_month:S.calMonth}), loadPlans(), loadKit()]); OV=o; ATTN=a; CAL=c;
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
    ...(ATTN.changes||[]).map(c=>`<button class="list-row" type="button" data-open="${esc(c.id)}"><span class="lr-main"><b>${esc(c.name)} <span class="pill st-new">Changed online</span></b><span>${esc(c.detail.replace(/^(Moved|Cancelled) (online )?by the customer( online)?/, "$1"))} · ${ago(c.at)}</span></span>${I.fwd}</button>`),
    ...(ATTN.cash||[]).map(c=>`<div class="list-row"><span class="lr-main"><b>Cash with ${esc(first(c.name))}: ${rupee(c.balance)}</b><span>${c.today?rupee(c.today)+" collected today":"From earlier days"} · tap Received when you get it</span></span><button class="btn sm" type="button" data-cashrecv="${esc(c.id)}">Received</button></div>`),
    ATTN.unassigned?`<button class="list-row" type="button" data-go="bookings"><span class="lr-main"><b>${ATTN.unassigned} job${ATTN.unassigned>1?"s":""} in the next 3 days with no washer</b><span>Open a booking and choose a washer</span></span>${I.fwd}</button>`:"",
    ATTN.due?`<button class="list-row" type="button" data-go="customers" data-cumode="due"><span class="lr-main"><b>${ATTN.due} customer${ATTN.due>1?"s":""} due for a wash</b><span>Last wash 12+ days ago, nothing booked</span></span><span class="pill st-confirmed">Rebook</span></button>`:"",
    ...(KIT&&KIT.sup.some(x=>x.is_low)?[`<button class="list-row" type="button" data-go="kit"><span class="lr-main"><b>Running low: ${KIT.sup.filter(x=>x.is_low).map(x=>esc(x.name)).join(", ")}</b><span>Buy more, then update Stock &amp; bills</span></span>${I.fwd}</button>`]:[]),
    ...(KIT&&KIT.exp.some(x=>x.status==="pending")?[`<button class="list-row" type="button" data-go="kit"><span class="lr-main"><b>${KIT.exp.filter(x=>x.status==="pending").length} bill${KIT.exp.filter(x=>x.status==="pending").length>1?"s":""} to approve</b><span>${rupee(KIT.exp.filter(x=>x.status==="pending").reduce((a,x)=>a+x.amount,0))} added by washers</span></span>${I.fwd}</button>`]:[]),
    ...(PLANS_L||[]).filter(c=>c.status==="active" && (c.renew||c.due>0)).map(c=>`<button class="list-row" type="button" data-go="c/${c.id}"><span class="lr-main"><b>${esc(c.name)} <span class="pill st-plan">${esc(c.kind==="society"?"Society":c.plan_name||"Plan")}</span></b><span>${[c.due>0?"Payment due "+rupee(c.due):"", c.renew?(c.last_end?"Month ends "+relDay(c.last_end).toLowerCase():"First month not started"):""].filter(Boolean).join(" · ")}</span></span>${I.fwd}</button>`),
    S.inboxCount?`<button class="list-row" type="button" data-go="inbox"><span class="lr-main"><b>${S.inboxCount} new in Inbox</b><span>${[OV.new_leads?OV.new_leads+" society":"",OV.new_enquiries?OV.new_enquiries+" message":"",OV.pending_reviews?OV.pending_reviews+" review":""].filter(Boolean).join(" · ")}</span></span><span class="nav-badge">${S.inboxCount}</span></button>`:""
  ].filter(Boolean);
  const recent = ATTN.recent.map(j=>JOBS.get(j.id)||j);
  V().innerHTML = `<div class="rise" style="display:flex;flex-direction:column;gap:18px">` + pageHead(`${greet}, ${esc(first(S.me.name))}`, fmtDay(istToday(),{weekday:"long", day:"numeric", month:"long"})+` · ${OV.today} job${OV.today===1?"":"s"} today`, newBtn()+`<button class="btn" type="button" data-go="jobs">${I.jobs}Today's jobs</button>`)
    + (n&&n.body?`<div class="notice">${I.note}<div><b>${esc(n.body)}</b><small>${esc(n.by||"")} · ${ago(n.updated_at)}</small></div></div>`:"")
    + `<div class="grid grid-kpi">${kpi("Jobs today",OV.today,"tap to open","","jobs")}${kpi("Upcoming",OV.upcoming,"after today","","bookings")}${kpi("Collected, 7 days",rupee(OV.collected_week))}${kpi("Washed, not paid",rupee(OV.unpaid_amount),OV.unpaid_count+" job"+(OV.unpaid_count===1?"":"s"),OV.unpaid_amount>0?"warn":"")}${kpi("Collected this month",rupee(OV.collected_month),"see Analytics","good","analytics")}</div>`
    + `<div class="grid grid-2"><section class="card"><div class="card-head"><h2>Needs attention</h2>${uc.length+up.length?`<span class="pill st-collect">${uc.length+up.length}</span>`:""}</div>${attn.length?attn.join(""):`<div class="empty"><b>All clear</b>Every booking is confirmed and every finished wash is paid.</div>`}</section>
      <section class="card" id="calCard">${calHTML()}</section></div>`
    + `<section class="card"><div class="card-head"><h2>Recent bookings</h2><button class="link-btn" type="button" data-go="bookings">See all</button></div>${recent.length?`<div style="overflow-x:auto"><table class="data"><thead><tr><th class="hide-sm">Booked</th><th>Name</th><th>When</th><th class="hide-sm">Package</th><th class="r">Total</th><th>Status</th></tr></thead><tbody>${recent.map(j=>`<tr data-go="b/${encodeURIComponent(j.id)}"><td class="nw muted small hide-sm">${ago(j.created_at)}</td><td><b>${esc(j.name)}</b><div class="tiny muted">${esc(SOURCE[j.source]||"")}</div></td><td class="nw">${relDay(j.wash_date)}<div class="tiny muted">${esc(j.slot)}</div></td><td class="hide-sm">${esc(j.package)}</td><td class="r num">${rupee(j.total)}</td><td>${pill(j)}</td></tr>`).join("")}</tbody></table></div>`:'<div class="empty">No bookings yet.</div>'}</section></div>`;
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
  loadRain(); loadCash();
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
  const openJobs = jobs.filter(j=>["new","confirmed","on_way"].includes(j.status)).length;
  const acts = (openJobs?`<button class="btn" type="button" data-route aria-label="Route">${I.route}<span class="hide-sm">Route</span></button>`:"") + (isOwner()&&openJobs&&S.day>=istToday()?`<button class="btn" type="button" data-moveday>${I.move}<span class="hide-sm">Move day</span></button>`:"") + (!isOwner()&&anyMine?`<div class="seg"><button type="button" data-mine="1" class="${S.mine?"on":""}">Mine</button><button type="button" data-mine="0" class="${!S.mine?"on":""}">Everyone</button></div>`:"") + newBtn();
  let html = pageHead(relDay(S.day), fmtDay(S.day,{weekday:"long", day:"numeric", month:"long"}) + (live.length?` · ${done}/${live.length} washed`:""), acts)
    + (n&&n.body?`<div class="notice">${I.note}<div><b>${esc(n.body)}</b><small>${esc(n.by||"")} · ${ago(n.updated_at)}</small></div></div>`:"")
    + cashCard() + rainBanner(jobs)
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
  if(to==="cancelled") return cancelSheet(id);
  if(from==="cancelled"){ if(to==="new"||to==="confirmed") return act(id,"reopen"); return toast("Reopen it first: move it to New or Confirmed.", true); }
  if(to==="done"){ if(j.status!=="done"){ if(!await act(id,"done")) return; } return paySheet(id); }
  if(from==="done" && to==="collect") return act(id,"unpaid");
  if(order.indexOf(to) < order.indexOf(from)) return toast("It can't move back. Open the booking to change it.", true);
  const seq = {confirmed:["confirm"], on_way:["on_way"], collect:["done"]}[to].slice();
  if(to==="on_way" && from==="new") seq.unshift("confirm");
  for(const a of seq){ if(!await act(id,a)) return; }
}
function paySheet(id){ const j=JOBS.get(id); openSheet(`How did ${first(j.name)} pay?`, `<div class="menu" data-id="${esc(id)}"><p class="muted">${rupee(j.total)} · ${esc(j.package)}</p><button class="btn" type="button" data-qr>${I.qr}Show UPI QR to scan</button><button class="btn coral" data-act="paid_upi">Paid by UPI</button><button class="btn coral" data-act="paid_cash">Paid in cash</button><button class="btn" type="button" data-close>Not paid yet</button></div>`); }
function confirmSheet(title, sub, label, fn){ openSheet(title, `<div class="menu"><p class="muted">${esc(sub)}</p><button class="btn danger" type="button" id="cfYes">${esc(label)}</button><button class="btn" type="button" data-close>Keep it</button></div>`); $("cfYes").onclick=()=>{ closeSheet(); fn(); }; }

/* ============================== BOOKING PAGE ============================== */
let HIST={};
async function vBooking(){
  const id=S.arg; dBooking();
  if(!JOBS.has(id)){ try{ const r=await rpc("staff_bookings",{p_query:id, p_from:addDays(istToday(),-365), p_limit:5}); remember(r); }catch(e){ quiet(e); } if(!JOBS.has(id)){ V().innerHTML = pageHead("Booking not found", "It may have been deleted.", "", "Back"); return; } dBooking(); }
  loadHist(id); loadPhotos(id);
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
          <dl class="dl">${j.status==="cancelled"?`<dt>Cancelled</dt><dd><b>${esc(j.cancel_reason||"No reason given")}</b></dd>`:""}<dt>When</dt><dd><b>${relDay(j.wash_date)}</b>, ${fmtDay(j.wash_date,{day:"numeric", month:"long"})} · ${esc(j.slot)}</dd>
          ${j.started_at?`<dt>Wash time</dt><dd>${j.status==="done"&&took(j)!=null?`<b>${took(j)} min</b> <span class="muted">(started ${clock(j.started_at)})</span>`:`Started ${clock(j.started_at)} · <b class="timer" data-since="${esc(j.started_at)}">${mins(j.started_at)}</b> so far${j.status!=="done"?` <button class="link-btn small" type="button" data-timer="reset">Undo start</button>`:""}`}</dd>`:""}
          <dt>Vehicle</dt><dd>${esc(j.vehicle)}${j.plate?" · <b>"+esc(j.plate)+"</b>":""}</dd>
          <dt>Package</dt><dd>${esc(j.package)}${j.extras?"<br><span class='muted'>+ "+esc(j.extras)+"</span>":""}</dd>
          <dt>Address</dt><dd>${esc([j.address,j.area].filter(Boolean).join(", "))} ${esc(j.pin)} · <a href="${mapUrl(j)}" target="_blank" rel="noopener">Map</a></dd>
          ${j.notes?`<dt>Notes</dt><dd><span class="note" style="display:inline-block">${esc(j.notes)}</span></dd>`:""}
          <dt>Washer</dt><dd>${isOwner()?`<select class="input" data-assign style="max-width:260px"><option value="">Nobody yet</option>${(SET.team||[]).map(t=>`<option value="${t.id}" ${t.id===j.assigned_to?"selected":""}>${esc(t.name)}${t.role==="owner"?" (owner)":""}</option>`).join("")}</select>`:esc(j.assigned_name||"Nobody yet")}</dd>
          <dt>Came from</dt><dd>${esc(SOURCE[j.source]||j.source)}</dd>
          ${j.promo_note&&j.promo!=="MANUAL"?`<dt>Offer note</dt><dd>${esc(j.promo_note)}</dd>`:""}</dl></section>
        ${j.status!=="cancelled"?`<section class="card"><div class="card-head"><h2>Checklist</h2><span class="muted small">${ckCount(j)} done</span></div>${checkHTML(j)}</section>`:""}
        <section class="card"><div class="card-head"><h2>Photos</h2><div class="row"><label class="btn sm">${I.cam}Before<input type="file" accept="image/*" data-photo="before" multiple hidden></label><label class="btn sm">${I.cam}After<input type="file" accept="image/*" data-photo="after" multiple hidden></label></div></div>
          <div id="photos">${photosHTML(j.id)}</div><button class="btn wa" type="button" id="phSend" data-phsend style="margin-top:12px"${(PH[j.id]||[]).length?"":" hidden"}>${I.chat}Send photos to ${esc(first(j.name))}</button></section>
        <section class="card"><div class="card-head"><h2>History and notes</h2></div>
          <form class="row" id="noteForm" style="margin-bottom:16px"><input class="input" id="noteIn" placeholder="Add a note (gate code, parking slot…)" maxlength="500" autocomplete="off" style="flex:1;min-width:180px"><button class="btn" type="submit">Add note</button></form>
          <ol class="timeline" id="hist">${histHTML(j.id)}</ol></section>
      </div><div class="narrow">
        ${j.payment==="covered"?`<section class="dark-card"><div class="label">Covered by ${j.plan&&j.plan.kind==="society"?"society contract":"monthly plan"}</div><div class="big" style="font-size:24px">${j.plan?esc(j.plan.kind==="society"?j.name:j.plan.name):"Plan"}</div>
          ${j.plan?`<div class="muted small">Visit ${j.plan.n} of ${j.plan.of} · ${j.plan.left} left this month (to ${fmtDay(j.plan.end,{day:"numeric",month:"short"})})</div><div class="row">${j.plan.pay==="pending"?'<span class="pill st-collect">Month not paid yet</span>':'<span class="pill st-done">Month paid</span>'}${isOwner()?`<button class="btn sm" type="button" data-go="c/${j.plan.contract}">Open ${j.plan.kind==="society"?"contract":"plan"}</button>`:""}</div>`:""}
          <div class="muted small">Nothing to collect at the visit.</div></section>`:`<section class="dark-card"><div class="label">${isPaid(j)?"Paid":"To collect"}</div><div class="big num">${rupee(j.total)}${j.discount>0?`<s>${rupee(j.subtotal)}</s>`:""}</div>
          ${j.discount>0?`<div class="muted small">${esc(discLabel(j))} −${rupee(j.discount)}</div>`:""}
          ${j.credit>0&&j.status!=="cancelled"?`<div class="alert ok">${rupee(j.credit)} referral credit. Take it off the bill. <button class="btn sm" data-act="use_credit" style="margin-top:6px">Mark used</button></div>`:""}
          ${j.status!=="cancelled"?(isPaid(j)?`<div class="row"><span class="pill st-done">${j.payment==="paid_upi"?"Paid by UPI":"Paid in cash"}</span><button class="btn sm" data-act="unpaid">Undo</button><button class="btn sm" type="button" data-receipt>${I.receipt}Send receipt</button></div>`:`<div class="row"><button class="btn sm" type="button" data-qr>${I.qr}UPI QR</button><button class="btn coral sm" data-act="paid_upi">Paid by UPI</button><button class="btn coral sm" data-act="paid_cash">Paid in cash</button></div>`):""}
          <div class="muted small">${j.pay_mode==="online"?"Customer chose to pay online (UPI)":"Pay after the wash"}</div></section>`}
        <section class="card"><div class="card-head"><h2>Customer</h2>${j.visits?`<span class="pill st-confirmed">${ord(j.visits+1)} visit</span>`:""}</div>
          <p><b>${esc(j.name)}</b><br><span class="muted">${esc(fmtPhone(j.phone))}</span></p>
          <div class="cnote">${j.cust_note?`<p class="note saved">${I.pin}<span>${esc(j.cust_note)}</span></p>`:`<p class="muted small">No saved note. Save things like the gate code or parking spot once, and they show on every booking.</p>`}<button class="link-btn small" type="button" data-cnote>${j.cust_note?"Edit saved note":"Add a saved note"}</button></div>
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
  try{ const r=await logLater(id, "note", v, "Note"); toast(r==="queued"?"Note saved on this phone, will sync when online":"Note added"); } catch(err){ toast("Couldn't save the note", true); loadHist(id); }
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
  const action=MSG_ACTION[k], title=templates().find(t=>t.key===k).title, log=()=>logLater(id, "message", "Sent: "+title, "Message").then(()=>{ delete HIST[id]; if(S.v==="b") loadHist(id); }).catch(()=>{});
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
  logLater(id, "call", "Call: "+b.dataset.out, "Call").then(r=>{ toast(r==="queued"?"Call saved on this phone, will sync when online":"Call noted"); delete HIST[id]; if(S.v==="b") loadHist(id); }).catch(()=>toast("Couldn't save", true));
});

/* ============================== NEW / EDIT BOOKING ============================== */
/* Checklist: the package's steps from the price list (one source with the website), its add-ons, and a final walk-round. */
const CKOPEN=new Set();
const clock = iso => new Date(iso).toLocaleTimeString("en-IN",{hour:"numeric", minute:"2-digit", timeZone:"Asia/Kolkata"});
function pkgItems(name, seen){
  for(const t of ["car","bike"]){ const p=PKG[t].find(x=>x.n===name); if(!p) continue;
    return p.i.flatMap(it=>{ const m=it.match(/^Everything in (.+)$/i); if(!m) return [it];
      const q=PKG[t].find(x=>x.n.toLowerCase().startsWith(m[1].toLowerCase())); return q && !(seen||[]).includes(q.n) ? pkgItems(q.n, [...(seen||[]), name]) : []; }); }
  return [];
}
function checklist(j){ if(Array.isArray(j.items) && j.items.length) return j.items; const ex=String(j.extras||"").split(/\s*,\s*/).filter(x=>x && x!=="None"); return [...new Set([...pkgItems(j.package), ...ex, "Final walk-round with the customer"])]; }
const ckCount = j => { const it=checklist(j); return `${it.filter(x=>(j.checks||[]).includes(x)).length}/${it.length}`; };
function checkHTML(j, inCard){
  const has=j.checks||[], list=`<div class="cklist">${checklist(j).map(x=>`<label class="ck${has.includes(x)?" on":""}"><input type="checkbox" data-check="${esc(x)}" ${has.includes(x)?"checked":""}><span>${esc(x)}</span></label>`).join("")}</div>`;
  return inCard ? `<details class="ckwrap" data-ck="${esc(j.id)}"${CKOPEN.has(j.id)?" open":""}><summary><span>Checklist · <b>${ckCount(j)}</b></span></summary>${list}</details>` : list;
}
document.addEventListener("toggle", e => { const d=e.target; if(!d.matches || !d.matches("[data-ck]")) return; d.open ? CKOPEN.add(d.dataset.ck) : CKOPEN.delete(d.dataset.ck); }, true);
document.addEventListener("change", e => {
  const c=e.target.closest("[data-check]"); if(!c) return; const id=c.closest("[data-id]").dataset.id, j=JOBS.get(id); if(!j) return;
  const it=c.dataset.check, on=c.checked, checks=(j.checks||[]).filter(x=>x!==it).concat(on?[it]:[]);
  if(on) buzz(8);
  bookCall(id, "staff_check", {p_id:id, p_item:it, p_on:on}, {checks}, on?"Tick "+it:"Untick "+it); if(on) fx("ck:"+id, it);
});
// Washed with items not ticked: ask for a second tap
document.addEventListener("click", e => {
  const a=e.target.closest('[data-act="done"]'); if(!a) return; const h=a.closest("[data-id]"), j=h&&JOBS.get(h.dataset.id); if(!j) return;
  const left=checklist(j).filter(x=>!(j.checks||[]).includes(x)).length;
  if(!left || a.dataset.sure) return;
  e.preventDefault(); e.stopImmediatePropagation(); a.dataset.sure="1"; toast(`${left} checklist item${left>1?"s":""} not ticked. Tap Mark washed again if it's done.`, true);
  setTimeout(()=>{ if(a.isConnected) delete a.dataset.sure; }, 5000);
}, true);
/* Wash timer: Start wash → Mark washed. Analytics shows the average time. */
function timerCall(id, what){
  if(what==="start") fx(id, "start");
  return bookCall(id, "staff_timer", {p_id:id, p_what:what}, {started_at: what==="start"?new Date().toISOString():null}, what==="start"?"Start wash":"Undo start")
    .then(r=>{ if(r){ if(what==="start"){ buzz(12); toast("Wash started. Tap Mark washed when you finish.", false, {undo:()=>timerCall(id, "reset")}); } else toast("Start undone"); }
      delete HIST[id]; if(S.v==="b" && r==="ok") loadHist(id); drawLive(); });
}
document.addEventListener("click", e => {
  const t=e.target.closest("[data-timer]"); if(!t) return; const h=t.closest("[data-id]"); if(!h) return; timerCall(h.dataset.id, t.dataset.timer);
});
setInterval(() => $$("[data-since]").forEach(x => x.textContent = mins(x.dataset.since)), 30e3);
/* Saved note for a customer: shows on all their bookings. */
document.addEventListener("click", e => {
  if(!e.target.closest("[data-cnote]")) return; const h=e.target.closest("[data-id]"), j=h&&JOBS.get(h.dataset.id); if(!j) return;
  openSheet("Saved note for "+first(j.name), `<form id="cnForm" class="menu" data-for="${esc(j.id)}"><p class="muted small">Shows on every booking for ${esc(fmtPhone(j.phone))}, today and later. For example the gate code, parking spot, "call before you come", or how they like it done. Not for payment or personal details.</p>
    <textarea class="input" id="cnIn" rows="4" maxlength="300" placeholder="Gate code 4512 · car in B2, slot 14 · call 10 min before">${esc(j.cust_note||"")}</textarea>
    <button class="btn primary lg" type="submit">Save</button></form>`);
  setTimeout(()=>{ const t=$("cnIn"); if(t) t.focus(); }, 60);
});
document.addEventListener("submit", async e => {
  if(e.target.id!=="cnForm") return; e.preventDefault(); const id=e.target.dataset.for, j=JOBS.get(id), v=$("cnIn").value.trim().slice(0,300); if(!j) return;
  closeSheet(); const r=await bookCall(id, "staff_save_customer_note", {p_phone:j.phone, p_note:v}, {cust_note:v}, "Saved note");
  if(r){ for(const [k,x] of JOBS) if(x.phone===j.phone && k!==id) JOBS.set(k, Object.assign({}, x, {cust_note:v})); redraw(); toast(r==="queued"?"Saved on this phone, will sync when online":v?"Note saved for every visit":"Saved note removed"); }
});

/* Route: the day's open jobs in time order, same area together, opened in Google Maps (10 stops per link). */
let ROUTE_BY="time";
const addrOf = j => [j.address, j.area, "Mumbai", j.pin].filter(Boolean).join(", ");
function mapsDir(stops, origin){ const enc=encodeURIComponent, last=stops[stops.length-1], mid=stops.slice(0,-1);
  return "https://www.google.com/maps/dir/?api=1"+(origin?"&origin="+enc(origin):"")+"&destination="+enc(last)+(mid.length?"&waypoints="+mid.map(enc).join("%7C"):"")+"&travelmode=driving"; }
function routeJobs(){
  const meId=S.me&&S.me.id; let jobs=(DAY?DAY.jobs:[]).map(j=>JOBS.get(j.id)||j).filter(j=>j.wash_date===S.day && ["new","confirmed","on_way"].includes(j.status));
  if(!isOwner() && S.mine && jobs.some(j=>j.assigned_to===meId)) jobs=jobs.filter(j=>j.assigned_to===meId || !j.assigned_to);
  const si=s=>{ const i=SLOTS.indexOf(s); return i<0?99:i; };
  if(ROUTE_BY==="area"){ const first={}; jobs.forEach(j=>{ const a=j.area||j.pin||""; first[a]=Math.min(first[a]??99, si(j.slot)); });
    return jobs.sort((a,b)=>first[a.area||a.pin||""]-first[b.area||b.pin||""] || (a.area||"").localeCompare(b.area||"") || si(a.slot)-si(b.slot)); }
  return jobs.sort((a,b)=>si(a.slot)-si(b.slot) || (a.area||"").localeCompare(b.area||"") || String(a.pin).localeCompare(String(b.pin)));
}
function routeSheet(){
  const jobs=routeJobs(); if(!jobs.length) return toast("No open jobs left on this day");
  const chunks=[]; for(let i=0;i<jobs.length;i+=10) chunks.push(jobs.slice(i,i+10));
  let area=null;
  openSheet(`Route · ${relDay(S.day)}`, `<div class="menu"><div class="seg"><button type="button" data-rby="time" class="${ROUTE_BY==="time"?"on":""}">By time</button><button type="button" data-rby="area" class="${ROUTE_BY==="area"?"on":""}">Same area together</button></div>
    <ol class="route">${jobs.map((j,i)=>{ const head=ROUTE_BY==="area" && (j.area||"")!==area ? `<li class="route-area">${esc((area=j.area||"")||"No area")}</li>` : ""; return head+`<li><span class="route-n">${i+1}</span><div class="lr-main"><b>${esc(j.slot)} · ${esc(j.name)}</b><span>${esc(addrOf(j))}</span></div><a class="btn sm" target="_blank" rel="noopener" href="${mapUrl(j)}">${I.map}</a></li>`; }).join("")}</ol>
    ${chunks.map((c,k)=>`<a class="btn primary lg" target="_blank" rel="noopener" href="${mapsDir(c.map(addrOf), k?addrOf(chunks[k-1][chunks[k-1].length-1]):"")}">${I.route}Open in Google Maps${chunks.length>1?` · stops ${k*10+1}–${k*10+c.length}`:""}</a>`).join("")}
    <p class="small muted">Starts from where you are. Google Maps works out the roads; the order of stops is the order above.</p></div>`);
}
document.addEventListener("click", e => {
  if(e.target.closest("[data-route]")) return routeSheet();
  const r=e.target.closest("[data-rby]"); if(r){ ROUTE_BY=r.dataset.rby; routeSheet(); }
});

/* Move a day (rain): owner moves the day's open bookings to another day, then tells each customer on WhatsApp. */
function moveSheet(){
  const jobs=(DAY?DAY.jobs:[]).map(j=>JOBS.get(j.id)||j).filter(j=>j.wash_date===S.day && !["done","cancelled"].includes(j.status))
    .sort((a,b)=>SLOTS.indexOf(a.slot)-SLOTS.indexOf(b.slot));
  if(!jobs.length) return toast("Nothing to move on this day");
  const to=addDays(S.day<istToday()?istToday():S.day, 1);
  openSheet(`Move ${relDay(S.day).toLowerCase()==="today"?"today":fmtDay(S.day)}'s bookings`, `<form id="mvForm" class="menu"><p class="muted small">For rain or a day off. Tick the bookings to move and pick the new day. Then send each customer a WhatsApp message.</p>
    <div class="cklist">${jobs.map(j=>`<label class="ck on"><input type="checkbox" data-mv="${esc(j.id)}" checked><span><b>${esc(j.slot)}</b> · ${esc(j.name)} · ${esc(j.package)}</span></label>`).join("")}</div>
    <div class="form-grid"><label class="field">New day<input type="date" id="mvDate" min="${istToday()}" value="${to}"></label>
      <label class="field">Time<select id="mvSlot"><option value="">Keep each booking's time</option>${SLOTS.map(x=>`<option value="${esc(x)}">${esc(x)}</option>`).join("")}</select></label>
      <label class="field">Reason (shows in the history)<input id="mvWhy" value="Rain" maxlength="60"></label></div>
    <div class="alert warn" id="mvLoad" hidden></div>
    <button class="btn primary lg" type="submit" id="mvGo">Move ${jobs.length} booking${jobs.length>1?"s":""}</button></form>`);
  mvLoad();
}
async function mvLoad(){
  const d=$("mvDate")&&$("mvDate").value, el=$("mvLoad"); if(!d||!el) return;
  try{ const x=await rpc("staff_slots",{p_from:d, p_to:d}); if($("mvDate").value!==d) return;
    const n=(x.counts||[]).reduce((a,c)=>a+c.n,0), why=closedWhy(x, d, $("mvSlot").value||SLOTS[0]), full=(x.caps||[]).filter(c=>c.cap!=null && ((x.counts||[]).find(k=>k.slot===c.slot)||{}).n>=c.cap).map(c=>c.slot);
    const m=[]; if(why) m.push(`${fmtDay(d)} is closed (${esc(why)}).`); if(n) m.push(`${fmtDay(d)} already has ${n} booking${n>1?"s":""}.`); if(full.length) m.push(`Full: ${full.map(esc).join(", ")}.`);
    el.hidden=!m.length; el.innerHTML=m.join(" ")+(m.length?" You can still move them.":""); }catch(e){ el.hidden=true; }
}
document.addEventListener("change", e => { if(e.target.id==="mvDate"||e.target.id==="mvSlot") mvLoad(); const c=e.target.closest("[data-mv]"); if(c){ c.closest(".ck").classList.toggle("on", c.checked); const n=$$("[data-mv]:checked").length, b=$("mvGo"); if(b){ b.disabled=!n; b.textContent=`Move ${n} booking${n===1?"":"s"}`; } } });
document.addEventListener("click", e => { if(e.target.closest("[data-moveday]")) moveSheet(); });
document.addEventListener("submit", async e => {
  if(e.target.id!=="mvForm") return; e.preventDefault();
  const ids=$$("[data-mv]:checked").map(x=>x.dataset.mv), d=$("mvDate").value, b=$("mvGo"); if(!ids.length||!d) return;
  b.disabled=true; b.textContent="Moving…";
  try{
    const moved=await rpc("owner_move_day",{p_ids:ids, p_date:d, p_slot:$("mvSlot").value||null, p_reason:$("mvWhy").value.trim()}); remember(moved);
    cache.set("day."+S.day, null); cache.set("day."+d, null);
    openSheet(`Moved ${moved.length} to ${fmtDay(d)}`, `<div class="menu"><p class="muted small">Now tell each customer. Each button opens WhatsApp with the message ready; send it, then come back for the next.</p>
      ${moved.map(j=>`<div class="list-row mv-row" style="cursor:default"><div class="lr-main"><b>${esc(j.name)}</b><span>${esc(j.slot)} · ${esc(j.package)}</span></div><a class="btn wa sm" target="_blank" rel="noopener" data-mvsent="${esc(j.id)}" href="${wa(j.phone, fill("moved", jobCtx(j)))}">${I.chat}WhatsApp</a></div>`).join("")}
      <p class="small muted">Change the wording in Settings → WhatsApp messages → Moved (rain day).</p></div>`);
    toast(`Moved ${moved.length} booking${moved.length>1?"s":""}`); vJobs();
  }catch(x){ b.disabled=false; b.textContent="Try again"; toast(x.message||"Couldn't move", true); }
});
document.addEventListener("click", e => {
  const a=e.target.closest("[data-mvsent]"); if(!a) return; const id=a.dataset.mvsent;
  setTimeout(()=>{ a.classList.remove("wa"); a.innerHTML="Sent ✓"; a.closest(".mv-row").classList.add("sent"); }, 300);
  logLater(id, "message", "Sent: Moved (rain day)", "Message").catch(()=>{});
});

/* Before/after photos: shrunk on the phone to about 1280 px, kept in the private "job-photos" Storage bucket. */
const PH={}, UPL={};
async function setPhotos(id, rows, local){
  const known=new Map((PH[id]||[]).map(p=>[p.path,p.url])); Object.entries(local||{}).forEach(([k,v])=>known.set(k,v));
  const need=rows.filter(r=>!known.get(r.path)).map(r=>r.path);
  try{ (await signUrls(need)).forEach(x=>known.set(x.path,x.url)); }catch(e){}
  PH[id]=rows.map(r=>Object.assign({}, r, {url:known.get(r.path)||""})); drawPhotos(id);
}
async function loadPhotos(id){ try{ await setPhotos(id, await rpc("staff_photos",{p_id:id})); }catch(e){ PH[id]=PH[id]||[]; drawPhotos(id); } }
function photosHTML(id){
  const ph=PH[id], up=UPL[id]||0;
  if(!ph) return `<div class="skel" style="height:90px"></div>`;
  if(!ph.length && !up) return `<p class="muted small">No photos yet. Take a <b>Before</b> photo when you arrive and an <b>After</b> photo when you finish.</p>`;
  return `<div class="photos">${ph.map(p=>`<figure><a href="${esc(p.url)}" target="_blank" rel="noopener">${p.url?`<img src="${esc(p.url)}" alt="${p.kind} photo" loading="lazy">`:""}</a><figcaption><span class="pill ${p.kind==="after"?"st-done":"st-new"}">${p.kind==="after"?"After":"Before"}</span>${p.mine||isOwner()?`<button type="button" class="ph-del" data-delphoto="${p.id}" aria-label="Delete photo">✕</button>`:""}</figcaption></figure>`).join("")}${Array.from({length:up},()=>'<figure class="uploading"><span>Uploading…</span></figure>').join("")}</div>`;
}
function drawPhotos(id){ if(S.v!=="b" || S.arg!==id) return; const el=$("photos"); if(el) setHTML(el, photosHTML(id)); const b=$("phSend"); if(b) b.hidden=!(PH[id]||[]).length; }
async function shrink(file){
  let img; try{ img=await createImageBitmap(file, {imageOrientation:"from-image"}); }
  catch(e){ img=await new Promise((ok,no)=>{ const i=new Image(); i.onload=()=>ok(i); i.onerror=()=>no(new Error("Couldn't read that photo")); i.src=URL.createObjectURL(file); }); }
  const k=Math.min(1, 1280/Math.max(img.width, img.height)), c=document.createElement("canvas"); c.width=Math.round(img.width*k); c.height=Math.round(img.height*k);
  c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
  return new Promise((ok,no)=>c.toBlob(b=>b?ok(b):no(new Error("Couldn't read that photo")), "image/jpeg", 0.8));
}
async function addPhotos(id, kind, files){
  if(!navigator.onLine) return toast("Photos need internet. Take them with the camera now and add them here when you're back online.", true);
  const list=[...files].slice(0,6); UPL[id]=(UPL[id]||0)+list.length; drawPhotos(id); let ok=0;
  for(const f of list){
    try{
      const blob=await shrink(f), path=`${id}/${kind}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,6)}.jpg`;
      await storage("object/"+BUCKET+"/"+path, {method:"POST", headers:{"Content-Type":"image/jpeg", "x-upsert":"false"}, body:blob});
      UPL[id]--; await setPhotos(id, await rpc("staff_add_photo",{p_id:id, p_path:path, p_kind:kind}), {[path]:URL.createObjectURL(blob)}); ok++;
    }catch(e){ UPL[id]--; drawPhotos(id); if(e.message!=="signed out") toast(netDown(e)?"Upload stopped: no internet":(e.message||"Couldn't upload the photo"), true); }
  }
  if(ok){ toast(ok===1?"Photo added":ok+" photos added"); delete HIST[id]; if(S.v==="b") loadHist(id); }
}
document.addEventListener("change", e => { const f=e.target.closest("[data-photo]"); if(!f || !f.files.length) return; const id=f.closest("[data-id]").dataset.id; addPhotos(id, f.dataset.photo, f.files); f.value=""; });
document.addEventListener("click", async e => {
  const d=e.target.closest("[data-delphoto]"); if(!d) return; e.preventDefault();
  if(!d.dataset.sure){ d.dataset.sure="1"; d.textContent="Delete?"; d.classList.add("sure"); setTimeout(()=>{ if(d.isConnected){ delete d.dataset.sure; d.textContent="✕"; d.classList.remove("sure"); } }, 3000); return; }
  const id=S.arg, p=(PH[id]||[]).find(x=>String(x.id)===d.dataset.delphoto); if(!p) return;
  try{ await removeFiles([p.path]); await setPhotos(id, await rpc("staff_delete_photo",{p_photo:p.id})); toast("Photo deleted"); delete HIST[id]; loadHist(id); }
  catch(x){ if(x.message!=="signed out") toast(x.message||"Couldn't delete", true); }
});
/* Send photos: share the files (phones) or WhatsApp links that work for 7 days. Both are prepared before the tap. */
let PHSHARE=null;
async function sendPhotos(id){
  const j=JOBS.get(id), ph=PH[id]||[]; if(!j || !ph.length) return;
  const text=`Hi ${first(j.name)}, here are the photos of your ${vehShort(j.vehicle).toLowerCase()} from the ${j.package}. Thank you for choosing ${SITE.name}!`;
  const share=!!(navigator.share && navigator.canShare);
  openSheet("Send photos to "+first(j.name), `<div class="menu" data-phfor="${esc(id)}"><p class="muted small">${ph.length} photo${ph.length>1?"s":""} (${ph.filter(p=>p.kind==="before").length} before, ${ph.filter(p=>p.kind==="after").length} after).</p>
    ${share?`<button class="btn wa" type="button" data-phshare disabled>Preparing photos…</button><p class="small muted">Then pick WhatsApp and ${esc(first(j.name))}'s chat.</p>`:""}
    <a class="btn${share?"":" wa"}" target="_blank" rel="noopener" data-phlinks aria-disabled="true">Preparing links…</a><p class="small muted">Opens ${esc(first(j.name))}'s chat with links to the photos. The links stop working after 7 days.</p></div>`);
  PHSHARE={id, text, files:null};
  signUrls(ph.map(p=>p.path), 7*86400).then(list=>{ const a=document.querySelector("[data-phlinks]"); if(!a) return;
    a.href=wa(j.phone, text+"\n\n"+ph.map((p,i)=>`${p.kind==="after"?"After":"Before"} ${i+1}: ${(list.find(x=>x.path===p.path)||{}).url}`).join("\n")); a.removeAttribute("aria-disabled"); a.textContent="Send links on WhatsApp"; })
    .catch(()=>{ const a=document.querySelector("[data-phlinks]"); if(a) a.textContent="Couldn't make links. Check the internet."; });
  if(share) Promise.all(ph.map((p,i)=>fetch(p.url).then(r=>r.blob()).then(b=>new File([b], `${j.id}-${p.kind}-${i+1}.jpg`, {type:"image/jpeg"}))))
    .then(files=>{ const b=document.querySelector("[data-phshare]"); if(!b) return; if(!navigator.canShare({files})){ b.remove(); return; } PHSHARE.files=files; b.disabled=false; b.textContent="Share the photos"; })
    .catch(()=>{ const b=document.querySelector("[data-phshare]"); if(b) b.remove(); });
}
document.addEventListener("click", e => {
  if(e.target.closest("[data-phsend]")) return sendPhotos(S.arg);
  const sh=e.target.closest("[data-phshare]");
  if(sh && PHSHARE && PHSHARE.files){ const {id, text, files}=PHSHARE; navigator.share({files, text}).then(()=>{ logLater(id, "message", "Sent photos", "Message").then(()=>{ delete HIST[id]; if(S.v==="b") loadHist(id); }).catch(()=>{}); closeSheet(); }).catch(()=>{}); return; }
  const ln=e.target.closest("[data-phlinks]");
  if(ln){ if(ln.getAttribute("aria-disabled")){ e.preventDefault(); return; } const id=ln.closest("[data-phfor]").dataset.phfor; closeSheet(); logLater(id, "message", "Sent photos", "Message").then(()=>{ delete HIST[id]; if(S.v==="b") loadHist(id); }).catch(()=>{}); }
});

/* UPI QR for the customer to scan on the washer's phone */
const upiUrl = j => "upi://pay?pa="+encodeURIComponent(SITE.upiId)+"&pn="+encodeURIComponent(SITE.upiName||SITE.name)+"&am="+j.total+"&cu=INR&tn="+encodeURIComponent("Booking "+j.id);
function qrSheet(id){
  const j=JOBS.get(id); if(!j) return; if(!SITE.upiId) return toast("No UPI ID set yet", true);
  let svg=""; try{ const q=qrcode(0,"M"); q.addData(upiUrl(j)); q.make(); svg=q.createSvgTag({cellSize:6, margin:2, scalable:true}); }catch(e){}
  openSheet("Scan to pay", `<div class="menu qr-sheet" data-id="${esc(id)}"><div class="qr-box">${svg||`<p class="muted">Couldn't draw the QR code. Give the customer the UPI ID below.</p>`}</div>
    <div class="qr-amt num">${rupee(j.total)}</div><p class="muted small" style="text-align:center">${esc(j.name)} · ${esc(j.id)}<br>The customer scans this with Google Pay, PhonePe, Paytm or any UPI app. The amount is filled in.</p>
    <div class="keybox"><span style="flex:1">${esc(SITE.upiId)}</span><button class="btn sm" type="button" data-copyupi>Copy</button></div>
    ${isPaid(j)?'<span class="pill st-done">Already paid</span>':`<button class="btn coral lg" data-act="paid_upi">They've paid · Paid by UPI</button>`}</div>`, "qr:"+id);
}
document.addEventListener("click", e => {
  const q=e.target.closest("[data-qr]"); if(q){ const h=q.closest("[data-id]"); if(h){ e.preventDefault(); qrSheet(h.dataset.id); } return; }
  if(e.target.closest("[data-copyupi]")) navigator.clipboard.writeText(SITE.upiId).then(()=>toast("UPI ID copied")).catch(()=>{});
});

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
/* Slot limits and days off (Settings → Slots & days off) */
function closedWhy(info, d, slot){
  if(!info) return null;
  const c=(info.closures||[]).find(x=>x.day===d && (!x.slot || x.slot===slot)); if(c) return c.reason||"Closed";
  const wd=String(info.closed_weekdays||"").split(",").filter(Boolean), dow=((new Date(d+"T12:00:00Z").getUTCDay()+6)%7)+1;
  return wd.includes(String(dow)) ? "Weekly day off" : null;
}
async function clash(){
  const el=$("fClash"); if(!el) return; const d=$("fDate").value, sl=($("fSlot").querySelector(".on")||{}).dataset;
  if(!d){ el.hidden=true; return; }
  let day=cache.get("day."+d), info=cache.get("slots."+d);
  await Promise.all([rpc("staff_day",{p_date:d}).then(r=>{ day=r; cache.set("day."+d,r); }).catch(()=>{}), rpc("staff_slots",{p_from:d, p_to:d}).then(r=>{ info=r; cache.set("slots."+d,r); }).catch(()=>{})]);
  if(!$("fClash") || $("fDate").value!==d) return;
  const jobs=((day&&day.jobs)||[]).filter(x=>x.status!=="cancelled" && x.id!==F.id), cap=sl2=>((info&&info.caps)||[]).find(c=>c.slot===sl2);
  $$("#fSlot .chip").forEach(c=>{ const s=c.dataset.slot, n=jobs.filter(x=>x.slot===s).length, k=cap(s), why=closedWhy(info,d,s);
    const tag = why ? "closed" : k&&k.cap!=null ? (n>=k.cap?"full":`${n}/${k.cap}`) : n ? String(n) : "";
    c.innerHTML=esc(s)+(tag?`<small class="slot-tag${why||(k&&k.cap!=null&&n>=k.cap)?" bad":""}">${tag}</small>`:""); });
  if(!sl||!sl.slot){ el.hidden=true; return; }
  const same=jobs.filter(x=>x.slot===sl.slot), k=cap(sl.slot), why=closedWhy(info,d,sl.slot), msg=[];
  if(why) msg.push(`<b>${fmtDay(d)}${(info.closures||[]).some(x=>x.day===d&&x.slot)?" at "+esc(sl.slot):""} is closed</b> (${esc(why)}). You can still save it.`);
  else if(k && k.cap!=null && same.length>=k.cap) msg.push(`<b>${esc(sl.slot)} is full</b>: ${same.length} of ${k.cap} booked. You can still save it.`);
  if(same.length) msg.push(`Already at ${esc(sl.slot)} on ${fmtDay(d)}: ${same.map(x=>esc(first(x.name))+(x.assigned_name?" ("+esc(first(x.assigned_name))+")":"")).join(", ")}`);
  el.hidden=!msg.length; el.innerHTML=msg.join("<br>");
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
    if(last && last.cust_note) m.innerHTML+=`<br>${I.pin} Saved note: <b>${esc(last.cust_note)}</b>`;
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
  }catch(x){ if(x.message==="signed out") return; err.hidden=false; err.textContent=netDown(x)?"No internet, so this isn't saved yet. Keep this screen open and tap Save again when you're back online.":(x.message||"Couldn't save. Try again."); btn.disabled=false; btn.textContent=F.editing?"Save changes":"Save booking"; }
});
document.addEventListener("click", e => { const b=e.target.closest("[data-sentconf]"); if(b && !b.dataset.act){ const id=b.closest("[data-id]").dataset.id; logLater(id, "message", "Sent: Confirm booking", "Message").catch(()=>{}); } });
async function delBooking(b){
  if(!b.dataset.sure){ b.dataset.sure="1"; b.textContent="Tap again to delete for good"; setTimeout(()=>{ if(b.isConnected){ delete b.dataset.sure; b.textContent="Delete booking"; } },4000); return; }
  try{ const r=await rpc("owner_delete_booking",{p_id:F.id}); removeFiles(r&&r.photos).catch(()=>{}); delete PH[F.id]; const j=JOBS.get(F.id); JOBS.delete(F.id); if(j) cache.set("day."+j.wash_date,null); closeSheet(); toast("Booking deleted"); if(S.v==="b") go(S.from||homeView()); else route(); }
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
    const recent = d => d.reminder_sent_at && Date.now()-new Date(d.reminder_sent_at) < 7*864e5, fresh=DUE.filter(d=>!recent(d)), later=DUE.filter(recent);
    const dueCard = d => { const i=DUE.indexOf(d); return `<section class="card${recent(d)?" muted-card":""}"><div class="card-head"><h2>${esc(d.name)}</h2><span class="pill st-collect">${d.days_ago} days</span></div>
      <p class="small muted">${esc(d.vehicle)} · last: ${esc(d.package)} on ${fmtDay(d.last_date)}${d.area?" · "+esc(d.area):""}<br>${d.washes} wash${d.washes>1?"es":""}${d.reminder_sent_at?` · reminded ${ago(d.reminder_sent_at)}`:""}</p>
      <div class="row" style="margin-top:12px"><a class="btn wa sm" target="_blank" rel="noopener" data-rebook="${i}" href="${wa(d.phone, fill("rebook", {first_name:first(d.name), brand:SITE.name, days:d.days_ago, package:d.package, book_link:BASE+"book.html"}))}">Send rebook message</a><a class="btn sm" href="${tel(d.phone)}">Call</a><button class="btn sm" type="button" data-newfor="${d.phone}">New booking</button></div></section>`; };
    el.innerHTML = DUE.length ? `<p class="small muted" style="margin-bottom:12px">${fresh.length} customer${fresh.length===1?"":"s"} with nothing booked whose last wash was ${S.cu.due}+ days ago. Plan and society customers aren't listed.</p>`
      + (fresh.length?`<div class="grid grid-3">${fresh.map(dueCard).join("")}</div>`:`<section class="card empty"><b>Everyone due has been reminded</b>They're below. They come back to the top 7 days after the reminder.</section>`)
      + (later.length?`<div class="grp" style="margin-top:18px"><h2>Reminded in the last 7 days · ${later.length}</h2></div><div class="grid grid-3">${later.map(dueCard).join("")}</div>`:"")
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
      <div style="margin:12px 0">${pills("lead",l.id,l.status,LEAD_ST)}</div><div class="row"><a class="btn wa sm" target="_blank" rel="noopener" href="${wa(l.phone, fill("lead",{first_name:first(l.contact_name), brand:SITE.name, society:l.society}))}">WhatsApp</a><a class="btn sm" href="${tel(l.phone)}">Call</a><button class="btn sm" type="button" data-lead2c="${l.id}">${I.repeat}Start contract</button></div></section>`).join("")}</div>` : empty("No society requests yet");
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
const AN_RANGES = {week:["7 days",()=>[addDays(istToday(),-6),istToday()]], d30:["30 days",()=>[addDays(istToday(),-29),istToday()]], d90:["90 days",()=>[addDays(istToday(),-89),istToday()]],
  month:["This month",()=>[monthStart(istToday()),istToday()]], last:["Last month",()=>{ const e=addDays(monthStart(istToday()),-1); return [monthStart(e),e]; }]};
let AN=null;
let DUR=null;
async function vAnalytics(){ const k="an."+S.an; AN=cache.get(k); DUR=cache.get("dur."+S.an); dAnalytics(); try{ const [f,t]=AN_RANGES[S.an][1]();
  const [a,d,c]=await Promise.all([rpc("owner_analytics",{p_from:f, p_to:t}), rpc("owner_durations",{p_from:f, p_to:t}).catch(()=>null), rpc("owner_cancel_reasons",{p_from:f, p_to:t}).catch(()=>null)]); AN=a; DUR=d; CXR=c; cache.set(k,AN); cache.set("dur."+S.an,DUR); dAnalytics(); }catch(e){ quiet(e); } }
let CXR=null;
const durRows = list => list&&list.length ? `<table class="mini"><tbody>${list.map(x=>`<tr><td>${esc(x.name)}</td><td class="muted">${x.n} timed</td><td class="num"><b>${x.avg} min</b></td></tr>`).join("")}</tbody></table>` : "";
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
  html += `<div class="grid grid-kpi">${k("Bookings",c.booked,delta(c.booked,p.booked))}${k("Washed",c.washed,delta(c.washed,p.washed))}${k("Collected",rupee(c.collected),delta(c.collected,p.collected,false,true)+(c.plans_collected?`<div class="knote">incl. ${rupee(c.plans_collected)} from plans</div>`:""))}${k("Average bill",rupee(c.avg_ticket),delta(c.avg_ticket,p.avg_ticket,false,true))}
      ${k("New customers",c.new_customers,delta(c.new_customers,p.new_customers))}${k("Cancelled",c.cancelled,delta(c.cancelled,p.cancelled,true),c.cancelled?"warn":"")}${k("Discounts given",rupee(c.discounts),delta(c.discounts,p.discounts,true,true))}${k("Profit",rupee(profit),delta(profit,pprofit,false,true),profit<0?"warn":"good")}</div>
    <section class="card"><div class="card-head"><h2>Bookings per day</h2><span class="small muted">Booked ${rupee(c.booked_value)} · collected ${rupee(c.collected)}</span></div>
      <div class="bars">${AN.series.map(x=>`<div class="b${x.count?"":" zero"}${x.date===t?" now":""}" title="${fmtDay(x.date)}: ${x.count} booking${x.count===1?"":"s"}, ${rupee(x.amount)} paid"><em>${x.count||""}</em><i style="height:${Math.round(x.count/max*100)}%"></i></div>`).join("")}</div>
      <div class="bar-labels">${AN.series.map((x,i)=>`<span>${i%step===0?fmtDay(x.date,{day:"numeric", month:"short"}):""}</span>`).join("")}</div></section>
    <div class="grid grid-2"><section class="card"><div class="card-head"><h2>From booking to review</h2></div><div class="funnel">${fun.map(([l,n])=>`<div class="f"><span>${l}</span><i style="width:${Math.max(1,Math.round(n/fmax*100))}%"></i><b class="num">${n}</b></div>`).join("")}</div>
        <p class="small muted" style="margin-top:12px">${c.rating?`Average rating <b>${c.rating}★</b> from ${c.reviews} review${c.reviews===1?"":"s"}.`:"No reviews in this range yet."}</p></section>
      <section class="card"><div class="card-head"><h2>Where bookings came from</h2></div>${donut(AN.sources.map(s=>({label:SOURCE[s.name]||s.name, count:s.count})))}</section></div>
    <div class="grid grid-2"><section class="card"><div class="card-head"><h2>Packages</h2></div>${hbars(AN.packages,"#9BCB2E",true)}</section><section class="card"><div class="card-head"><h2>Areas</h2></div>${hbars(AN.areas,"#0B7F6F")}</section></div>
    <div class="grid grid-2"><section class="card"><div class="card-head"><h2>Time slots</h2></div>${hbars(AN.slots,"#F08A5D")}</section><section class="card"><div class="card-head"><h2>Washes per washer</h2></div>${hbars(AN.washers,"#2F4566",true)}</section></div>
    <div class="grid grid-2"><section class="dark-card"><div class="label">Profit in this range</div><div class="big">${rupee(profit)}</div><div class="muted small">collected ${rupee(c.collected)} − costs ${rupee(c.costs||0)}${c.expenses||c.wages?` (incl. ${[c.expenses?rupee(c.expenses)+" bills":"", c.wages?rupee(c.wages)+" washer pay":""].filter(Boolean).join(", ")})`:""}</div>
        <dl class="dl" style="color:#F3F5F1"><dt class="muted">Cost per wash</dt><dd>${c.washed?rupee((c.costs||0)/c.washed):"–"}</dd><dt class="muted">Ad cost per new customer</dt><dd>${c.new_customers&&c.ads?rupee(c.ads/c.new_customers):"–"}</dd><dt class="muted">Car / bike</dt><dd>${AN.vehicles.map(v=>`${v.count} ${v.name}`).join(" · ")||"–"}</dd></dl>
        <button class="btn sm" type="button" data-go="settings/costs" style="align-self:flex-start">Edit monthly costs</button></section>
      <section class="card"><div class="card-head"><h2>Offers used</h2></div>${hbars(AN.offers,"#C9A23A",true)}</section></div>
    ${CXR&&CXR.length?`<section class="card"><div class="card-head"><h2>Why bookings were cancelled</h2><span class="muted small">${CXR.reduce((a,x)=>a+x.n,0)} cancelled</span></div>${hbars(CXR.map(x=>({name:x.name, count:x.n})),"#FF895C")}</section>`:""}
    <section class="card"><div class="card-head"><h2>Time per wash</h2>${DUR&&DUR.n?`<span class="pill st-confirmed">${DUR.avg} min on average</span>`:""}</div>
      ${DUR&&DUR.n?`<div class="grid grid-2"><div><p class="opt-h">By package</p>${durRows(DUR.packages)}</div><div><p class="opt-h">By washer</p>${durRows(DUR.washers)}</div></div>`
        :`<p class="muted small">No timed washes yet. When washers tap <b>Start wash</b> and then <b>Mark washed</b>, the average time per package and per washer shows here.</p>`}</section>
    <section class="card"><div class="card-head"><h2>How these are counted</h2></div><dl class="dl small"><dt>Bookings</dt><dd>Wash day in the range, not cancelled.</dd><dt>Time per wash</dt><dd>From Start wash to Mark washed, for washes in the range. Times under 3 minutes or over 8 hours are left out.</dd><dt>Collected</dt><dd>Bookings in the range marked paid (UPI or cash).</dd><dt>Profit</dt><dd>Collected minus Settings → Monthly costs, shared over the days of each month in the range.</dd><dt>New customers</dt><dd>Mobile numbers whose first booking falls in the range.</dd><dt>Compared with</dt><dd>The same number of days just before the range.</dd></dl></section>`;
  V().innerHTML = `<div class="rise" style="display:flex;flex-direction:column;gap:16px">${html}</div>`;
}
document.addEventListener("click", e => { const a=e.target.closest("[data-an]"); if(a){ S.an=a.dataset.an; store.set("vb.an",S.an); AN=null; vAnalytics(); } });

/* ============================== SETTINGS (owner) — Team inside, like Studio CRM ============================== */
let TEAM=null, OFFERS=null, COSTS=null, AUDIT=null, SLOTSET=null, PAY=null;
const PAY_RANGES={week:["This week",()=>{ const t=istToday(), d=new Date(t+"T12:00:00Z"), back=(d.getUTCDay()+6)%7; return [addDays(t,-back), t]; }],
  month:["This month",()=>[monthStart(istToday()), istToday()]], last:["Last month",()=>{ const m=monthStart(istToday()), d=new Date(m+"T12:00:00Z"); d.setUTCMonth(d.getUTCMonth()-1); const lm=d.toISOString().slice(0,10); return [lm, monthEnd(lm)]; }]};
const payStatement=(w,f,t)=>{ const cars=w.jobs.filter(x=>!/bike/i.test(x.vehicle)).reduce((a,x)=>a+x.units,0), bikes=w.jobs.filter(x=>/bike/i.test(x.vehicle)).reduce((a,x)=>a+x.units,0);
  return `Hi ${first(w.name)}, your ${SITE.name} pay for ${fmtDay(f,{day:"numeric",month:"short"})} – ${fmtDay(t,{day:"numeric",month:"short"})}:\n`+(cars?`${cars} car wash${cars>1?"es":""} × ${rupee(w.pay_car)} = ${rupee(cars*w.pay_car)}\n`:"")+(bikes?`${bikes} bike wash${bikes>1?"es":""} × ${rupee(w.pay_bike)} = ${rupee(bikes*w.pay_bike)}\n`:"")
    +`Total ${rupee(w.earned)}`+(w.earned-w.owed?`\nAlready paid ${rupee(w.earned-w.owed)}`:"")+(w.owed?`\nStill to pay ${rupee(w.owed)}`:"\nAll paid. Thank you!"); };
const SET_TABS=[["team","Team"],["pay","Pay"],["slots","Slots & days off","Slots"],["messages","WhatsApp messages","Messages"],["offers","Offers"],["costs","Monthly costs","Costs"],["notice","Team notice","Notice"],["data","Data & activity","Data"]];
async function vSettings(){
  if(!SET_TABS.some(t=>t[0]===S.setTab)) S.setTab="team";
  TEAM=TEAM||cache.get("team"); dSettings();
  try{
    if(S.setTab==="team"){ TEAM=await rpc("owner_team"); cache.set("team",TEAM); }
    if(S.setTab==="offers") OFFERS=await rpc("owner_offers");
    if(S.setTab==="pay"){ const [f,t]=PAY_RANGES[S.payR||"month"][1](); PAY=await rpc("owner_pay",{p_from:f, p_to:t}); }
    if(S.setTab==="slots") SLOTSET=await rpc("staff_slots",{p_from:istToday(), p_to:addDays(istToday(),120)});
    if(S.setTab==="costs") COSTS=await rpc("owner_costs",{p_month:S.setMonth});
    if(S.setTab==="data"){ const r=await Promise.all([rpc("owner_audit",{p_limit:150}), rpc("owner_team")]); AUDIT=r[0]; TEAM=r[1]; }
    await refreshSettings(); dSettings();
  }catch(e){ quiet(e); }
}
const AUD = {export:"Downloaded bookings", booking_deleted:"Deleted a booking", login_added:"Added a login", login_switched_on:"Switched a login on", login_switched_off:"Switched a login off",
  login_role:"Changed access", login_password:"Set a new password", login_edited:"Changed a login", login_deleted:"Deleted a login", messages_saved:"Changed WhatsApp messages",
  notice_posted:"Posted the team notice", notice_cleared:"Cleared the team notice", offers_saved:"Changed an offer", costs_saved:"Saved monthly costs",
  slots_saved:"Changed slot limits or days off", day_closed:"Closed a day", day_reopened:"Opened a day again"};
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
  if(tab==="slots"){ const X=SLOTSET, wd=X?String(X.closed_weekdays||"").split(","):[], DAYS=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
    const cnt=(d,sl)=>((X&&X.counts)||[]).filter(c=>c.date===d && (!sl||c.slot===sl)).reduce((a,c)=>a+c.n,0);
    body = !X ? skel(2,180) : `<div class="grid grid-2"><section class="card"><div class="card-head"><h2>Bookings per time slot</h2></div>
      <p class="small muted" style="margin-bottom:12px">How many website bookings each time can take in a day. When a time is full, the website shows <b>Full</b> and the customer picks another. Leave it empty for no limit. You can still add bookings yourself; the app only warns you.</p>
      <div class="form-grid">${X.caps.map(c=>`<label class="field">${esc(c.slot)}<input type="number" min="0" max="50" inputmode="numeric" data-cap="${esc(c.slot)}" value="${c.cap==null?"":c.cap}" placeholder="No limit"></label>`).join("")}</div>
      <p class="opt-h" style="margin:16px 0 8px">Weekly day off</p><div class="chips">${DAYS.map((d,i)=>`<button type="button" class="chip${wd.includes(String(i+1))?" on":""}" data-wd="${i+1}" aria-pressed="${wd.includes(String(i+1))}">${d}</button>`).join("")}</div>
      <button class="btn primary" type="button" id="stSlotSave" style="margin-top:16px">Save</button></section>
    <section class="card"><div class="card-head"><h2>Close a day or a time</h2></div><p class="small muted" style="margin-bottom:12px">For a holiday, heavy rain or a big society job. The website stops taking bookings for it. Bookings already made stay; move or cancel them yourself.</p>
      <div class="form-grid"><label class="field">Day<input type="date" id="stCloseDay" min="${istToday()}" value="${addDays(istToday(),1)}"></label><label class="field">Time<select id="stCloseSlot"><option value="">Whole day</option>${X.caps.map(c=>`<option value="${esc(c.slot)}">${esc(c.slot)}</option>`).join("")}</select></label><label class="field">Reason (only the team sees it)<input id="stCloseWhy" maxlength="120" placeholder="e.g. Diwali"></label></div>
      <button class="btn primary" type="button" id="stClose" style="margin-top:14px">Close it</button>
      <p class="opt-h" style="margin:18px 0 4px">Closed days coming up</p>
      ${X.closures.length?X.closures.map(c=>{ const n=cnt(c.day,c.slot); return `<div class="list-row" style="cursor:default"><div class="lr-main"><b>${relDay(c.day)}${relDay(c.day).length<10?", "+fmtDay(c.day,{day:"numeric",month:"short"}):""}</b><span>${c.slot?esc(c.slot):"Whole day"}${c.reason?" · "+esc(c.reason):""}${n?` · <b class="warn-tx">${n} booking${n>1?"s":""} already</b>`:""}</span></div><button class="btn sm" type="button" data-reopen="${c.id}">Open again</button></div>`; }).join(""):'<p class="muted small">Nothing closed.</p>'}</section></div>`; }
  if(tab==="pay"){ const [f,t]=PAY_RANGES[S.payR||"month"][1]();
    body = `<div class="seg">${Object.entries(PAY_RANGES).map(([k,[l]])=>`<button type="button" data-payr="${k}" class="${(S.payR||"month")===k?"on":""}">${l}</button>`).join("")}</div>
      <p class="small muted">Pay is counted from the day a job is marked washed, for the washer it's given to. A society visit counts each vehicle ticked. ${fmtDay(f,{day:"numeric",month:"short"})} – ${fmtDay(t,{day:"numeric",month:"short"})}.</p>`
      + (!PAY ? skel(2,160) : PAY.length ? `<div class="grid grid-2">${PAY.map(w=>`<section class="card" data-wid="${w.id}"><div class="card-head"><h2>${esc(w.name)}</h2>${w.owed?`<span class="pill st-collect">Owed ${rupee(w.owed)}</span>`:w.earned?'<span class="pill st-done">All paid</span>':""}</div>
        <div class="form-grid"><label class="field">Per car wash ₹<input type="number" min="0" inputmode="numeric" data-rate="car" value="${w.pay_car}"></label><label class="field">Per bike wash ₹<input type="number" min="0" inputmode="numeric" data-rate="bike" value="${w.pay_bike}"></label></div>
        <button class="btn sm" type="button" data-saverate style="margin-top:8px">Save rates</button>
        <dl class="dl" style="margin-top:12px"><dt>Washes</dt><dd><b>${w.washes}</b></dd><dt>Earned</dt><dd><b>${rupee(w.earned)}</b></dd><dt>Still owed</dt><dd><b>${rupee(w.owed)}</b></dd></dl>
        ${!w.pay_car&&!w.pay_bike&&w.washes?'<p class="small warn-tx">Set the rates above to work out the pay.</p>':""}
        <div class="row" style="margin-top:10px">${w.owed?`<button class="btn coral" type="button" data-payout>Mark ${rupee(w.owed)} paid</button>`:""}${w.phone&&w.washes?`<a class="btn wa" target="_blank" rel="noopener" href="${wa(w.phone, payStatement(w,f,t))}">${I.chat}Send statement</a>`:""}</div>
        ${w.jobs.length?`<details style="margin-top:10px"><summary class="small muted">Jobs · ${w.jobs.length}</summary><table class="mini"><tbody>${w.jobs.map(x=>`<tr><td>${fmtDay(x.day,{day:"numeric",month:"short"})}</td><td>${esc(x.name)}<br><span class="muted small">${esc(x.package)}${x.units>1?" · "+x.units+" vehicles":""}</span></td><td class="num">${rupee(x.amount)}${x.paid?' <span class="muted small">paid</span>':""}</td></tr>`).join("")}</tbody></table></details>`:""}
        ${w.payouts.length?`<details style="margin-top:6px"><summary class="small muted">Paid before · ${w.payouts.length}</summary><table class="mini"><tbody>${w.payouts.map(x=>`<tr><td>${fmtDay(String(x.paid_at).slice(0,10),{day:"numeric",month:"short"})}</td><td>${fmtDay(x.from,{day:"numeric",month:"short"})}–${fmtDay(x.to,{day:"numeric",month:"short"})} · ${x.washes} washes${x.note?" · "+esc(x.note):""}</td><td class="num">${rupee(x.amount)} <button class="link-btn small" type="button" data-unpay="${x.id}">Undo</button></td></tr>`).join("")}</tbody></table></details>`:""}
        </section>`).join("")}</div>` : `<section class="card empty"><b>No washers yet</b>Add washers in Team first.</section>`); }
  if(tab==="messages") body = `<section class="card"><div class="card-head"><h2>WhatsApp messages</h2><button class="btn primary sm" type="button" id="stTplSave">Save messages</button></div><p class="small muted" style="margin-bottom:12px">Words in curly brackets are filled in for each customer: {first_name} {package} {vehicle} {date} {slot} {address} {id} {total} {review_link} {book_link} {days} {society} {brand}</p>
    <div class="grid grid-2">${templates().map(t=>`<label class="field">${esc(t.title)}<textarea data-tpl="${t.key}" rows="4" maxlength="1000">${esc(t.body)}</textarea></label>`).join("")}</div></section>`;
  if(tab==="offers") body = !OFFERS ? skel(2,140) : `<section class="card"><div class="card-head"><h2>Offers and codes</h2></div><p class="small muted" style="margin-bottom:12px">The website and bookings use these straight away. Minimum order is the package plus add-ons before the discount.</p><div class="grid grid-2">${OFFERS.map(o=>offerRow(o)).join("")+offerRow(null)}</div></section>`;
  if(tab==="costs"){ const months=[]; for(let i=0;i<6;i++){ const d=new Date(monthStart(istToday())+"T12:00:00Z"); d.setUTCMonth(d.getUTCMonth()-i); months.push(d.toISOString().slice(0,8)+"01"); }
    body = `<section class="card"><div class="card-head"><h2>Monthly costs</h2><select class="input" id="stMonth" style="width:auto">${months.map(m=>`<option value="${m}" ${m===S.setMonth?"selected":""}>${fmtDay(m,{month:"long", year:"numeric"})}</option>`).join("")}</select></div><p class="small muted" style="margin-bottom:12px">Used for profit, cost per wash and ad cost per new customer in Analytics. Bills you approve in <b>Stock &amp; bills</b> and washer pay you mark paid in <b>Settings → Pay</b> are added by themselves, so don't enter them here too.</p>
      ${COSTS?`<div class="form-grid">${COST_CATS.map(([k,l])=>`<label class="field">${l} ₹<input type="number" min="0" inputmode="numeric" data-cost="${k}" value="${COSTS.costs[k]!=null?COSTS.costs[k]:""}"></label>`).join("")}</div><div class="row" style="margin-top:14px"><button class="btn primary" type="button" id="stCostSave">Save costs</button><span class="small muted">Total ${rupee(Object.values(COSTS.costs).reduce((s,x)=>s+x,0))}</span></div>`:skel(1,120)}</section>`; }
  if(tab==="notice"){ const n=SET.notice; body = `<section class="card"><div class="card-head"><h2>Team notice</h2></div><p class="small muted" style="margin-bottom:12px">One line everyone sees at the top of Home and Jobs until you clear it.</p>
    <label class="field">Notice<textarea id="stNotice" rows="2" maxlength="280" placeholder="e.g. Rain today, carry seat covers">${esc(n&&n.body||"")}</textarea></label><div class="row" style="margin-top:12px"><button class="btn primary" type="button" id="stNoticeSave">Post</button>${n&&n.body?'<button class="btn" type="button" id="stNoticeClear">Clear</button>':""}</div></section>`; }
  if(tab==="data") body = `<div class="grid grid-2"><section class="card"><div class="card-head"><h2>Download bookings</h2></div><p class="small muted" style="margin-bottom:12px">A spreadsheet (CSV) with customers' details. Keep it private. The download is noted in the activity log.</p>
      <div class="form-grid"><label class="field">From<input type="date" id="stFrom" value="${monthStart(istToday())}"></label><label class="field">To<input type="date" id="stTo" value="${monthEnd(istToday())}"></label></div><button class="btn primary" type="button" id="stExport" style="margin-top:14px">Download CSV</button></section>
    <section class="card"><div class="card-head"><h2>Google Sheet copy</h2></div><p class="small muted" style="margin-bottom:12px">Paste this key into the Google Sheet copy script (Vroombrite → Set copy key) so it can copy bookings every night. Keep it private.</p>
      <div class="keybox"><span id="sheetKey" style="flex:1">${TEAM?esc(TEAM.sheet_copy_key):"…"}</span><button class="btn sm" type="button" id="copyKey">Copy</button></div></section></div>
    <section class="card"><div class="card-head"><h2>Activity log</h2></div><p class="small muted" style="margin-bottom:12px">Who changed logins, offers or messages, downloaded or deleted data. Customers' details are never shown here.</p>
      ${AUDIT?(AUDIT.length?`<ol class="timeline">${AUDIT.map(a=>`<li><span class="dot"></span><div>${esc(AUD[a.action]||a.action)}${a.detail?" · "+esc(a.detail):""}<small>${esc(a.actor_name||"")} · ${fmtTime(a.at)}</small></div></li>`).join("")}</ol>`:'<p class="muted">Nothing yet.</p>'):skel(1,120)}</section>`;
  V().innerHTML = pageHead("Settings", "Team, slots and days off, messages, offers, costs and data") + `<div class="seg">${SET_TABS.map(([k,l,sh])=>`<button type="button" data-settab="${k}" class="${tab===k?"on":""}"${sh?` aria-label="${l}"`:""}>${sh?`<span class="t-lg">${l}</span><span class="t-sm" aria-hidden="true">${sh}</span>`:l}</button>`).join("")}</div>` + body;
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
    if(t.closest("[data-wd]")){ const b=t.closest("[data-wd]"); b.classList.toggle("on"); b.setAttribute("aria-pressed", b.classList.contains("on")); return; }
    if(t.id==="stSlotSave"){ t.disabled=true; SLOTSET=await rpc("owner_save_slots",{p:{caps:$$("[data-cap]").map(x=>({slot:x.dataset.cap, cap:x.value===""?null:+x.value})), closed_weekdays:$$("[data-wd].on").map(x=>x.dataset.wd)}});
      SLOTSET=await rpc("staff_slots",{p_from:istToday(), p_to:addDays(istToday(),120)}); toast("Saved. The website uses this straight away."); dSettings(); }
    if(t.id==="stClose"){ const d=$("stCloseDay").value; if(!d) return toast("Pick a day", true); t.disabled=true;
      const r=await rpc("owner_close_day",{p_day:d, p_slot:$("stCloseSlot").value||null, p_reason:$("stCloseWhy").value.trim()});
      SLOTSET=await rpc("staff_slots",{p_from:istToday(), p_to:addDays(istToday(),120)}); dSettings();
      toast(r.bookings?`Closed. ${r.bookings} booking${r.bookings>1?"s are":" is"} already on it — move or cancel ${r.bookings>1?"them":"it"}.`:"Closed. The website won't take bookings for it.", !!r.bookings); }
    const ro=t.closest("[data-reopen]"); if(ro){ ro.disabled=true; await rpc("owner_reopen_day",{p_id:+ro.dataset.reopen}); SLOTSET=await rpc("staff_slots",{p_from:istToday(), p_to:addDays(istToday(),120)}); toast("Open again"); dSettings(); }
    const pr=t.closest("[data-payr]"); if(pr){ S.payR=pr.dataset.payr; PAY=null; dSettings(); vSettings(); return; }
    const wc=t.closest("[data-wid]");
    if(wc && t.closest("[data-saverate]")){ await rpc("owner_set_rates",{p_staff:wc.dataset.wid, p_car:+wc.querySelector('[data-rate="car"]').value||0, p_bike:+wc.querySelector('[data-rate="bike"]').value||0}); toast("Rates saved"); return vSettings(); }
    if(wc && t.closest("[data-payout]")){ const b=t.closest("[data-payout]"); if(!b.dataset.sure){ b.dataset.sure="1"; b.textContent="Tap again: you've paid "+b.textContent.replace(/^Mark | paid$/g,""); return; }
      const [f,to]=PAY_RANGES[S.payR||"month"][1](); const r=await rpc("owner_pay_out",{p_staff:wc.dataset.wid, p_from:f, p_to:to, p_note:""}); toast(`Marked ${rupee(r.amount)} paid for ${r.washes} wash${r.washes>1?"es":""}`); return vSettings(); }
    const up=t.closest("[data-unpay]"); if(up){ if(!up.dataset.sure){ up.dataset.sure="1"; up.textContent="Tap again"; return; } await rpc("owner_undo_payout",{p_id:+up.dataset.unpay}); toast("Payment undone"); return vSettings(); }
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
    ${isOwner()?`<fieldset class="fs"><legend>Phone alerts</legend><div id="pushBox"><div class="skel" style="height:40px"></div></div></fieldset>`:`<fieldset class="fs"><legend>My pay</legend><div id="myPay"><div class="skel" style="height:40px"></div></div></fieldset><button class="btn" type="button" data-go="kit">${I.box}Stock &amp; bills</button>`}
    ${feedbackBox()}<button class="btn" type="button" id="refreshNow">Refresh now</button><button class="btn" type="button" data-go="help">Help</button><button class="btn danger" type="button" data-signout>Sign out</button></div>`, "account");
  if(isOwner()) drawPushBox();
  else rpc("staff_my_pay").then(m=>{ const el=$("myPay"); if(!el) return; el.innerHTML=`<dl class="dl"><dt>This month</dt><dd><b>${m.month_washes}</b> wash${m.month_washes===1?"":"es"} · <b>${rupee(m.month_earned)}</b></dd><dt>Still to be paid</dt><dd><b>${rupee(m.owed)}</b></dd><dt>Rate</dt><dd>${rupee(m.pay_car)} a car · ${rupee(m.pay_bike)} a bike</dd>${m.payouts.length?`<dt>Last paid</dt><dd>${rupee(m.payouts[0].amount)} on ${fmtDay(String(m.payouts[0].paid_at).slice(0,10),{day:"numeric",month:"short"})}</dd>`:""}</dl>`; })
    .catch(()=>{ const el=$("myPay"); if(el) el.innerHTML='<p class="small muted">Couldn\'t load. Check your internet.</p>'; });
}
$("sheetBody").addEventListener("click", e => { const b=e.target.closest("[data-th]"); if(!b) return; $$("#themeSeg button").forEach(x=>x.classList.toggle("on", x===b)); themeSwap(() => { store.set("vb.theme", b.dataset.th==="auto"?null:b.dataset.th); applyTheme(); }, b); });
$("sheetBody").addEventListener("submit", async e => {
  if(e.target.id!=="pwForm") return; e.preventDefault(); const pw=$("myPw").value, m=$("pwMsg"); m.hidden=false;
  if(pw.length<8){ m.className="msg bad"; m.textContent="Use 8 or more characters."; return; }
  try{ await fresh(); await auth("user",{password:pw},"PUT"); m.className="msg ok"; m.textContent="Password changed. Use it next time you sign in."; $("myPw").value=""; }
  catch(x){ m.className="msg bad"; m.textContent=/different|same/i.test(x.message)?"That's your current password. Pick a new one.":x.message; }
});
document.addEventListener("click", e => {
  if(e.target.closest("#refreshNow")){ closeSheet(); refreshSettings(); route(); }
  if(e.target.closest("[data-signout]")){ if(session) fetch(URL_+"/auth/v1/logout",{method:"POST",headers:{apikey:KEY,Authorization:"Bearer "+session.access_token}}).catch(()=>{});
    Object.keys(localStorage).filter(k=>k.startsWith("vb.") && !["vb.theme","vb.menu","vb.buzz","vb.shake"].includes(k) && !k.startsWith("vb.tour")).forEach(k=>localStorage.removeItem(k));
    session=null; S.me=null; S.v=""; S.day=istToday(); S.open.clear(); S.inboxCount=0; S.attnCount=0; SET={templates:[],notice:null,team:[]}; JOBS.clear(); SINCE=null; NOTES=[];
    OV=ATTN=CAL=DAY=BK=CU=DUE=INB=AN=TEAM=PAY=KIT=null;
    closeSheet(); closePop(); history.replaceState(null,"",location.pathname); $("lgFields").hidden=false; $("lgCer").hidden=true; show("login"); }
});

/* ============================== motion: swipe, live bar, sheet drag, shake ============================== */
/* Swipe a job on a phone: right = the next step (a long swipe does it), left = Call, Chat, Cancel. */
let SWO=null, SWP=null, swipedAt=0;
const SW_W=78;
function swipeActs(j){
  const A=(cls, attrs, icon, tx, a) => a ? `<a class="sw-a ${cls}" ${attrs}>${icon}<span>${tx}</span></a>` : `<button type="button" class="sw-a ${cls}" ${attrs}>${icon}<span>${tx}</span></button>`;
  const waA=(act, key, icon, tx) => A("wa", `data-act="${act}" target="_blank" rel="noopener" href="${wa(j.phone, fill(key, jobCtx(j)))}"`, icon, tx, 1);
  const L=[], R=[];
  if(j.status==="cancelled") L.push(A("ok", 'data-act="reopen"', I.repeat, "Reopen"));
  else if(j.status==="new") L.push(waA("confirm", "confirm", I.chat, "Confirm"));
  else if(j.status==="confirmed") L.push(waA("on_way", "onway", I.jobs, "On my way"));
  else if(j.status==="on_way"){ if(!j.started_at) L.push(A("ok", 'data-timer="start"', I.play, "Start")); L.push(A("ok", 'data-act="done"', I.check, "Washed")); }
  else if(!isPaid(j) && j.payment!=="refunded") L.push(A("pay", 'data-act="paid_upi"', I.qr, "UPI"), A("pay", 'data-act="paid_cash"', I.cash, "Cash"));
  else if(!j.review_asked_at) L.push(waA("review_asked", "review", I.star, "Review"));
  R.push(A("", `href="${tel(j.phone)}" data-call`, I.call, "Call", 1), A("", "data-chat", I.chat, "Chat"));
  if(!["cancelled","done"].includes(j.status)) R.push(A("bad", 'data-act="cancel"', I.x, "Cancel"));
  return {L, R};
}
function swipePrep(p){
  if(SWO && SWO.el===p.el){ Object.assign(p, {u:SWO.u, lw:SWO.lw, rw:SWO.rw, full:SWO.full}); SWO=null; }
  else {
    closeSwipe(true);
    const {L, R}=swipeActs(p.j), el=p.el, par=el.parentElement, u=document.createElement("div");
    if(getComputedStyle(par).position==="static") par.style.position="relative";
    u.className="sw-under"+(el.offsetHeight>220?" tall":""); u.dataset.id=p.id; u.innerHTML=`<div class="sw-l">${L.join("")}</div><div class="sw-r">${R.join("")}</div>`;
    u.style.cssText=`top:${el.offsetTop}px;left:${el.offsetLeft}px;width:${el.offsetWidth}px;height:${el.offsetHeight}px;border-radius:${getComputedStyle(el).borderRadius}`;
    el.before(u); Object.assign(p, {u, lw:L.length*SW_W, rw:R.length*SW_W, full:L.length===1});
  }
  p.el.classList.add("swiping"); p.u.classList.remove("anim"); p.el.style.transition="none";
}
function swipeTo(o, off){
  o.off=off; o.el.style.transform=off?`translateX(${off}px)`:""; o.u.querySelector(".sw-l").style.width=Math.max(0,off)+"px"; o.u.querySelector(".sw-r").style.width=Math.max(0,-off)+"px";
}
function openSwipe(p, off){ p.el.style.transition=""; p.u.classList.add("anim"); swipeTo(p, off); SWO=p; }
function closeSwipe(now){
  const o=SWO; SWO=null; if(!o) return;
  if(now || !o.el.isConnected){ o.u.remove(); o.el.classList.remove("swiping"); o.el.style.transform=o.el.style.transition=""; return; }
  o.el.style.transition=""; o.u.classList.add("anim"); swipeTo(o, 0);
  setTimeout(()=>{ if(SWO && SWO.el===o.el) return; o.u.remove(); o.el.classList.remove("swiping"); }, 240);
}
document.addEventListener("pointerdown", e => {
  const el=e.target.closest("#view .job, #view .jrow");
  if(SWO && !e.target.closest(".sw-under") && el!==SWO.el) closeSwipe();
  if(e.pointerType==="mouse" || !el || e.target.closest("input,textarea,select,summary,.cklist")) return;
  const id=el.dataset.id||el.dataset.open, j=JOBS.get(id); if(!j) return;
  SWP={el, id, j, x:e.clientX, y:e.clientY, mode:0, base:SWO&&SWO.el===el?SWO.off:0, off:0};
}, {passive:true});
document.addEventListener("pointermove", e => {
  const p=SWP; if(!p) return; const dx=e.clientX-p.x, dy=e.clientY-p.y;
  if(!p.mode){ if(Math.abs(dx)>10 && Math.abs(dx)>Math.abs(dy)*1.4){ p.mode=1; swipePrep(p); } else { if(Math.abs(dy)>10) SWP=null; return; } }
  const W=p.el.offsetWidth; let off=p.base+dx;
  const maxR=p.full?W*.82:p.lw+24, minL=-(p.rw+24);
  if(off>0 && !p.lw) off*=.15; else if(off>maxR) off=maxR+(off-maxR)*.2;
  if(off<0 && !p.rw) off*=.15; else if(off<minL) off=minL+(off-minL)*.2;
  swipeTo(p, off); p.u.classList.toggle("show-l", off>0); p.u.classList.toggle("show-r", off<0);
  const armed=p.full && off>Math.max(W*.45, p.lw+40); if(armed!==!!p.armed){ p.armed=armed; p.u.classList.toggle("armed", armed); if(armed) buzz(10); }
});
function swipeEnd(e){
  const p=SWP; SWP=null; if(!p || !p.mode) return; swipedAt=Date.now();
  if(e.type==="pointercancel"){ SWO=p; return closeSwipe(); }
  if(p.armed){ const b=p.u.querySelector(".sw-l .sw-a"); openSwipe(p, p.lw); b.click();     // the click runs in the swipe itself, so WhatsApp links open
    setTimeout(()=>{ if(SWO===p && !b.dataset.sure) closeSwipe(); }, 60); return; }
  if(p.lw && p.off>p.lw*.5) openSwipe(p, p.lw); else if(p.rw && p.off<-p.rw*.5) openSwipe(p, -p.rw); else { SWO=p; closeSwipe(); }
}
document.addEventListener("pointerup", swipeEnd); document.addEventListener("pointercancel", swipeEnd);
/* After a swipe, the lifted finger doesn't also open the job; a tap on an open row closes it. */
document.addEventListener("click", e => {
  const el=e.target.closest("#view .job, #view .jrow"); if(!el) return;
  if(Date.now()-swipedAt<400 || (SWO && SWO.el===el)){ e.preventDefault(); e.stopImmediatePropagation(); if(SWO && Date.now()-swipedAt>=400) closeSwipe(); }
}, true);
document.addEventListener("click", e => { const b=e.target.closest(".sw-under .sw-a"); if(b) setTimeout(()=>{ if(SWO && SWO.u.contains(b) && !b.dataset.sure) closeSwipe(); }, 0); });

/* Live bar: a wash that's running stays pinned at the top (timer and checklist) until it's marked washed. */
function hudVis(){ const h=$("hud"); if(h) h.hidden=$("liveBar").hidden && $("syncBar").hidden; }
function drawLive(){
  const bar=$("liveBar"); if(!bar) return; const me=S.me&&S.me.id, here=S.v==="b"?S.arg:null;
  const run=!S.me||$("shell").hidden ? [] : [...JOBS.values()].filter(j=>j.status==="on_way" && j.started_at && (isOwner()||j.assigned_to===me||!j.assigned_to) && j.id!==here && decodeURIComponent(here||"")!==j.id)
    .sort((a,b)=>a.started_at<b.started_at?-1:1);
  bar.hidden=!run.length;
  if(run.length){ const j=run[0], all=checklist(j), done=(j.checks||[]).filter(x=>all.includes(x)).length;
    bar.dataset.open=j.id; bar.setAttribute("aria-label", `Washing ${j.name}, open the booking`);
    setHTML(bar, `<span class="live-dot" aria-hidden="true"></span><span class="live-tx"><b>Washing · ${esc(j.name)}</b><small>${esc(vehShort(j.vehicle))} · ${esc(j.package)}${all.length?` · ${done}/${all.length} ticked`:""}${run.length>1?` · +${run.length-1} more`:""}</small></span><b class="live-time" data-since="${esc(j.started_at)}">${mins(j.started_at)}</b><span class="live-prog"><i style="width:${all.length?Math.round(done/all.length*100):0}%"></i></span>`); }
  hudVis();
}
setInterval(drawLive, 15e3);

/* Sheets: pull down on the handle or the title to close. */
let SD=null;
const sheetPanel = () => $("sheet").querySelector(".sheet-panel");
function sheetReset(){ const p=sheetPanel(); p.style.transform=p.style.transition=p.style.animation=""; $("sheet").querySelector(".sheet-bg").style.opacity=""; }
$("sheet").addEventListener("pointerdown", e => {
  if(!e.target.closest(".sheet-grip, .sheet-head") || e.target.closest("button,a,input")) return;
  const p=sheetPanel(); SD={y:e.clientY, t:Date.now(), dy:0}; p.style.transition="none"; p.style.animation="none";
  try{ e.target.setPointerCapture(e.pointerId); }catch(x){}
});
$("sheet").addEventListener("pointermove", e => {
  if(!SD) return; const dy=e.clientY-SD.y; SD.dy=dy>0?dy:dy*.15;
  sheetPanel().style.transform=`translateY(${SD.dy}px)`; $("sheet").querySelector(".sheet-bg").style.opacity=Math.max(.2, 1-SD.dy/400);
});
function sheetDragEnd(){
  const d=SD; SD=null; if(!d) return; const p=sheetPanel(), v=d.dy/Math.max(1, Date.now()-d.t);
  p.style.transition="transform .2s cubic-bezier(.2,.8,.2,1)";
  if(d.dy>110 || (d.dy>40 && v>.5)){ p.style.transform="translateY(110%)"; buzz(8); setTimeout(()=>{ closeSheet(); sheetReset(); }, 190); }
  else { p.style.transform=""; $("sheet").querySelector(".sheet-bg").style.opacity=""; setTimeout(sheetReset, 220); }
}
$("sheet").addEventListener("pointerup", sheetDragEnd); $("sheet").addEventListener("pointercancel", sheetDragEnd);

/* Shake the phone to undo (while the Undo button shows). iPhones ask once; Me → Feedback turns it on there. */
const MOTION_ASK = typeof DeviceMotionEvent!=="undefined" && typeof DeviceMotionEvent.requestPermission==="function", SHAKE_ASK = MOTION_ASK && isIOS;
const touchy = matchMedia("(pointer:coarse)").matches;
const shakeOn = () => { const v=store.get("vb.shake"); return v==null ? !SHAKE_ASK : v; };
let motionOn=false, shPrev=null, shT=0, shHits=[], shLast=0;
function onMotion(e){
  const a=e.accelerationIncludingGravity; if(!a || a.x==null) return; const now=Date.now(); if(now-shT<90) return; shT=now;
  if(shPrev){ const d=Math.abs(a.x-shPrev.x)+Math.abs(a.y-shPrev.y)+Math.abs(a.z-shPrev.z);
    if(d>22){ shHits=shHits.filter(t=>now-t<900); shHits.push(now); if(shHits.length>=3 && now-shLast>1500){ shLast=now; shHits=[]; doUndo(); } } }
  shPrev={x:a.x, y:a.y, z:a.z};
}
function motion(on){ if(on===motionOn) return; motionOn=on; on ? addEventListener("devicemotion", onMotion) : removeEventListener("devicemotion", onMotion); }
function startShake(){
  if(typeof DeviceMotionEvent==="undefined" || !touchy || !shakeOn()) return Promise.resolve(motion(false));
  if(!SHAKE_ASK){ motion(true); if(MOTION_ASK) DeviceMotionEvent.requestPermission().catch(()=>{}); return Promise.resolve(true); }
  return DeviceMotionEvent.requestPermission().then(r=>{ motion(r==="granted"); return r==="granted"; }, ()=>false);
}
document.addEventListener("click", function firstTap(){ document.removeEventListener("click", firstTap, true); if(MOTION_ASK && shakeOn()) startShake(); }, true);
if(!SHAKE_ASK) startShake();
function feedbackBox(){
  const canBuzz="vibrate" in navigator && touchy, canShake=typeof DeviceMotionEvent!=="undefined" && touchy;
  const seg=(k, on) => `<div class="seg" data-fbseg="${k}"><button type="button" data-fb="${k}" data-val="1" class="${on?"on":""}">On</button><button type="button" data-fb="${k}" data-val="0" class="${on?"":"on"}">Off</button></div>`;
  return `<fieldset class="fs"><legend>Feedback</legend>${canBuzz?`<div class="field">Vibrate on taps${seg("buzz", store.get("vb.buzz")!==false)}</div>`:""}${canShake?`<div class="field">Shake to undo${seg("shake", shakeOn())}</div>`:""}
    <p class="small muted">After Paid, Washed, Cancel or Start wash, an <b>Undo</b> button shows for a few seconds.${isIOS?" iPhones don't let web apps vibrate.":""}</p></fieldset>`;
}
$("sheetBody").addEventListener("click", async e => {
  const b=e.target.closest("[data-fb]"); if(!b) return; const on=b.dataset.val==="1";
  if(b.dataset.fb==="buzz"){ store.set("vb.buzz", on?null:false); if(on) buzz(20); return; }
  store.set("vb.shake", on); if(!on) return motion(false);
  if(!await startShake()){ store.set("vb.shake", false); $$('[data-fb="shake"]').forEach(x=>x.classList.toggle("on", x.dataset.val==="0")); toast("Motion access wasn't allowed. Turn it on in the phone's settings for this app.", true); }
  else toast("Shake to undo is on");
});

/* ============================== cash handover ============================== */
/* Washers: cash they collected (Paid in cash on their jobs) minus what the owner marked received. */
let CASH=store.get("vb.cash")||null;
async function loadCash(){ if(!S.me || isOwner()) return; try{ CASH=await rpc("staff_cash"); store.set("vb.cash", CASH); if(S.v==="jobs") dJobs(); }catch(e){} }
function cashCard(){
  if(isOwner() || !CASH || CASH.balance<=0) return "";
  return `<button class="cashbar" type="button" data-cashme>${I.cash}<span><b>Cash with you: ${rupee(CASH.balance)}</b><small>${CASH.today?rupee(CASH.today)+" collected today · ":""}hand it to the owner</small></span>${I.fwd}</button>`;
}
const handRows = (list, undo) => list.map(h=>`<div class="list-row" style="cursor:default"><span class="lr-main"><b>${rupee(h.amount)} received${h.expected>h.amount?` <span class="pill st-collect">${rupee(h.expected-h.amount)} short</span>`:""}</b><span>${fmtDay(String(h.at).slice(0,10),{day:"numeric",month:"short"})} · ${ago(h.at)}${h.by?" · by "+esc(first(h.by)):""}${h.note?" · "+esc(h.note):""}</span></span>${undo && Date.now()-new Date(h.at)<2*864e5?`<button class="btn sm" type="button" data-cashundo="${h.id}">Undo</button>`:""}</div>`).join("");
function cashMeSheet(){
  const c=CASH; if(!c) return;
  openSheet("Cash with you", `<div class="menu"><div class="cash-big"><small>Still with you</small><b class="num">${rupee(c.balance)}</b></div>
    ${c.today_jobs.length?`<h4>Paid in cash today</h4>${c.today_jobs.map(j=>`<button class="list-row" type="button" data-open="${esc(j.id)}"><span class="lr-main"><b>${esc(j.name)}</b><span>${new Date(j.paid_at).toLocaleTimeString("en-IN",{hour:"numeric",minute:"2-digit",timeZone:"Asia/Kolkata"})}</span></span><b class="num">${rupee(j.total)}</b></button>`).join("")}`:""}
    ${c.handovers.length?`<h4>Handed over</h4>${handRows(c.handovers.slice(0,5))}`:""}
    <p class="small muted">When you give the cash to the owner, they tap <b>Received</b> on their phone and this goes down.</p></div>`);
}
async function cashRecvSheet(id){
  let c=(ATTN&&ATTN.cash||[]).find(x=>x.id===id); try{ const all=await rpc("owner_cash"); c=all.find(x=>x.id===id)||c; }catch(e){}
  if(!c) return toast("Couldn't load the cash for this washer", true);
  openSheet("Cash from "+first(c.name), `<div class="menu" data-cashfor="${esc(c.id)}">
    <div class="cash-big"><small>The app expects</small><b class="num">${rupee(c.balance)}</b><span>${c.today?rupee(c.today)+" collected today":"all from earlier days"}</span></div>
    <label class="field">Amount you received (₹)<input class="input" id="cashAmt" type="number" inputmode="numeric" min="1" step="1" value="${Math.max(c.balance,0)}"></label>
    <p class="small" id="cashDiff" aria-live="polite"></p>
    <label class="field">Note (optional)<input class="input" id="cashNote" maxlength="200" placeholder="e.g. ₹50 kept for petrol"></label>
    <button class="btn primary" type="button" id="cashGo" data-expect="${c.balance}">${I.check}Mark received</button>
    ${c.handovers.length?`<h4>Earlier handovers</h4>${handRows(c.handovers, true)}`:""}</div>`);
  cashDiff();
}
function cashDiff(){ const a=$("cashAmt"), out=$("cashDiff"), go=$("cashGo"); if(!a||!out) return; const d=Math.round(+a.value||0) - +go.dataset.expect;
  out.className="small"+(d<0?" warn-tx":""); out.textContent = !a.value ? "" : d===0 ? "Matches what the app expects." : d<0 ? `${rupee(-d)} short. That stays with the washer until it's handed over.` : `${rupee(d)} more than the app expects. Check that every cash job is marked Paid in cash.`; }
document.addEventListener("input", e => { if(e.target.id==="cashAmt") cashDiff(); });
document.addEventListener("click", async e => {
  if(e.target.closest("[data-cashme]")) return cashMeSheet();
  const r=e.target.closest("[data-cashrecv]"); if(r) return cashRecvSheet(r.dataset.cashrecv);
  const u=e.target.closest("[data-cashundo]"); if(u){ u.disabled=true; try{ await rpc("owner_cash_undo",{p_id:+u.dataset.cashundo}); closeSheet(); toast("Handover undone"); vHome(); }catch(x){ u.disabled=false; toast(x.message, true); } return; }
  if(e.target.closest("#cashGo")){ const host=e.target.closest("[data-cashfor]"), amt=Math.round(+$("cashAmt").value||0), exp=+$("cashGo").dataset.expect;
    if(amt<1) return toast("Enter the amount you received", true);
    $("cashGo").disabled=true;
    try{ await rpc("owner_cash_received",{p_staff:host.dataset.cashfor, p_amount:amt, p_note:$("cashNote").value.trim()}); closeSheet(); buzz([18,40,18]);
      toast(`Received ${rupee(amt)}`+(amt<exp?` · ${rupee(exp-amt)} still with them`:"")); vHome(); }
    catch(x){ $("cashGo").disabled=false; toast(x.message, true); } }
});

/* ============================== rain warning ============================== */
/* Free forecast from Open-Meteo (no key, nothing about customers is sent: only a point in central Mumbai). */
const RAIN_AT={lat:19.11, lon:72.88};
let RAIN=store.get("vb.rain")||null, rainBusy=false;
async function loadRain(){
  if(rainBusy || (RAIN && Date.now()-RAIN.at<45*60e3)) return; rainBusy=true;
  try{ const r=await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${RAIN_AT.lat}&longitude=${RAIN_AT.lon}&hourly=precipitation_probability,precipitation&timezone=Asia%2FKolkata&forecast_days=4`);
    const j=await r.json(); if(j && j.hourly){ RAIN={at:Date.now(), t:j.hourly.time, p:j.hourly.precipitation_probability, mm:j.hourly.precipitation}; store.set("vb.rain", RAIN); if(S.v==="jobs") dJobs(); } }
  catch(e){} rainBusy=false;
}
function rainFor(day, slot){
  if(!RAIN) return null; const h=SLOT_H[slot]; if(!h) return null; let p=0, mm=0, n=0;
  RAIN.t.forEach((t,i)=>{ if(t.slice(0,10)!==day) return; const hr=+t.slice(11,13); if(hr>=h[0] && hr<h[1]){ p=Math.max(p, RAIN.p[i]||0); mm+=RAIN.mm[i]||0; n++; } });
  return n ? {p, mm:Math.round(mm*10)/10} : null;
}
function rainBanner(jobs){
  if(!RAIN || (store.get("vb.rainHide")||{})[S.day]) return "";
  const by={}; jobs.filter(j=>["new","confirmed","on_way"].includes(j.status)).forEach(j=>(by[j.slot]=by[j.slot]||[]).push(j));
  const wet=Object.keys(by).sort((a,b)=>SLOTS.indexOf(a)-SLOTS.indexOf(b)).map(sl=>({sl, r:rainFor(S.day, sl), n:by[sl].length})).filter(x=>x.r && x.r.p>=60 && x.r.mm>=1);
  if(!wet.length) return "";
  return `<div class="rainbar" role="status">${I.rain}<div class="rain-tx"><b>Rain likely ${wet.length===1?wet[0].sl:relDay(S.day).toLowerCase()}</b><small>${wet.map(x=>`${x.sl}: ${x.r.p}% chance, about ${x.r.mm} mm · ${x.n} job${x.n>1?"s":""}`).join("<br>")}</small><small class="rain-src">Forecast: Open-Meteo</small></div>
    <div class="rain-acts">${isOwner()&&S.day>=istToday()?`<button class="btn sm" type="button" data-moveday>${I.move}Move day</button>`:""}<button class="link-btn" type="button" data-rainhide>Hide</button></div></div>`;
}
document.addEventListener("click", e => { if(e.target.closest("[data-rainhide]")){ const h=store.get("vb.rainHide")||{}; h[S.day]=1; Object.keys(h).forEach(d=>{ if(d<istToday()) delete h[d]; }); store.set("vb.rainHide", h); dJobs(); } });

/* ============================== light / dark: ink transition ============================== */
/* The new look spreads from the button you tapped like a splash of ink (Chrome, Edge, Safari 18+; others switch at once). */
let INK=null;
function inkMask(){
  if(INK) return INK; let seed=7; const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;
  const N=72, pts=[], ph=[rnd()*6.3, rnd()*6.3, rnd()*6.3], spikes=Array.from({length:9},()=>({a:rnd()*6.283, w:.05+rnd()*.07, h:5+rnd()*9}));
  for(let i=0;i<N;i++){ const a=i/N*6.283; let r=31+3.2*Math.sin(3*a+ph[0])+2.4*Math.sin(5*a+ph[1])+1.6*Math.sin(11*a+ph[2])+(rnd()-.5)*1.6;
    spikes.forEach(s=>{ let d=Math.abs(a-s.a); d=Math.min(d, 6.283-d); const u=d/s.w; r+=s.h*Math.exp(-u*u); }); pts.push([50+r*Math.cos(a), 50+r*Math.sin(a)]); }
  let d=`M${pts[0][0].toFixed(2)},${pts[0][1].toFixed(2)}`;
  for(let i=0;i<N;i++){ const p0=pts[(i-1+N)%N], p1=pts[i], p2=pts[(i+1)%N], p3=pts[(i+2)%N];
    d+=`C${(p1[0]+(p2[0]-p0[0])/6).toFixed(2)},${(p1[1]+(p2[1]-p0[1])/6).toFixed(2)} ${(p2[0]-(p3[0]-p1[0])/6).toFixed(2)},${(p2[1]-(p3[1]-p1[1])/6).toFixed(2)} ${p2[0].toFixed(2)},${p2[1].toFixed(2)}`; }
  const drops=Array.from({length:14},()=>{ const a=rnd()*6.283, r=40+rnd()*8.5, s=.5+rnd()*1.8; return `<circle cx="${(50+r*Math.cos(a)).toFixed(2)}" cy="${(50+r*Math.sin(a)).toFixed(2)}" r="${s.toFixed(2)}"/>`; }).join("");
  INK=`url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><g fill="#fff"><path d="${d}Z"/>${drops}</g></svg>`)}")`;
  return INK;
}
function themeSwap(change, from){
  if(!document.startViewTransition || matchMedia("(prefers-reduced-motion:reduce)").matches) return change();
  const r=from&&from.getBoundingClientRect(), x=r&&r.width?r.left+r.width/2:innerWidth-40, y=r&&r.width?r.top+r.height/2:40;
  const far=Math.hypot(Math.max(x, innerWidth-x), Math.max(y, innerHeight-y)), end=Math.ceil(far/0.25), img=inkMask();
  let vt; try{ vt=document.startViewTransition(change); }catch(e){ return change(); }
  vt.ready.then(() => {
    const k=[{maskImage:img, WebkitMaskImage:img, maskSize:"0px 0px", WebkitMaskSize:"0px 0px", maskPosition:`${x}px ${y}px`, WebkitMaskPosition:`${x}px ${y}px`, maskRepeat:"no-repeat", WebkitMaskRepeat:"no-repeat"},
             {maskImage:img, WebkitMaskImage:img, maskSize:`${end}px ${end}px`, WebkitMaskSize:`${end}px ${end}px`, maskPosition:`${x-end/2}px ${y-end/2}px`, WebkitMaskPosition:`${x-end/2}px ${y-end/2}px`, maskRepeat:"no-repeat", WebkitMaskRepeat:"no-repeat"}];
    document.documentElement.animate(k, {duration:1100, easing:"cubic-bezier(.7,0,.25,1)", pseudoElement:"::view-transition-new(root)"});
  }).catch(()=>{});
}

/* ============================== bell (notifications) ============================== */
function drawBell(ring){
  const seen=store.get("vb.bellSeen")||"", n=NOTES.filter(x=>x.at>seen).length + (isOwner()?(S.inboxCount||0)+((ATTN&&ATTN.changes)||[]).filter(c=>c.at>seen).length:0);
  $$("[data-bell]").forEach(b=>{ setHTML(b, I.bell + (n?`<span class="bell-count">${n>9?"9+":n}</span>`:"")); if(ring){ b.classList.remove("ring"); void b.offsetWidth; b.classList.add("ring"); } });
}
document.addEventListener("click", e => {
  const b=e.target.closest("[data-bell]"); if(!b) return; if(!$("pop").hidden){ closePop(); return; }
  const r=b.getBoundingClientRect(), pop=$("pop"), seen=store.get("vb.bellSeen")||"", items=[];
  if(isOwner() && S.inboxCount) items.push(`<button class="list-row" type="button" data-go="inbox"><span class="lr-main"><b>${S.inboxCount} new in Inbox</b><span>Society requests, messages and reviews</span></span><span class="nav-badge">${S.inboxCount}</span></button>`);
  if(isOwner() && ATTN) (ATTN.changes||[]).forEach(c=>items.push(`<button class="list-row" type="button" data-open="${esc(c.id)}"><span class="lr-main"><b>${c.at>seen?"● ":""}${esc(c.name)} changed their booking</b><span>${esc(c.detail.replace(/^(Moved|Cancelled) (online )?by the customer( online)?/, "$1"))} · ${ago(c.at)}</span></span></button>`));
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
  drawSync(); flush(); pingCheck(); if(isOwner() && S.v!=="home") rpc("owner_overview").then(o=>{ OV=o; cache.set("numbers",o); setCounts(); }).catch(()=>{});
  setTimeout(()=>tour(), 600);
}

/* live: refresh the open screen every 30 s while visible, and when coming back to the app */
async function pingCheck(){ try{ remember(await rpc("staff_bookings",{p_query:"", p_from:istToday(), p_limit:200}), true); }catch(e){} }
const LIVE = {home:()=>vHome(), jobs:()=>vJobs(), bookings:()=>vBookings()};
setInterval(() => { if(document.hidden || !session || !S.me || $("shell").hidden) return; flush(); pingCheck(); if(LIVE[S.v] && $("sheet").hidden && $("finder").hidden && !document.activeElement.matches("input,textarea,select")) LIVE[S.v](); }, 30000);
document.addEventListener("visibilitychange", () => { if(!document.hidden && session && S.me && !$("shell").hidden){ refreshSettings(); pingCheck(); if(LIVE[S.v] && $("sheet").hidden) LIVE[S.v](); checkVersion(); } });
async function checkVersion(){ if(!BUILD_ID) return; try{ const r=await fetch("version.json?t="+Date.now(),{cache:"no-store"}); const j=await r.json(); if(j.build && j.build!==BUILD_ID) $("updBar").hidden=false; }catch(e){} }
setInterval(checkVersion, 5*60e3);
$("updBtn").addEventListener("click", () => location.reload());
$("syncBtn").addEventListener("click", () => { if(!navigator.onLine) return toast("Still no internet", true); flush(); });

/* ============================== go ============================== */
const hash = new URLSearchParams(location.hash.slice(1));
if(!URL_ || !KEY){ show("setup"); }
else if(hash.get("type")==="recovery" && hash.get("access_token")){ keep({access_token:hash.get("access_token"), refresh_token:hash.get("refresh_token"), expires_in:hash.get("expires_in")}); show("recover"); }
else if(hash.get("error_description")){ show("login"); $("lgErr").hidden=false; $("lgErr").textContent=hash.get("error_description").replace(/\+/g," ")+". Ask for a new link."; history.replaceState(null,"",location.pathname); }
else if(session && S.me && S.me.active){ show("app"); drawNav(); route(); start(); }
else if(session){ start(); }
else show("login");
})();
