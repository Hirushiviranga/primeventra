require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log("Querying non-existent listing with .single()...");
  try {
    const { data, error } = await supabase
      .from('listings')
      .select('description')
      .eq('id', 9999)
      .single();
    
    console.log("Error returned in object:", error);
    console.log("Data returned in object:", data);
  } catch (err) {
    console.error("Hard exception caught:", err.message);
  }
}

run();
