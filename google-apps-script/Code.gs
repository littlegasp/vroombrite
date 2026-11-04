/**
 * Vroombrite — booking & enquiry receiver
 * Saves every website booking and contact message into this Google Sheet.
 *
 * Setup (once):
 * 1. Create a Google Sheet (e.g. "Vroombrite Bookings").
 * 2. Extensions → Apps Script → paste this file → Save.
 * 3. Deploy → New deployment → Type: Web app
 *      Execute as: Me
 *      Who has access: Anyone
 * 4. Copy the Web app URL and paste it into SITE.sheetUrl at the top of app.js.
 *
 * Updating this file later: paste the new code, Save, then Deploy → Manage deployments →
 * edit (pencil) → Version: New version → Deploy. That keeps the same web-app URL.
 *
 * Daily use: the "Vroombrite" menu in the Sheet. Select one or more booking rows, then
 * Mark paid · UPI / Mark paid · cash / Mark job done / Mark cancelled.
 * Run "Set up dropdowns & colours" once (and again any time the formatting gets lost).
 */

const BOOKING_COLS = ["Received","Booking ID","Status","Vehicle","Number plate","Package","Extras","Date","Slot","Address","Area","PIN","Name","Mobile","Notes","Est. total (₹)","Payment","Paid on"];
const ENQUIRY_COLS = ["Received","Name","Mobile","Message","Status"];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const d = JSON.parse(e.postData.contents || "{}");
    const now = new Date();
    if (d.type === "booking") {
      const sh = sheet_("Bookings", BOOKING_COLS);
      sh.appendRow([now, clean_(d.id), "New", clean_(d.vehicle), clean_(d.plate), clean_(d.package), clean_(d.addons),
                    clean_(d.date), clean_(d.slot), clean_(d.address), clean_(d.area), "'" + clean_(d.pin),
                    clean_(d.name), "'" + clean_(d.phone), clean_(d.notes), Number(d.total) || "", clean_(d.payment)]);
    } else if (d.type === "enquiry") {
      const sh = sheet_("Enquiries", ENQUIRY_COLS);
      sh.appendRow([now, clean_(d.name), "'" + clean_(d.phone), clean_(d.message), "New"]);
    } else {
      return json_({ ok: false, error: "unknown type" });
    }
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

/* Lets you open the URL in a browser to check the script is live. */
function doGet() { return json_({ ok: true, service: "Vroombrite bookings" }); }

function sheet_(name, cols) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.appendRow(cols);
    sh.getRange(1, 1, 1, cols.length).setFontWeight("bold").setBackground("#15191C").setFontColor("#C9F36A");
    sh.setFrozenRows(1);
    if (name === "Bookings") format_(sh);
  }
  return sh;
}

/* ---------- Sheet menu: payment & job status ---------- */
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
    .addItem("Set up dropdowns & colours", "setupSheet")
    .addToUi();
}

function markPaidUpi()   { setForSelection_({ Payment: "Paid · UPI",  "Paid on": new Date() }); }
function markPaidCash()  { setForSelection_({ Payment: "Paid · cash", "Paid on": new Date() }); }
function markDone()      { setForSelection_({ Status: "Done" }); }
function markCancelled() { setForSelection_({ Status: "Cancelled" }); }

function setupSheet() {
  const sh = sheet_("Bookings", BOOKING_COLS);
  format_(sh);
  SpreadsheetApp.getActive().toast("Dropdowns and colours are set on the Bookings tab.", "Vroombrite");
}

function setForSelection_(values) {
  const sh = SpreadsheetApp.getActiveSheet();
  if (sh.getName() !== "Bookings") { SpreadsheetApp.getUi().alert("Open the Bookings tab and select the booking rows first."); return; }
  ensureCols_(sh);
  const rows = new Set();
  sh.getActiveRangeList().getRanges().forEach(r => { for (let i = r.getRow(); i < r.getRow() + r.getNumRows(); i++) if (i > 1) rows.add(i); });
  if (!rows.size) { SpreadsheetApp.getUi().alert("Select at least one booking row (not the header)."); return; }
  rows.forEach(row => Object.keys(values).forEach(k => sh.getRange(row, col_(sh, k)).setValue(values[k])));
  SpreadsheetApp.getActive().toast(rows.size + " booking(s) updated.", "Vroombrite");
}

function ensureCols_(sh) {
  const head = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  BOOKING_COLS.forEach(c => { if (head.indexOf(c) < 0) { const at = sh.getLastColumn() + 1; sh.getRange(1, at).setValue(c).setFontWeight("bold").setBackground("#15191C").setFontColor("#C9F36A"); head.push(c); } });
}
function col_(sh, name) { return sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0].indexOf(name) + 1; }

function format_(sh) {
  ensureCols_(sh);
  const n = sh.getMaxRows() - 1;
  const st = sh.getRange(2, col_(sh, "Status"), n), pay = sh.getRange(2, col_(sh, "Payment"), n), paidOn = sh.getRange(2, col_(sh, "Paid on"), n);
  st.setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(STATUS_LIST, true).setAllowInvalid(true).build());
  pay.setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(PAYMENT_LIST, true).setAllowInvalid(true).build());
  paidOn.setNumberFormat("dd-mmm-yyyy hh:mm");
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

/* Stops spreadsheet formulas being injected through the form. */
function clean_(v) {
  v = String(v == null ? "" : v).slice(0, 1000);
  return /^[=+\-@]/.test(v) ? "'" + v : v;
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
