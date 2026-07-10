require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log("Inserting temp row to inspect drafts columns...");
  const { data, error } = await supabase
    .from('drafts')
    .insert([{ 
      title: 'Temp Column Inspection',
      type: 'House',
      district: 'Colombo',
      city: 'Colombo'
    }])
    .select();
    
  if (error) {
    console.error("Error inserting into drafts:", error);
  } else {
    console.log("Columns in drafts:", Object.keys(data[0]));
    console.log("Sample row:", data[0]);
    
    // Delete the temp row
    const id = data[0].property_id || data[0].id;
    console.log("Deleting temp row with ID:", id);
    await supabase.from('drafts').delete().eq('property_id', id);
  }
}

run();
