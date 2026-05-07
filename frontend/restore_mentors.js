import pg from 'pg';

const { Client } = pg;

const config = {
  host: 'db.olzghrvomdyywqsdprob.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: '2846@Forge2',
  ssl: { rejectUnauthorized: false }
};

const mentors = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'nischay@theboringpeople.in',
    role: 'mentor',
    display_name: 'Nischay BK'
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    email: 'varun@theboringpeople.in',
    role: 'mentor',
    display_name: 'Varun'
  }
];

async function restore() {
  const client = new Client(config);
  try {
    await client.connect();
    console.log('Connected to database.');

    for (const mentor of mentors) {
      console.log(`Restoring profile for ${mentor.email}...`);
      await client.query(`
        INSERT INTO public.users (id, email, role, display_name)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (id) DO UPDATE SET
          email = EXCLUDED.email,
          role = EXCLUDED.role,
          display_name = EXCLUDED.display_name
      `, [mentor.id, mentor.email, mentor.role, mentor.display_name]);
    }

    console.log('✅ Mentor profiles restored!');
  } catch (err) {
    console.error('❌ Restore failed:', err.message);
  } finally {
    await client.end();
  }
}

restore();
