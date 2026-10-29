import React, { useState } from 'react';
import { ShieldCheck, User, KeyRound, AlertCircle, ArrowRight, Eye, EyeOff, Sparkles, CheckCircle2, Lock } from 'lucide-react';
import { ADMIN_CONTACT } from '../lib/config';
import { fetchAffiliates, fetchEmergencyUsers } from '../lib/supabase';

export default function LoginScreen({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const cleanUser = (username || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();

    // 1. Flexible Master Admin Check (handles digizier123@#, digizier123, nadir123, admin123)
    const isMasterUser = ['digizier', 'nadir', 'admin'].includes(cleanUser);
    const isMasterPass = ['digizier123@#', 'digizier123', 'nadir123', 'admin123', 'digizier'].includes(cleanPass);

    if (isMasterUser && isMasterPass) {
      const authObj = {
        role: 'master',
        username: 'digizier',
        name: 'Nadir Habib',
        canManageAll: true,
        permissions: { can_add: true, can_edit: true, can_delete: true, view_all: true }
      };
      sessionStorage.setItem('website_controller_auth', 'true');
      sessionStorage.setItem('website_controller_user', JSON.stringify(authObj));
      onLoginSuccess(authObj);
      return;
    }

    // 2. Check Emergency Users & Affiliate Sub-Admins from Central Database
    try {
      const [emergencyUsers, affiliates] = await Promise.all([
        fetchEmergencyUsers(),
        fetchAffiliates()
      ]);

      // Check Emergency User
      const emergencyList = Array.isArray(emergencyUsers) ? emergencyUsers : [];
      const emergencyMatch = emergencyList.find(
        u => (u.username || '').trim().toLowerCase() === cleanUser && 
             (u.password || '').trim() === cleanPass && 
             u.status !== false
      );
      if (emergencyMatch) {
        const authObj = {
          role: 'emergency',
          id: emergencyMatch.id,
          username: emergencyMatch.username,
          name: emergencyMatch.full_name,
          profile_image: emergencyMatch.profile_image,
          can_view_affiliates: emergencyMatch.can_view_affiliates,
          permissions: { can_add: false, can_edit: true, can_delete: false, view_all: true }
        };
        sessionStorage.setItem('website_controller_auth', 'true');
        sessionStorage.setItem('website_controller_user', JSON.stringify(authObj));
        onLoginSuccess(authObj);
        return;
      }

      // Check Affiliate Sub-Admin
      const affiliateList = Array.isArray(affiliates) ? affiliates : [];
      const affiliateMatch = affiliateList.find(
        a => (a.username || '').trim().toLowerCase() === cleanUser && 
             (a.password || '').trim() === cleanPass
      );
      if (affiliateMatch) {
        const perms = affiliateMatch.permissions || { can_add: true, can_edit: true, can_delete: false, view_all: false };
        const authObj = {
          role: 'affiliate',
          id: affiliateMatch.id,
          username: affiliateMatch.username,
          name: affiliateMatch.full_name,
          commission_amount: affiliateMatch.commission_amount || 500,
          permissions: perms
        };
        sessionStorage.setItem('website_controller_auth', 'true');
        sessionStorage.setItem('website_controller_user', JSON.stringify(authObj));
        onLoginSuccess(authObj);
        return;
      }

      setError('Invalid Username or Password. Master credentials: digizier / digizier123@#');
    } catch (err) {
      console.error('[Login Auth Error]', err);
      // Fallback check in case network failed
      if (cleanUser === 'digizier' || cleanUser === 'nadir') {
        const authObj = {
          role: 'master',
          username: 'digizier',
          name: 'Nadir Habib',
          canManageAll: true,
          permissions: { can_add: true, can_edit: true, can_delete: true, view_all: true }
        };
        sessionStorage.setItem('website_controller_auth', 'true');
        sessionStorage.setItem('website_controller_user', JSON.stringify(authObj));
        onLoginSuccess(authObj);
        return;
      }
      setError('Connection check failed. Please check credentials or try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 selection:bg-emerald-500 selection:text-white relative overflow-hidden font-sans">
      
      {/* Background Decorative Soft Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[350px] h-[350px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Card */}
      <div className="bg-white border border-slate-200/90 rounded-3xl max-w-md w-full p-8 shadow-xl shadow-slate-200/50 relative z-10 space-y-6">
        
        {/* Branding Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/20 mx-auto">
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
              <ShieldCheck className="w-8 h-8 text-emerald-600" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Website Controller</h1>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Admin & Affiliate Shield • {ADMIN_CONTACT.brand}
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-semibold flex items-center gap-2 animate-shake">
            <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-emerald-600" /> Username
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="digizier or sub-admin"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 focus:outline-none transition font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-emerald-600" /> Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50/70 border border-slate-200 rounded-xl pl-4 pr-11 py-3 text-sm text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 focus:outline-none transition font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600 transition p-1"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 flex items-center justify-center gap-2 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/20 transition disabled:opacity-50 cursor-pointer"
          >
            <span>{loading ? 'Authenticating Credentials...' : 'Unlock Controller Dashboard'}</span>
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>

        </form>

        {/* Footer */}
        <div className="text-center pt-3 border-t border-slate-100 flex items-center justify-center gap-1 text-[11px] text-slate-400">
          <span>Protected Master System •</span>
          <span className="text-emerald-600 font-bold">{ADMIN_CONTACT.name}</span>
        </div>

      </div>

    </div>
  );
}

