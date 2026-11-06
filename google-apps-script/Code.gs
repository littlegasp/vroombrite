/**
 * Vroombrite — booking API for the website and the staff app
 * Saves bookings, enquiries, society leads and reviews into this Google Sheet,
 * checks first-wash and referral offers, and serves the staff app (ops.html).
 *
 * First-time setup:
 * 1. Extensions → Apps Script → paste this file → Save.
 * 2. Deploy → New deployment → Type: Web app · Execute as: Me · Who has access: Anyone.
 * 3. Paste the Web app URL into SITE.sheetUrl at the top of src/app.js.
 * 4. In the Sheet: Vroombrite menu → "Set staff PINs" (owner PIN + washer PIN for the staff app).
 * 5. Vroombrite menu → "Set up dropdowns & colours".
 *
 * Updating this file later: paste the new code, Save, then Deploy → Manage deployments →
 * edit (pencil) → Version: New version → Deploy. That keeps the same web-app URL.
 */

const TZ = "Asia/Kolkata";
const BOOKING_COLS = ["Received","Booking ID","Status","Vehicle","Number plate","Package","Extras","Date","Slot","Address","Area","PIN","Name","Mobile","Notes","Est. total (₹)","Payment","Paid on","Promo","Discount (₹)","Referred by","Reminder sent"];
const ENQUIRY_COLS = ["Received","Name","Mobile","Message","Status"];
const SOCIETY_COLS = ["Received","Society","Area","PIN","Contact name","Mobile","Role","Cars","Bikes","Preferred days","Notes","Status"];
const REVIEW_COLS  = ["Received","Booking ID","Name","Rating","Review","Area","Approved"];
const CREDIT_COLS  = ["Created","Referrer mobile","Friend mobile","Friend booking ID","Credit (₹)","Status","Used on booking"];

/* Offers — keep in step with PROMOS / REFERRAL in src/app.js */
/* min = minimum order value (package + add-ons, before discount) */
const PROMOS = { WELCOME50: { off: 50, firstOnly: true, min: 299 } };
const REFERRAL = { friendOff: 50, referrerCredit: 50, min: 299 };
const SLOT_ORDER = ["6–8 AM","8–10 AM","10 AM–1 PM","2–5 PM","5–8 PM"];

/* =============================== WRITE =============================== */
function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const d = JSON.parse((e && e.postData && e.postData.contents) || "{}");
    const now = new Date();
    if (d.type === "booking") return json_(saveBooking_(d, now));
    if (d.type === "enquiry") { append_("Enquiries", ENQUIRY_COLS, { Received: now, Name: d.name, Mobile: tel_(d.phone), Message: d.message, Status: "New" }); return json_({ ok: true }); }
    if (d.type === "society") {
      append_("Society leads", SOCIETY_COLS, { Received: now, Society: d.society, Area: d.area, PIN: "'" + clean_(d.pin), "Contact name": d.name, Mobile: tel_(d.phone),
        Role: d.role, Cars: Number(d.cars) || 0, Bikes: Number(d.bikes) || 0, "Preferred days": d.days, Notes: d.notes, Status: "New" });
      return json_({ ok: true });
    }
    if (d.type === "review") {
      const rating = Math.max(1, Math.min(5, Number(d.rating) || 0));
      const b = findBooking_(d.id);
      append_("Reviews", REVIEW_COLS, { Received: now, "Booking ID": d.id, Name: d.name || (b ? b.Name : ""), Rating: rating, Review: d.text, Area: b ? b.Area : (d.area || ""), Approved: false });
      checkboxes_();
      return json_({ ok: true });
    }
    if (d.type === "op") return json_(op_(d, now));
    return json_({ ok: false, error: "unknown type" });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function saveBooking_(d, now) {
  const phone = digits_(d.phone), ref = digits_(d.ref);
  const prior = bookingsFor_(phone).length;
  let promo = clean_(d.promo || "");
  let discount = Number(d.discount) || 0;
  if (discount > 0 && prior > 0) promo = (promo || "Discount") + " — not first wash, check";
  const minNeed = promo.indexOf("Referral") === 0 ? REFERRAL.min : ((PROMOS[String(d.promo || "").toUpperCase()] || {}).min || 0);
  if (discount > 0 && (Number(d.total) || 0) + discount < minNeed) promo = (promo || "Discount") + " — below ₹" + minNeed + " minimum, check";
  append_("Bookings", BOOKING_COLS, {
    Received: now, "Booking ID": d.id, Status: "New", Vehicle: d.vehicle, "Number plate": d.plate, Package: d.package, Extras: d.addons,
    Date: d.date, Slot: d.slot, Address: d.address, Area: d.area, PIN: "'" + clean_(d.pin), Name: d.name, Mobile: tel_(phone),
    Notes: d.notes, "Est. total (₹)": Number(d.total) || "", Payment: d.payment, Promo: promo, "Discount (₹)": discount || "", "Referred by": ref ? tel_(ref) : ""
  });
  // referral credit for the friend who referred a first-time customer
  if (ref && ref !== phone && prior === 0 && bookingsFor_(ref).length > 0) {
    append_("Referral credits", CREDIT_COLS, { Created: now, "Referrer mobile": tel_(ref), "Friend mobile": tel_(phone), "Friend booking ID": d.id,
      "Credit (₹)": REFERRAL.referrerCredit, Status: "Pending", "Used on booking": "" });
  }
  return { ok: true, firstWash: prior === 0 };
}

