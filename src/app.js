/* Vroombrite — shared site script. Business settings (phone, UPI, database) are in config.js. */

/* Prices are launch placeholders — change them here and every page updates. */
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
const AREAS = /*@@AREAS@@*/[];   // filled from src/areas.json by build.py — edit the areas there
const SLOTS = ["6–8 AM","8–10 AM","10 AM–1 PM","2–5 PM","5–8 PM"];
/* Offers — starting values only. With the database on, the owner changes offers in the staff app
   (Settings → Offers) and the amounts and minimums below are replaced by the database's answer. */
/* min = minimum order value (package + add-ons, before discount) for the ₹50 to apply */
const PROMOS = { WELCOME50: { off: 50, min: 299, label: "₹50 off your first wash" } };
const REFERRAL = { friendOff: 50, referrerCredit: 50, min: 299 };
const SIZE_LABEL = {hatch:"Hatchback", sedan:"Sedan", suv:"SUV / MUV"};

/* ========================================================= */
const $ = id => document.getElementById(id);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];
const rupee = n => "₹" + n.toLocaleString("en-IN");
const waLink = t => "https://wa.me/" + SITE.phone + (t ? "?text=" + encodeURIComponent(t) : "");
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const clamp = (v,a=0,b=1) => Math.min(b, Math.max(a, v));
const PREVIEW = !!document.querySelector(".view");
const LINK = PREVIEW ? {book:"#book"} : {book:"book.html"};
const ss = { get(k){ try{ return sessionStorage.getItem(k); }catch(e){ return null; } }, set(k,v){ try{ sessionStorage.setItem(k,v); }catch(e){} } };
const priceKey = (veh,size) => veh === "bike" ? "bike" : size;
function areaForPin(pin){ return AREAS.find(x => x.pins.includes(pin)); }
function openNew(url){ const a=document.createElement("a"); a.href=url; a.target="_blank"; a.rel="noopener"; a.click(); }
/* ---------- database: Supabase when configured, the old Google Sheet script otherwise ---------- */
const USE_DB = !!(SITE.supabaseUrl && SITE.supabaseKey);
async function rpc(fn, args){
  const r = await fetch(SITE.supabaseUrl.replace(/\/$/,"")+"/rest/v1/rpc/"+fn, {method:"POST",
    headers:{"Content-Type":"application/json", apikey:SITE.supabaseKey}, body:JSON.stringify(args||{})});
  const j = await r.json().catch(()=>null);
  if(!r.ok) throw Object.assign(new Error((j&&j.message)||("HTTP "+r.status)), {hint:j&&j.hint||""});
  return j;
}
async function apiGet(params){
  if(USE_DB){
    try{
      if(params.action==="check") return await rpc("check_offer",{p_phone:params.phone||"", p_code:params.code||null, p_ref:params.ref||null});
      if(params.action==="reviews") return {ok:true, reviews: await rpc("public_reviews")};
    }catch(e){ return null; }
    return null;
  }
  if(!SITE.sheetUrl) return null;
  try{ const r=await fetch(SITE.sheetUrl+"?"+new URLSearchParams(params)); return await r.json(); }catch(e){ return null; }
}
async function saveToSheet(payload){
  if(USE_DB){
    const fn={booking:"create_booking", enquiry:"submit_enquiry", society:"submit_society_lead", review:"submit_review"}[payload.type];
    try{ const j=await rpc(fn,{p:payload}); return j&&j.ok ? "ok" : "fail"; }catch(e){ console.warn(e); return /^slot (full|closed)/.test(e.message) ? "full" : "fail"; }
  }
  if(!SITE.sheetUrl) return "skipped";
  try{
    const r = await fetch(SITE.sheetUrl, {method:"POST", headers:{"Content-Type":"text/plain;charset=utf-8"}, body:JSON.stringify(payload)});
    const j = await r.json().catch(()=>null);
    return j && j.ok ? "ok" : "fail";
  }catch(e){ return "fail"; }
}
function bookingId(){ const d=new Date(), p=n=>String(n).padStart(2,"0"), A="ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const r=new Uint8Array(5); (window.crypto||{getRandomValues:a=>a.map(()=>Math.random()*256)}).getRandomValues(r);
  return "VB-"+String(d.getFullYear()).slice(2)+p(d.getMonth()+1)+p(d.getDate())+"-"+[...r].map(x=>A[x%A.length]).join(""); }

/* ---------- nav ---------- */
if($("burger")) $("burger").addEventListener("click", () => { const o=$("links").classList.toggle("open"); $("burger").setAttribute("aria-expanded", o); });
function markNav(page){ $$("[data-nav]").forEach(a => { if(a.dataset.nav===page) a.setAttribute("aria-current","page"); else a.removeAttribute("aria-current"); }); }

/* ---------- contact bits ---------- */
$$("[data-num]").forEach(e => e.textContent = SITE.phoneDisplay);
$$("[data-wa]").forEach(a => { a.href = waLink(a.dataset.wa || `Hi ${SITE.name}, I'd like to book a wash.`); a.target="_blank"; a.rel="noopener"; });
$$("[data-call]").forEach(a => a.href = "tel:+" + SITE.phone);
$$("[data-copy]").forEach(b => b.addEventListener("click", () => {
  const done = () => { b.textContent="Copied"; setTimeout(()=>b.textContent="Copy",1500); };
  navigator.clipboard.writeText(SITE.phoneDisplay).then(done).catch(() => { const t=b.previousElementSibling; const r=document.createRange(); r.selectNodeContents(t); const s=getSelection(); s.removeAllRanges(); s.addRange(r); });
}));

