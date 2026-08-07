import pg from 'pg';

const regions = [
  'aws-0-ap-southeast-1.pooler.supabase.com',
  'aws-0-us-east-1.pooler.supabase.com',
  'aws-0-us-west-1.pooler.supabase.com',
  'aws-0-eu-central-1.pooler.supabase.com'
];

const username = 'postgres.pggolsqtamtkafrpigfo';
const password = '5f-Dxpx6YmA?zgEds';

async function tryPooler() {
  for (const host of regions) {
    console.log(`Trying pooler host: ${host}...`);
    const client = new pg.Client({
      host,
      port: 6543, // Transaction pooler or 5432
      user: username,
      password: password,
      database: 'postgres',
      ssl: { rejectUnauthorized: false }
    });

    try {
      await client.connect();
      console.log(`SUCCESS! Connected via pooler: ${host}`);
      
      // Execute Migration SQL!
      const sql = `
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

        CREATE INDEX IF NOT EXISTS idx_client_websites_site_key ON public.client_websites(site_key);
        ALTER TABLE public.client_websites ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Allow public read" ON public.client_websites;
        DROP POLICY IF EXISTS "Allow anon all" ON public.client_websites;
        CREATE POLICY "Allow public read" ON public.client_websites FOR SELECT USING (true);
        CREATE POLICY "Allow anon all" ON public.client_websites FOR ALL USING (true) WITH CHECK (true);

        INSERT INTO public.client_websites (site_key, client_name, client_phone, website_name, website_link, vercel_email, supabase_email, billing_cycle, expiry_date, status)
        VALUES 
        ('site_estate_pro', 'Imran Shah', '03001234567', 'Luxury Estate Pro', 'https://estate-demo.vercel.app', 'imran.estate@gmail.com', 'imran.estate@gmail.com', 'monthly', NOW() + INTERVAL '30 days', true),
        ('site_tech_hub', 'Tariq Mahmood', '03219876543', 'Lahore Tech Solutions', 'https://techhub-demo.vercel.app', 'tariq.tech@gmail.com', 'tariq.tech@gmail.com', 'monthly', NOW() - INTERVAL '2 days', false)
        ON CONFLICT (site_key) DO UPDATE SET status = EXCLUDED.status;
      `;

      await client.query(sql);
      console.log('MIGRATION EXECUTED SUCCESSFULLY! Table public.client_websites IS LIVE ON SUPABASE!');
      
      const countRes = await client.query('SELECT count(*) FROM public.client_websites;');
      console.log(`Live Table Row Count: ${countRes.rows[0].count}`);
      await client.end();
      process.exit(0);
    } catch (e) {
      console.log(`Failed on ${host}:`, e.message);
    }
  }
}

tryPooler();
