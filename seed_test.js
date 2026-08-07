import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://pggolsqtamtkafrpigfo.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnZ29sc3F0YW10a2FmcnBpZ2ZvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTI0MTc4OCwiZXhwIjoyMTAwODE3Nzg4fQ.HylEsioCqtvD80tvetGvSetwEdwLE5cq1GYrLXdcjMY';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function testSeed() {
  console.log('Testing Supabase client insertion...');
  const testRecord = {
    site_key: 'site_test_' + Date.now(),
    client_name: 'Test Client',
    client_phone: '03222685868',
    website_name: 'Demo Website',
    website_link: 'https://demo-site.com',
    vercel_email: 'test@vercel.com',
    supabase_email: 'test@supabase.com',
    billing_cycle: 'monthly',
    expiry_date: new Date(Date.now() + 30 * 86400000).toISOString(),
    status: true
  };

  const { data, error } = await supabase
    .from('client_websites')
    .insert([testRecord])
    .select();

  if (error) {
    console.log('Supabase Notice:', error.message);
    console.log('Note: Please paste schema.sql in Supabase SQL Editor once to initialize table.');
  } else {
    console.log('Supabase table created & test record inserted successfully:', data);
  }
}

testSeed();
