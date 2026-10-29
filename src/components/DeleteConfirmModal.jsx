import React, { useState } from 'react';
import { AlertTriangle, Trash2, X, ShieldAlert } from 'lucide-react';

export default function DeleteConfirmModal({ client, isOpen, onClose, onConfirm }) {
  const [confirmInput, setConfirmInput] = useState('');
  const [deleting, setDeleting] = useState(false);

  if (!isOpen || !client) return null;

  const isMatched = confirmInput.trim() === 'DELETE';

  const handleDelete = async () => {
    if (!isMatched) return;
    setDeleting(true);
    await onConfirm(client);
    setDeleting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in font-sans">
      <div className="bg-white border border-rose-200 rounded-3xl max-w-md w-full p-6 shadow-2xl text-slate-800 relative">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Delete Client Website</h2>
              <p className="text-xs text-slate-400">Confirmation required</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Warning Card */}
        <div className="space-y-4">
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3.5 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-rose-800 leading-relaxed font-medium">
              You are about to permanently delete <strong className="text-slate-900">{client.website_name}</strong> (<code className="font-mono text-rose-700 font-bold">{client.site_key}</code>) from your Controller and Central Cloud Database.
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              To confirm deletion, please type <span className="text-rose-600 font-mono font-bold">DELETE</span> below:
            </label>
            <input
              type="text"
              placeholder="Type DELETE"
              value={confirmInput}
              onChange={(e) => setConfirmInput(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-rose-500 rounded-xl px-3.5 py-2.5 font-mono text-sm text-rose-600 focus:outline-none"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs transition"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!isMatched || deleting}
            onClick={handleDelete}
            className="flex items-center gap-1.5 px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold text-xs shadow-md transition disabled:opacity-40"
          >
            <Trash2 className="w-4 h-4" />
            {deleting ? 'Deleting...' : 'Delete Permanently'}
          </button>
        </div>

      </div>
    </div>
  );
}
