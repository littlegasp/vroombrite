/* =========================================================
   Vroombrite — shared site script
   EDIT THIS BLOCK BEFORE GOING LIVE
   ========================================================= */
const SITE = {
  name: "Vroombrite",
  phone: "917718984191",            // WhatsApp / call number, country code first, digits only
  phoneDisplay: "+91 77189 84191",
  sheetUrl: "https://script.google.com/macros/s/AKfycbzKZ57SuWpdzK0HCt4Vx8BeIf40FDzAGpnF1iSr3nT3os5dAsW74akLCk3kB6eRl278/exec",                     // paste your Google Apps Script web-app URL here (see README)
  upiId: "7718984191@yescred",                        // UPI ID for "Pay online now" (e.g. vroombrite@okaxis). Empty = online option shows "coming soon"
  upiName: "Vroombrite"             // name shown in the customer's UPI app
};

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
const AREAS = [{"a": "Andheri East", "slug": "andheri-east", "pins": ["400069", "400093", "400099"]}, {"a": "Marol", "slug": "marol", "pins": ["400059"]}, {"a": "Sakinaka & Chandivali", "slug": "sakinaka-chandivali", "pins": ["400072"]}, {"a": "Andheri West", "slug": "andheri-west", "pins": ["400053", "400058", "400061"]}, {"a": "Powai", "slug": "powai", "pins": ["400076"]}, {"a": "Vile Parle", "slug": "vile-parle", "pins": ["400056", "400057"]}, {"a": "Jogeshwari", "slug": "jogeshwari", "pins": ["400060", "400102"]}, {"a": "Goregaon", "slug": "goregaon", "pins": ["400062", "400063"]}, {"a": "Santacruz", "slug": "santacruz", "pins": ["400054", "400055"]}, {"a": "Kurla", "slug": "kurla", "pins": ["400070"]}, {"a": "Ghatkopar", "slug": "ghatkopar", "pins": ["400077", "400086"]}, {"a": "Vikhroli", "slug": "vikhroli", "pins": ["400079", "400083"]}];   // filled from src/areas.json by build.py — edit the areas there
const SLOTS = ["6–8 AM","8–10 AM","10 AM–1 PM","2–5 PM","5–8 PM"];
/* Offers — keep in step with PROMOS / REFERRAL in google-apps-script/Code.gs */
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
async function apiGet(params){
  if(!SITE.sheetUrl) return null;
  try{ const r=await fetch(SITE.sheetUrl+"?"+new URLSearchParams(params)); return await r.json(); }catch(e){ return null; }
}
async function saveToSheet(payload){
  if(!SITE.sheetUrl) return "skipped";
  try{
    const r = await fetch(SITE.sheetUrl, {method:"POST", headers:{"Content-Type":"text/plain;charset=utf-8"}, body:JSON.stringify(payload)});
    const j = await r.json().catch(()=>null);
    return j && j.ok ? "ok" : "fail";
  }catch(e){ return "fail"; }
}
function bookingId(){ const d=new Date(); const p=n=>String(n).padStart(2,"0"); return "VB-"+String(d.getFullYear()).slice(2)+p(d.getMonth()+1)+p(d.getDate())+"-"+Math.random().toString(36).slice(2,6).toUpperCase(); }

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
  if(code && !ref && !PROMOS[code]){ m.className="pinmsg no"; m.textContent="That code isn't valid. Check the spelling."; updateSum(); return; }
  const type = ref ? "ref" : "code", off = ref ? REFERRAL.friendOff : PROMOS[code].off;
  if(phone.length<10){ m.className="pinmsg"; m.textContent="Add your mobile number above so we can check the offer."; updateSum(); return; }
  m.textContent="Checking…";
  const r = await apiGet(type==="ref" ? {action:"check", ref, phone} : {action:"check", code, phone});
  if(seq!==offerSeq) return;
  const why={not_first:"This offer is for your first Vroombrite wash only.", unknown_ref:"We couldn't find a customer with that mobile number. Check it with your friend.", self:"You can't use your own number as the referral.", unknown:"That code isn't valid."};
  if(r && r.ok && r.valid===false){ m.className="pinmsg no"; m.textContent=why[r.reason]||"This offer can't be applied."; }
  else { B.offer={type, value: ref||code, off, ok:true}; m.className="pinmsg ok";
    B.offer.msg = (r && r.valid===true ? "✓ " : "✓ Applied. We'll confirm it with your booking. ") + "₹"+off+" off" + (type==="ref" ? " — and your friend gets ₹"+REFERRAL.referrerCredit+" credit." : " your first wash."); }
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
if(bform){
  const on=!!SITE.upiId;
  $("payPick").innerHTML=`<label><span><input type="radio" name="pay" value="after" id="pay-after" checked><b>Pay after the wash</b><small>UPI or cash, once you've checked the shine. No advance needed.</small></span><strong class="tagp">Standard</strong></label>
    <label${on?"":' class="off"'}><span><input type="radio" name="pay" value="online" id="pay-online" ${on?"":"disabled"}><b>Pay online now</b><small>${on?"Pay by UPI from any app right after you confirm.":"Online payment is coming soon."}</small></span><strong class="tagp alt">${on?"UPI":"Soon"}</strong></label>`;
  $("slotChips").innerHTML=SLOTS.map((s,i)=>`<label><input type="radio" name="slot" value="${s}" id="slot-${i}" ${i===0?"checked":""}><span>${s}</span></label>`).join("");
  const iso=d=>new Date(d.getTime()-d.getTimezoneOffset()*6e4).toISOString().slice(0,10);
  const tm=new Date(); tm.setDate(tm.getDate()+1); $("b-date").min=iso(new Date()); $("b-date").value=iso(tm);
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
      discount:discount(), promo: discount()>0 ? (B.offer.type==="ref" ? "Referral" : B.offer.value) : "", ref: discount()>0 && B.offer.type==="ref" ? B.offer.value : ""};
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
    if(res==="ok"){ st.className="status ok"; st.textContent="Saved to our booking list."; st.hidden=false; }
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
