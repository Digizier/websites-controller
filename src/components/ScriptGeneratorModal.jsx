import React, { useState } from 'react';
import { X, Copy, Check, Code, Sparkles, MessageSquare, ShieldCheck, AlertCircle } from 'lucide-react';
import { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_KEY, ADMIN_CONTACT } from '../lib/config';

export default function ScriptGeneratorModal({ client, onClose }) {
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  const siteKey = client ? client.site_key : 'site_estate_pro';
  const websiteName = client ? client.website_name : 'Client Website';

  const dbPassword = '5f-Dxpx6YmA?zgEds';
  const directConnectionString = 'postgresql://postgres:5f-Dxpx6YmA%3FzgEds@db.pggolsqtamtkafrpigfo.supabase.co:5432/postgres';
  const publishableKey = 'sb_publishable_XpYfaWv-_LNXEyJ5YAmRuw_q0wfyI8d';

  // Raw Javascript Code string for Next.js dangerouslySetInnerHTML or standard HTML <script>
  const rawJsLogic = `(function() {
  const SITE_KEY = "${siteKey}";
  const SUPABASE_URL = "${SUPABASE_URL}";
  const SUPABASE_KEY = "${SUPABASE_ANON_KEY}";
  const WHATSAPP_NUM = "${ADMIN_CONTACT.phone}";
  const WHATSAPP_LINK = "https://wa.me/${ADMIN_CONTACT.whatsapp}?text=Hi%20Nader%20Habib,%20I%20want%20to%20unlock%20my%20website.";
  const isTestLock = typeof window !== 'undefined' && window.location && window.location.search && window.location.search.includes('lock=true');

  async function checkAccess() {
    if (isTestLock) {
      execLockOverlay('monthly');
      return;
    }

    try {
      const url = \`\${SUPABASE_URL}/rest/v1/client_websites?site_key=\${encodeURIComponent(SITE_KEY)}&select=*\`;
      const res = await fetch(url, {
        headers: { 
          'apikey': SUPABASE_KEY, 
          'Authorization': 'Bearer ' + SUPABASE_KEY 
        }
      });
      if (!res.ok) return;
      const data = await res.json();
      
      if (data && data.length > 0) {
        const item = data[0];
        const now = new Date();
        const expiry = new Date(item.expiry_date);
        const isExpired = now > expiry;
        const isDisabled = item.status === false;

        if (isExpired || isDisabled) {
          execLockOverlay(item.billing_cycle || 'monthly');
        }
      }
    } catch (e) {
      console.error('[Website-Controller] Access check failed:', e);
    }
  }

  function execLockOverlay(billingCycle) {
    function inject() {
      if (document.getElementById('nader-habib-lock-overlay')) return;
      document.documentElement.style.overflow = 'hidden';
      if (document.body) document.body.style.overflow = 'hidden';

      const overlay = document.createElement('div');
      overlay.id = 'nader-habib-lock-overlay';
      overlay.style.cssText = 'position:fixed!important;top:0!important;left:0!important;width:100vw!important;height:100vh!important;background:#030712!important;color:#ffffff!important;z-index:999999999!important;display:flex!important;align-items:center!important;justify-content:center!important;font-family:system-ui,-apple-system,sans-serif!important;text-align:center!important;padding:20px!important;box-sizing:border-box!important;';

      const cycle = billingCycle === 'yearly' ? 'Yearly' : 'Monthly';

      overlay.innerHTML = \`
        <div style="max-width:520px;width:100%;background:rgba(17,24,39,0.95);border:1px solid rgba(239,68,68,0.4);border-radius:24px;padding:40px 32px;box-shadow:0 25px 50px -12px rgba(239,68,68,0.25);backdrop-filter:blur(16px);">
          <div style="width:72px;height:72px;margin:0 auto 24px;background:rgba(239,68,68,0.15);border:2px solid rgba(239,68,68,0.5);border-radius:50%;display:flex;align-items:center;justify-content:center;">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          </div>
          <span style="background:rgba(239,68,68,0.2);color:#f87171;border:1px solid rgba(239,68,68,0.3);font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;padding:6px 14px;border-radius:9999px;display:inline-block;margin-bottom:16px;">
            Website Access Locked • \${cycle} Payment Remaining
          </span>
          <h1 style="font-size:26px;font-weight:800;color:#ffffff;margin:0 0 12px 0;">Nader Habib Payment Remaining</h1>
          <p style="font-size:15px;color:#9ca3af;line-height:1.6;margin:0 0 24px 0;">
            Your hosting subscription access is locked. Please contact Nader Habib on WhatsApp to pay remaining dues and restore access.
          </p>
          <div style="background:#1f2937;border:1px solid #374151;border-radius:16px;padding:16px;margin-bottom:24px;">
            <div style="font-size:13px;color:#9ca3af;margin-bottom:4px;">Direct WhatsApp Support</div>
            <div style="font-size:20px;font-weight:700;color:#10b981;">\${WHATSAPP_NUM}</div>
          </div>
          <a href="\${WHATSAPP_LINK}" target="_blank" rel="noreferrer" style="display:flex;align-items:center;justify-content:center;gap:10px;background:#10b981;color:#ffffff;text-decoration:none;font-weight:700;font-size:16px;padding:14px 24px;border-radius:14px;box-shadow:0 10px 20px -5px rgba(16,185,129,0.4);">
            Contact Nader Habib on WhatsApp
          </a>
        </div>
      \`;
      document.documentElement.appendChild(overlay);
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', inject);
    } else {
      inject();
    }
  }

  checkAccess();
})();`;

  const antigravityPrompt = `Hi Antigravity! Please add First-Layer Lock Protection to this client website for Nader Habib's Website Controller.

--- NADER HABIB MASTER CONTROLLER CREDENTIALS & DIRECT SETUP ---
Supabase Controller URL: "${SUPABASE_URL}"
Publishable Key: "${publishableKey}"
Database Master Password: "${dbPassword}"
Direct Connection String (PostgreSQL): "${directConnectionString}"
Anon Key: "${SUPABASE_ANON_KEY}"
Service Role Key: "${SUPABASE_SERVICE_KEY}"

--- CLIENT WEBSITE CONFIGURATION ---
Target Client Site Key: "${siteKey}"
Client Website Name: "${websiteName}"

--- INSTRUCTION FOR ANTIGRAVITY (MULTI-FRAMEWORK INTEGRATION) ---

[CASE A: IF NEXT.JS APP ROUTER OR PAGES ROUTER (React Next.js)]
Do NOT use Next.js <Script strategy="beforeInteractive"> component as it defers inline execution!
Instead, open src/app/layout.tsx (or src/pages/_document.tsx) and insert a raw HTML <script dangerouslySetInnerHTML> inside the <head> tag:

<head>
  <script dangerouslySetInnerHTML={{ __html: \`${rawJsLogic}\` }} />
</head>

[CASE B: IF VITE / REACT / HTML / PHP / WORDPRESS]
Open index.html (or header layout) and paste this exact self-contained <script> tag directly inside the <head> section:

<!-- NADER HABIB SOLID FIRST-LAYER PROTECTION -->
<script data-site-key="${siteKey}">
${rawJsLogic}
</script>

This connects directly to Nader Habib's central Controller Supabase. If status is set to OFF or payment date is expired in Supabase, it instantly locks the website and displays Nader Habib's WhatsApp contact (${ADMIN_CONTACT.phone}).`;

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-3xl w-full p-6 shadow-2xl overflow-y-auto max-h-[92vh] text-gray-100 relative">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-800 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Advanced Antigravity Protection Prompt</h2>
              <p className="text-xs text-gray-400">Site Key: <span className="font-mono text-emerald-400">{siteKey}</span> ({websiteName})</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab 1: Antigravity Prompt */}
        <div className="space-y-4">
          
          <div className="p-3 bg-blue-950/40 border border-blue-500/30 rounded-xl text-xs space-y-1">
            <div className="flex items-center gap-2 font-bold text-blue-300">
              <AlertCircle className="w-4 h-4 text-blue-400" />
              <span>Multi-Framework Smart Prompt (Next.js, Vite, React, HTML):</span>
            </div>
            <p className="text-[11px] text-gray-300 pl-6">
              Is prompt me <strong>Next.js (dangerouslySetInnerHTML)</strong> aur <strong>React/Vite/HTML (&lt;script&gt;)</strong> dono ke liye exact instructions shamil hain, taaki Next.js project ho ya React, lock 100% instant render ho!
            </p>
          </div>

          <p className="text-sm text-gray-300">
            Is prompt ko copy karke Antigravity ki chat me daalein. Isme <strong className="text-white">Next.js Code</strong>, <strong className="text-white">HTML/Vite Code</strong>, <strong className="text-white">Direct Connection String</strong>, <strong className="text-white">Database Password</strong>, <strong className="text-white">Anon Key</strong>, aur <strong className="text-white">Service Role Key</strong> tamam cheezein shamil hain:
          </p>

          <div className="relative">
            <textarea
              readOnly
              rows={15}
              value={antigravityPrompt}
              className="w-full bg-gray-950 border border-gray-800 rounded-xl p-4 font-mono text-xs text-emerald-300 focus:outline-none resize-none"
            />
            <button
              onClick={() => copyToClipboard(antigravityPrompt)}
              className="absolute top-3 right-3 flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow transition"
            >
              {copiedPrompt ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copiedPrompt ? 'Copied Prompt!' : 'Copy Complete Prompt'}
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-6 pt-4 border-t border-gray-800 flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            <span>Support WhatsApp: <strong className="text-white">{ADMIN_CONTACT.phone}</strong></span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-xl font-medium transition"
          >
            Close Window
          </button>
        </div>

      </div>
    </div>
  );
}
