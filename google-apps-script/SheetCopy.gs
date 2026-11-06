/**
 * Vroombrite — nightly copy of the database into this Google Sheet.
 *
 * Setup (once):
 *   1. In the Google Sheet: Extensions → Apps Script. Replace everything with this file. Save.
 *   2. Reload the Sheet. Use the menu  Vroombrite → Set copy key  and paste the key
 *      from the staff app (Team → Google Sheet copy key).
 *   3. Vroombrite → Turn on nightly copy. Approve the permissions Google asks for.
 *   4. Vroombrite → Copy now, to check it works.
 *
 * The Sheet is a read-only copy: it is fully rewritten every night (about 2 am).
 * Make changes in the staff app, not here.
 */
const SUPABASE_URL = "https://rcekecnigbtgicvntfbz.supabase.co";
const SUPABASE_KEY = "sb_publishable_1eXeVJPxzCkJY2Hou8kwIg_B_9kvme2"; // public key, safe to share

const TABS = {
  bookings: { name: "Bookings", cols: [
    ["id","Booking ID"],["created_at","Booked on"],["wash_date","Wash date"],["slot","Slot"],["status","Status"],["payment","Payment"],
    ["name","Name"],["phone","Phone"],["vehicle_type","Type"],["vehicle","Vehicle"],["plate","Plate"],["package","Package"],["extras","Add-ons"],
    ["address","Address"],["area","Area"],["pin","PIN"],["notes","Notes"],["subtotal","Subtotal"],["discount","Discount"],["total","Total"],
    ["promo","Offer"],["promo_note","Offer note"],["referred_by","Referred by"],["pay_mode","Pay mode"],
    ["confirmed_at","Confirmed"],["done_at","Washed"],["paid_at","Paid on"],["cancelled_at","Cancelled"]]},
  leads: { name: "Society leads", cols: [
    ["created_at","Received"],["society","Society"],["area","Area"],["pin","PIN"],["contact_name","Contact"],["phone","Phone"],["role","Role"],
    ["cars","Cars"],["bikes","Bikes"],["days","Preferred days"],["notes","Notes"],["status","Status"]]},
  enquiries: { name: "Enquiries", cols: [["created_at","Received"],["name","Name"],["phone","Phone"],["message","Message"],["status","Status"]]},
  reviews: { name: "Reviews", cols: [["created_at","Received"],["booking_id","Booking ID"],["name","Name"],["rating","Rating"],["text","Review"],["area","Area"],["approved","On website"]]},
  credits: { name: "Referral credits", cols: [["created_at","Created"],["referrer_phone","Referrer"],["friend_phone","Friend"],["friend_booking_id","Friend's booking"],["amount","Amount"],["status","Status"],["used_on_booking","Used on"]]}
};

function onOpen() {
  SpreadsheetApp.getUi().createMenu("Vroombrite")
    .addItem("Copy now", "copyNow")
    .addItem("Set copy key", "setKey")
    .addSeparator()
    .addItem("Turn on nightly copy", "turnOn")
    .addItem("Turn off nightly copy", "turnOff")
    .addToUi();
}

function setKey() {
  const ui = SpreadsheetApp.getUi();
  const r = ui.prompt("Copy key", "Paste the key from the staff app (Team → Google Sheet copy key).", ui.ButtonSet.OK_CANCEL);
  if (r.getSelectedButton() !== ui.Button.OK) return;
  PropertiesService.getScriptProperties().setProperty("COPY_KEY", r.getResponseText().trim());
  ui.alert("Key saved. Now choose Vroombrite → Copy now to test it.");
}

function turnOn() {
  turnOff_();
  ScriptApp.newTrigger("nightlyCopy").timeBased().atHour(2).everyDays(1).inTimezone("Asia/Kolkata").create();
  SpreadsheetApp.getUi().alert("Nightly copy is on. It runs every night at about 2 am.");
}
function turnOff() { turnOff_(); SpreadsheetApp.getUi().alert("Nightly copy is off."); }
function turnOff_() { ScriptApp.getProjectTriggers().filter(t => t.getHandlerFunction() === "nightlyCopy").forEach(t => ScriptApp.deleteTrigger(t)); }

function copyNow() {
  const n = nightlyCopy();
  SpreadsheetApp.getUi().alert("Copied " + n + " bookings.");
}

function nightlyCopy() {
  const key = PropertiesService.getScriptProperties().getProperty("COPY_KEY");
  if (!key) throw new Error("No copy key. Use Vroombrite → Set copy key first.");
  const res = UrlFetchApp.fetch(SUPABASE_URL + "/rest/v1/rpc/sheet_copy", {
    method: "post", contentType: "application/json", muteHttpExceptions: true,
    headers: { apikey: SUPABASE_KEY, Authorization: "Bearer " + SUPABASE_KEY },
    payload: JSON.stringify({ p_key: key })
  });
  if (res.getResponseCode() !== 200) throw new Error("Copy failed (" + res.getResponseCode() + "): " + res.getContentText().slice(0, 200));
  const data = JSON.parse(res.getContentText());
  const ss = SpreadsheetApp.getActive();
  Object.keys(TABS).forEach(k => writeTab_(ss, TABS[k], data[k] || []));
  ss.getSheetByName(TABS.bookings.name).getRange(1, TABS.bookings.cols.length + 2).setValue("Last copied: " + new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }));
  return (data.bookings || []).length;
}

function writeTab_(ss, tab, rows) {
  const sh = ss.getSheetByName(tab.name) || ss.insertSheet(tab.name);
  const values = [tab.cols.map(c => c[1])].concat(rows.map(r => tab.cols.map(c => cell_(r[c[0]]))));
  sh.clearContents();
  sh.getRange(1, 1, values.length, tab.cols.length).setValues(values);
  sh.getRange(1, 1, 1, tab.cols.length).setFontWeight("bold");
  sh.setFrozenRows(1);
}

function cell_(v) {
  if (v === null || v === undefined) return "";
  if (typeof v === "boolean") return v ? "Yes" : "No";
  if (typeof v === "string" && /^\d{4}-\d{2}-\d{2}T/.test(v)) return new Date(v);
  if (typeof v === "string" && /^[=+\-@]/.test(v)) return "'" + v;  // never run customer text as a formula
  return v;
}
