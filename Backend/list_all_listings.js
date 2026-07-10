const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  const { data, error } = await supabase.from('listings').select('id, title, description');
  if (error) {
    console.error(error);
  } else {
    console.log("All listings in database:", data.map(l => ({ id: l.id, title: l.title, descTruncated: l.description ? l.description.substring(0, 100) : '' })));
  }
}

run();
