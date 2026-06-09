const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function test() {
  const { data: txs, error: txError } = await supabase
    .from('transactions')
    .select('*')
    .eq('normalizedMerchant', 'dad');
  
  if (txError) {
    console.error('Tx error:', txError.message);
  } else {
    console.log('Transactions for "dad":', txs);
  }

  const { data: maps, error: mapError } = await supabase
    .from('merchant_map')
    .select('*');
  
  if (mapError) {
    console.error('Merchant map error:', mapError.message);
  } else {
    console.log('Merchant map entries:', maps);
  }
}

test();