/* staff actions from ops.html */
function op_(d, now) {
  const role = role_(d.key);
  if (!role) return { ok: false, error: "auth" };
  const sh = sheet_("Bookings", BOOKING_COLS);
  const row = rowOf_(sh, d.id);
  if (!row && d.action !== "use_credit") return { ok: false, error: "booking not found" };
  const set = (k, v) => sh.getRange(row, col_(sh, k)).setValue(v);
  switch (d.action) {
    case "confirm":   set("Status", "Confirmed"); break;
    case "done":      set("Status", "Done"); creditsOnDone_([d.id]); break;
    case "cancel":    set("Status", "Cancelled"); break;
    case "paid_upi":  set("Payment", "Paid · UPI");  set("Paid on", now); break;
    case "paid_cash": set("Payment", "Paid · cash"); set("Paid on", now); break;
    case "reminded":  set("Reminder sent", now); break;
    case "use_credit": useCredits_(digits_(d.phone), d.id); break;
    default: return { ok: false, error: "unknown action" };
  }
  return { ok: true };
}

/* =============================== READ =============================== */
function doGet(e) {
  const p = (e && e.parameter) || {};
  try {
    if (p.action === "check")   return json_(check_(p));
    if (p.action === "reviews") return json_({ ok: true, reviews: publicReviews_() });
    if (["jobs","stats","due","leads","me"].indexOf(p.action) >= 0) {
      const role = role_(p.key);
      if (!role) return json_({ ok: false, error: "auth" });
      if (p.action === "me")   return json_({ ok: true, role: role });
      if (p.action === "jobs") return json_({ ok: true, role: role, jobs: jobs_(p.date) });
      if (role !== "owner")    return json_({ ok: false, error: "owner only" });
      if (p.action === "stats") return json_({ ok: true, stats: stats_() });
      if (p.action === "due")   return json_({ ok: true, due: due_(Number(p.days) || 12) });
      if (p.action === "leads") return json_({ ok: true, leads: rows_("Society leads", SOCIETY_COLS).slice(-30).reverse().map(r => ({ received: iso_(r.Received), society: r.Society, area: r.Area, name: r["Contact name"], phone: String(r.Mobile), cars: r.Cars, bikes: r.Bikes, days: r["Preferred days"], notes: r.Notes, status: r.Status })) });
    }
    return json_({ ok: true, service: "Vroombrite bookings" });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

/* promo / referral check before booking */
function check_(p) {
  const phone = digits_(p.phone), first = phone.length === 10 ? bookingsFor_(phone).length === 0 : null;
  if (p.code) {
    const c = PROMOS[String(p.code).trim().toUpperCase()];
    if (!c) return { ok: true, valid: false, reason: "unknown" };
    if (c.firstOnly && first === false) return { ok: true, valid: false, reason: "not_first" };
    return { ok: true, valid: true, off: c.off, min: c.min || 0 };
  }
  if (p.ref) {
    const ref = digits_(p.ref);
    if (ref === phone) return { ok: true, valid: false, reason: "self" };
    if (first === false) return { ok: true, valid: false, reason: "not_first" };
    if (bookingsFor_(ref).length === 0) return { ok: true, valid: false, reason: "unknown_ref" };
    return { ok: true, valid: true, off: REFERRAL.friendOff, min: REFERRAL.min };
  }
  return { ok: true, valid: false, reason: "empty" };
}

function publicReviews_() {
  return rows_("Reviews", REVIEW_COLS).filter(r => r.Approved === true || String(r.Approved).toUpperCase() === "TRUE")
    .slice(-12).reverse()
    .map(r => ({ name: String(r.Name || "Customer").split(" ")[0], rating: Number(r.Rating) || 5, text: String(r.Review || ""), area: r.Area || "", date: iso_(r.Received) }));
}

function jobs_(date) {
  const day = date || today_();
  const credits = creditMap_();
  return rows_("Bookings", BOOKING_COLS).filter(r => iso_(r.Date) === day)
    .map(r => ({ id: r["Booking ID"], status: r.Status, vehicle: r.Vehicle, plate: r["Number plate"], pkg: r.Package, extras: r.Extras, date: iso_(r.Date), slot: r.Slot,
      address: r.Address, area: r.Area, pin: String(r.PIN), name: r.Name, phone: digits_(r.Mobile), notes: r.Notes, total: Number(r["Est. total (₹)"]) || 0,
      payment: r.Payment, promo: r.Promo, credit: credits[digits_(r.Mobile)] || 0 }))
    .sort((a, b) => SLOT_ORDER.indexOf(a.slot) - SLOT_ORDER.indexOf(b.slot));
}

function stats_() {
  const all = rows_("Bookings", BOOKING_COLS), live = all.filter(r => r.Status !== "Cancelled");
  const t = today_(), month = t.slice(0, 7), weekAgo = iso_(new Date(Date.now() - 6 * 864e5));
  const paid = r => String(r.Payment || "").indexOf("Paid") === 0;
  const sum = (list) => list.reduce((s, r) => s + (Number(r["Est. total (₹)"]) || 0), 0);
  const paidMonth = live.filter(r => paid(r) && (iso_(r["Paid on"]) || iso_(r.Date)).slice(0, 7) === month);
  const pending = live.filter(r => r.Status === "Done" && !paid(r));
  const phones = {}; live.forEach(r => { const k = digits_(r.Mobile); phones[k] = (phones[k] || 0) + 1; });
  const pkgs = {}; live.forEach(r => { pkgs[r.Package] = (pkgs[r.Package] || 0) + 1; });
  const days = []; for (let i = 6; i >= 0; i--) { const d = iso_(new Date(Date.now() - i * 864e5)); days.push({ date: d, count: live.filter(r => iso_(r.Date) === d).length }); }
  return {
    today: live.filter(r => iso_(r.Date) === t).length,
    upcoming: live.filter(r => iso_(r.Date) > t).length,
    doneWeek: live.filter(r => r.Status === "Done" && iso_(r.Date) >= weekAgo && iso_(r.Date) <= t).length,
    revenueMonth: sum(paidMonth),
    pendingAmount: sum(pending), pendingCount: pending.length,
    customers: Object.keys(phones).length, repeat: Object.keys(phones).filter(k => phones[k] > 1).length,
    packages: Object.keys(pkgs).map(k => ({ name: k, count: pkgs[k] })).sort((a, b) => b.count - a.count).slice(0, 5),
    last7: days,
    newLeads: rows_("Society leads", SOCIETY_COLS).filter(r => r.Status === "New").length,
    pendingReviews: rows_("Reviews", REVIEW_COLS).filter(r => !(r.Approved === true || String(r.Approved).toUpperCase() === "TRUE")).length
  };
}

/* customers whose last finished wash was `days`+ days ago and who have nothing booked */
function due_(days) {
  const all = rows_("Bookings", BOOKING_COLS).filter(r => r.Status !== "Cancelled"), t = today_(), by = {};
  all.forEach(r => { const k = digits_(r.Mobile); (by[k] = by[k] || []).push(r); });
  const out = [];
  Object.keys(by).forEach(k => {
    const list = by[k];
    if (list.some(r => iso_(r.Date) >= t && r.Status !== "Done")) return;           // already booked
    const done = list.filter(r => r.Status === "Done").sort((a, b) => iso_(a.Date) < iso_(b.Date) ? 1 : -1);
    if (!done.length) return;
    const last = done[0], ago = Math.round((new Date(t) - new Date(iso_(last.Date))) / 864e5);
    if (ago < days) return;
    out.push({ id: last["Booking ID"], name: last.Name, phone: k, vehicle: last.Vehicle, pkg: last.Package, area: last.Area, lastDate: iso_(last.Date), daysAgo: ago,
      washes: done.length, reminded: iso_(last["Reminder sent"]) });
  });
  return out.sort((a, b) => b.daysAgo - a.daysAgo);
}

/* =============================== CREDITS =============================== */
function creditMap_() {
  const m = {}; rows_("Referral credits", CREDIT_COLS).forEach(r => { if (r.Status === "Available") { const k = digits_(r["Referrer mobile"]); m[k] = (m[k] || 0) + (Number(r["Credit (₹)"]) || 0); } });
  return m;
}
function creditsOnDone_(ids) {
  const sh = sheet_("Referral credits", CREDIT_COLS), v = sh.getDataRange().getValues(), h = v[0];
  const ci = h.indexOf("Friend booking ID"), si = h.indexOf("Status");
  for (let i = 1; i < v.length; i++) if (ids.indexOf(String(v[i][ci])) >= 0 && v[i][si] === "Pending") sh.getRange(i + 1, si + 1).setValue("Available");
}
function useCredits_(phone, bookingId) {
  const sh = sheet_("Referral credits", CREDIT_COLS), v = sh.getDataRange().getValues(), h = v[0];
  const ri = h.indexOf("Referrer mobile"), si = h.indexOf("Status"), ui = h.indexOf("Used on booking");
  for (let i = 1; i < v.length; i++) if (digits_(v[i][ri]) === phone && v[i][si] === "Available") { sh.getRange(i + 1, si + 1).setValue("Used"); sh.getRange(i + 1, ui + 1).setValue(bookingId || ""); }
}

/* =============================== SHEET MENU =============================== */
const STATUS_LIST  = ["New", "Confirmed", "Done", "Cancelled"];
const PAYMENT_LIST = ["After service", "Online UPI · pending", "Paid · UPI", "Paid · cash", "Refunded"];

function onOpen() {
  SpreadsheetApp.getUi().createMenu("Vroombrite")
    .addItem("Mark paid · UPI", "markPaidUpi")
    .addItem("Mark paid · cash", "markPaidCash")
    .addSeparator()
    .addItem("Mark job done", "markDone")
    .addItem("Mark cancelled", "markCancelled")
    .addSeparator()
    .addItem("Set staff PINs", "setPins")
    .addItem("Set up dropdowns & colours", "setupSheet")
    .addToUi();
}
function markPaidUpi()   { setForSelection_({ Payment: "Paid · UPI",  "Paid on": new Date() }); }
function markPaidCash()  { setForSelection_({ Payment: "Paid · cash", "Paid on": new Date() }); }
function markDone()      { const ids = setForSelection_({ Status: "Done" }); if (ids) creditsOnDone_(ids); }
function markCancelled() { setForSelection_({ Status: "Cancelled" }); }

function setPins() {
  const ui = SpreadsheetApp.getUi(), props = PropertiesService.getScriptProperties();
  const a = ui.prompt("Owner PIN", "Sees everything in the staff app: jobs, dashboard, due reminders, society leads. Use 4–8 digits.", ui.ButtonSet.OK_CANCEL);
  if (a.getSelectedButton() !== ui.Button.OK) return;
  const b = ui.prompt("Washer PIN", "Sees only the jobs list. Must be different from the owner PIN.", ui.ButtonSet.OK_CANCEL);
  if (b.getSelectedButton() !== ui.Button.OK) return;
  const o = a.getResponseText().trim(), w = b.getResponseText().trim();
  if (!/^\d{4,8}$/.test(o) || !/^\d{4,8}$/.test(w) || o === w) { ui.alert("PINs must be 4–8 digits and different from each other. Nothing was changed."); return; }
  props.setProperty("OWNER_PIN", o); props.setProperty("WASHER_PIN", w);
  ui.alert("Saved. Open the staff app (ops.html on your website) and sign in with one of these PINs.");
}

function setupSheet() {
  const sh = sheet_("Bookings", BOOKING_COLS);
  format_(sh);
  ["Society leads", "Reviews", "Referral credits", "Enquiries"].forEach(n => sheet_(n, ({ "Society leads": SOCIETY_COLS, Reviews: REVIEW_COLS, "Referral credits": CREDIT_COLS, Enquiries: ENQUIRY_COLS })[n]));
  checkboxes_();
  SpreadsheetApp.getActive().toast("Tabs, dropdowns and colours are set.", "Vroombrite");
}

function setForSelection_(values) {
  const sh = SpreadsheetApp.getActiveSheet();
  if (sh.getName() !== "Bookings") { SpreadsheetApp.getUi().alert("Open the Bookings tab and select the booking rows first."); return null; }
  ensureCols_(sh, BOOKING_COLS);
  const rows = new Set();
  sh.getActiveRangeList().getRanges().forEach(r => { for (let i = r.getRow(); i < r.getRow() + r.getNumRows(); i++) if (i > 1) rows.add(i); });
  if (!rows.size) { SpreadsheetApp.getUi().alert("Select at least one booking row (not the header)."); return null; }
  const idCol = col_(sh, "Booking ID"), ids = [];
  rows.forEach(row => { Object.keys(values).forEach(k => sh.getRange(row, col_(sh, k)).setValue(values[k])); ids.push(String(sh.getRange(row, idCol).getValue())); });
  SpreadsheetApp.getActive().toast(rows.size + " booking(s) updated.", "Vroombrite");
  return ids;
}

/* =============================== HELPERS =============================== */
function role_(key) {
  const k = String(key || "").trim(); if (!k) return null;
  const props = PropertiesService.getScriptProperties();
  if (k === props.getProperty("OWNER_PIN")) return "owner";
  if (k === props.getProperty("WASHER_PIN")) return "washer";
  return null;
}
function sheet_(name, cols) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.appendRow(cols);
    sh.getRange(1, 1, 1, cols.length).setFontWeight("bold").setBackground("#15191C").setFontColor("#C9F36A");
    sh.setFrozenRows(1);
    if (name === "Bookings") format_(sh);
  } else ensureCols_(sh, cols);
  return sh;
}
function ensureCols_(sh, cols) {
  const last = Math.max(sh.getLastColumn(), 1);
  const head = sh.getRange(1, 1, 1, last).getValues()[0];
  cols.forEach(c => { if (head.indexOf(c) < 0) { const at = head.filter(String).length ? head.length + 1 : 1; sh.getRange(1, at).setValue(c).setFontWeight("bold").setBackground("#15191C").setFontColor("#C9F36A"); head[at - 1] = c; } });
}
function col_(sh, name) { return sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0].indexOf(name) + 1; }
/* append a row, matching values to columns by header name */
function append_(name, cols, obj) {
  const sh = sheet_(name, cols), head = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  sh.appendRow(head.map(h => { if (!(h in obj)) return ""; const v = obj[h]; return (v instanceof Date || typeof v === "number" || typeof v === "boolean") ? v : clean_(v); }));
}
function rows_(name, cols) {
  const sh = sheet_(name, cols), v = sh.getDataRange().getValues(), h = v[0];
  return v.slice(1).filter(r => r.join("") !== "").map(r => { const o = {}; h.forEach((k, i) => o[k] = r[i]); return o; });
}
function rowOf_(sh, id) {
  const ci = col_(sh, "Booking ID"); if (!ci || !id) return 0;
  const v = sh.getRange(1, ci, sh.getLastRow(), 1).getValues();
  for (let i = v.length - 1; i >= 1; i--) if (String(v[i][0]) === String(id)) return i + 1;
  return 0;
}
function findBooking_(id) { return rows_("Bookings", BOOKING_COLS).filter(r => String(r["Booking ID"]) === String(id))[0] || null; }
function bookingsFor_(phone) { if (!phone) return []; return rows_("Bookings", BOOKING_COLS).filter(r => digits_(r.Mobile) === phone && r.Status !== "Cancelled"); }
function checkboxes_() {
  const sh = sheet_("Reviews", REVIEW_COLS), c = col_(sh, "Approved"), n = sh.getLastRow() - 1;
  if (c && n > 0) sh.getRange(2, c, n, 1).insertCheckboxes();
}
function digits_(v) { return String(v == null ? "" : v).replace(/\D/g, "").slice(-10); }
function tel_(v) { const d = digits_(v); return d ? "'" + d : ""; }
function today_() { return Utilities.formatDate(new Date(), TZ, "yyyy-MM-dd"); }
function iso_(v) {
  if (!v) return "";
  if (v instanceof Date) return Utilities.formatDate(v, TZ, "yyyy-MM-dd");
  const s = String(v); return /^\d{4}-\d{2}-\d{2}/.test(s) ? s.slice(0, 10) : s;
}
/* Stops spreadsheet formulas being injected through the forms. */
function clean_(v) {
  v = String(v == null ? "" : v).slice(0, 1000);
  return /^[=+\-@]/.test(v) ? "'" + v : v;
}
function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

