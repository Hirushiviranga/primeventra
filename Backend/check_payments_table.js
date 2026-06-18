const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log("Checking if payments table exists...");
  const { data, error } = await supabase.from('payments').select('*').limit(1);
  if (error) {
    console.log("payments table check returned error:", error.message);
  } else {
    console.log("payments table exists! Sample data:", data);
  }
}

run();
