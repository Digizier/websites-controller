import React, { useState } from 'react';
import { X, Key, Database, Globe, Copy, Check, ShieldCheck, Terminal, Sparkles, Eye, EyeOff } from 'lucide-react';
import { 
  SUPABASE_URL, 
  SUPABASE_ANON_KEY, 
  SUPABASE_SERVICE_KEY, 
  CRON_JOB_API_KEY, 
  ADMIN_CONTACT 
} from '../lib/config';

export default function MasterCredentialsModal({ isOpen, onClose }) {
  const [copiedKey, setCopiedKey] = useState('');
  const [showSensitive, setShowSensitive] = useState(false);

  if (!isOpen) return null;

  const masterKeys = [
    { label: 'Central Controller Cloud Database URL', value: SUPABASE_URL, keyName: 'url', color: 'text-slate-900 font-bold' },
    { label: 'Publishable Key', value: 'sb_publishable_XpYfaWv-_LNXEyJ5YAmRuw_q0wfyI8d', keyName: 'pub', color: 'text-blue-700' },
    { label: 'Database Master Password', value: '5f-Dxpx6YmA?zgEds', isSensitive: true, keyName: 'pwd', color: 'text-amber-700' },
    { label: 'Direct Connection String (PostgreSQL)', value: 'postgresql://postgres:5f-Dxpx6YmA%3FzgEds@db.pggolsqtamtkafrpigfo.supabase.co:5432/postgres', isSensitive: true, keyName: 'conn', color: 'text-purple-700' },
    { label: 'CLI Setup Command', value: 'supabase link --project-ref pggolsqtamtkafrpigfo', keyName: 'cli', color: 'text-emerald-700' },
    { label: 'anon_key', value: SUPABASE_ANON_KEY, keyName: 'anon', color: 'text-slate-600' },
    { label: 'service_role_key', value: SUPABASE_SERVICE_KEY, isSensitive: true, keyName: 'service', color: 'text-rose-700' },
    { label: 'cron-job.org Master API Key', value: CRON_JOB_API_KEY, keyName: 'cron', color: 'text-blue-600' }
  ];

  const copyText = (txt, label) => {
    navigator.clipboard.writeText(txt);
    setCopiedKey(label);
    setTimeout(() => setCopiedKey(''), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in font-sans">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-3xl w-full p-6 shadow-2xl overflow-y-auto max-h-[90vh] text-slate-800 relative">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Nadir Habib — Digizier Owner Master Keys</h2>
              <p className="text-xs text-slate-500">Your central Website Controller Database & Cron-Job.org Master Credentials</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSensitive(!showSensitive)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-xs font-semibold rounded-xl text-slate-700 border border-slate-200 transition"
            >
              {showSensitive ? <EyeOff className="w-3.5 h-3.5 text-amber-600" /> : <Eye className="w-3.5 h-3.5 text-slate-500" />}
              <span>{showSensitive ? 'Hide Sensitive Keys' : 'Show Sensitive Keys'}</span>
            </button>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Copy Notification Toast */}
        {copiedKey && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 font-bold text-xs flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Successfully copied {copiedKey} to clipboard!</span>
          </div>
        )}

        {/* Keys Grid */}
        <div className="space-y-2.5 font-mono text-xs">
          {masterKeys.map((item, idx) => (
            <div key={idx} className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-3 hover:border-slate-300 transition">
              <div className="overflow-hidden">
                <div className="text-[11px] font-sans font-bold text-slate-500 mb-0.5">{item.label}</div>
                <div className={`truncate ${item.color}`}>
                  {item.isSensitive && !showSensitive ? '••••••••••••••••••••••••' : item.value}
                </div>
              </div>
              <button
                onClick={() => copyText(item.value, item.label)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 font-sans font-semibold rounded-xl text-xs transition flex-shrink-0 shadow-sm"
              >
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                Copy
              </button>
            </div>
          ))}
        </div>

        {/* Footer Info */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div>
            Created by <strong className="text-emerald-700 font-bold">{ADMIN_CONTACT.name}</strong> ({ADMIN_CONTACT.brand})
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs transition"
          >
            Close Window
          </button>
        </div>

      </div>
    </div>
  );
}
