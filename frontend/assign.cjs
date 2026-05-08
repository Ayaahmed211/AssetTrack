const { Client } = require('pg');
const client = new Client('postgres://neondb_owner:npg_6mXKcorb8ufy@ep-delicate-tooth-abb2q88a-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require');
async function run() {
  try {
    await client.connect();
    
    // 1. Make mona an ADMIN so she can do anything
    await client.query("UPDATE users SET role='ADMIN' WHERE email='mona@test.com' OR email='mona@gmail.com'");
    
    // 2. Find mona's ID
    const res = await client.query("SELECT id FROM users WHERE email='mona@test.com' OR email='mona@gmail.com' LIMIT 1");
    if (res.rows.length > 0) {
      const userId = res.rows[0].id;
      
      // 3. Assign an asset to mona (e.g., Asset ID 3 which is a laptop)
      await client.query("UPDATE assets SET assigned_to_id=$1, status='ASSIGNED' WHERE id=3", [userId]);
      
      // 4. Also insert into allocation_history so the timeline works
      await client.query("INSERT INTO allocation_history (asset_id, assigned_to_id, action_type, assigned_at) VALUES (3, $1, 'ASSIGNED', NOW())", [userId]);
      
      console.log('Success! Mona is now an ADMIN and has Asset #3 assigned to her.');
    } else {
      console.log('User mona not found in DB.');
    }
  } catch (err) {
    console.error('DB Error:', err);
  } finally {
    await client.end();
  }
}
run();
