import pg from 'pg';

const regions = [
  'aws-0-ap-northeast-1.pooler.supabase.com',
  'aws-0-ap-south-1.pooler.supabase.com',
  'aws-0-eu-west-1.pooler.supabase.com',
  'aws-0-us-east-1.pooler.supabase.com',
  'aws-0-ap-southeast-1.pooler.supabase.com',
  'aws-0-eu-central-1.pooler.supabase.com',
  'aws-0-us-west-1.pooler.supabase.com'
];

const pass = '5f-Dxpx6YmA?zgEds';
const projectRef = 'pggolsqtamtkafrpigfo';
const users = [`postgres.${projectRef}`, 'postgres'];

async function executeSchemaUpgrade() {
  console.log('Upgrading Supabase public.client_websites table schema for 5 Platform Accounts (Vercel, Supabase, GitHub, Cloudflare, Cronjob)...');

  for (const host of regions) {
    for (const user of users) {
      for (const port of [5432, 6543]) {
        const client = new pg.Client({
          host,
          port,
          user,
          password: pass,
          database: 'postgres',
          ssl: { rejectUnauthorized: false },
          connectionTimeoutMillis: 3000
        });

        try {
          await client.connect();
          console.log(`\n🎉 Connected to Supabase DB via ${host}:${port}`);

          await client.query(`
            ALTER TABLE public.client_websites 
            ADD COLUMN IF NOT EXISTS vercel_email TEXT,
            ADD COLUMN IF NOT EXISTS supabase_email TEXT,
            ADD COLUMN IF NOT EXISTS github_email TEXT,
            ADD COLUMN IF NOT EXISTS cloudflare_email TEXT,
            ADD COLUMN IF NOT EXISTS cronjob_email TEXT;
          `);

          console.log('✅ DATABASE SCHEMA FULLY UPGRADED WITH ALL 5 PLATFORM ACCOUNT COLUMNS!');
          await client.end();
          process.exit(0);
        } catch (err) {
          // try next
        }
      }
    }
  }
}

executeSchemaUpgrade();
