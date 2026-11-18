import React, { useState, useEffect } from 'react';
import { X, User, Phone, MessageSquare, ShieldCheck, Check, Sparkles, AlertCircle, Save, CreditCard } from 'lucide-react';
import { fetchMasterProfile, updateMasterProfile } from '../lib/supabase';
import { ADMIN_CONTACT } from '../lib/config';
import {
  DEFAULT_PAYMENT_ACCOUNTS,
  getStoredPaymentAccounts,
  saveStoredPaymentAccounts,
  unpackProfileData,
  packProfileData
} from '../lib/paymentAccounts';

export default function MasterProfileModal({ isOpen, onClose, onUpdated }) {
  if (!isOpen) return null;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: 'Nadir Habib',
    phone: '03222685868',
    whatsapp: '923222685868',
    brand: 'Digizier • Nadir Habib Protection System',
    owner_role: 'Digizier Owner',
    default_payment_notice: 'Your monthly website hosting subscription is currently locked. To unlock and restore access immediately, please contact Nadir Habib.',
    default_construction_notice: 'This website is currently undergoing scheduled maintenance or system upgrades. Access will be restored shortly.'
  });

  const [paymentAccounts, setPaymentAccounts] = useState(getStoredPaymentAccounts());

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    const data = await fetchMasterProfile();
    if (data) {
      const { note, accounts } = unpackProfileData(data);
      setFormData(prev => ({
        ...prev,
        ...data,
        default_payment_notice: note || prev.default_payment_notice,
        default_construction_notice: data.default_construction_notice || prev.default_construction_notice
      }));
      if (accounts) {
        setPaymentAccounts(accounts);
      }
    }
    setLoading(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);

    try {
      // Save payment accounts locally
      saveStoredPaymentAccounts(paymentAccounts);

      // Pack payment accounts into default_payment_notice JSON for cross-device cloud sync
      const packedNotice = packProfileData(formData.default_payment_notice, paymentAccounts);

      const payload = {
        ...formData,
        default_payment_notice: packedNotice
      };

      const res = await updateMasterProfile(payload);
      if (res) {
        setSuccess(true);
        if (onUpdated) onUpdated(res);
        setTimeout(() => {
          setSuccess(false);
          onClose();
        }, 1200);
      } else {
        setError('Failed to update master profile. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'Error updating profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in font-sans">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl text-slate-800 relative space-y-5 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Master Owner Profile & Contact</h3>
              <p className="text-xs text-slate-400">Controls live lock screens and 1-Click WhatsApp Dispatcher accounts</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Status Note */}
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Yahan se aapka phone aur payment accounts (JazzCash / EasyPaisa / Bank) <strong>WhatsApp Dispatcher aur client websites par real-time sync</strong> ho jate hain!
          </p>
        </div>

        {/* Success Alert */}
        {success && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold flex items-center gap-2 animate-fade-in">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Master Profile & Payment Accounts successfully updated!</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Owner Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Role / Designation</label>
              <input
                type="text"
                required
                value={formData.owner_role}
                onChange={(e) => setFormData({ ...formData, owner_role: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Local Phone Display</label>
              <input
                type="text"
                required
                placeholder="03222685868"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">WhatsApp International Format</label>
              <input
                type="text"
                required
                placeholder="923222685868"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Brand Name & Protection Tag</label>
            <input
              type="text"
              required
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Payment Receiving Accounts Section */}
          <div className="pt-3 border-t border-slate-100 space-y-3">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              <div>
                <span className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Payment Receiving Accounts
                </span>
                <span className="block text-[11px] text-slate-500">
                  Yeh accounts 1-Click WhatsApp Dispatcher messages me dynamically include honge
                </span>
              </div>
            </div>

            {/* JazzCash Card */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span>🏦</span> JazzCash Account
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={paymentAccounts.jazzcash.enabled}
                    onChange={(e) => setPaymentAccounts({
                      ...paymentAccounts,
                      jazzcash: { ...paymentAccounts.jazzcash, enabled: e.target.checked }
                    })}
                    className="sr-only peer"
                  />
                  <div className="w-8 h-4 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <span className="block text-[10px] text-slate-500 font-semibold mb-0.5">JazzCash Number</span>
                  <input
                    type="text"
                    value={paymentAccounts.jazzcash.number}
                    onChange={(e) => setPaymentAccounts({
                      ...paymentAccounts,
                      jazzcash: { ...paymentAccounts.jazzcash, number: e.target.value }
                    })}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <span className="block text-[10px] text-slate-500 font-semibold mb-0.5">Account Title / Holder</span>
                  <input
                    type="text"
                    value={paymentAccounts.jazzcash.title}
                    onChange={(e) => setPaymentAccounts({
                      ...paymentAccounts,
                      jazzcash: { ...paymentAccounts.jazzcash, title: e.target.value }
                    })}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* EasyPaisa Card */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span>📱</span> EasyPaisa Account
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={paymentAccounts.easypaisa.enabled}
                    onChange={(e) => setPaymentAccounts({
                      ...paymentAccounts,
                      easypaisa: { ...paymentAccounts.easypaisa, enabled: e.target.checked }
                    })}
                    className="sr-only peer"
                  />
                  <div className="w-8 h-4 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <span className="block text-[10px] text-slate-500 font-semibold mb-0.5">EasyPaisa Number</span>
                  <input
                    type="text"
                    value={paymentAccounts.easypaisa.number}
                    onChange={(e) => setPaymentAccounts({
                      ...paymentAccounts,
                      easypaisa: { ...paymentAccounts.easypaisa, number: e.target.value }
                    })}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <span className="block text-[10px] text-slate-500 font-semibold mb-0.5">Account Title / Holder</span>
                  <input
                    type="text"
                    value={paymentAccounts.easypaisa.title}
                    onChange={(e) => setPaymentAccounts({
                      ...paymentAccounts,
                      easypaisa: { ...paymentAccounts.easypaisa, title: e.target.value }
                    })}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Bank Card */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span>🏛️</span> Bank Transfer
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={paymentAccounts.bank.enabled}
                    onChange={(e) => setPaymentAccounts({
                      ...paymentAccounts,
                      bank: { ...paymentAccounts.bank, enabled: e.target.checked }
                    })}
                    className="sr-only peer"
                  />
                  <div className="w-8 h-4 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <span className="block text-[10px] text-slate-500 font-semibold mb-0.5">Bank Name</span>
                  <input
                    type="text"
                    value={paymentAccounts.bank.name}
                    onChange={(e) => setPaymentAccounts({
                      ...paymentAccounts,
                      bank: { ...paymentAccounts.bank, name: e.target.value }
                    })}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <span className="block text-[10px] text-slate-500 font-semibold mb-0.5">Account / IBAN</span>
                  <input
                    type="text"
                    value={paymentAccounts.bank.number}
                    onChange={(e) => setPaymentAccounts({
                      ...paymentAccounts,
                      bank: { ...paymentAccounts.bank, number: e.target.value }
                    })}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <span className="block text-[10px] text-slate-500 font-semibold mb-0.5">Account Title</span>
                  <input
                    type="text"
                    value={paymentAccounts.bank.title}
                    onChange={(e) => setPaymentAccounts({
                      ...paymentAccounts,
                      bank: { ...paymentAccounts.bank, title: e.target.value }
                    })}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700 mb-1">Default Payment Lock Notice</label>
            <textarea
              rows="2"
              value={formData.default_payment_notice}
              onChange={(e) => setFormData({ ...formData, default_payment_notice: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Default Under Construction Notice</label>
            <textarea
              rows="2"
              value={formData.default_construction_notice}
              onChange={(e) => setFormData({ ...formData, default_construction_notice: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Updating Live Profile...' : 'Save Master Profile'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
