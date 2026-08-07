import React, { useState } from 'react';
import { ShieldCheck, Lock, User, KeyRound, AlertCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { ADMIN_CONTACT } from '../lib/config';

export default function LoginScreen({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (username.trim() === 'digizier' && password === 'digizier123@#') {
      sessionStorage.setItem('website_controller_auth', 'true');
      onLoginSuccess();
    } else {
      setError('Invalid Username or Password. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4 selection:bg-emerald-500 selection:text-white relative overflow-hidden font-sans">
      
      {/* Background Decorative Gradient Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Glassmorphism Card */}
      <div className="bg-gray-900/90 border border-gray-800 rounded-3xl max-w-md w-full p-8 shadow-2xl backdrop-blur-xl relative z-10 space-y-6">
        
        {/* Branding Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-xl shadow-emerald-950 mx-auto">
            <div className="w-full h-full bg-gray-950 rounded-[14px] flex items-center justify-center">
              <ShieldCheck className="w-8 h-8 text-emerald-400" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Website Controller</h1>
            <p className="text-xs text-gray-400 mt-1">Admin Authentication Shield • {ADMIN_CONTACT.brand}</p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-300 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          
          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-emerald-400" /> Username
            </label>
            <input
              type="text"
              required
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-sm text-white focus:border-emerald-500 focus:outline-none transition font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-emerald-400" /> Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl pl-4 pr-11 py-3 text-sm text-white focus:border-emerald-500 focus:outline-none transition font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-400 transition p-1"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-950 transition disabled:opacity-50"
          >
            <span>{loading ? 'Authenticating...' : 'Unlock Controller Dashboard'}</span>
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>

        </form>

        {/* Footer */}
        <div className="text-center pt-2 border-t border-gray-800/60">
          <p className="text-[11px] text-gray-500">
            Protected System • Created by <span className="text-emerald-400 font-semibold">{ADMIN_CONTACT.name}</span>
          </p>
        </div>

      </div>

    </div>
  );
}
