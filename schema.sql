-- SQL Migration Script for Nader Habib Website Controller
-- Execute this script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/pggolsqtamtkafrpigfo/sql/new

CREATE TABLE IF NOT EXISTS public.client_websites (
    id UUID DEFAULT gen_random_policy_id() PRIMARY KEY,
    site_key TEXT UNIQUE NOT NULL,
    client_name TEXT NOT NULL,
    client_phone TEXT NOT NULL,
    website_name TEXT NOT NULL,
    website_link TEXT NOT NULL,
    vercel_email TEXT,
    supabase_email TEXT,
    billing_cycle TEXT DEFAULT 'monthly', -- 'monthly', 'yearly', 'custom'
    expiry_date TIMESTAMPTZ NOT NULL,
    status BOOLEAN DEFAULT true,
    custom_notice TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookup by site_key
CREATE INDEX IF NOT EXISTS idx_client_websites_site_key ON public.client_websites(site_key);

-- Enable Row Level Security (RLS)
ALTER TABLE public.client_websites ENABLE ROW LEVEL SECURITY;

-- Allow public Read access (so client websites can check their status via site_key)
CREATE POLICY "Allow public read access for client status check" 
ON public.client_websites FOR SELECT 
USING (true);

-- Allow full access for authenticated service role / anon dashboard operations
CREATE POLICY "Allow anon insert/update/delete for dashboard" 
ON public.client_websites FOR ALL 
USING (true) 
WITH CHECK (true);
