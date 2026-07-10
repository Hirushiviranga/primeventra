require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log("Checking if RPC exec_sql exists...");
  const { data, error } = await supabase.rpc('exec_sql', { sql: 'SELECT 1;' });
  if (error) {
    console.error("exec_sql RPC failed:", error);
  } else {
    console.log("exec_sql RPC exists! Data:", data);
  }
}

run();
