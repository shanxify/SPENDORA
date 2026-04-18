require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function seed() {
  console.log('Creating tables and seeding categories...\n');

  // Create transactions table
  const { error: e1 } = await supabase.rpc('exec_sql', { sql: `
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      date TEXT,
      time TEXT,
      merchant TEXT,
      raw_merchant TEXT,
      normalized_merchant TEXT,
      amount DECIMAL(10,2),
      type TEXT,
      category TEXT DEFAULT 'Uncategorized',
      upi_ref TEXT,
      transaction_id TEXT,
      status TEXT DEFAULT 'Success',
      uploaded_at TIMESTAMPTZ DEFAULT NOW()
    );
  `}).catch(() => null);

  // Create categories table
  const { error: e2 } = await supabase.rpc('exec_sql', { sql: `
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE,
      icon TEXT,
      color TEXT
    );
  `}).catch(() => null);

  // Create merchant_map table
  const { error: e3 } = await supabase.rpc('exec_sql', { sql: `
    CREATE TABLE IF NOT EXISTS merchant_map (
      normalized_merchant TEXT PRIMARY KEY,
      category_name TEXT
    );
  `}).catch(() => null);

  // Insert default categories
  const defaultCategories = [
    { id: 'cat-food', name: 'Food & Dining', icon: '🍔', color: '#FF6B6B' },
    { id: 'cat-groceries', name: 'Groceries', icon: '🛒', color: '#4ECDC4' },
    { id: 'cat-transport', name: 'Transport', icon: '🚗', color: '#45B7D1' },
    { id: 'cat-shopping', name: 'Shopping', icon: '🛍️', color: '#96CEB4' },
    { id: 'cat-health', name: 'Health & Medical', icon: '💊', color: '#88D8A3' },
    { id: 'cat-entertainment', name: 'Entertainment', icon: '🎬', color: '#DDA0DD' },
    { id: 'cat-bills', name: 'Bills & Utilities', icon: '💡', color: '#F0E68C' },
    { id: 'cat-income', name: 'Income', icon: '💰', color: '#98FB98' },
    { id: 'cat-refund', name: 'Refund', icon: '🔄', color: '#87CEEB' },
    { id: 'cat-others', name: 'Others', icon: '📦', color: '#D3D3D3' },
    { id: 'cat-uncategorized', name: 'Uncategorized', icon: '❓', color: '#808080' },
  ];

  const { data, error } = await supabase
    .from('categories')
    .upsert(defaultCategories, { onConflict: 'id' })
    .select();

  if (error) {
    console.error('❌ Failed to insert categories:', error.message);
  } else {
    console.log(`✅ Successfully seeded ${data.length} categories:`);
    data.forEach(c => console.log(`   ${c.icon}  ${c.name}`));
  }

  // Verify all tables exist
  console.log('\nVerifying tables...');
  const { data: txns } = await supabase.from('transactions').select('id').limit(1);
  const { data: cats } = await supabase.from('categories').select('id').limit(1);
  const { data: maps } = await supabase.from('merchant_map').select('normalized_merchant').limit(1);
  
  console.log(`  transactions table: ${txns !== null ? '✅ exists' : '❌ missing'}`);
  console.log(`  categories table:   ${cats !== null ? '✅ exists' : '❌ missing'}`);
  console.log(`  merchant_map table: ${maps !== null ? '✅ exists' : '❌ missing'}`);

  console.log('\nDone! Your Supabase is ready.');
}

seed().catch(console.error);
