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
  supabaseUrl: "",                  // https://xxxx.supabase.co
  supabaseKey: "",                  // publishable (sb_publishable_…) or anon key

  // Old Google Sheet script. Used only while supabaseUrl is empty.
  sheetUrl: "https://script.google.com/macros/s/AKfycbzKZ57SuWpdzK0HCt4Vx8BeIf40FDzAGpnF1iSr3nT3os5dAsW74akLCk3kB6eRl278/exec"
};
