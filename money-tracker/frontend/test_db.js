const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'frontend/.env.production' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function test() {
  const { data, error } = await supabase.from('transactions').select('*').limit(1);
  console.log('Transactions columns:', error ? error.message : Object.keys(data[0] || {}));
}

test();
