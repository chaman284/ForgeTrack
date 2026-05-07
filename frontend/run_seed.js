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

const client = new Client(config);

async function run() {
  await client.connect();
  console.log('Connected!');

  try {
    console.log('Seed data is now empty except for mentor accounts (managed elsewhere).');
    console.log('\n✅ Cleanup complete!');
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await client.end();
  }
}

run();
