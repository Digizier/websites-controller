import React, { useState } from 'react';
import { X, Key, Database, Globe, Copy, Check, ShieldCheck, Terminal, Sparkles } from 'lucide-react';
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
    { label: 'Central Controller Supabase URL', value: SUPABASE_URL, keyName: 'url', color: 'text-white' },
    { label: 'Publishable Key', value: 'sb_publishable_XpYfaWv-_LNXEyJ5YAmRuw_q0wfyI8d', keyName: 'pub', color: 'text-blue-300' },
    { label: 'Database Master Password', value: '5f-Dxpx6YmA?zgEds', isSensitive: true, keyName: 'pwd', color: 'text-amber-400' },
    { label: 'Direct Connection String (PostgreSQL)', value: 'postgresql://postgres:5f-Dxpx6YmA%3FzgEds@db.pggolsqtamtkafrpigfo.supabase.co:5432/postgres', isSensitive: true, keyName: 'conn', color: 'text-purple-300' },
    { label: 'CLI Setup Command', value: 'supabase link --project-ref pggolsqtamtkafrpigfo', keyName: 'cli', color: 'text-emerald-300' },
    { label: 'anon_key', value: SUPABASE_ANON_KEY, keyName: 'anon', color: 'text-gray-300' },
    { label: 'service_role_key', value: SUPABASE_SERVICE_KEY, isSensitive: true, keyName: 'service', color: 'text-red-300' },
    { label: 'cron-job.org Master API Key', value: CRON_JOB_API_KEY, keyName: 'cron', color: 'text-blue-400' }
  ];

  const copyText = (txt, label) => {
    navigator.clipboard.writeText(txt);
    setCopiedKey(label);
    setTimeout(() => setCopiedKey(''), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-gray-900 border border-emerald-500/40 rounded-2xl max-w-3xl w-full p-6 shadow-2xl overflow-y-auto max-h-[90vh] text-gray-100 relative">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-800 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Nader Habib - Master Controller Keys</h2>
              <p className="text-xs text-gray-400">Your central Website Controller Supabase & Cron-Job.org Master Credentials</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSensitive(!showSensitive)}
              className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-xs font-sans font-semibold rounded-lg text-amber-300 border border-amber-500/30"
            >
              {showSensitive ? 'Hide Sensitive Keys' : 'Show Sensitive Keys'}
            </button>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Copy Notification Toast */}
        {copiedKey && (
          <div className="mb-4 p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 font-bold text-xs flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>Successfully copied {copiedKey} to clipboard!</span>
          </div>
        )}

        {/* Keys Grid */}
        <div className="space-y-3 font-mono text-xs">
          {masterKeys.map((item, idx) => (
            <div key={idx} className="bg-gray-950 p-3.5 rounded-xl border border-gray-800 flex items-center justify-between gap-3 hover:border-gray-700 transition">
              <div className="overflow-hidden">
                <div className="text-[11px] font-sans font-bold text-gray-400 mb-0.5">{item.label}</div>
                <div className={`truncate ${item.color}`}>
                  {item.isSensitive && !showSensitive ? '••••••••••••••••••••••••' : item.value}
                </div>
              </div>
              <button
                onClick={() => copyText(item.value, item.label)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-emerald-400 font-sans font-semibold rounded-lg text-xs transition flex-shrink-0"
              >
                <Copy className="w-3.5 h-3.5" />
                Copy
              </button>
            </div>
          ))}
        </div>

        {/* Footer Info */}
        <div className="mt-6 pt-4 border-t border-gray-800 flex items-center justify-between text-xs text-gray-400">
          <div>
            Created by <strong className="text-emerald-400">{ADMIN_CONTACT.name}</strong> ({ADMIN_CONTACT.brand})
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-semibold text-xs transition"
          >
            Close Window
          </button>
        </div>

      </div>
    </div>
  );
}
