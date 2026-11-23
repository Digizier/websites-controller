import React, { useState, useEffect } from 'react';
import { ShieldCheck, User, KeyRound, AlertCircle, ArrowRight, Eye, EyeOff, Sparkles, CheckCircle2, Lock, Clock } from 'lucide-react';
import { ADMIN_CONTACT } from '../lib/config';
import { authenticateAffiliate, authenticateEmergencyUser } from '../lib/supabase';

// Cryptographic SHA-256 hash of Master Admin Password - zero plaintext leak
// Plaintext password is never saved in code, git commits, or bundled assets
const MASTER_PASSWORD_HASH = '2879f5eb0b3681fdfc1d4eb101ba6198734ee111b92aed7458fedd796965f594';
const MAX_FAILED_ATTEMPTS = 3;
const LOCKOUT_DURATION_MS = 5 * 60 * 1000; // 5 minutes wait
const STORAGE_ATTEMPTS_KEY = 'website_controller_failed_attempts';
const STORAGE_LOCKOUT_KEY = 'website_controller_lockout_until';

async function computeSha256(str) {
  const enc = new TextEncoder().encode(str);
  const buf = await crypto.subtle.digest('SHA-256', enc);
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export default function LoginScreen({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [lockoutRemaining, setLockoutRemaining] = useState(0);

  // Check 5-minute lockout status continuously
  useEffect(() => {
    const checkLockout = () => {
      const lockoutUntil = parseInt(localStorage.getItem(STORAGE_LOCKOUT_KEY) || '0', 10);
      const now = Date.now();
      if (lockoutUntil > now) {
        const remaining = Math.ceil((lockoutUntil - now) / 1000);
        setLockoutRemaining(remaining);
      } else {
        setLockoutRemaining(0);
        if (lockoutUntil !== 0) {
          localStorage.removeItem(STORAGE_LOCKOUT_KEY);
          localStorage.removeItem(STORAGE_ATTEMPTS_KEY);
        }
      }
    };

    checkLockout();
    const interval = setInterval(checkLockout, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatCountdown = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s < 10 ? '0' : ''}${s}s`;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (lockoutRemaining > 0) return;

    setError('');
    setLoading(true);

    const cleanUser = (username || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();

    // 1. Master Admin Check (Verified via zero-knowledge SHA-256 hash comparison)
    // ONLY username 'digizier' is allowed master access
    const isMasterUser = cleanUser === 'digizier';
    const passHash = await computeSha256(cleanPass);
    const isMasterPass = passHash === MASTER_PASSWORD_HASH;

    if (isMasterUser && isMasterPass) {
      // Clear brute-force counters on successful auth
      localStorage.removeItem(STORAGE_ATTEMPTS_KEY);
      localStorage.removeItem(STORAGE_LOCKOUT_KEY);

      const sessionToken = await computeSha256(cleanPass + '_digizier_master_session_salt');

      const authObj = {
        role: 'master',
        username: 'digizier',
        name: 'Nadir Habib',
        canManageAll: true,
        permissions: { can_add: true, can_edit: true, can_delete: true, view_all: true }
      };
      sessionStorage.setItem('website_controller_auth', 'true');
      sessionStorage.setItem('website_controller_token', sessionToken);
      sessionStorage.setItem('website_controller_user', JSON.stringify(authObj));
      onLoginSuccess(authObj);
      return;
    }

    // 2. Targeted Secure Auth: Check Emergency Users & Affiliates without pre-downloading tables
    try {
      const [emergencyMatch, affiliateMatch] = await Promise.all([
        authenticateEmergencyUser(cleanUser, cleanPass),
        authenticateAffiliate(cleanUser, cleanPass)
      ]);

      if (emergencyMatch) {
        localStorage.removeItem(STORAGE_ATTEMPTS_KEY);
        localStorage.removeItem(STORAGE_LOCKOUT_KEY);

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

      if (affiliateMatch) {
        localStorage.removeItem(STORAGE_ATTEMPTS_KEY);
        localStorage.removeItem(STORAGE_LOCKOUT_KEY);

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

      // Brute-force protection: Handle wrong attempt & enforce 5-minute lockout
      const currentAttempts = parseInt(localStorage.getItem(STORAGE_ATTEMPTS_KEY) || '0', 10) + 1;
      localStorage.setItem(STORAGE_ATTEMPTS_KEY, currentAttempts.toString());

      if (currentAttempts >= MAX_FAILED_ATTEMPTS) {
        const lockoutUntil = Date.now() + LOCKOUT_DURATION_MS;
        localStorage.setItem(STORAGE_LOCKOUT_KEY, lockoutUntil.toString());
        setLockoutRemaining(Math.ceil(LOCKOUT_DURATION_MS / 1000));
        setError('🚨 Maximum login attempts exceeded! System locked for 5 minutes for brute-force security.');
      } else {
        const remaining = MAX_FAILED_ATTEMPTS - currentAttempts;
        setError(`Invalid username or password. ⚠️ Warning: ${remaining} attempt${remaining > 1 ? 's' : ''} remaining before 5-minute security lockout.`);
      }
    } catch (err) {
      console.error('[Login Auth Error]', err);
      setError('Connection check failed. Please check your network and try again.');
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

        {/* 5-Minute Security Lockout Banner */}
        {lockoutRemaining > 0 ? (
          <div className="p-4 bg-rose-50 border-2 border-rose-300 rounded-2xl text-rose-800 text-xs space-y-2 animate-shake">
            <div className="flex items-center gap-2 text-rose-900">
              <Lock className="w-4 h-4 text-rose-600 animate-pulse flex-shrink-0" />
              <span className="font-extrabold text-sm">Security Lockout Active</span>
            </div>
            <p className="text-[11px] text-rose-700 leading-relaxed font-medium">
              Multiple incorrect login attempts detected. To prevent unauthorized brute-force attacks, login is temporarily suspended.
            </p>
            <div className="pt-1 flex items-center justify-between text-xs font-mono font-bold text-rose-950 bg-rose-100/80 px-3 py-2 rounded-xl border border-rose-200">
              <span className="flex items-center gap-1.5 font-sans font-semibold text-rose-800">
                <Clock className="w-3.5 h-3.5 text-rose-600 animate-spin" /> Next attempt in:
              </span>
              <span className="text-sm text-rose-900 font-extrabold">{formatCountdown(lockoutRemaining)}</span>
            </div>
          </div>
        ) : error && (
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
              disabled={loading || lockoutRemaining > 0}
              placeholder="digizier or sub-admin"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 focus:outline-none transition font-medium disabled:opacity-50 disabled:bg-slate-100 cursor-text"
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
                disabled={loading || lockoutRemaining > 0}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50/70 border border-slate-200 rounded-xl pl-4 pr-11 py-3 text-sm text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 focus:outline-none transition font-medium disabled:opacity-50 disabled:bg-slate-100 cursor-text"
              />
              <button
                type="button"
                disabled={loading || lockoutRemaining > 0}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600 transition p-1 disabled:opacity-40"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || lockoutRemaining > 0}
            className={`w-full mt-2 flex items-center justify-center gap-2 py-3.5 font-bold text-sm rounded-xl shadow-lg transition disabled:opacity-50 cursor-pointer text-white ${
              lockoutRemaining > 0
                ? 'bg-rose-500/80 shadow-rose-500/20 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20'
            }`}
          >
            <span>
              {lockoutRemaining > 0
                ? `System Locked (${formatCountdown(lockoutRemaining)})`
                : (loading ? 'Authenticating Credentials...' : 'Unlock Controller Dashboard')}
            </span>
            {lockoutRemaining === 0 && !loading && <ArrowRight className="w-4 h-4" />}
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

