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
 */

const BOOKING_COLS = ["Received","Booking ID","Status","Vehicle","Number plate","Package","Extras","Date","Slot","Address","Area","PIN","Name","Mobile","Notes","Est. total (₹)"];
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
                    clean_(d.name), "'" + clean_(d.phone), clean_(d.notes), Number(d.total) || ""]);
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
  }
  return sh;
}

/* Stops spreadsheet formulas being injected through the form. */
function clean_(v) {
  v = String(v == null ? "" : v).slice(0, 1000);
  return /^[=+\-@]/.test(v) ? "'" + v : v;
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