function format_(sh) {
  ensureCols_(sh, BOOKING_COLS);
  const n = sh.getMaxRows() - 1;
  const st = sh.getRange(2, col_(sh, "Status"), n), pay = sh.getRange(2, col_(sh, "Payment"), n);
  st.setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(STATUS_LIST, true).setAllowInvalid(true).build());
  pay.setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(PAYMENT_LIST, true).setAllowInvalid(true).build());
  sh.getRange(2, col_(sh, "Paid on"), n).setNumberFormat("dd-mmm-yyyy hh:mm");
  sh.getRange(2, col_(sh, "Reminder sent"), n).setNumberFormat("dd-mmm-yyyy hh:mm");
  const rule = (range, text, bg, fg, how) => { let b = SpreadsheetApp.newConditionalFormatRule(); b = how === "starts" ? b.whenTextStartsWith(text) : b.whenTextEqualTo(text); return b.setBackground(bg).setFontColor(fg).setRanges([range]).build(); };
  const keep = sh.getConditionalFormatRules().filter(r => !r.getRanges().some(x => [st.getColumn(), pay.getColumn()].indexOf(x.getColumn()) >= 0));
  sh.setConditionalFormatRules(keep.concat([
    rule(pay, "Paid", "#DDF5B0", "#2F4A00", "starts"),
    rule(pay, "Online UPI · pending", "#FFE2D4", "#8A2E0B"),
    rule(pay, "After service", "#EEF0EC", "#4A5056"),
    rule(pay, "Refunded", "#F3D6D6", "#7A1F1F"),
    rule(st, "New", "#D8F4EF", "#0E5A4F"),
    rule(st, "Confirmed", "#E3ECFF", "#1E3A8A"),
    rule(st, "Done", "#DDF5B0", "#2F4A00"),
    rule(st, "Cancelled", "#E5E5E5", "#6B6B6B")
  ]));
}
