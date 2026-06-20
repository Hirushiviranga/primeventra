require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log("Fetching one row from portal_users...");
  const { data, error } = await supabase.from('portal_users').select('*').limit(1);
  if (error) {
    console.error("Error fetching portal_users:", error);
  } else {
    console.log("Success! Columns in portal_users:", data.length > 0 ? Object.keys(data[0]) : "Empty table");
    console.log("Sample data:", data);
  }
}

run();
