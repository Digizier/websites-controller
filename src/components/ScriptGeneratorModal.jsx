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

  // Upgraded self-contained JavaScript Logic with Anti-Cache & Dual-Mode (Under Construction / Payment Lock)
  const rawJsLogic = `(function() {
  const SITE_KEY = "${siteKey}";
  const SUPABASE_URL = "${SUPABASE_URL}";
  const SUPABASE_KEY = "${SUPABASE_ANON_KEY}";
  const WHATSAPP_NUM = "${ADMIN_CONTACT.phone}";
  const WHATSAPP_LINK = "https://wa.me/${ADMIN_CONTACT.whatsapp}?text=Hi%20Nadir%20Habib,%20I%20want%20to%20unlock%20my%20website.";
  const isTestLock = typeof window !== 'undefined' && window.location && window.location.search && window.location.search.includes('lock=true');

  async function checkAccess() {
    if (isTestLock) {
      execLockOverlay('monthly', 'payment');
      return;
    }

    try {
      const ts = Date.now();
      const url = \`\${SUPABASE_URL}/rest/v1/client_websites?site_key=\${encodeURIComponent(SITE_KEY)}&select=*&_ts=\${ts}\`;
      const res = await fetch(url, {
        method: 'GET',
        cache: 'no-store',
        headers: { 
          'apikey': SUPABASE_KEY, 
          'Authorization': 'Bearer ' + SUPABASE_KEY,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
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

        if (item.lock_mode === 'under_construction' || (isDisabled && item.lock_mode === 'under_construction')) {
          execLockOverlay(item.billing_cycle || 'monthly', 'under_construction', item.custom_notice, item);
          return;
        }

        if (isExpired || isDisabled) {
          execLockOverlay(item.billing_cycle || 'monthly', 'payment', item.custom_notice, item);
        }
      }
    } catch (e) {
      console.error('[Website-Controller] Access check failed:', e);
    }
  }

  function formatNotice(notice, item, fallback) {
    let text = (notice && notice.trim()) ? notice : fallback;
    if (!text) return '';
    return text
      .replace(/\\{client_name\\}|\\{name\\}/gi, (item && item.client_name) || 'Valued Client')
      .replace(/\\{website_name\\}|\\{website\\}/gi, (item && item.website_name) || '')
      .replace(/\\{client_phone\\}|\\{phone\\}/gi, (item && item.client_phone) || '')
      .replace(/\\{admin_phone\\}/gi, WHATSAPP_NUM)
      .replace(/\\{expiry_date\\}|\\{expiry\\}/gi, (item && item.expiry_date) ? new Date(item.expiry_date).toLocaleDateString('en-GB') : '');
  }

  function execLockOverlay(billingCycle, mode, rawNotice, item) {
    function inject() {
      if (document.getElementById('nader-habib-lock-overlay')) return;
      document.documentElement.style.overflow = 'hidden';
      if (document.body) document.body.style.overflow = 'hidden';

      const overlay = document.createElement('div');
      overlay.id = 'nader-habib-lock-overlay';
      overlay.style.cssText = 'position:fixed!important;top:0!important;left:0!important;width:100vw!important;height:100vh!important;background:#090d16!important;color:#ffffff!important;z-index:999999999!important;display:flex!important;align-items:center!important;justify-content:center!important;font-family:system-ui,-apple-system,sans-serif!important;text-align:center!important;padding:24px!important;box-sizing:border-box!important;';

      const cycle = billingCycle === 'yearly' ? 'Yearly' : 'Monthly';

      if (mode === 'under_construction') {
        const defaultMsg = 'This website is currently undergoing scheduled maintenance or system upgrades. Access will be restored shortly.';
        const customNotice = formatNotice(rawNotice, item, defaultMsg);

        overlay.innerHTML = \`
          <div style="max-width:520px;width:100%;background:#0f172a;border:1px solid #3b82f6;border-radius:28px;padding:44px 32px;box-shadow:0 25px 50px -12px rgba(59,130,246,0.25);backdrop-filter:blur(16px);">
            <div style="width:76px;height:76px;margin:0 auto 24px;background:rgba(59,130,246,0.15);border:2px solid #3b82f6;border-radius:50%;display:flex;align-items:center;justify-content:center;">
              <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>
            </div>
            <span style="background:rgba(59,130,246,0.18);color:#93c5fd;border:1px solid rgba(59,130,246,0.4);font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;padding:6px 16px;border-radius:9999px;display:inline-block;margin-bottom:16px;">
              Maintenance & Development Mode
            </span>
            <h1 style="font-size:26px;font-weight:800;color:#ffffff;margin:0 0 12px 0;">Website Under Construction</h1>
            <p style="font-size:15px;color:#94a3b8;line-height:1.6;margin:0 0 24px 0;">
              \${customNotice}
            </p>
            <div style="background:#1e293b;border:1px solid #334155;border-radius:16px;padding:16px;margin-bottom:24px;">
              <div style="font-size:13px;color:#94a3b8;margin-bottom:4px;">Administration Contact</div>
              <div style="font-size:20px;font-weight:700;color:#38bdf8;">\${WHATSAPP_NUM}</div>
            </div>
            <div style="margin-top:16px;font-size:12px;color:#64748b;">DIGIZIER • Quality Assurance System</div>
          </div>
        \`;
      } else {
        overlay.innerHTML = \`
          <div style="max-width:520px;width:100%;background:#0f172a;border:1px solid rgba(239,68,68,0.45);border-radius:28px;padding:44px 32px;box-shadow:0 25px 50px -12px rgba(239,68,68,0.25);backdrop-filter:blur(16px);">
            <div style="width:76px;height:76px;margin:0 auto 24px;background:rgba(239,68,68,0.15);border:2px solid rgba(239,68,68,0.5);border-radius:50%;display:flex;align-items:center;justify-content:center;">
              <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            </div>
            <span style="background:rgba(239,68,68,0.2);color:#f87171;border:1px solid rgba(239,68,68,0.35);font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;padding:6px 16px;border-radius:9999px;display:inline-block;margin-bottom:16px;">
              Website Access Locked • \${cycle} Payment Overdue
            </span>
            <h1 style="font-size:26px;font-weight:800;color:#ffffff;margin:0 0 12px 0;">Nadir Habib Payment Remaining</h1>
            <p style="font-size:15px;color:#94a3b8;line-height:1.6;margin:0 0 24px 0;">
              \${customNotice || 'Your hosting subscription access is locked. Please contact Nadir Habib on WhatsApp to pay remaining dues and restore access.'}
            </p>
            <div style="background:#1e293b;border:1px solid #334155;border-radius:16px;padding:16px;margin-bottom:24px;">
              <div style="font-size:13px;color:#94a3b8;margin-bottom:4px;">Direct WhatsApp Support</div>
              <div style="font-size:20px;font-weight:700;color:#10b981;">\${WHATSAPP_NUM}</div>
            </div>
            <a href="\${WHATSAPP_LINK}" target="_blank" rel="noreferrer" style="display:flex;align-items:center;justify-content:center;gap:10px;background:#10b981;color:#ffffff;text-decoration:none;font-weight:700;font-size:16px;padding:14px 24px;border-radius:14px;box-shadow:0 10px 20px -5px rgba(16,185,129,0.4);">
              Contact Nadir Habib on WhatsApp
            </a>
            <div style="margin-top:20px;font-size:12px;color:#64748b;">DIGIZIER • Premium Controller System</div>
          </div>
        \`;
      }
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

  const antigravityPrompt = `Hi Antigravity! Please add First-Layer Lock Protection to this my website for Nadir Habib's Website Controller.

