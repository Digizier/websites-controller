import React, { useState } from 'react';
import { X, CheckCircle2, AlertTriangle, ShieldCheck, Hammer, Lock, Power, Sparkles, MessageSquare } from 'lucide-react';

export default function ConfirmStatusModal({ client, isOpen, targetAction: initialAction, onClose, onConfirm }) {
  if (!isOpen || !client) return null;

  const DEFAULT_CONSTRUCTION_MSG = 'This website is currently undergoing scheduled maintenance or system upgrades. Access will be restored shortly.';
  const DEFAULT_PAYMENT_MSG = 'Your monthly website hosting subscription is currently locked. To unlock and restore access immediately, please contact Nadir Habib.';

  // Selected mode: 'activate', 'under_construction', 'lock_payment'
  const [selectedMode, setSelectedMode] = useState(() => {
    if (initialAction) return initialAction;
    if (client.status === false && client.lock_mode === 'under_construction') return 'under_construction';
    if (client.status === false && client.lock_mode === 'payment') return 'lock_payment';
    return client.status ? 'under_construction' : 'activate';
  });

  const [customNotice, setCustomNotice] = useState(() => {
    if (client.custom_notice && client.custom_notice.trim()) {
      return client.custom_notice;
    }
    return (initialAction === 'lock_payment' || client.lock_mode === 'payment') ? DEFAULT_PAYMENT_MSG : DEFAULT_CONSTRUCTION_MSG;
  });
  const [confirmed, setConfirmed] = useState(false);

  const handleModeChange = (mode) => {
    setSelectedMode(mode);
    if (mode === 'lock_payment') {
      if (!customNotice || customNotice.toLowerCase().includes('maintenance') || customNotice.toLowerCase().includes('undergoing scheduled')) {
        setCustomNotice(DEFAULT_PAYMENT_MSG);
      }
    } else if (mode === 'under_construction') {
      if (!customNotice || customNotice.toLowerCase().includes('hosting subscription') || customNotice.toLowerCase().includes('payment')) {
        setCustomNotice(DEFAULT_CONSTRUCTION_MSG);
      }
    }
  };

  const handleAction = () => {
    onConfirm(selectedMode, customNotice);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in font-sans">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl text-slate-800 relative space-y-5 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
              selectedMode === 'activate' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
              selectedMode === 'under_construction' ? 'bg-blue-50 text-blue-700 border-blue-200' :
              'bg-rose-50 text-rose-700 border-rose-200'
            }`}>
              {selectedMode === 'activate' && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
              {selectedMode === 'under_construction' && <Hammer className="w-5 h-5 text-blue-600" />}
              {selectedMode === 'lock_payment' && <Lock className="w-5 h-5 text-rose-600" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Change Status & First-Layer Lock Mode</h3>
              <p className="text-xs text-slate-400">Target: <strong className="text-slate-700">{client.website_name}</strong> ({client.site_key})</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 3 Selectable Modes */}
        <div className="space-y-2.5">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
            Choose Status Action:
          </label>

          {/* 1. Live & Active */}
          <div 
            onClick={() => handleModeChange('activate')}
            className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-start gap-3 ${
              selectedMode === 'activate' 
                ? 'bg-emerald-50/70 border-emerald-400 shadow-xs' 
                : 'bg-white border-slate-200 hover:bg-slate-50'
            }`}
          >
            <input 
              type="radio" 
              name="lock_choice" 
              checked={selectedMode === 'activate'} 
              onChange={() => handleModeChange('activate')}
              className="mt-1 text-emerald-600 focus:ring-emerald-500" 
            />
            <div>
              <div className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>🟢 Make Website Live & Active</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Removes all locks immediately. Public visitors can browse the website freely without any overlay.
              </p>
            </div>
          </div>

          {/* 2. Under Construction Screen */}
          <div 
            onClick={() => handleModeChange('under_construction')}
            className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-start gap-3 ${
              selectedMode === 'under_construction' 
                ? 'bg-blue-50/70 border-blue-400 shadow-xs' 
                : 'bg-white border-slate-200 hover:bg-slate-50'
            }`}
          >
            <input 
              type="radio" 
              name="lock_choice" 
              checked={selectedMode === 'under_construction'} 
              onChange={() => handleModeChange('under_construction')}
              className="mt-1 text-blue-600 focus:ring-blue-500" 
            />
            <div>
              <div className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                <Hammer className="w-3.5 h-3.5 text-blue-600" />
                <span>🔵 Put Under Construction / Maintenance</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Displays a modern blue Maintenance Mode overlay with development tools icon, your custom notice, and admin contact number.
              </p>
            </div>
          </div>

          {/* 3. Payment Overdue Lock */}
          <div 
            onClick={() => handleModeChange('lock_payment')}
            className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-start gap-3 ${
              selectedMode === 'lock_payment' 
                ? 'bg-rose-50/70 border-rose-400 shadow-xs' 
                : 'bg-white border-slate-200 hover:bg-slate-50'
            }`}
          >
            <input 
              type="radio" 
              name="lock_choice" 
              checked={selectedMode === 'lock_payment'} 
              onChange={() => handleModeChange('lock_payment')}
              className="mt-1 text-rose-600 focus:ring-rose-500" 
            />
            <div>
              <div className="text-xs font-bold text-rose-950 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-rose-600" />
                <span>🔴 Lock Website — Payment Overdue</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Instantly locks access and displays the red Nadir Habib Payment Remaining overlay with direct 1-click WhatsApp payment recovery link.
              </p>
            </div>
          </div>
        </div>

        {/* Custom Notice Input for Under Construction or Payment Lock */}
        {selectedMode !== 'activate' && (
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
                <span>Custom Notice / Message</span>
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCustomNotice(selectedMode === 'lock_payment' ? DEFAULT_PAYMENT_MSG : DEFAULT_CONSTRUCTION_MSG)}
                  className="text-[10px] text-emerald-700 font-bold hover:underline"
                >
                  Reset Default
                </button>
                <span className="text-[10px] text-slate-400">• Supports Variables</span>
              </div>
            </div>
            <textarea
              rows="3"
              value={customNotice}
              onChange={(e) => setCustomNotice(e.target.value)}
              placeholder="e.g. Dear {client_name}, your website hosting access is currently locked..."
              className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-medium"
            />
            <div className="flex flex-wrap items-center justify-between gap-1 text-[10px]">
              <div className="flex flex-wrap gap-1 items-center">
                <span className="text-slate-400">Insert tag:</span>
                {['{client_name}', '{website_name}', '{phone}', '{admin_phone}'].map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setCustomNotice(prev => prev + ' ' + tag)}
                    className="bg-white hover:bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded border border-indigo-200 font-mono transition"
                  >
                    {tag}
                  </button>
                ))}
              </div>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setCustomNotice(DEFAULT_PAYMENT_MSG)}
                  className="text-rose-600 hover:text-rose-700 font-semibold cursor-pointer"
                >
                  Payment Msg
                </button>
                <span className="text-slate-300">|</span>
                <button
                  type="button"
                  onClick={() => setCustomNotice(DEFAULT_CONSTRUCTION_MSG)}
                  className="text-blue-600 hover:text-blue-700 font-semibold cursor-pointer"
                >
                  Maintenance Msg
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Checkbox */}
        <label className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            className="rounded text-emerald-600 focus:ring-emerald-500"
          />
          <span className="text-xs font-semibold text-slate-700">
            Yes, I confirm applying <strong className="text-slate-900">{
              selectedMode === 'activate' ? 'Live Mode' : selectedMode === 'under_construction' ? 'Under Construction' : 'Payment Lock'
            }</strong> to this website.
          </span>
        </label>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!confirmed}
            onClick={handleAction}
            className={`px-5 py-2 text-xs font-bold rounded-xl shadow-md transition disabled:opacity-40 cursor-pointer text-white ${
              selectedMode === 'activate' ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20' :
              selectedMode === 'under_construction' ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/20' :
              'bg-rose-600 hover:bg-rose-500 shadow-rose-600/20'
            }`}
          >
            Confirm & Save Status
          </button>
        </div>

      </div>
    </div>
  );
}
