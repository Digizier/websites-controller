import React, { useState } from 'react';
import { X, BookOpen, ShieldCheck, Key, Clock, Code, Sparkles, Copy, Check, ExternalLink } from 'lucide-react';
import { ADMIN_CONTACT } from '../lib/config';

export default function GuidanceModal({ isOpen, onClose }) {
  const [copiedSection, setCopiedSection] = useState('');

  if (!isOpen) return null;

  const copyText = (txt, label) => {
    navigator.clipboard.writeText(txt);
    setCopiedSection(label);
    setTimeout(() => setCopiedSection(''), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in font-sans">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-3xl w-full p-6 shadow-2xl overflow-y-auto max-h-[90vh] text-slate-800 relative">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Website Controller - Master User Guide</h2>
              <p className="text-xs text-slate-500">Complete A to Z guide for managing client websites, sub-admins, domains & Cron Jobs</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4 text-sm text-slate-700">
          
          {/* Step 1 */}
          <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase tracking-wider">
              <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-xs">1</span>
              <span>Adding a New Client Website</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed pl-7">
              Click the green <strong>"Add Client Website"</strong> button. Fill in client name, phone number, location, website name, and target website URL. Select the expiry date (e.g. 30 days ahead).
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs uppercase tracking-wider">
              <span className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-xs">2</span>
              <span>Domain Expiry Tracking</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed pl-7">
              Add domain purchase and expiry dates in the Domain Tracker tab. When a domain is within 30 days of expiring, it automatically moves to the <strong>Domain Alerts</strong> warning list.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-blue-700 font-bold text-xs uppercase tracking-wider">
              <span className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-xs">3</span>
              <span>Universal Keep-Alive Cron Job (Daily 12:00 AM)</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed pl-7">
              The system connects to <code>cron-job.org</code> targeting the client's <code>/storage/v1/status</code> endpoint. This delivers 100% 200 OK responses with 0 payload size and keeps Supabase databases active 24/7.
            </p>
          </div>

          {/* Step 4 */}
          <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-amber-700 font-bold text-xs uppercase tracking-wider">
              <span className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center text-xs">4</span>
              <span>Affiliate Sub-Admins & Emergency Access</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed pl-7">
              Create sub-admin logins with custom commission rates (PKR 500 or 1000) and permissions. Create Emergency Access users with WebP profile images who can reactivate sites if you are unavailable.
            </p>
          </div>

          {/* Step 5 */}
          <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-rose-700 font-bold text-xs uppercase tracking-wider">
              <span className="w-5 h-5 rounded-full bg-rose-100 flex items-center justify-center text-xs">5</span>
              <span>Anti-Cache Lock & 1-Click WhatsApp Reminders</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed pl-7">
              The updated Antigravity prompt features timestamp cache-busting so reactivated sites unlock instantly on client phones. Send 1-click WhatsApp payment & domain reminders with pre-filled professional templates.
            </p>
          </div>

          {/* Footer Contact */}
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
            <div className="text-xs text-emerald-950 font-medium">
              Created by <strong className="text-emerald-700 font-bold">{ADMIN_CONTACT.name}</strong> • {ADMIN_CONTACT.brand}
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold rounded-xl text-xs transition"
            >
              Got It
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
