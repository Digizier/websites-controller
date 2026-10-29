import React, { useState } from 'react';
import { X, Hammer, CheckCircle2, AlertTriangle, ShieldAlert, Sparkles, MessageSquare } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function BulkEmergencyStatusModal({ isOpen, clients = [], onClose, onRefresh }) {
  if (!isOpen) return null;

  const [bulkMode, setBulkMode] = useState('under_construction'); // 'under_construction' or 'activate'
  const [customNotice, setCustomNotice] = useState('All client websites are currently undergoing scheduled maintenance. Access will be restored shortly.');
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resultMsg, setResultMsg] = useState('');

  const handleBulkExecute = async () => {
    setLoading(true);
    setResultMsg('');

    try {
      if (bulkMode === 'under_construction') {
        const { error } = await supabase
          .from('client_websites')
          .update({
            status: false,
            lock_mode: 'under_construction',
            custom_notice: customNotice
          })
          .neq('id', '00000000-0000-0000-0000-000000000000'); // Updates all rows

        if (error) throw error;
        setResultMsg(`Successfully put all ${clients.length} websites into Under Construction mode.`);
      } else {
        const { error } = await supabase
          .from('client_websites')
          .update({
            status: true,
            lock_mode: 'payment'
          })
          .neq('id', '00000000-0000-0000-0000-000000000000'); // Updates all rows

        if (error) throw error;
        setResultMsg(`Successfully restored all ${clients.length} websites to Live & Active.`);
      }

      await onRefresh();
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      console.error('[Bulk Action Error]', err);
      setResultMsg('Failed to apply bulk update: ' + (err.message || 'Error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in font-sans">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl text-slate-800 relative space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
              bulkMode === 'under_construction' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}>
              {bulkMode === 'under_construction' ? <Hammer className="w-5 h-5 text-amber-600" /> : <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Emergency Bulk Maintenance Switch</h3>
              <p className="text-xs text-slate-400">Total websites affected: <strong className="text-slate-800">{clients.length} sites</strong></p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Choice */}
        <div className="space-y-2.5">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
            Select Bulk Action:
          </label>

          <div
            onClick={() => setBulkMode('under_construction')}
            className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-start gap-3 ${
              bulkMode === 'under_construction' ? 'bg-blue-50/70 border-blue-400 shadow-xs' : 'bg-white border-slate-200 hover:bg-slate-50'
            }`}
          >
            <input 
              type="radio" 
              name="bulk_mode" 
              checked={bulkMode === 'under_construction'} 
              onChange={() => setBulkMode('under_construction')}
              className="mt-1 text-blue-600 focus:ring-blue-500" 
            />
            <div>
              <div className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                <Hammer className="w-3.5 h-3.5 text-blue-600" />
                <span>Put ALL Websites Under Construction</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Immediately displays the blue Maintenance Screen on every connected client website.
              </p>
            </div>
          </div>

          <div
            onClick={() => setBulkMode('activate')}
            className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-start gap-3 ${
              bulkMode === 'activate' ? 'bg-emerald-50/70 border-emerald-400 shadow-xs' : 'bg-white border-slate-200 hover:bg-slate-50'
            }`}
          >
            <input 
              type="radio" 
              name="bulk_mode" 
              checked={bulkMode === 'activate'} 
              onChange={() => setBulkMode('activate')}
              className="mt-1 text-emerald-600 focus:ring-emerald-500" 
            />
            <div>
              <div className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Restore ALL Websites to Live (Active)</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Removes the under-construction lock from all websites and restores public browsing.
              </p>
            </div>
          </div>
        </div>

        {/* Custom Notice for Bulk Maintenance */}
        {bulkMode === 'under_construction' && (
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
                <span>Bulk Custom Maintenance Notice</span>
              </label>
              <span className="text-[10px] text-slate-400">Applies to all sites</span>
            </div>
            <textarea
              rows="2"
              value={customNotice}
              onChange={(e) => setCustomNotice(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-medium"
            />
          </div>
        )}

        {/* Result status */}
        {resultMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl animate-fade-in">
            {resultMsg}
          </div>
        )}

        {/* Warning & Confirmation */}
        <div className="space-y-3">
          <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>This is a global action that updates all <strong>{clients.length} websites</strong> in real time.</span>
          </div>

          <label className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-emerald-500"
            />
            <span className="text-xs font-semibold text-slate-700">
              Yes, I confirm applying this bulk action to all {clients.length} websites.
            </span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!confirmed || loading}
            onClick={handleBulkExecute}
            className={`px-5 py-2 text-xs font-bold rounded-xl shadow-md transition disabled:opacity-40 cursor-pointer text-white ${
              bulkMode === 'under_construction' ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/20' : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20'
            }`}
          >
            {loading ? 'Executing Update...' : 'Yes, Confirm Bulk Action'}
          </button>
        </div>

      </div>
    </div>
  );
}
