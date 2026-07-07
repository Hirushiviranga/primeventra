require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log("Fetching one row from drafts to see column names...");
  const { data, error } = await supabase.from('drafts').select('*').limit(1);
  if (error) {
    console.error("Error fetching drafts:", error);
  } else {
    console.log("Success! Columns in drafts:", data.length > 0 ? Object.keys(data[0]) : "Empty table (but exists!)");
    console.log("Sample data:", data);
  }
}

run();
