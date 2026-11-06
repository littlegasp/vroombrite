/* =========================================================
   Vroombrite — business settings (used by the website and the staff app)
   ========================================================= */
const SITE = {
  name: "Vroombrite",
  phone: "917718984191",            // WhatsApp / call number, country code first, digits only
  phoneDisplay: "+91 77189 84191",
  upiId: "7718984191@yescred",      // UPI ID for "Pay online now"; empty = online option shows "coming soon"
  upiName: "Vroombrite",            // name shown in the customer's UPI app

  // Database (Supabase, Mumbai). Both values are public by design; never put the secret / service_role key here.
  supabaseUrl: "https://rcekecnigbtgicvntfbz.supabase.co",
  supabaseKey: "sb_publishable_1eXeVJPxzCkJY2Hou8kwIg_B_9kvme2",   // publishable key (public by design)

  // Old Google Sheet script. Used only while supabaseUrl is empty.
  sheetUrl: ""   // old Apps Script booking API, retired Nov 2026 (the Sheet is now a nightly copy of Supabase)
};
