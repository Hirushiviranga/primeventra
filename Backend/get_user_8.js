const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function check() {
  const { data: user, error } = await supabase.from('portal_users').select('*').eq('id', 8).maybeSingle();
  if (error) {
    console.error("Error fetching user 8:", error);
  } else {
    console.log("User 8 details:", user);
  }
}
check();
