require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log("Fetching all drafts from Supabase...");
  const { data, error } = await supabase.from('drafts').select('*');
  if (error) {
    console.error("Error:", error);
  } else {
    console.log("Drafts count:", data.length);
    data.forEach((d, idx) => {
      console.log(`\n--- Draft #${idx + 1} (ID: ${d.property_id || d.id}) ---`);
      console.log("Title:", d.title);
      console.log("Submitted By (DB):", d.submitted_by);
      console.log("Email (DB):", d.email);
      console.log("Phone (DB):", d.phone);
      console.log("WhatsApp (DB):", d.whatsapp);
      console.log("Description:", d.description);
    });
  }
}

run();
