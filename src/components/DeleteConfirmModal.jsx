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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-gray-900 border border-red-500/40 rounded-2xl max-w-md w-full p-6 shadow-2xl overflow-hidden text-gray-100 relative">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-800 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Delete Client Website</h2>
              <p className="text-xs text-gray-400">Confirmation required</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Warning Card */}
        <div className="space-y-4">
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3.5 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-red-200 leading-relaxed">
              You are about to permanently delete <strong className="text-white">{client.website_name}</strong> (<code className="font-mono text-emerald-300">{client.site_key}</code>) from your Controller and Supabase Cloud Database.
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-2">
              To confirm deletion, please type <span className="text-red-400 font-mono font-bold">DELETE</span> below:
            </label>
            <input
              type="text"
              placeholder="Type DELETE"
              value={confirmInput}
              onChange={(e) => setConfirmInput(e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 focus:border-red-500 rounded-xl px-3.5 py-2.5 font-mono text-sm text-red-400 focus:outline-none"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-gray-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl font-medium text-xs transition"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!isMatched || deleting}
            onClick={handleDelete}
            className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-red-950 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-4 h-4" />
            {deleting ? 'Deleting from Supabase...' : 'Delete Permanently'}
          </button>
        </div>

      </div>
    </div>
  );
}
