import React, { useState } from 'react';
import { X, Users, UserPlus, Trash2, Edit3, Check, Shield, DollarSign, Key, Phone, User, CheckCircle2 } from 'lucide-react';
import { createAffiliate, updateAffiliate, deleteAffiliate } from '../lib/supabase';

export default function AffiliatesModal({ affiliates, clients, isOpen, onClose, onRefresh }) {
  const [editingAffiliate, setEditingAffiliate] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    full_name: '',
    phone: '',
    commission_amount: 500,
    can_add: true,
    can_edit: true,
    can_delete: false,
    view_all: false
  });
  const [saving, setSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  if (!isOpen) return null;

  const handleOpenAdd = () => {
    setEditingAffiliate(null);
    setFormData({
      username: '',
      password: '',
      full_name: '',
      phone: '',
      commission_amount: 500,
      can_add: true,
      can_edit: true,
      can_delete: false,
      view_all: false
    });
    setShowAddForm(true);
  };

  const handleOpenEdit = (aff) => {
    setEditingAffiliate(aff);
    const perms = aff.permissions || {};
    setFormData({
      username: aff.username,
      password: aff.password,
      full_name: aff.full_name,
      phone: aff.phone || '',
      commission_amount: aff.commission_amount || 500,
      can_add: perms.can_add !== undefined ? perms.can_add : true,
      can_edit: perms.can_edit !== undefined ? perms.can_edit : true,
      can_delete: perms.can_delete !== undefined ? perms.can_delete : false,
      view_all: perms.view_all !== undefined ? perms.view_all : false
    });
    setShowAddForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      username: formData.username.trim(),
      password: formData.password.trim(),
      full_name: formData.full_name.trim(),
      phone: formData.phone.trim(),
      commission_amount: Number(formData.commission_amount) || 500,
      permissions: {
        can_add: formData.can_add,
        can_edit: formData.can_edit,
        can_delete: formData.can_delete,
        view_all: formData.view_all
      }
    };

    if (editingAffiliate) {
      await updateAffiliate(editingAffiliate.id, payload);
    } else {
      await createAffiliate(payload);
    }

    setSaving(false);
    setShowAddForm(false);
    setEditingAffiliate(null);
    onRefresh();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this sub-admin / affiliate?')) {
      await deleteAffiliate(id);
      onRefresh();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in font-sans">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-4xl w-full p-6 shadow-2xl overflow-y-auto max-h-[92vh] text-slate-800 relative">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Affiliate Clients & Sub-Admins</h2>
              <p className="text-xs text-slate-500">Manage agent logins, commission rates & dashboard permissions</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!showAddForm && (
              <button
                onClick={handleOpenAdd}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-sm transition"
              >
                <UserPlus className="w-4 h-4" />
                <span>Add Sub-Admin</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Add / Edit Form */}
        {showAddForm && (
          <form onSubmit={handleSubmit} className="mb-8 p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <span className="text-sm font-bold text-slate-800">
                {editingAffiliate ? 'Edit Sub-Admin Account' : 'Create New Sub-Admin / Affiliate Account'}
              </span>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="text-xs text-slate-500 hover:text-slate-800 font-semibold"
              >
                Cancel
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Usman Habib"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Username *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. usman_agent"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Password *</label>
                <input
                  type="text"
                  required
                  placeholder="Secret password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Commission (PKR) *</label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    placeholder="500"
                    value={formData.commission_amount}
                    onChange={(e) => setFormData({ ...formData, commission_amount: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 font-bold"
                  />
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">₨</span>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">WhatsApp / Phone</label>
                <input
                  type="text"
                  placeholder="03001234567"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Permissions Toggles */}
            <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3">
              <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
                <Shield className="w-3.5 h-3.5 text-indigo-600" />
                <span>Dashboard Permissions for this Sub-Admin</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <label className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-100 transition">
                  <input
                    type="checkbox"
                    checked={formData.can_add}
                    onChange={(e) => setFormData({ ...formData, can_add: e.target.checked })}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="font-semibold text-slate-800">Can Add Clients</span>
                </label>

                <label className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-100 transition">
                  <input
                    type="checkbox"
                    checked={formData.can_edit}
                    onChange={(e) => setFormData({ ...formData, can_edit: e.target.checked })}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="font-semibold text-slate-800">Can Edit Clients</span>
                </label>

                <label className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-100 transition">
                  <input
                    type="checkbox"
                    checked={formData.can_delete}
                    onChange={(e) => setFormData({ ...formData, can_delete: e.target.checked })}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="font-semibold text-slate-800">Can Delete Clients</span>
                </label>

                <label className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-100 transition">
                  <input
                    type="checkbox"
                    checked={formData.view_all}
                    onChange={(e) => setFormData({ ...formData, view_all: e.target.checked })}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="font-semibold text-slate-800">View All Clients (vs Own Only)</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md transition disabled:opacity-50"
              >
                {saving ? 'Saving...' : (editingAffiliate ? 'Update Sub-Admin' : 'Create Sub-Admin')}
              </button>
            </div>
          </form>
        )}

        {/* List of Sub-Admins */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
            <span>Existing Sub-Admins ({affiliates.length})</span>
          </div>

          {affiliates.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-slate-200 rounded-2xl">
              <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-600">No Sub-Admins or Affiliates Yet</p>
              <p className="text-xs text-slate-400 mt-1">Click "Add Sub-Admin" above to create an agent login.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {affiliates.map((aff) => {
                const perms = aff.permissions || {};
                const clientCount = clients.filter(c => c.affiliate_id === aff.id).length;
                const totalCommission = clientCount * (Number(aff.commission_amount) || 500);

                return (
                  <div key={aff.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 hover:border-indigo-300 transition">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-100/70 border border-indigo-200 flex items-center justify-center font-bold text-indigo-700 text-sm">
                          {aff.full_name ? aff.full_name.charAt(0).toUpperCase() : 'A'}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900">{aff.full_name}</div>
                          <div className="text-xs text-slate-500 flex items-center gap-2">
                            <span>User: <strong className="text-slate-700 font-mono">{aff.username}</strong></span>
                            <span>•</span>
                            <span>Pass: <strong className="text-slate-700 font-mono">{aff.password}</strong></span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(aff)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                          title="Edit Sub-Admin"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(aff.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Delete Sub-Admin"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Stats & Commission */}
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200/80 text-center">
                      <div className="bg-white p-2 rounded-xl border border-slate-200">
                        <div className="text-[10px] text-slate-400 uppercase font-bold">Commission</div>
                        <div className="text-xs font-black text-emerald-600 mt-0.5">₨ {aff.commission_amount || 500}</div>
                      </div>
                      <div className="bg-white p-2 rounded-xl border border-slate-200">
                        <div className="text-[10px] text-slate-400 uppercase font-bold">Referred Sites</div>
                        <div className="text-xs font-black text-slate-800 mt-0.5">{clientCount} Sites</div>
                      </div>
                      <div className="bg-white p-2 rounded-xl border border-slate-200">
                        <div className="text-[10px] text-slate-400 uppercase font-bold">Total Earned</div>
                        <div className="text-xs font-black text-indigo-600 mt-0.5">₨ {totalCommission}</div>
                      </div>
                    </div>

                    {/* Permissions Badges */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {perms.can_add && (
                        <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md">
                          + Add Client
                        </span>
                      )}
                      {perms.can_edit && (
                        <span className="text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-md">
                          ✎ Edit Client
                        </span>
                      )}
                      {perms.can_delete && (
                        <span className="text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-md">
                          ✖ Delete
                        </span>
                      )}
                      <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-md">
                        {perms.view_all ? '👁 Sees All Sites' : '🔒 Own Sites Only'}
                      </span>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
