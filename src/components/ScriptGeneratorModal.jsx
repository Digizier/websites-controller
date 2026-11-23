import React, { useState } from 'react';
import { X, Copy, Check, Code, Sparkles, MessageSquare, ShieldCheck, AlertCircle } from 'lucide-react';
import { ADMIN_CONTACT } from '../lib/config';

export default function ScriptGeneratorModal({ client, onClose }) {
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  const siteKey = client ? client.site_key : 'site_estate_pro';
  const websiteName = client ? client.website_name : 'Client Website';

  // Ultra-Short Stealth JavaScript Logic (Zero-Key, Zero Hardcoded Phone, Zero SEO Keywords)
  const rawJsLogic = `(function() {
  const p = "https://status.digizier.com/?site=${encodeURIComponent(siteKey)}";
  const b = "https://status.digizier.workers.dev/?site=${encodeURIComponent(siteKey)}";

  function check(url) {
    return fetch(url, { cache: 'no-store' }).then(r => r.ok ? r.json() : Promise.reject());
  }

  check(p).catch(() => check(b)).then(d => {
    if (!d || !d.locked) return;

    const phone = (d.admin_phone || '').replace(/[^0-9]/g, '');
    const intl = phone.startsWith('92') ? phone : (phone.startsWith('0') ? '92' + phone.slice(1) : '92' + phone);
    const isMaint = d.mode === 'under_construction';
    const title = isMaint ? 'Website Under Construction' : 'Service Notice';
    const sub = isMaint ? 'Scheduled Maintenance' : 'Verification Required';
    const msg = d.custom_notice || (isMaint 
      ? 'This website is currently undergoing scheduled maintenance. Access will be restored shortly.' 
      : 'Access is temporarily restricted. Please contact administration to restore service.');
    const wa = 'https://wa.me/' + intl + '?text=' + encodeURIComponent('Inquiry regarding website status: ' + (d.site_name || window.location.hostname));

    function esc(s) {
      return (s || '').toString().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
    }

    const safeTitle = esc(title);
    const safeSub = esc(sub);
    const safeMsg = esc(msg);
    const safePhone = esc(d.admin_phone || '');

    document.documentElement.style.overflow = 'hidden';
    const el = document.createElement('div');
    el.id = 'status-dialog';
    el.style.cssText = 'position:fixed!important;top:0!important;left:0!important;width:100vw!important;height:100vh!important;background:#090d16!important;color:#fff!important;z-index:999999999!important;display:flex!important;align-items:center!important;justify-content:center!important;font-family:sans-serif!important;padding:24px!important;box-sizing:border-box!important;text-align:center!important;';
    el.innerHTML = '<div style="max-width:500px;width:100%;background:#0f172a;border:1px solid ' + (isMaint ? '#3b82f6' : '#ef4444') + ';border-radius:24px;padding:40px 28px;box-shadow:0 25px 50px -12px rgba(0,0,0,0.5);">' +
      '<span style="background:rgba(' + (isMaint ? '59,130,246' : '239,68,68') + ',0.2);color:' + (isMaint ? '#93c5fd' : '#f87171') + ';font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;padding:6px 14px;border-radius:99px;display:inline-block;margin-bottom:16px;">' + safeSub + '</span>' +
      '<div style="font-size:24px;font-weight:800;margin-bottom:12px;">' + safeTitle + '</div>' +
      '<p style="font-size:15px;color:#94a3b8;line-height:1.6;margin-bottom:24px;">' + safeMsg + '</p>' +
      (safePhone ? '<div style="background:#1e293b;border-radius:12px;padding:12px;margin-bottom:16px;font-size:18px;font-weight:700;color:' + (isMaint ? '#38bdf8' : '#25D366') + ';">' + safePhone + '</div>' : '') +
      '<a href="' + wa + '" target="_blank" rel="noreferrer" style="display:inline-block;background:#25D366;color:#fff;text-decoration:none;font-weight:700;font-size:15px;padding:14px 28px;border-radius:12px;">Contact on WhatsApp</a>' +
      '</div>';
    (document.body || document.documentElement).appendChild(el);
  }).catch(() => {});
})();`;

  const antigravityPrompt = `Hi Antigravity! Please add First-Layer Protection & Status Verification to this website for Nadir Habib's Controller System.

--- CONTROLLER STATUS ENDPOINTS (ZERO-KEY PROXY ARCHITECTURE) ---
Target Site Key: "${siteKey}"
Website Name: "${websiteName}"
Primary Status Endpoint: "https://status.digizier.com/?site=${encodeURIComponent(siteKey)}"
Backup Status Endpoint: "https://status.digizier.workers.dev/?site=${encodeURIComponent(siteKey)}"

[CRITICAL SECURITY & PRIVACY REQUIREMENT]
1. No database credentials, API keys, passwords, or direct connection strings should be used.
2. No personal phone numbers or payment/lock keywords should be hardcoded in static HTML (prevents Google SEO crawling and privacy leaks).
3. The client website communicates strictly with the dual-redundancy Edge status endpoints with zero secret keys exposed.

--- INSTRUCTION FOR ANTIGRAVITY (MULTI-FRAMEWORK INTEGRATION) ---

[CASE A: IF NEXT.JS APP ROUTER OR PAGES ROUTER (React Next.js)]
Do NOT use Next.js <Script strategy="beforeInteractive"> component as it defers inline execution!
Instead, open src/app/layout.tsx (or src/pages/_document.tsx) and insert a raw HTML <script dangerouslySetInnerHTML> inside the <head> tag:

<head>
  {/* DIGIZIER QUALITY ASSURANCE & STATUS CONTROLLER */}
  <script data-cfasync="false" data-site-key="${siteKey}" dangerouslySetInnerHTML={{ __html: \`${rawJsLogic}\` }} />
</head>

[CASE B: IF VITE / REACT / HTML / PHP / WORDPRESS]
Open index.html (or header layout) and paste this exact self-contained <script> tag directly inside the <head> section:

<!-- DIGIZIER QUALITY ASSURANCE & STATUS CONTROLLER -->
<script data-cfasync="false" data-site-key="${siteKey}">
${rawJsLogic}
</script>

Features: Anti-Cache Realtime Status Busting, Stealth Client-Side Verification (no hardcoded phone numbers, no payment keywords in static source code to protect Google SEO and privacy), and dynamic runtime overlay for Maintenance / Service Notice.`;

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
