const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const REAL_LISTING_IDS = [78, 79, 80, 86, 87, 88, 95];

async function cleanup() {
  console.log("Starting mock/test data cleanup...");

  // 1. Clean up local files
  try {
    fs.writeFileSync(path.join(__dirname, 'payments.json'), JSON.stringify([], null, 2));
    console.log("✅ Cleared local payments.json");
  } catch (err) {
    console.error("❌ Failed to clear payments.json:", err);
  }

  try {
    fs.writeFileSync(path.join(__dirname, 'enquiries.json'), JSON.stringify([], null, 2));
    console.log("✅ Cleared local enquiries.json");
  } catch (err) {
    console.error("❌ Failed to clear enquiries.json:", err);
  }

  try {
    fs.writeFileSync(path.join(__dirname, 'drafts.json'), JSON.stringify([], null, 2));
    console.log("✅ Cleared local drafts.json");
  } catch (err) {
    console.error("❌ Failed to clear drafts.json:", err);
  }

  // 2. Clean up Supabase payments table
  try {
    const { data: payData, error: payErr } = await supabase
      .from('payments')
      .delete()
      .not('listing_id', 'in', `(${REAL_LISTING_IDS.join(',')})`);
    
    if (payErr) throw payErr;
    console.log("✅ Deleted mock records from Supabase 'payments' table");
  } catch (err) {
    console.error("❌ Failed to clear Supabase payments:", err);
  }

  // 3. Clean up Supabase listings table
  try {
    const { data: listData, error: listErr } = await supabase
      .from('listings')
      .delete()
      .not('id', 'in', `(${REAL_LISTING_IDS.join(',')})`);
    
    if (listErr) throw listErr;
    console.log("✅ Deleted mock records from Supabase 'listings' table");
  } catch (err) {
    console.error("❌ Failed to clear Supabase listings:", err);
  }

  // 4. Clean up Supabase rejected_properties table
  try {
    const { data: rejData, error: rejErr } = await supabase
      .from('rejected_properties')
      .delete()
      .neq('id', 0); // Delete all rows
    
    if (rejErr) throw rejErr;
    console.log("✅ Deleted all records from Supabase 'rejected_properties' table");
  } catch (err) {
    console.error("❌ Failed to clear Supabase rejected_properties:", err);
  }

  console.log("Mock data cleanup complete! 🎉");
}

cleanup();
