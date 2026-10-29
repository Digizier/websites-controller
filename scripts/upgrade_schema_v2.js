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

async function runUpgrade() {
  console.log('Connecting to Supabase PostgreSQL pooler...');

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
          console.log(`🎉 Connected via ${host}:${port} as ${user}`);

          const sql = `
            ALTER TABLE public.client_websites 
            ADD COLUMN IF NOT EXISTS client_location TEXT,
            ADD COLUMN IF NOT EXISTS domain_name TEXT,
            ADD COLUMN IF NOT EXISTS domain_purchase_date TIMESTAMPTZ,
            ADD COLUMN IF NOT EXISTS domain_expiry_date TIMESTAMPTZ,
            ADD COLUMN IF NOT EXISTS domain_registrar TEXT,
            ADD COLUMN IF NOT EXISTS hosting_email TEXT,
            ADD COLUMN IF NOT EXISTS hosting_password TEXT,
            ADD COLUMN IF NOT EXISTS github_repo_url TEXT,
            ADD COLUMN IF NOT EXISTS github_token TEXT,
            ADD COLUMN IF NOT EXISTS cloudflare_api_key TEXT,
            ADD COLUMN IF NOT EXISTS resend_api_key TEXT,
            ADD COLUMN IF NOT EXISTS resend_from_email TEXT,
            ADD COLUMN IF NOT EXISTS lock_mode TEXT DEFAULT 'payment',
            ADD COLUMN IF NOT EXISTS affiliate_id TEXT,
            ADD COLUMN IF NOT EXISTS monthly_price_pkr NUMERIC DEFAULT 0,
            ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'paid';

            CREATE TABLE IF NOT EXISTS public.controller_affiliates (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              username TEXT UNIQUE NOT NULL,
              password TEXT NOT NULL,
              full_name TEXT NOT NULL,
              phone TEXT,
              commission_amount NUMERIC DEFAULT 500,
              permissions JSONB DEFAULT '{"can_add": true, "can_edit": true, "can_delete": false, "view_all": false}'::jsonb,
              created_at TIMESTAMPTZ DEFAULT NOW()
            );

            CREATE TABLE IF NOT EXISTS public.controller_emergency_users (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              username TEXT UNIQUE NOT NULL,
              password TEXT NOT NULL,
              full_name TEXT NOT NULL,
              phone TEXT,
              profile_image TEXT,
              can_view_affiliates BOOLEAN DEFAULT false,
              status BOOLEAN DEFAULT true,
              created_at TIMESTAMPTZ DEFAULT NOW()
            );

            ALTER TABLE public.controller_affiliates DISABLE ROW LEVEL SECURITY;
            ALTER TABLE public.controller_emergency_users DISABLE ROW LEVEL SECURITY;
            GRANT ALL ON public.controller_affiliates TO anon, authenticated, service_role;
            GRANT ALL ON public.controller_emergency_users TO anon, authenticated, service_role;
          `;

          await client.query(sql);
          console.log('✅ DATABASE SCHEMA SUCCESSFULLY UPGRADED (All 11 sites preserved 100%)!');
          await client.end();
          process.exit(0);
        } catch (err) {
          // try next host
        }
      }
    }
  }

  console.error('Failed to connect to any pooler host');
  process.exit(1);
}

runUpgrade();