--- NADIR HABIB MASTER CONTROLLER CREDENTIALS & DIRECT SETUP ---
Supabase Controller URL: "${SUPABASE_URL}"
Publishable Key: "${publishableKey}"
Database Master Password: "${dbPassword}"
Direct Connection String (PostgreSQL): "${directConnectionString}"
Anon Key: "${SUPABASE_ANON_KEY}"
Service Role Key: "${SUPABASE_SERVICE_KEY}"

--- MY WEBSITE CONFIGURATION ---
Target Site Key: "${siteKey}"
My Website Name: "${websiteName}"

--- CRITICAL SUPABASE POSTGREST QUERY SYNTAX REQUIREMENT ---
Please query the Supabase table client_websites using the PostgREST equality filter site_key=eq.${siteKey} (e.g. ${SUPABASE_URL}/rest/v1/client_websites?site_key=eq.${encodeURIComponent(siteKey)}&select=*). 
Note that "eq." is strictly required by Supabase REST API syntax, and the table name must be "client_websites". Always include &_ts=\${Date.now()} and cache: "no-store" with no-cache headers to prevent mobile/browser caching lags.

--- INSTRUCTION FOR ANTIGRAVITY (MULTI-FRAMEWORK INTEGRATION) ---

[CASE A: IF NEXT.JS APP ROUTER OR PAGES ROUTER (React Next.js)]
Do NOT use Next.js <Script strategy="beforeInteractive"> component as it defers inline execution!
Instead, open src/app/layout.tsx (or src/pages/_document.tsx) and insert a raw HTML <script dangerouslySetInnerHTML> inside the <head> tag:

<head>
  <script dangerouslySetInnerHTML={{ __html: \`${rawJsLogic}\` }} />
</head>

[CASE B: IF VITE / REACT / HTML / PHP / WORDPRESS]
Open index.html (or header layout) and paste this exact self-contained <script> tag directly inside the <head> section:

<!-- NADIR HABIB SOLID FIRST-LAYER PROTECTION -->
<script data-site-key="${siteKey}">
${rawJsLogic}
</script>

Features: Anti-Cache Realtime Status Busting (&_ts=\${Date.now()}), Immediate Reactivation, and Dual-Mode (Payment Lock vs Under Construction Screen). If status is set to OFF or payment date is expired in Supabase, it instantly locks the website and displays Nadir Habib's WhatsApp contact (${ADMIN_CONTACT.phone}).`;

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-3xl w-full p-6 shadow-2xl overflow-y-auto max-h-[92vh] text-slate-800 relative">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <Code className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Antigravity Protection Prompt</h2>
              <p className="text-xs text-slate-500">Self-Contained Realtime Anti-Cache Protection for {websiteName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1-Click Copy Box */}
        <div className="mb-6 bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-800 font-semibold text-sm">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Copy this prompt & paste into Antigravity in your project</span>
          </div>
          <button
            onClick={() => copyToClipboard(antigravityPrompt)}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition"
          >
            {copiedPrompt ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedPrompt ? 'Copied Prompt!' : '1-Click Copy Full Prompt'}</span>
          </button>
        </div>

        {/* Credentials & Prompt Preview */}
        <div className="space-y-4">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Antigravity Instruction Preview</span>
              <span className="text-[11px] text-emerald-600 font-semibold bg-emerald-100/60 px-2.5 py-0.5 rounded-full">Anti-Cache & Dual-Mode Verified</span>
            </div>
            <pre className="text-xs text-slate-600 font-mono whitespace-pre-wrap max-h-72 overflow-y-auto bg-white p-3.5 rounded-xl border border-slate-200 leading-relaxed selection:bg-emerald-100">
              {antigravityPrompt}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Target Site Key: <strong className="text-slate-800 font-mono">{siteKey}</strong></span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
