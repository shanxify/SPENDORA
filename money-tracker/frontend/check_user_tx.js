require('dotenv').config({ path: '../.env' });
const { createClient } = require('@supabase/supabase-js');

const serviceClient = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function run() {
  try {
    console.log('1. Fetching all users from auth...');
    const { data: { users }, error: usersError } = await serviceClient.auth.admin.listUsers();
    if (usersError) throw usersError;

    const targetUser = users.find(u => u.email === 'sudharshan1167@gmail.com');
    if (!targetUser) {
      console.log('❌ User sudharshan1167@gmail.com not found in auth.');
      console.log('Available users:', users.map(u => u.email));
      return;
    }

    const userId = targetUser.id;
    console.log(`✅ Found user: ${targetUser.email} | ID: ${userId}`);

    console.log(`2. Querying categories for user_id = ${userId}...`);
    const { data: categories, error: catError } = await serviceClient
      .from('categories')
      .select('*')
      .eq('user_id', userId);

    if (catError) {
      console.error('❌ Error fetching categories:', catError);
    } else {
      console.log(`   Found ${categories.length} categories.`);
      categories.forEach(c => console.log(`   - ${c.icon} ${c.name} (${c.color})`));
    }

    console.log(`3. Querying transactions count for user_id = ${userId}...`);
    const { count, error: txError } = await serviceClient
      .from('transactions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (txError) {
      console.error('❌ Error fetching transactions:', txError);
    } else {
      console.log(`   Found ${count} transactions in the database.`);
    }

  } catch (err) {
    console.error('Error during run:', err.message);
  }
}

run();
