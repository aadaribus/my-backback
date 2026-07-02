import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

const tables = ['materialuser','user_profiles','profiledate','bookdigital','bookhistory','gruppro','tareapro'];

for (const table of tables) {
  const { data, error } = await supabase.from(table).select('*').limit(1);
  console.log(table + ': ' + (error ? 'ERROR: ' + error.message : 'OK'));
}
