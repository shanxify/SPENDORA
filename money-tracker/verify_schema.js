require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function checkSchema() {
  console.log('Checking database schema columns...');

  // Inspect transactions table columns by executing a query or using the postgres information schema
  // Since we have service role key, we can query information_schema.columns
  const { data: cols, error } = await supabase.rpc('exec_sql', { sql: `
    SELECT table_name, column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name IN ('transactions', 'categories', 'merchant_map')
    ORDER BY table_name, column_name;
  `}).catch(err => {
    return { error: err };
  });

  if (error || !cols) {
    // If exec_sql RPC is not present, let's try direct queries on tables to see what columns we can fetch or if we get an error
    console.log('Could not use exec_sql RPC, checking via table select...');
    const { data: tData, error: tErr } = await supabase.from('transactions').select('*').limit(1);
    if (tErr) {
      console.error('Error selecting from transactions:', tErr.message);
    } else {
      console.log('Transactions columns in current row:', tData[0] ? Object.keys(tData[0]) : 'Empty table');
    }

    const { data: cData, error: cErr } = await supabase.from('categories').select('*').limit(1);
    if (cErr) {
      console.error('Error selecting from categories:', cErr.message);
    } else {
      console.log('Categories columns in current row:', cData[0] ? Object.keys(cData[0]) : 'Empty table');
    }

    const { data: mData, error: mErr } = await supabase.from('merchant_map').select('*').limit(1);
    if (mErr) {
      console.error('Error selecting from merchant_map:', mErr.message);
    } else {
      console.log('Merchant Map columns in current row:', mData[0] ? Object.keys(mData[0]) : 'Empty table');
    }
  } else {
    console.log('Found columns via information_schema:');
    cols.forEach(c => {
      console.log(`  Table: ${c.table_name.padEnd(15)} | Column: ${c.column_name.padEnd(20)} | Type: ${c.data_type}`);
    });
  }
}

checkSchema();
