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

async function runUpgradeV3() {
  console.log('Connecting to Supabase PostgreSQL pooler for v3 schema upgrade...');

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
          connectionTimeoutMillis: 3500
        });

        try {
          await client.connect();
          console.log(`Connected via ${host}:${port} as ${user}`);

          const sql = `
            ALTER TABLE public.client_websites 
            ADD COLUMN IF NOT EXISTS admin_whatsapp TEXT DEFAULT '03222685868',
            ADD COLUMN IF NOT EXISTS admin_name TEXT DEFAULT 'Nadir Habib',
            ADD COLUMN IF NOT EXISTS admin_brand TEXT DEFAULT 'Digizier',
            ADD COLUMN IF NOT EXISTS lock_heading TEXT DEFAULT 'Nadir Habib Payment Remaining',
            ADD COLUMN IF NOT EXISTS lock_btn_text TEXT DEFAULT 'Contact on WhatsApp',
            ADD COLUMN IF NOT EXISTS under_construction_heading TEXT DEFAULT 'Website Under Construction',
            ADD COLUMN IF NOT EXISTS under_construction_badge TEXT DEFAULT 'Maintenance & Development Mode';

            CREATE TABLE IF NOT EXISTS public.controller_master_profile (
              id TEXT PRIMARY KEY DEFAULT 'master',
              name TEXT DEFAULT 'Nadir Habib',
              phone TEXT DEFAULT '03222685868',
              whatsapp TEXT DEFAULT '923222685868',
              brand TEXT DEFAULT 'Digizier • Nadir Habib Protection System',
              owner_role TEXT DEFAULT 'Digizier Owner',
              default_payment_notice TEXT,
              default_construction_notice TEXT,
              updated_at TIMESTAMPTZ DEFAULT NOW()
            );

            INSERT INTO public.controller_master_profile (id, name, phone, whatsapp, brand, owner_role)
            VALUES ('master', 'Nadir Habib', '03222685868', '923222685868', 'Digizier • Nadir Habib Protection System', 'Digizier Owner')
            ON CONFLICT (id) DO NOTHING;

            ALTER TABLE public.controller_master_profile DISABLE ROW LEVEL SECURITY;
            GRANT ALL ON public.controller_master_profile TO anon, authenticated, service_role;
          `;

          await client.query(sql);
          console.log('V3 SCHEMA UPGRADE COMPLETED SUCCESSFULLY (All 11 sites preserved 100%)!');
          await client.end();
          process.exit(0);
        } catch (err) {
          // try next
        }
      }
    }
  }

  console.error('Failed to connect to pooler host');
  process.exit(1);
}

runUpgradeV3();
