const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log("Checking Supabase Connection...");
  console.log("Supabase URL:", supabaseUrl);
  
  console.log("\n1. Checking listings table...");
  const { data: listings, error: listingError } = await supabase.from('listings').select('id, title').limit(2);
  if (listingError) {
    console.error("❌ Listings table check failed:", listingError.message);
  } else {
    console.log("✅ Listings table found! Sample listings:", listings);
  }

  console.log("\n2. Checking payments table...");
  const { data: payments, error: paymentError } = await supabase.from('payments').select('*').limit(2);
  if (paymentError) {
    console.error("❌ Payments table check failed:", paymentError.message);
    console.log("\n💡 Make sure you executed the SQL script in your Supabase SQL Editor to create the payments table!");
  } else {
    console.log("✅ Payments table found! Sample payments:", payments);
  }
}

run();
