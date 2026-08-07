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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-3xl w-full p-6 shadow-2xl overflow-y-auto max-h-[90vh] text-gray-100 relative">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-800 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Website Controller - Step-by-Step Master Guide</h2>
              <p className="text-xs text-gray-400">Complete A to Z guide for managing client websites, Supabase keys & Cron Jobs</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6 text-sm text-gray-300">
          
          {/* Step 1 */}
          <div className="bg-gray-950/80 border border-gray-800 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <span className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-xs">1</span>
              <span>Step 1: Adding a New Client Website</span>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed pl-8">
              Click on the green <strong>"Add Client Website"</strong> button. Fill in client name, phone number, website name, and target website URL. Select the expiry date (e.g. 17th of next month).
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-gray-950/80 border border-gray-800 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <span className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center text-xs">2</span>
              <span>Step 2: Fill Mandatory Supabase Credentials & Keys</span>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed pl-8">
              Enter all mandatory Supabase keys in the form: Supabase URL, Publishable Key, Database Password, Direct Connection String, CLI Setup, anon_key, and service_role_key. All keys are synchronized directly to your cloud database.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-gray-950/80 border border-gray-800 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
              <span className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-xs">3</span>
              <span>Step 3: Automatic Daily Keep-Alive Cron Job (12:00 AM)</span>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed pl-8">
              Upon clicking Save, the system connects to <code>cron-job.org</code> API using your key and creates a daily genuine browser ping scheduled at 12:00 AM Midnight. The title is formatted as:
              <br />
              <code className="text-emerald-300 font-mono text-[11px] bg-gray-900 p-1.5 rounded block mt-1">
                [Keep-Alive] Client: Client Name | Site: Website Name (site_key) | Active Until: Expiry Date
              </code>
            </p>
          </div>

          {/* Step 4 */}
          <div className="bg-gray-950/80 border border-gray-800 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
              <span className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-xs">4</span>
              <span>Step 4: Embedding Protection in Client Website</span>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed pl-8">
              Click on the <code>&lt;/&gt;</code> button for any client row, copy the generated Antigravity prompt, and paste it into the client website project. Antigravity will automatically inject the first-layer lock controller into the website header.
            </p>
          </div>

          {/* Step 5 */}
          <div className="bg-gray-950/80 border border-gray-800 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
              <span className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center text-xs">5</span>
              <span>Step 5: Safe Deletion Feature (Type DELETE)</span>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed pl-8">
              To delete a client, click the trash icon. A custom glassmorphism modal will open asking you to type <strong>DELETE</strong>. This prevents accidental deletion while removing records from both Supabase Cloud and cron-job.org.
            </p>
          </div>

          {/* Footer Contact */}
          <div className="p-4 bg-emerald-950/30 border border-emerald-500/30 rounded-xl flex items-center justify-between">
            <div className="text-xs text-gray-300">
              Created by <strong className="text-emerald-400">{ADMIN_CONTACT.name}</strong> • DG ZIYAR First Layer System
            </div>
            <a
              href="https://wa.me/923222685868"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-bold text-emerald-400 hover:underline"
            >
              WhatsApp: {ADMIN_CONTACT.phone}
            </a>
          </div>

        </div>

        <div className="mt-6 pt-4 border-t border-gray-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-semibold text-xs transition"
          >
            Close Guide
          </button>
        </div>

      </div>
    </div>
  );
}
