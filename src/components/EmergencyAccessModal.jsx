import React, { useState } from 'react';
import { X, ShieldAlert, UserPlus, Trash2, Edit3, Check, Key, Phone, User, Image, Lock, ShieldCheck, Power } from 'lucide-react';
import { createEmergencyUser, updateEmergencyUser, deleteEmergencyUser } from '../lib/supabase';
import { compressImageToWebP } from '../lib/imageCompressor';

export default function EmergencyAccessModal({ emergencyUsers, isOpen, onClose, onRefresh }) {
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    full_name: '',
    phone: '',
    profile_image: '',
    can_view_affiliates: false,
    status: true
  });
  const [saving, setSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [imageCompressing, setImageCompressing] = useState(false);

  if (!isOpen) return null;

  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormData({
      username: '',
      password: '',
      full_name: '',
      phone: '',
      profile_image: '',
      can_view_affiliates: false,
      status: true
    });
    setShowAddForm(true);
  };

  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: user.password,
      full_name: user.full_name,
      phone: user.phone || '',
      profile_image: user.profile_image || '',
      can_view_affiliates: user.can_view_affiliates || false,
      status: user.status !== undefined ? user.status : true
    });
    setShowAddForm(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    setImageCompressing(true);
    try {
      // Compress client-side to lightweight WebP (< 30 KB)
      const webpDataUrl = await compressImageToWebP(file, 300, 0.75);
      setFormData(prev => ({ ...prev, profile_image: webpDataUrl }));
    } catch (err) {
      console.error('Image compression error:', err);
    } finally {
      setImageCompressing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      username: formData.username.trim(),
      password: formData.password.trim(),
      full_name: formData.full_name.trim(),
      phone: formData.phone.trim(),
      profile_image: formData.profile_image,
      can_view_affiliates: formData.can_view_affiliates,
      status: formData.status
    };

    if (editingUser) {
      await updateEmergencyUser(editingUser.id, payload);
    } else {
      await createEmergencyUser(payload);
    }

    setSaving(false);
    setShowAddForm(false);
    setEditingUser(null);
    onRefresh();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to revoke this emergency admin access?')) {
      await deleteEmergencyUser(id);
      onRefresh();
    }
  };

  const handleToggleStatus = async (user) => {
    const newStatus = !user.status;
    await updateEmergencyUser(user.id, { status: newStatus });
    onRefresh();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in font-sans">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-4xl w-full p-6 shadow-2xl overflow-y-auto max-h-[92vh] text-slate-800 relative">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Controller Access (Emergency Admins)</h2>
              <p className="text-xs text-slate-500">Trusted backup users who can reactivate sites & extend dates if you are unavailable</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!showAddForm && (
              <button
                onClick={handleOpenAdd}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs rounded-xl shadow-sm transition"
              >
                <UserPlus className="w-4 h-4" />
                <span>Add Emergency User</span>
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
                {editingUser ? 'Edit Emergency User' : 'Create Trusted Emergency Controller User'}
              </span>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="text-xs text-slate-500 hover:text-slate-800 font-semibold"
              >
                Cancel
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Asif Raza (Brother / Partner)"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Emergency Username *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. backup_nadir"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Emergency Password *</label>
                <input
                  type="text"
                  required
                  placeholder="Secret password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phone / WhatsApp</label>
                <input
                  type="text"
                  placeholder="03001234567"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Profile Image with WebP Compression */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Profile Photo (Auto-compressed to WebP &lt; 30 KB)</span>
                  {imageCompressing && <span className="text-amber-600 text-[11px] font-semibold animate-pulse">Compressing...</span>}
                </label>
                <div className="flex items-center gap-3">
                  {formData.profile_image ? (
                    <img
                      src={formData.profile_image}
                      alt="Preview"
                      className="w-10 h-10 rounded-full object-cover border border-amber-300"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-400">
                      <User className="w-5 h-5" />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-100 file:text-amber-800 hover:file:bg-amber-200 cursor-pointer"
                  />
                  {formData.profile_image && (
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, profile_image: '' }))}
                      className="text-xs text-rose-500 hover:underline"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Permissions Toggles */}
            <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2 text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.can_view_affiliates}
                  onChange={(e) => setFormData({ ...formData, can_view_affiliates: e.target.checked })}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <span className="font-semibold text-slate-800">
                  Allow this user to also view Sub-Admins / Affiliates
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.checked })}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <span className="font-semibold text-slate-800">
                  Account is Active (Can Login)
                </span>
              </label>
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
                disabled={saving || imageCompressing}
                className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl shadow-md transition disabled:opacity-50"
              >
                {saving ? 'Saving...' : (editingUser ? 'Update Emergency User' : 'Grant Emergency Access')}
              </button>
            </div>
          </form>
        )}

        {/* List of Emergency Users */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Active Emergency Access Admins ({emergencyUsers.length})
          </div>

          {emergencyUsers.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-slate-200 rounded-2xl">
              <ShieldAlert className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-600">No Emergency Access Admins Configured</p>
              <p className="text-xs text-slate-400 mt-1">
                Add a trusted person who can reactivate websites if you ever lose access.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {emergencyUsers.map((user) => (
                <div key={user.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 hover:border-amber-300 transition">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {user.profile_image ? (
                        <img
                          src={user.profile_image}
                          alt={user.full_name}
                          className="w-11 h-11 rounded-full object-cover border-2 border-amber-400 shadow-sm"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center font-bold text-amber-800 text-sm">
                          {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'E'}
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                          <span>{user.full_name}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${user.status !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
                            {user.status !== false ? 'Active' : 'Disabled'}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                          <span>User: <strong className="text-slate-700 font-mono">{user.username}</strong></span>
                          <span>•</span>
                          <span>Pass: <strong className="text-slate-700 font-mono">{user.password}</strong></span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleToggleStatus(user)}
                        className={`p-1.5 rounded-lg transition ${user.status !== false ? 'text-emerald-600 hover:bg-emerald-50' : 'text-slate-400 hover:bg-slate-200'}`}
                        title={user.status !== false ? 'Disable Account' : 'Enable Account'}
                      >
                        <Power className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(user)}
                        className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                        title="Edit User"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Revoke Access"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-200/80 flex items-center justify-between">
                    <span>Phone: {user.phone || 'N/A'}</span>
                    <span className="text-slate-600 font-semibold">
                      {user.can_view_affiliates ? '✓ Sub-Admin View Enabled' : '✖ Sub-Admin View Disabled'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
