import React, { useState } from 'react';
import { X, Database, Check, Copy, AlertTriangle, ExternalLink } from 'lucide-react';
import { SUPABASE_URL } from '../lib/config';

export default function DatabaseSetupModal({ isOpen, onClose }) {
  const [copiedSql, setCopiedSql] = useState(false);

  if (!isOpen) return null;

  const sqlQuery = `-- Copy & Paste this into Supabase SQL Editor:
-- ${SUPABASE_URL}/dashboard/project/pggolsqtamtkafrpigfo/sql/new

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
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_client_websites_site_key ON public.client_websites(site_key);

ALTER TABLE public.client_websites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access for client status check" 
ON public.client_websites FOR SELECT USING (true);

CREATE POLICY "Allow anon all for dashboard" 
ON public.client_websites FOR ALL USING (true) WITH CHECK (true);`;

  const copySql = () => {
    navigator.clipboard.writeText(sqlQuery);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl overflow-hidden text-gray-100 relative">
        
        <div className="flex items-center justify-between border-b border-gray-800 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Supabase Database Setup</h2>
              <p className="text-xs text-gray-400">Run this SQL query once to create the client_websites table</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3.5 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-200 leading-relaxed">
              If your database shows a table error, simply open your Supabase SQL Editor and click <strong>Run Query</strong> with the script below.
            </p>
          </div>

          <div className="relative">
            <pre className="bg-gray-950 border border-gray-800 rounded-xl p-4 font-mono text-xs text-amber-300 overflow-x-auto max-h-60">
              {sqlQuery}
            </pre>
            <button
              onClick={copySql}
              className="absolute top-3 right-3 flex items-center gap-1.5 bg-amber-600 hover:bg-amber-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow transition"
            >
              {copiedSql ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copiedSql ? 'Copied SQL!' : 'Copy SQL Script'}
            </button>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-800 flex items-center justify-between">
          <a
            href="https://supabase.com/dashboard/project/pggolsqtamtkafrpigfo/sql/new"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs font-semibold text-emerald-400 hover:underline"
          >
            Open Supabase SQL Editor Direct Link <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-xl font-medium text-sm transition"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}
