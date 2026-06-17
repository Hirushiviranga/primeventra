require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing environment variables!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log("Fetching listing to test...");
  const { data, error } = await supabase.from('listings').select('*').limit(1);
  if (error) {
    console.error("Fetch error:", error);
    return;
  }
  if (!data || data.length === 0) {
    console.log("No listings found in the database.");
    return;
  }
  const item = data[0];
  console.log("Found listing ID:", item.id, "Title:", item.title);
  
  console.log("Testing update operation...");
  const { data: updated, error: updateError } = await supabase
    .from('listings')
    .update({ title: item.title + " (Test)" })
    .eq('id', item.id)
    .select();
    
  if (updateError) {
    console.error("Update error:", updateError);
  } else {
    console.log("Update success! Row returned:", updated);
    
    // Restore original title
    console.log("Restoring original title...");
    await supabase
      .from('listings')
      .update({ title: item.title })
      .eq('id', item.id);
  }
}

run();