/* ---------- packages, compare tables, add-ons, plans, treatments ---------- */
function pkgCard(veh,size,i){
  const pk=PKG[veh][i], pr=PRICE[priceKey(veh,size)][i];
  return `<article class="pkg${i===1?" feat":""}">${i===1?'<span class="pop">MOST BOOKED</span>':""}<span class="num">0${i+1}</span><h3>${pk.n}</h3><p class="desc">${pk.d}</p><div class="price">${rupee(pr)}<small>/ wash${veh==="car"?" · "+SIZE_LABEL[size].toLowerCase():""}</small></div><span class="meta">${pk.t} · AT YOUR PARKING</span><ul>${pk.i.map(x=>`<li>${x}</li>`).join("")}</ul><a class="btn ${i===1?"btn-lime":"btn-dark"}" href="${LINK.book}" data-book="${veh}|${size}|${i}">Book this wash <span class="arrow">↗</span></a></article>`;
}
function compareTable(veh,size){
  const P=PKG[veh], all=[...new Set(P[0].i.concat(P[1].i,P[2].i))].filter(x=>!x.startsWith("Everything"));
  const has=(i,x)=>{ for(let k=i;k>=0;k--) if(P[k].i.includes(x)) return true; return false; };
  return `<thead><tr><th>What's included</th>${P.map(x=>`<th>${x.n}</th>`).join("")}</tr></thead><tbody>${all.map(x=>`<tr><td>${x}</td>${[0,1,2].map(i=>has(i,x)?'<td class="yes">✓</td>':'<td class="no">—</td>').join("")}</tr>`).join("")}<tr><td><b>Time</b></td>${P.map(x=>`<td>${x.t.replace("~","").toLowerCase()}</td>`).join("")}</tr><tr><td><b>Price</b></td>${[0,1,2].map(i=>`<td><b>${rupee(PRICE[priceKey(veh,size)][i])}</b></td>`).join("")}</tr></tbody>`;
}
function bindPkgBlock(root){
  const veh=root.dataset.pkgs, grid=$$(".pkgs",root)[0], tbl=$$("table",root)[0];
  let size="hatch";
  const draw=()=>{ grid.innerHTML=[0,1,2].map(i=>pkgCard(veh,size,i)).join(""); if(tbl) tbl.innerHTML=compareTable(veh,size); };
  $$("[data-size]",root).forEach(b=>b.addEventListener("click",()=>{ size=b.dataset.size; $$("[data-size]",root).forEach(x=>x.setAttribute("aria-pressed",x===b)); draw(); }));
  $$("[data-hveh]",root).forEach(b=>b.addEventListener("click",()=>{ const v=b.dataset.hveh; $$("[data-hveh]",root).forEach(x=>x.setAttribute("aria-pressed",x===b)); grid.innerHTML=[0,1,2].map(i=>pkgCard(v,"hatch",i)).join(""); }));
  draw();
}
$$("[data-pkgs]").forEach(bindPkgBlock);
$$("[data-addons]").forEach(el => { const L=ADDONS[el.dataset.addons]; el.classList.add(L.length===3?"n3":"n4"); el.innerHTML=L.map(a=>`<div class="addon"><b>${a.n}</b><span>${a.d}</span><strong>+${rupee(a.p)}</strong></div>`).join(""); });
$$("[data-treat]").forEach(el => el.innerHTML = DETAIL.map(t=>`<article class="tcard"><span class="ic">${t.ic}</span><div><h3>${t.n}</h3><p>${t.d}</p><ul>${t.tags.map(x=>`<li>${x}</li>`).join("")}</ul></div><div class="tp"><b>${rupee(t.p)}</b><span>from · ${t.t}</span></div></article>`).join(""));
function planCards(v){ return PLANS[v].map(p=>`<article class="plan${p.hl?" hl":""}"><span>${p.s}</span><h3>${p.n}</h3><p>${p.d}</p><div class="pp">${rupee(p.p)}<small> / month</small></div><b class="per">${rupee(Math.round(p.p/p.w))} per wash</b><ul>${p.i.map(x=>`<li>${x}</li>`).join("")}</ul><a class="btn ${p.hl?"btn-lime":"btn-ghost"}" target="_blank" rel="noopener" href="${waLink(`Hi ${SITE.name}, I'm interested in the ${p.n} monthly plan for my ${v}.`)}">Start this plan <span class="arrow">↗</span></a></article>`).join(""); }
$$("[data-plans]").forEach(root => {
  const grid=$$(".plans",root)[0];
  const draw=v=>grid.innerHTML=planCards(v);
  $$("[data-pveh]",root).forEach(b=>b.addEventListener("click",()=>{ $$("[data-pveh]",root).forEach(x=>x.setAttribute("aria-pressed",x===b)); draw(b.dataset.pveh); }));
  draw("car");
});
$$("[data-areas]").forEach(el => el.innerHTML = AREAS.map(x=>`<a href="${PREVIEW?"#wash-"+x.slug:"doorstep-car-wash-"+x.slug+".html"}"><span>${x.a}<small>${x.pins.join(" · ")}</small></span></a>`).join(""));

/* ---------- PIN checkers ---------- */
$$("[data-pin-form]").forEach(form => {
  const inp=$$("input",form)[0], out=form.parentElement.querySelector(".pinres");
  inp.addEventListener("input",()=>{ inp.value=inp.value.replace(/\D/g,"").slice(0,6); });
  form.addEventListener("submit", e => {
    e.preventDefault();
    const pin=inp.value.trim();
    if(pin.length!==6){ out.className="pinres no"; out.textContent="Enter all 6 digits of your PIN code."; return; }
    const hit=areaForPin(pin);
    if(hit){ out.className="pinres ok"; out.innerHTML=`Yes, we come to ${hit.a} (${pin}). <a href="${LINK.book}" data-pinbook="${pin}" style="text-decoration:underline">Book a wash →</a>`; }
    else { out.className="pinres no"; out.innerHTML=`We don't cover ${pin} yet. <a href="${waLink(`Hi ${SITE.name}, do you come to PIN ${pin}?`)}" target="_blank" rel="noopener" style="text-decoration:underline">Ask us on WhatsApp</a> and we'll tell you when we reach your area.`; }
  });
});
document.addEventListener("click", e => {
  const b=e.target.closest("[data-book]"); if(b){ ss.set("dgBook", b.dataset.book); }
  const p=e.target.closest("[data-pinbook]"); if(p){ ss.set("dgPin", p.dataset.pinbook); }
  const r=e.target.closest("[data-ride]"); if(r){ ss.set("dgBook", r.dataset.ride+"|hatch|1"); }
});

/* ---------- before / after ---------- */
$$(".ba").forEach(ba => { const r=$$("input",ba)[0]; r.addEventListener("input",()=>ba.style.setProperty("--p",r.value+"%")); });

/* ---------- scroll-to-wash hero ---------- */
const washEl=document.querySelector(".wash");
let washFrame=()=>{};
if(washEl){
  const cv=$("spray"), cx=cv.getContext("2d");
  const CARDS=[["01 — MUD & DUST","What Mumbai roads leave behind","Construction dust, traffic grime and monsoon splash. Keep scrolling to wash it off."],
               ["02 — SNOW FOAM","Foam lifts the grime","Thick pH-neutral foam loosens dirt before a mitt ever touches your paint."],
               ["03 — RINSE & DRY","From our own water tank","A low-pressure rinse, then a hand-dry with fresh microfibre."],
               ["04 — SHOWROOM SHINE","Right where you parked it","Glass streak-free, tyres dressed, paint glowing. Ready for the drive."]];
  let stage=0, parts=[], lastX=null, raf=0;
  const sizeCanvas=()=>{ const d=Math.min(devicePixelRatio||1,2); cv.width=cv.clientWidth*d; cv.height=cv.clientHeight*d; cx.setTransform(d,0,0,d,0,0); };
  const setCard=i=>{ if(i===stage) return; stage=i; const els=[$("cN"),$("cH"),$("cP")];
    els.forEach(e=>e.classList.add("swap","out"));
    setTimeout(()=>{ $("cN").textContent=CARDS[i][0]; $("cH").textContent=CARDS[i][1]; $("cP").textContent=CARDS[i][2]; els.forEach(e=>e.classList.remove("out")); }, reduce?0:200); };
  const skew=8, edge=w=>-skew+w*(100+2*skew);
  const B=[[0,.2],[.2,.5],[.5,.86],[.86,1]];
  function drawParts(){
    const W=cv.clientWidth,H=cv.clientHeight; cx.clearRect(0,0,W,H);
    parts=parts.filter(q=>q.l>0); cx.fillStyle="#EAF8FF";
    parts.forEach(q=>{ cx.globalAlpha=q.l*.85; cx.beginPath(); cx.arc(q.x,q.y,q.s,0,7); cx.fill(); });
    cx.globalAlpha=1;
    if(parts.length && !raf) raf=requestAnimationFrame(()=>{ parts.forEach(q=>{ q.x+=q.vx; q.y+=q.vy; q.vy+=.28; q.l-=.035; }); frame(); });
  }
  function frame(){
    raf=0;
    const fab=$("fab");
    if(washEl.offsetParent===null){ fab && fab.classList.remove("away"); return; }
    const r=washEl.getBoundingClientRect(), tot=washEl.offsetHeight-innerHeight, p=clamp(-r.top/tot);
    const w1=clamp((p-.06)/.36), w2=clamp((p-.52)/.36), e1=edge(w1), e2=edge(w2);
    $("lMud").style.clipPath=`polygon(${e1+skew}% 0,100% 0,100% 100%,${e1-skew}% 100%)`;
    $("lFoam").style.clipPath=`polygon(${e2+skew}% 0,100% 0,100% 100%,${e2-skew}% 100%)`;
    $("lMud").style.visibility = w1>=1 ? "hidden" : "";
    const active=(w1>0&&w1<1)?e1:(w2>0&&w2<1)?e2:null, jet=$("jet");
    if(active!==null){ jet.style.setProperty("--x",active+"%"); jet.style.setProperty("--jo",1); } else jet.style.setProperty("--jo",0);
    $("layers").style.setProperty("--z",(1.1-p*.1).toFixed(4));
    $("hint").style.opacity = p>.03 ? 0 : 1;
    fab && fab.classList.toggle("away", r.bottom>innerHeight*1.02);
    setCard(p<.2?0:p<.5?1:p<.86?2:3);
    [...$("rail").children].forEach((d,i)=>{ d.querySelector("i").style.setProperty("--w",clamp((p-B[i][0])/(B[i][1]-B[i][0]))*100+"%"); d.classList.toggle("on",p>=B[i][0]); });
    const W=cv.clientWidth,H=cv.clientHeight, top=$("layers").offsetTop, lh=$("layers").offsetHeight;
    if(active!==null && !reduce){ const x=active/100*W; if(lastX!==null && Math.abs(x-lastX)>1){ for(let k=0;k<14;k++){ parts.push({x:x+(Math.random()-.5)*20,y:top+lh*(.3+Math.random()*.5),vx:(Math.random()-.3)*6,vy:-Math.random()*5-1,l:1,s:1+Math.random()*2.2}); } } lastX=x; } else lastX=null;
    drawParts();
  }
  washFrame=()=>{ if(!raf) raf=requestAnimationFrame(frame); };
  addEventListener("scroll",washFrame,{passive:true});
  addEventListener("resize",()=>{ sizeCanvas(); washFrame(); });
  sizeCanvas(); frame();
}

/* ---------- booking ---------- */
const bform=$("bform");
const B={veh:"car",size:"hatch",pkg:1,adds:new Set(),step:1,pinOk:false};
function applyPreselect(){
  if(!bform) return;
  const s=ss.get("dgBook"); if(s){ const [v,z,i]=s.split("|"); B.veh=v==="bike"?"bike":"car"; B.size=SIZE_LABEL[z]?z:"hatch"; B.pkg=+i||0; ss.set("dgBook",""); }
  const pin=ss.get("dgPin"); if(pin){ $("b-pin").value=pin; ss.set("dgPin",""); checkBookPin(); }
  $("bv-"+B.veh).checked=true; if(B.veh==="car") $("bs-"+B.size).checked=true;
  renderPick(); showStep(1);
}
function addonList(){ return B.veh==="bike" ? ADDONS.bike : ADDONS.car; }
function renderPick(){
  $("sizeField").hidden=B.veh==="bike";
  $("detailField").hidden=B.veh==="bike";
  const pr=PRICE[priceKey(B.veh,B.size)];
  $("pkgPick").innerHTML=PKG[B.veh].map((p,i)=>`<label><span><input type="radio" name="pkg" value="${i}" ${i===B.pkg?"checked":""}><b>${p.n}</b><small>${p.t.replace("~","about ").toLowerCase()} · ${p.i[p.i[0].startsWith("Everything")?1:0]}</small></span><strong>${rupee(pr[i])}</strong></label>`).join("");
  const ids=new Set(addonList().map(a=>a.id).concat(B.veh==="car"?DETAIL.map(d=>d.id):[]));
  [...B.adds].forEach(id=>{ if(!ids.has(id)) B.adds.delete(id); });
  $("addPick").innerHTML=addonList().map(a=>`<label><input type="checkbox" value="${a.id}" ${B.adds.has(a.id)?"checked":""}> ${a.n} <b>+${rupee(a.p)}</b></label>`).join("");
  $("detailPick").innerHTML=DETAIL.map(a=>`<label><input type="checkbox" value="${a.id}" ${B.adds.has(a.id)?"checked":""}> ${a.n} <b>+${rupee(a.p)}</b></label>`).join("");
  $("sumImg").src=B.veh==="bike"?"img/bike.jpg":"img/shine.jpg";
  updateSum();
}
function extraById(id){ return addonList().concat(DETAIL).find(a=>a.id===id); }
function subtotal(){ return PRICE[priceKey(B.veh,B.size)][B.pkg] + [...B.adds].reduce((s,id)=>s+(extraById(id)?.p||0),0); }
function offerMin(){ if(!B.offer) return 0; return (B.offer.type==="ref" ? REFERRAL.min : (PROMOS[B.offer.value]||{}).min) || 0; }
function belowMin(){ return !!(B.offer && B.offer.ok && subtotal() < offerMin()); }
function discount(){ return B.offer && B.offer.ok && !belowMin() ? Math.min(B.offer.off, subtotal()) : 0; }
function total(){ return subtotal() - discount(); }
function vehText(){ return B.veh==="bike" ? "Bike / Scooter" : "Car · "+SIZE_LABEL[B.size]; }
function whenText(){ const d=$("b-date").value; if(!d) return "—"; const sl=document.querySelector('input[name="slot"]:checked'); return new Date(d+"T00:00").toLocaleDateString("en-IN",{weekday:"short",day:"numeric",month:"short"})+(sl?", "+sl.value:""); }
function payMode(){ const r=document.querySelector('input[name="pay"]:checked'); return r?r.value:"after"; }
function payText(){ return payMode()==="online" ? "Online by UPI" : "After the wash (UPI / cash)"; }
function upiQuery(amount,id){ return "pa="+encodeURIComponent(SITE.upiId)+"&pn="+encodeURIComponent(SITE.upiName)+"&am="+amount+"&cu=INR&tn="+encodeURIComponent("Booking "+id); }
function upiLink(amount,id){ return "upi://pay?"+upiQuery(amount,id); }
const OS = /iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.platform==="MacIntel" && navigator.maxTouchPoints>1) ? "ios" : /Android/i.test(navigator.userAgent) ? "android" : "desktop";
/* iPhones have no "choose an app" sheet for upi:// links (the last-installed UPI app, e.g. WhatsApp, always opens),
   so each app gets its own button. Android uses intent links that open that exact app. */
function upiApps(amount,id){
  const q=upiQuery(amount,id), intent=pkg=>"intent://pay?"+q+"#Intent;scheme=upi;package="+pkg+";end";
  const apps=[
    {n:"Google Pay", ios:"tez://upi/pay?"+q, android:intent("com.google.android.apps.nbu.paisa.user")},
    {n:"PhonePe",    ios:"phonepe://pay?"+q, android:intent("com.phonepe.app")},
    {n:"Paytm",      ios:"paytmmp://pay?"+q, android:intent("net.one97.paytm")},
    {n:"Other UPI app", ios:"upi://pay?"+q, android:"upi://pay?"+q}
  ];
  return apps.map(a=>`<a class="btn ${a.n==="Other UPI app"?"btn-ghost":"btn-lime"} sm" href="${OS==="ios"?a.ios:a.android}">${a.n}</a>`).join("");
}
function drawQr(text){
  const el=$("upiQr"); if(!el) return;
  if(typeof qrcode!=="function"){ el.innerHTML=""; $("qrWrap").hidden=true; return; }
  const qr=qrcode(0,"M"); qr.addData(text); qr.make();
  el.innerHTML=qr.createSvgTag({cellSize:5, margin:3, scalable:true});
}
function addsText(){ return B.adds.size ? [...B.adds].map(id=>extraById(id)?.n).filter(Boolean).join(", ") : "None"; }
function updateSum(){
  $("sVeh").textContent=vehText(); $("sPkg").textContent=PKG[B.veh][B.pkg].n;
  $("sAdd").textContent=addsText(); $("sWhen").textContent=whenText();
  const pin=$("b-pin").value, hit=areaForPin(pin); $("sWhere").textContent= hit ? `${hit.a} · ${pin}` : "—";
  $("sPay").textContent=payText();
  const dsc=discount(); $("sDiscRow").hidden=!dsc; $("sDisc").textContent="−"+rupee(dsc);
  if(B.offer && B.offer.ok){ const m=$("offerMsg");
    if(belowMin()){ m.className="pinmsg no"; m.textContent=`${B.offer.type==="ref"?"The referral discount":B.offer.value} needs a minimum order of ${rupee(offerMin())}. Add ${rupee(offerMin()-subtotal())} more (a bigger package or an add-on) and it applies automatically.`; }
    else { m.className="pinmsg ok"; m.textContent=B.offer.msg; } }
  $("sTot").textContent=rupee(total());
}
/* first-wash code or friend referral: one ₹50 discount, checked against the bookings Sheet */
let offerTimer=0, offerSeq=0, offerRun=null;
function setChecking(on){ const b=bform && bform.querySelector('[data-step="3"] button[type=submit]'); if(!b) return; b.disabled=on; b.innerHTML = on ? "Checking offer…" : 'Confirm booking <span class="arrow">↗</span>'; }
function queueOffer(){ clearTimeout(offerTimer); const has=$("b-code").value.trim()||$("b-ref").value.trim(); if(has) setChecking(true); offerTimer=setTimeout(runOffer,450); }
function runOffer(){ clearTimeout(offerTimer); offerRun=checkOffer().finally(()=>{ offerRun=null; setChecking(false); }); return offerRun; }
async function checkOffer(){
  const code=$("b-code").value.trim().toUpperCase(), ref=$("b-ref").value.replace(/\D/g,"").slice(-10), phone=$("b-phone").value.replace(/\D/g,"").slice(-10), m=$("offerMsg"), seq=++offerSeq;
  B.offer=null; m.className="pinmsg"; m.textContent="";
  if(!code && !ref){ updateSum(); return; }
  if(ref && ref.length<10){ updateSum(); return; }
  if(code && !ref && !PROMOS[code] && !USE_DB){ m.className="pinmsg no"; m.textContent="That code isn't valid. Check the spelling."; updateSum(); return; }
  const type = ref ? "ref" : "code";
  let off = ref ? REFERRAL.friendOff : (PROMOS[code]||{}).off || 0;
  if(phone.length<10){ m.className="pinmsg"; m.textContent="Add your mobile number above so we can check the offer."; updateSum(); return; }
  m.textContent="Checking…";
  const r = await apiGet(type==="ref" ? {action:"check", ref, phone} : {action:"check", code, phone});
  if(seq!==offerSeq) return;
  const why={not_first:"This offer is for your first Vroombrite wash only.", unknown_ref:"We couldn't find a customer with that mobile number. Check it with your friend.", self:"You can't use your own number as the referral.", unknown:"That code isn't valid."};
  if(r && r.ok && r.valid===true && r.off){   // the database's amounts win (owner edits them in the staff app)
    off = r.off;
    if(type==="ref"){ REFERRAL.friendOff=r.off; REFERRAL.min=r.min||0; if(r.referrer_credit!=null) REFERRAL.referrerCredit=r.referrer_credit; }
    else PROMOS[code] = Object.assign({}, PROMOS[code], {off:r.off, min:r.min||0});
  }
  if(r && r.ok && r.valid===false){ m.className="pinmsg no"; m.textContent=why[r.reason]||"This offer can't be applied."; }
  else if(!off){ m.className="pinmsg no"; m.textContent="That code isn't valid. Check the spelling."; }
  else { B.offer={type, value: ref||code, off, ok:true}; m.className="pinmsg ok";
    B.offer.msg = (r && r.valid===true ? "✓ " : "✓ Applied. We'll confirm it with your booking. ") + "₹"+off+" off" + (type==="ref" ? " — and your friend gets ₹"+REFERRAL.referrerCredit+" credit." : code==="WELCOME50" ? " your first wash." : " with "+code+"."); }
  updateSum();
}
function checkBookPin(){
  const pin=$("b-pin").value.trim(), m=$("pinMsg");
  if(pin.length<6){ B.pinOk=false; m.className="pinmsg"; m.textContent=""; updateSum(); return; }
  const hit=areaForPin(pin);
  B.pinOk=!!hit;
  if(hit){ m.className="pinmsg ok"; m.textContent=`✓ We cover ${hit.a}`; }
  else { m.className="pinmsg no"; m.innerHTML=`We don't cover ${pin} yet. <a href="${waLink(`Hi ${SITE.name}, do you come to PIN ${pin}?`)}" target="_blank" rel="noopener" style="text-decoration:underline">Ask on WhatsApp</a>`; }
  updateSum();
}
function showStep(n){
  B.step=n; $$(".step",bform).forEach(s=>s.hidden=+s.dataset.step!==n); $("done").hidden=true;
  $("prog").hidden=false; $("stepLbl").textContent=`STEP 0${n} / 03`; $("stepBar").style.width=(n/3*100)+"%";
}
/* Time slots: full, closed and already-started slots can't be picked (the database also refuses them). */
const AVAIL={}, SLOT_TAG={full:"Full", closed:"Closed", past:"Gone"};
async function loadAvail(from){
  if(!USE_DB) return;
  try{ (await rpc("slot_availability",{p_from:from, p_days:31})).forEach(d=>AVAIL[d.date]=d.slots); renderSlots(); }catch(e){ /* offline: every slot stays open; the database still checks */ }
}
function renderSlots(){
  const box=$("slotChips"); if(!box) return;
  const d=$("b-date").value, st=AVAIL[d]||{}, cur=(document.querySelector('input[name="slot"]:checked')||{}).value;
  const open=SLOTS.filter(s=>!st[s]||st[s]==="open"), pick=open.includes(cur)?cur:open[0];
  box.innerHTML=SLOTS.map((s,i)=>{ const x=st[s]&&st[s]!=="open"?st[s]:""; return `<label${x?' class="off"':""}><input type="radio" name="slot" value="${s}" id="slot-${i}" ${s===pick?"checked":""} ${x?"disabled":""}><span>${s}${x?`<small>${SLOT_TAG[x]||"Full"}</small>`:""}</span></label>`; }).join("");
  const none=!open.length; let m=$("slotNone"); if(!m){ m=document.createElement("p"); m.id="slotNone"; m.className="pinmsg no"; m.style.marginTop="8px"; box.after(m); }
  m.textContent=none?(Object.values(st).every(v=>v==="closed")?"We're not washing on this day. Please pick another date.":"No times left on this day. Please pick another date."):""; m.hidden=!none;
  if(typeof updateSum==="function") updateSum();
}
if(bform){
  const on=!!SITE.upiId;
  $("payPick").innerHTML=`<label><span><input type="radio" name="pay" value="after" id="pay-after" checked><b>Pay after the wash</b><small>UPI or cash, once you've checked the shine. No advance needed.</small></span><strong class="tagp">Standard</strong></label>
    <label${on?"":' class="off"'}><span><input type="radio" name="pay" value="online" id="pay-online" ${on?"":"disabled"}><b>Pay online now</b><small>${on?"Pay by UPI from any app right after you confirm.":"Online payment is coming soon."}</small></span><strong class="tagp alt">${on?"UPI":"Soon"}</strong></label>`;
  const iso=d=>new Date(d.getTime()-d.getTimezoneOffset()*6e4).toISOString().slice(0,10);
  const tm=new Date(); tm.setDate(tm.getDate()+1); $("b-date").min=iso(new Date()); $("b-date").value=iso(tm);
  renderSlots(); loadAvail(iso(new Date()));
  $("b-date").addEventListener("change",()=>{ const d=$("b-date").value; renderSlots(); if(d && !AVAIL[d]) loadAvail(d); });
  ["b-code","b-ref","b-phone"].forEach(id=>$(id).addEventListener("input",queueOffer));
  $("applyOffer").addEventListener("click",()=>{ setChecking(true); runOffer(); });
  $("b-code").addEventListener("keydown",e=>{ if(e.key==="Enter"){ e.preventDefault(); setChecking(true); runOffer(); } });
  $("showQr").addEventListener("click",()=>{ $("qrWrap").hidden=!$("qrWrap").hidden; });
  $("b-pin").addEventListener("input",()=>{ $("b-pin").value=$("b-pin").value.replace(/\D/g,"").slice(0,6); checkBookPin(); });
  bform.addEventListener("change",e=>{
    const t=e.target;
    if(t.name==="veh"){ B.veh=t.value; renderPick(); }
    else if(t.name==="size"){ B.size=t.value; renderPick(); }
    else if(t.name==="pkg"){ B.pkg=+t.value; updateSum(); }
    else if(t.type==="checkbox"){ t.checked?B.adds.add(t.value):B.adds.delete(t.value); updateSum(); }
    else updateSum();
  });
  bform.addEventListener("click",e=>{
    if(e.target.closest("[data-next]")){
      if(B.step===2){
        const m=[]; if(!$("b-addr").value.trim()) m.push("your building or society"); if(!B.pinOk) m.push("a PIN code we cover"); if(!$("b-date").value) m.push("a date");
        else if(!document.querySelector('input[name="slot"]:checked')) m.push("a time slot that's still free (or another date)");
        $("err2").textContent=m.length?"Please add "+m.join(", ")+".":""; $("err2").hidden=!m.length; if(m.length) return;
      }
      showStep(B.step+1); bform.scrollIntoView({behavior:reduce?"auto":"smooth",block:"start"});
    }
    if(e.target.closest("[data-prev]")) showStep(B.step-1);
  });
  bform.addEventListener("submit", async e=>{
    e.preventDefault();
    const name=$("b-name").value.trim(), ph=$("b-phone").value.replace(/\D/g,"").slice(-10), m=[];
    if(!name) m.push("your name"); if(!/^[6-9]\d{9}$/.test(ph)) m.push("a valid 10-digit mobile number");
    if(m.length){ $("err3").textContent="Please add "+m.join(" and ")+"."; $("err3").hidden=false; return; }
    $("err3").hidden=true;
    const id=bookingId(), pin=$("b-pin").value, area=areaForPin(pin)?.a||"";
    const data={type:"booking", id, vehicle:vehText(), plate:$("b-plate").value.trim(), package:PKG[B.veh][B.pkg].n, addons:addsText(),
      date:$("b-date").value, slot:(document.querySelector('input[name="slot"]:checked')||{}).value||"", address:$("b-addr").value.trim(), area, pin,
      name, phone:ph, notes:$("b-notes").value.trim(), total:total(), payment: payMode()==="online" ? "Online UPI · pending" : "After service",
      subtotal:subtotal(), pay_mode:payMode(), discount:discount(), promo: discount()>0 ? (B.offer.type==="ref" ? "Referral" : B.offer.value) : "", ref: discount()>0 && B.offer.type==="ref" ? B.offer.value : ""};
    const msg=`Hi ${SITE.name}, I'd like to book a doorstep wash.\n\nBooking ID: ${id}\nVehicle: ${data.vehicle}${data.plate?" ("+data.plate+")":""}\nPackage: ${data.package}\nAdd-ons: ${data.addons}\nWhen: ${whenText()}\nAddress: ${data.address}, ${area} ${pin}\nName: ${name}\nMobile: ${ph}${data.notes?"\nNotes: "+data.notes:""}\n\n${data.discount?`Offer: ${data.promo==="Referral"?"Referred by "+data.ref:data.promo} (−${rupee(data.discount)})\n`:""}Estimated total: ${rupee(data.total)}\nPayment: ${payText()}`;
    const url=waLink(msg); $("waAgain").href=url; $("doneId").textContent=id;
    $("referShare").href="https://wa.me/?text="+encodeURIComponent(`I just booked a doorstep car wash with ${SITE.name}, they come to your parking with their own water and power. Book here and enter my number ${ph} as "Referred by" to get ₹${REFERRAL.friendOff} off your first wash (on orders of ₹${REFERRAL.min}+): ${location.origin}${location.pathname.replace(/[^/]*$/,"")}${PREVIEW?"#book":"book.html"}`);
    $$(".step",bform).forEach(s=>s.hidden=true); $("prog").hidden=true; $("done").hidden=false;
    const online = payMode()==="online" && !!SITE.upiId;
    $("payBox").hidden=!online;
    if(online){
      $("payAmt").textContent=rupee(data.total); $("upiIdText").textContent=SITE.upiId;
      $("upiApps").innerHTML=upiApps(data.total,id); drawQr(upiLink(data.total,id));
      $("payMobile").hidden = OS==="desktop"; $("qrWrap").hidden = OS!=="desktop";
    }
    $("doneMsg").textContent = online ? "WhatsApp should have opened with your booking. Press send there, then pay below and share the payment screenshot in the same chat." : "WhatsApp should have opened with your booking filled in. Press send there and we'll confirm your slot. You pay after the wash.";
    openNew(url);                               // open WhatsApp inside the click so it isn't blocked
    const st=$("saveState"); st.hidden=true;
    const res=await saveToSheet(data);
    if(res==="ok"){ st.className="status ok"; st.textContent="Saved to our booking list."; st.hidden=false;
      rpc("public_track_link",{p_id:id, p_phone:ph}).then(r=>{ const k=r&&r.key; if(!k) return; const a=$("trackLink"); a.href=`track.html?b=${encodeURIComponent(id)}&k=${k}`; a.hidden=false; }).catch(()=>{}); }
    else if(res==="full"){ st.className="status warn"; st.textContent="That time just got fully booked. Please still press send in WhatsApp and we'll reply with the nearest free time."; st.hidden=false; delete AVAIL[data.date]; loadAvail(data.date); }
    else if(res==="fail"){ st.className="status warn"; st.textContent="We couldn't save this online, so please press send in WhatsApp to confirm."; st.hidden=false; }
  });
  $("newBooking").addEventListener("click",()=>{ B.adds.clear(); B.offer=null; $("b-code").value=""; $("b-ref").value=""; $("offerMsg").textContent=""; renderPick(); showStep(1); });
  applyPreselect();
}

$("copyUpi") && $("copyUpi").addEventListener("click",()=>{ const b=$("copyUpi"); navigator.clipboard.writeText(SITE.upiId).then(()=>{b.textContent="Copied";setTimeout(()=>b.textContent="Copy",1500);}).catch(()=>{const r=document.createRange();r.selectNodeContents($("upiIdText"));const g=getSelection();g.removeAllRanges();g.addRange(r);}); });

/* ---------- contact enquiry ---------- */
const eform=$("eform");
if(eform){
  eform.addEventListener("submit", async e=>{
    e.preventDefault();
    const name=$("e-name").value.trim(), ph=$("e-phone").value.replace(/\D/g,"").slice(-10), msg=$("e-msg").value.trim(), m=[];
    if(!name) m.push("your name"); if(!/^[6-9]\d{9}$/.test(ph)) m.push("a valid mobile number"); if(!msg) m.push("a message");
    const out=$("eState");
    if(m.length){ out.className="status warn"; out.textContent="Please add "+m.join(", ")+"."; out.hidden=false; return; }
    openNew(waLink(`Hi ${SITE.name}, I'm ${name} (${ph}).\n\n${msg}`));
    out.className="status ok"; out.textContent="WhatsApp opened with your message. Press send there and we'll reply."; out.hidden=false;
    const res=await saveToSheet({type:"enquiry", name, phone:ph, message:msg});
    if(res==="ok") out.textContent="Got it. Your message is saved and WhatsApp is open if you'd like to chat now.";
  });
}

/* ---------- reviews shown on the site (approved in the Sheet) ---------- */
async function loadReviews(){
  const blocks=$$("[data-reviews]"); if(!blocks.length) return;
  const r=await apiGet({action:"reviews"}); const list=(r&&r.reviews)||[];
  if(!list.length) return;                       // nothing approved yet: keep the section hidden
  const esc=t=>String(t).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const html=list.slice(0,6).map(v=>`<figure class="rv"><div class="rv-stars" aria-label="${v.rating} out of 5">${"★".repeat(v.rating)}<span>${"★".repeat(5-v.rating)}</span></div><blockquote>${esc(v.text)}</blockquote><figcaption><b>${esc(v.name)}</b>${v.area?" · "+esc(v.area):""}</figcaption></figure>`).join("");
  blocks.forEach(b=>{ $$(".reviews",b)[0].innerHTML=html; b.hidden=false; });
}
loadReviews();

/* ---------- receipt (receipt.html?b=BOOKING_ID&k=KEY), made in the staff app once a job is paid ---------- */
const rcpt=$("receipt");
if(rcpt){
  const q=new URLSearchParams(location.search), e=t=>String(t==null?"":t).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const bad=()=>{ rcpt.innerHTML='<p class="sub">We couldn\'t find this receipt. Please check the link, or WhatsApp us and we\'ll send it again.</p>'; };
  if(!USE_DB || !q.get("b") || !q.get("k")) bad();
  else rpc("public_receipt",{p_id:q.get("b"), p_key:q.get("k")}).then(r=>{
    if(!r) return bad();
    const day=d=>new Date(d+"T12:00:00Z").toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric",timeZone:"UTC"});
    const ex=String(r.extras||"").split(/\s*,\s*/).filter(x=>x&&x!=="None");
    rcpt.innerHTML=`<div class="rc-head"><span>Receipt for <b>${e(r.name)}</b></span><span class="rc-paid">Paid</span></div>
      <dl class="rc"><dt>Booking</dt><dd>${e(r.id)}</dd><dt>Wash date</dt><dd>${day(r.wash_date)}, ${e(r.slot)}</dd>
      <dt>Vehicle</dt><dd>${e(r.vehicle)}${r.plate?" · "+e(r.plate):""}</dd><dt>Service</dt><dd>${e(r.package)}${ex.length?"<br><small>+ "+ex.map(e).join(", ")+"</small>":""}</dd>
      ${r.area?`<dt>Area</dt><dd>${e(r.area)}</dd>`:""}</dl>
      <div class="rc-sum">${r.discount>0?`<div><span>Price</span><span>${rupee(r.subtotal)}</span></div><div><span>Discount${r.promo&&r.promo!=="MANUAL"?" ("+e(r.promo==="REFERRAL"?"referral":r.promo)+")":""}</span><span>−${rupee(r.discount)}</span></div>`:""}
        <div class="rc-total"><span>Total paid</span><span>${rupee(r.total)}</span></div>
        <p>${r.payment==="paid_upi"?"Paid by UPI":"Paid in cash"}${r.paid_at?" on "+new Date(r.paid_at).toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric",timeZone:"Asia/Kolkata"}):""}</p></div>
      <p class="note">${e(SITE.name)} · Doorstep car &amp; bike care, Mumbai</p>`;
  }).catch(bad);
}

/* ---------- track page (track.html?b=BOOKING_ID&k=KEY): live status; move or cancel until 2 hours before the slot ---------- */
const trk=$("track");
if(trk){
  const q=new URLSearchParams(location.search), bid=q.get("b")||"", key=q.get("k")||"";
  const e=t=>String(t==null?"":t).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const ist=()=>new Date(Date.now()+5.5*36e5).toISOString().slice(0,10), addD=(d,n)=>{ const x=new Date(d+"T12:00:00Z"); x.setUTCDate(x.getUTCDate()+n); return x.toISOString().slice(0,10); };
  const day=(d,o)=>new Date(d+"T12:00:00Z").toLocaleDateString("en-IN",Object.assign({weekday:"short",day:"numeric",month:"short",timeZone:"UTC"},o||{}));
  const tm=t=>t?new Date(t).toLocaleTimeString("en-IN",{hour:"numeric",minute:"2-digit",timeZone:"Asia/Kolkata"}):"";
  const STARTS={"6–8 AM":6,"8–10 AM":8,"10 AM–1 PM":10,"2–5 PM":14,"5–8 PM":17};
  let T=null, mode="", pick={d:"", s:""}, reason="", busy=false, msg="", timer=0;
  const bad=m=>{ trk.innerHTML=`<div class="tr-card"><p>${m||"We couldn't find this booking. Please check the link, or WhatsApp us and we'll send it again."}</p></div>`; };
  async function load(){
    if(!USE_DB || !bid || !key) return bad();
    try{ const r=await rpc("public_track",{p_id:bid, p_key:key}); if(!r) return bad(); T=r; if(!mode) draw(); }
    catch(x){ if(!T) bad("We couldn't load your booking just now. Please check your internet and try again."); }
    clearTimeout(timer); if(T && !["done","cancelled"].includes(T.status)) timer=setTimeout(load, 30000);
  }
  document.addEventListener("visibilitychange",()=>{ if(!document.hidden && T && !mode) load(); });
  function draw(){
    const st=T.status, cancelled=st==="cancelled", paid=/^paid/.test(T.payment)||T.payment==="covered";
    const steps=[["Booked",T.created_at],["Confirmed",T.confirmed_at],["On the way",T.on_way_at],["Washing",T.started_at],["Done",T.done_at]];
    const cur=st==="done"?4:T.started_at?3:st==="on_way"?2:st==="confirmed"?1:0;
    const label=cancelled?"Cancelled":["Booked · waiting for confirmation","Confirmed","On the way","Washing now","Done"][cur];
    const ex=String(T.extras||"").split(/\s*,\s*/).filter(x=>x&&x!=="None");
    let acts="";
    if(cancelled) acts=`<p class="tr-msg">${T.cancelled_by_you?"You cancelled this booking.":"This booking was cancelled."} Nothing more to pay for it.</p><a class="btn btn-lime" href="book.html">Book a new wash <span class="arrow">→</span></a>`;
    else if(T.can_change) acts=`<div class="tr-acts"><button type="button" class="btn btn-lime" data-trmode="move">Change day or time</button><button type="button" class="btn btn-ghost" data-trmode="cancel">Cancel booking</button></div>
      <p class="note">You can change or cancel here until ${tm(T.change_until)} on ${day(new Date(new Date(T.change_until).getTime()+5.5*36e5).toISOString().slice(0,10))}, free of charge.</p>`;
    else if(st==="new"||st==="confirmed") acts=`<p class="tr-msg">${T.source==="plan"||T.source==="society"?"This is a plan visit. To change it, message us.":"It's less than 2 hours to your slot, so changes need a quick message."}</p><a class="btn btn-wa" target="_blank" rel="noopener" href="${waLink(`Hi ${SITE.name}, about my booking ${T.id}: `)}">WhatsApp us <span class="arrow">↗</span></a>`;
    if(st==="done"){ acts+=`<div class="tr-acts">${T.receipt_key?`<a class="btn btn-ghost" href="receipt.html?b=${encodeURIComponent(T.id)}&k=${T.receipt_key}">See receipt</a>`:""}${!T.reviewed?`<a class="btn btn-lime" href="review.html?b=${encodeURIComponent(T.id)}">Rate your wash <span class="arrow">→</span></a>`:`<p class="tr-msg">Thanks for your review!</p>`}</div>`; }
    trk.innerHTML=`<div class="tr-card">
      <div class="tr-head"><span>Hi <b>${e(T.name)}</b> · ${e(T.id)}</span><span class="tr-pill${cancelled?" off":cur===4?" done":""}">${label}</span></div>
      ${cancelled?"":`<ol class="tr-steps">${steps.map(([n,t],i)=>`<li class="${i<cur?"past":i===cur?"now":""}"><i></i><b>${n}</b><small>${i<=cur&&t?tm(t):""}</small></li>`).join("")}</ol>`}
      ${st==="on_way"&&!T.started_at?`<p class="tr-live"><span class="dot"></span>${T.washer?e(T.washer)+" is":"Your washer is"} on the way.</p>`:""}
      ${T.started_at&&st!=="done"?`<p class="tr-live"><span class="dot"></span>Washing started at ${tm(T.started_at)}.</p>`:""}
      <dl class="rc"><dt>When</dt><dd>${day(T.wash_date,{weekday:"long",month:"long"})}, ${e(T.slot)}</dd><dt>Vehicle</dt><dd>${e(T.vehicle)}${T.plate?" · "+e(T.plate):""}</dd>
        <dt>Service</dt><dd>${e(T.package)}${ex.length?"<br><small>+ "+ex.map(e).join(", ")+"</small>":""}</dd>${T.area?`<dt>Area</dt><dd>${e(T.area)}</dd>`:""}
        ${T.washer&&!cancelled?`<dt>Washer</dt><dd>${e(T.washer)}</dd>`:""}
        ${T.payment==="covered"?`<dt>Payment</dt><dd>Covered by your plan</dd>`:`<dt>Total</dt><dd>${rupee(T.total)}${T.discount>0?` <small>(${rupee(T.discount)} off)</small>`:""} · ${paid?(T.payment==="paid_upi"?"Paid by UPI":"Paid in cash"):cancelled?"Not charged":"Pay after the wash"}</dd>`}</dl>
      ${msg?`<p class="status ok">${e(msg)}</p>`:""}${acts}</div>`;
  }
  async function drawMove(){
    const t0=ist(); if(!pick.d){ pick={d:T.wash_date, s:T.slot}; }
    trk.innerHTML=`<div class="tr-card"><h3>Pick a new day and time</h3><p class="note" style="margin-top:0">Now: ${day(T.wash_date)}, ${e(T.slot)}</p>
      <div class="chips tr-days" role="radiogroup" aria-label="Day">${Array.from({length:14},(_,i)=>addD(t0,i)).map(d=>`<label><input type="radio" name="trd" value="${d}" ${d===pick.d?"checked":""}><span>${i0(d,t0)}</span></label>`).join("")}</div>
      <div class="chips" role="radiogroup" aria-label="Time slot" id="trSlots" style="margin-top:14px"><span class="note">Checking free times…</span></div>
      <p class="status warn" id="trErr" hidden></p>
      <div class="tr-acts"><button type="button" class="btn btn-lime" id="trMoveGo">Move my booking</button><button type="button" class="btn btn-ghost" data-trmode="">Back</button></div></div>`;
    drawSlots();
  }
  const i0=(d,t0)=>d===t0?"Today":d===addD(t0,1)?"Tomorrow":day(d);
  const AV={};
  async function drawSlots(){
    const box=$("trSlots"); if(!box) return;
    if(!AV[pick.d]){ try{ (await rpc("slot_availability",{p_from:pick.d, p_days:14})).forEach(x=>AV[x.date]=x.slots); }catch(x){ AV[pick.d]={}; } }
    const st=AV[pick.d]||{}, now=Date.now(), soon=s=>{ const h=STARTS[s]; if(h==null) return false; return new Date(pick.d+"T00:00:00+05:30").getTime()+h*36e5 < now+2*36e5; };
    const state=s=>{ const x=st[s]&&st[s]!=="open"?st[s]:""; return x||(soon(s)?"past":""); };
    if(state(pick.s) && !(pick.d===T.wash_date&&pick.s===T.slot)) pick.s=SLOTS.find(s=>!state(s))||"";
    box.innerHTML=SLOTS.map(s=>{ const x=state(s), mine=pick.d===T.wash_date&&s===T.slot; return `<label${x&&!mine?' class="off"':""}><input type="radio" name="trs" value="${s}" ${s===pick.s?"checked":""} ${x&&!mine?"disabled":""}><span>${s}${mine?"<small style=\"color:var(--aqua)\">Now</small>":x?`<small>${SLOT_TAG[x]||"Full"}</small>`:""}</span></label>`; }).join("");
  }
  function drawCancel(){
    const R=["My plans changed","Not needed right now","Booked by mistake","Weather","Other"];
    trk.innerHTML=`<div class="tr-card"><h3>Cancel this booking?</h3><p class="note" style="margin-top:0">${day(T.wash_date)}, ${e(T.slot)} · ${e(T.package)}. Cancelling now is free.</p>
      <p class="lb" style="margin:14px 0 8px">Tell us why (optional)</p>
      <div class="chips">${R.map(r=>`<label><input type="radio" name="trr" value="${r}" ${r===reason?"checked":""}><span>${r}</span></label>`).join("")}</div>
      <p class="status warn" id="trErr" hidden></p>
      <div class="tr-acts"><button type="button" class="btn btn-danger" id="trCancelGo">Yes, cancel it</button><button type="button" class="btn btn-ghost" data-trmode="">Keep my booking</button></div>
      <p class="note">Rather move it? <button type="button" class="linkbtn" data-trmode="move">Pick another day or time</button></p></div>`;
  }
  async function change(action, args){
    if(busy) return; busy=true; const err=$("trErr"), btn=$(action==="move"?"trMoveGo":"trCancelGo"); if(btn) btn.disabled=true;
    try{ T=await rpc("public_change", Object.assign({p_id:bid, p_key:key, p_action:action, p_date:null, p_slot:null, p_reason:""}, args)); mode=""; pick={d:"",s:""};
      msg=action==="move"?`Done. Your wash is now on ${day(T.wash_date)}, ${T.slot}. We've let the team know.`:"Your booking is cancelled. We've let the team know."; draw(); trk.scrollIntoView({behavior:"smooth", block:"start"}); }
    catch(x){ if(err){ err.textContent=x.hint||(/not found/.test(x.message)?"We couldn't find this booking.":"That didn't work. Please try again, or WhatsApp us."); err.hidden=false; } if(btn) btn.disabled=false;
      if(/too late|not online/.test(x.message)) setTimeout(()=>{ mode=""; load(); }, 2500); }
    busy=false;
  }
  trk.addEventListener("click", ev=>{
    const m=ev.target.closest("[data-trmode]"); if(m){ mode=m.dataset.trmode; msg=""; if(mode==="move"){ Object.keys(AV).forEach(k=>delete AV[k]); drawMove(); } else if(mode==="cancel") drawCancel(); else { pick={d:"",s:""}; draw(); } return; }
    if(ev.target.closest("#trMoveGo")){ if(pick.d===T.wash_date&&pick.s===T.slot){ const er=$("trErr"); er.textContent="That's the time you already have. Pick a different day or time."; er.hidden=false; return; }
      if(!pick.s){ const er=$("trErr"); er.textContent="No free time left on that day. Please pick another day."; er.hidden=false; return; }
      change("move",{p_date:pick.d, p_slot:pick.s}); }
    if(ev.target.closest("#trCancelGo")) change("cancel",{p_reason:reason});
  });
  trk.addEventListener("change", ev=>{
    if(ev.target.name==="trd"){ pick.d=ev.target.value; drawSlots(); }
    if(ev.target.name==="trs") pick.s=ev.target.value;
    if(ev.target.name==="trr") reason=ev.target.value;
  });
  load();
}

/* ---------- review form (review.html?b=BOOKING_ID) ---------- */
const rform=$("rform");
if(rform){
  const bid=(new URLSearchParams(location.search).get("b")||"").slice(0,40);
  if(bid) $("rFor").textContent="Booking "+bid+". Tell us how we did. It takes 20 seconds.";
  rform.addEventListener("submit", async e=>{
    e.preventDefault();
    const rating=+((document.querySelector('input[name="rating"]:checked')||{}).value||0), out=$("rState");
    if(!rating){ out.className="status warn"; out.textContent="Tap a star rating first."; out.hidden=false; return; }
    const btn=rform.querySelector("button[type=submit]"); btn.disabled=true;
    const res=await saveToSheet({type:"review", id:bid, rating, text:$("r-text").value.trim(), name:$("r-name").value.trim()});
    btn.disabled=false;
    if(res==="ok"){ out.className="status ok"; out.textContent="Thank you! Your feedback is with us."; rform.querySelectorAll("input,textarea,button").forEach(x=>x.disabled=true); }
    else { out.className="status warn"; out.innerHTML=`We couldn't send this. <a href="${waLink(`Feedback for booking ${bid}: ${rating}/5. ${$("r-text").value.trim()}`)}" target="_blank" rel="noopener" style="text-decoration:underline">Send it on WhatsApp instead</a>.`; }
    out.hidden=false;
  });
}

/* ---------- society quote form ---------- */
const sform=$("sform");
if(sform){
  sform.addEventListener("submit", async e=>{
    e.preventDefault();
    const v=id=>$(id).value.trim(), ph=v("s-phone").replace(/\D/g,"").slice(-10), out=$("sState"), m=[];
    if(!v("s-soc")) m.push("the society name"); if(!v("s-name")) m.push("your name"); if(!/^[6-9]\d{9}$/.test(ph)) m.push("a valid mobile number");
    if(m.length){ out.className="status warn"; out.textContent="Please add "+m.join(", ")+"."; out.hidden=false; return; }
    const d={type:"society", society:v("s-soc"), area:v("s-area"), pin:v("s-pin"), name:v("s-name"), phone:ph, role:v("s-role"), cars:v("s-cars"), bikes:v("s-bikes"), days:v("s-days"), notes:v("s-notes")};
    openNew(waLink(`Hi ${SITE.name}, I'd like a society quote.\n\nSociety: ${d.society}${d.area?", "+d.area:""} ${d.pin}\nContact: ${d.name} (${d.role}), ${ph}\nVehicles: about ${d.cars||0} cars, ${d.bikes||0} bikes\nPreferred days: ${d.days||"—"}${d.notes?"\nNotes: "+d.notes:""}`));
    out.className="status ok"; out.textContent="WhatsApp opened with your request. Press send there and we'll reply with a group price."; out.hidden=false;
    const res=await saveToSheet(d);
    if(res==="ok") out.textContent="Got it. Your request is saved, and WhatsApp is open if you'd like to chat now.";
  });
}

/* ---------- page routing ---------- */
if(PREVIEW){
  const views=$$(".view").map(v=>v.id.slice(2));
  const route=()=>{
    const v=views.includes(location.hash.slice(1))?location.hash.slice(1):"home";
    views.forEach(x=>$("v-"+x).hidden=x!==v);
    markNav(v); $("links").classList.remove("open"); $("burger").setAttribute("aria-expanded","false");
    scrollTo(0,0);
    if(v==="book") applyPreselect();
    const f=$("fab"); if(f) f.classList.toggle("onbook", v==="book"||v==="review");
    washFrame();
  };
  addEventListener("hashchange",route); route();
} else {
  markNav(document.body.dataset.page);
}
