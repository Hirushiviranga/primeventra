const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  const { data: listings, error } = await supabase
    .from('listings')
    .select('id, title, created_at, description')
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error("Error fetching listings:", error);
    return;
  }
  console.log("Recent Listings:", listings);
}

run();
