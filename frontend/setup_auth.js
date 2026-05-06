import pg from 'pg';
const { Client } = pg;

async function setup() {
  const client = new Client({
    host: 'db.olzghrvomdyywqsdprob.supabase.co',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: '2846@Forge2',
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to database.');

    // Ensure pgcrypto is enabled
    await client.query('CREATE EXTENSION IF NOT EXISTS pgcrypto');

    const users = [
      {
        id: '00000000-0000-0000-0000-000000000001',
        email: 'nischay@theboringpeople.in',
        password: 'forge@123'
      },
      {
        id: '00000000-0000-0000-0000-000000000002',
        email: 'varun@theboringpeople.in',
        password: 'forge@123'
      },
      {
        id: '00000000-0000-0000-0000-000000000003',
        email: '4SH24CS001@forge.local',
        password: 'forge@123'
      }
    ];

    for (const user of users) {
      console.log(`Creating/Updating auth account for ${user.email}...`);
      
      // Delete if exists to avoid conflicts during setup
      await client.query('DELETE FROM auth.users WHERE email = $1', [user.email]);

      await client.query(`
        INSERT INTO auth.users (
          instance_id, id, aud, role, email, encrypted_password, 
          email_confirmed_at, recovery_sent_at, last_sign_in_at, 
          raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
          confirmation_token, email_change, email_change_token_new, recovery_token
        ) VALUES (
          '00000000-0000-0000-0000-000000000000',
          $1,
          'authenticated',
          'authenticated',
          $2,
          crypt($3, gen_salt('bf')),
          now(),
          now(),
          now(),
          '{"provider":"email","providers":["email"]}',
          '{}',
          now(),
          now(),
          '',
          '',
          '',
          ''
        )
      `, [user.id, user.email, user.password]);

      // Also ensure public.users has the right entry (though seed should have done this)
      // For student, we also need to link to students table
      // Let's assume seed.sql was run and these IDs match.
    }

    console.log('✅ Auth setup complete. Password for all accounts is: forge@123');

  } catch (err) {
    console.error('❌ Setup Failed:', err.message);
  } finally {
    await client.end();
  }
}

setup();
