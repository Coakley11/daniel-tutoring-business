/**
 * Site configuration — edit these values before publishing.
 * All booking, payment, and contact links read from here.
 */
window.SITE_CONFIG = {
  // Calendly event used by Stripe's post-payment redirect. Customers should
  // enter the paid booking flow through stripeUrl, not this URL directly.
  calendlyUrl: "https://calendly.com/coakley1112/60min",

  // LIVE Stripe Payment Link for one $140, 60-minute tutoring session.
  stripeUrl: "https://buy.stripe.com/4gM14n1Iv4ms1bfePc8og00",

  // Professional contact email (shown in Contact + footer)
  contactEmail: "Daniel.cohen11@yahoo.com",

  // Default video platform note shown on the site
  // Options typically: "Google Meet", "Zoom", or "Google Meet or Zoom"
  videoPlatform: "Google Meet or Zoom",

  // Public Supabase project settings for reviews. These values are safe to use
  // in browser code when the row-level security rules in supabase/reviews.sql
  // have been applied. Never put a service-role key here.
  supabaseUrl: "https://ugbjbgboqdxunrmofzfv.supabase.co",
  supabaseAnonKey: "sb_publishable_tzLBU3Ok8HHsO0AChlk1BA_wLba_01s"
};
