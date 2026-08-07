import pg from 'pg';

const regions = [
  'aws-0-ap-south-1.pooler.supabase.com',
  'aws-0-eu-west-1.pooler.supabase.com',
  'aws-0-us-east-1.pooler.supabase.com',
  'aws-0-ap-southeast-1.pooler.supabase.com',
  'aws-0-eu-central-1.pooler.supabase.com',
  'aws-0-us-west-1.pooler.supabase.com',
  'aws-0-sa-east-1.pooler.supabase.com',
  'aws-0-ca-central-1.pooler.supabase.com'
];

const username = 'postgres.pggolsqtamtkafrpigfo';
const password = '5f-Dxpx6YmA?zgEds';

async function runAutoMigration() {
  console.log('Attempting automatic connection to Supabase database...');

  for (const host of regions) {
    for (const port of [5432, 6543]) {
      const client = new pg.Client({
        host,
        port,
        user: username,
        password: password,
        database: 'postgres',
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 4000
      });

      try {
        await client.connect();
        console.log(`\n🎉 SUCCESS! Connected directly to Supabase DB via ${host}:${port}`);
        
        console.log('1. Creating table public.client_websites...');
        await client.query(`
          CREATE TABLE IF NOT EXISTS public.client_websites (
              id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
              site_key TEXT UNIQUE NOT NULL,
              client_name TEXT NOT NULL,
              client_phone TEXT NOT NULL,
              website_name TEXT NOT NULL,
              website_link TEXT NOT NULL,
              vercel_email TEXT,
              supabase_email TEXT,
              billing_cycle TEXT DEFAULT 'monthly',
              expiry_date TIMESTAMPTZ NOT NULL,
              status BOOLEAN DEFAULT true,
              custom_notice TEXT,
              created_at TIMESTAMPTZ DEFAULT NOW()
          );
        `);

        console.log('2. Creating index...');
        await client.query(`CREATE INDEX IF NOT EXISTS idx_client_websites_site_key ON public.client_websites(site_key);`);

        console.log('3. Applying Row Level Security (RLS) Policies...');
        await client.query(`ALTER TABLE public.client_websites ENABLE ROW LEVEL SECURITY;`);
        await client.query(`DROP POLICY IF EXISTS "Allow public read" ON public.client_websites;`);
        await client.query(`DROP POLICY IF EXISTS "Allow anon all" ON public.client_websites;`);
        await client.query(`CREATE POLICY "Allow public read" ON public.client_websites FOR SELECT USING (true);`);
        await client.query(`CREATE POLICY "Allow anon all" ON public.client_websites FOR ALL USING (true) WITH CHECK (true);`);

        console.log('4. Seeding initial client records...');
        await client.query(`
          INSERT INTO public.client_websites (site_key, client_name, client_phone, website_name, website_link, vercel_email, supabase_email, billing_cycle, expiry_date, status)
          VALUES 
          ('site_estate_pro', 'Imran Shah', '03001234567', 'Luxury Estate Pro', 'https://estate-demo.vercel.app', 'imran@gmail.com', 'imran@gmail.com', 'monthly', NOW() + INTERVAL '30 days', true),
          ('site_tech_hub', 'Tariq Mahmood', '03219876543', 'Lahore Tech Solutions', 'https://techhub-demo.vercel.app', 'tariq@gmail.com', 'tariq@gmail.com', 'monthly', NOW() - INTERVAL '2 days', false)
          ON CONFLICT (site_key) DO UPDATE SET status = EXCLUDED.status;
        `);

        const countRes = await client.query('SELECT count(*) FROM public.client_websites;');
        console.log(`\n✅ DATABASE MIGRATION COMPLETE 100%! Total Rows in Supabase: ${countRes.rows[0].count}`);

        await client.end();
        process.exit(0);
      } catch (err) {
        // Silently try next region
      }
    }
  }

  console.log('Could not reach database pooler directly. Please run SQL manually in SQL Editor.');
}

runAutoMigration();
