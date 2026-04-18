const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.production' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const defaultCategories = [
  { id: 'cat-food', name: 'Food & Dining', icon: '🍔', color: '#FF6B6B' },
  { id: 'cat-groceries', name: 'Groceries', icon: '🛒', color: '#4ECDC4' },
  { id: 'cat-transport', name: 'Transport', icon: '🚗', color: '#45B7D1' },
  { id: 'cat-shopping', name: 'Shopping', icon: '🛍️', color: '#96CEB4' },
  { id: 'cat-health', name: 'Health & Medical', icon: '💊', color: '#88D8A3' },
  { id: 'cat-entertainment', name: 'Entertainment', icon: '🎬', color: '#DDA0DD' },
  { id: 'cat-bills', name: 'Bills & Utilities', icon: '📱', color: '#FAD02E' },
  { id: 'cat-transfer', name: 'Transfers', icon: '💸', color: '#E0E0E0' },
  { id: 'cat-uncategorized', name: 'Uncategorized', icon: '❓', color: '#A0A0A0' }
];

async function seed() {
  console.log('Seeding categories...');
  for (const cat of defaultCategories) {
    const { error } = await supabase.from('categories').upsert(cat, { onConflict: 'name' });
    if (error) console.error('Error inserting', cat.name, error.message);
    else console.log('Upserted', cat.name);
  }
  
  // also verify merchant_map
  const { error: mmError } = await supabase.from('merchant_map').upsert({ normalized: 'test_merchant', category: 'Testing' });
  if (mmError) console.error('Merchant Map schema check failed:', mmError.message);
  else {
    console.log('Merchant Map OK. Deleting test merchant map...');
    await supabase.from('merchant_map').delete().eq('normalized', 'test_merchant');
  }

  // verify transactions
  const { error: txError } = await supabase.from('transactions').select('id, "normalizedMerchant"').limit(1);
  if (txError) console.error('Tx schema check failed:', txError.message);
  else console.log('Transactions OK.');
}

seed();
