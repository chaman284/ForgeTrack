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

async function check() {
  const client = new Client(config);
  try {
    await client.connect();
    console.log('--- public.users ---');
    const resPublic = await client.query('SELECT * FROM public.users');
    console.log(JSON.stringify(resPublic.rows, null, 2));
    
    console.log('--- auth.users ---');
    const resAuth = await client.query('SELECT id, email FROM auth.users');
    console.log(JSON.stringify(resAuth.rows, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

check();
