import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldCheck, Globe, Users, Clock, Lock, Plus, Search, Filter, 
  RefreshCw, Power, ExternalLink, Calendar, Code, Trash2, Edit3, 
  CheckCircle2, AlertCircle, Database, Phone, Mail, Sparkles, MessageCircle, BookOpen, Key, ChevronDown, ChevronUp, Copy, Check, LogOut, Cloud, Server, GitBranch
} from 'lucide-react';
import { 
  fetchClients, createClientWebsite, updateClientWebsite, 
  deleteClientWebsite, extendClientExpiry, checkSupabaseConnection 
} from './lib/supabase';
import { ADMIN_CONTACT } from './lib/config';
import { setCronJobStatus, deleteCronJob } from './lib/cronjob';
import ClientModal from './components/ClientModal';
import ScriptGeneratorModal from './components/ScriptGeneratorModal';
import DatabaseSetupModal from './components/DatabaseSetupModal';
import GuidanceModal from './components/GuidanceModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import MasterCredentialsModal from './components/MasterCredentialsModal';
import LoginScreen from './components/LoginScreen';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('website_controller_auth') === 'true';
  });

  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'locked', 'due_soon'
  
  const [selectedClientForScript, setSelectedClientForScript] = useState(null);
  const [editingClient, setEditingClient] = useState(null);
  const [deletingClient, setDeletingClient] = useState(null);
  const [expandedKeysClientId, setExpandedKeysClientId] = useState(null);
  
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isDbSetupOpen, setIsDbSetupOpen] = useState(false);
  const [isGuidanceOpen, setIsGuidanceOpen] = useState(false);
  const [isMasterKeysOpen, setIsMasterKeysOpen] = useState(false);
  const [dbConnected, setDbConnected] = useState(true);

  const [copiedKey, setCopiedKey] = useState('');

  // Load clients data safely with try/finally to prevent any loading hang
  const loadData = async () => {
    setLoading(true);
    try {
      const dbStatus = await checkSupabaseConnection();
      setDbConnected(dbStatus.connected);

      const data = await fetchClients();
      setClients(data || []);
    } catch (err) {
      console.error('[Load Error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  // Clean Logout Handler
  const handleLogout = () => {
    sessionStorage.removeItem('website_controller_auth');
    setClients([]);
    setLoading(false);
    setIsAuthenticated(false);
  };

  // If not authenticated, render Login Shield Screen
  if (!isAuthenticated) {
    return <LoginScreen onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  // Compute key stats metrics
  const metrics = useMemo(() => {
    const total = clients.length;
    const now = new Date();

    let activeCount = 0;
    let lockedCount = 0;
    let dueSoonCount = 0;

    clients.forEach(c => {
      const expiry = new Date(c.expiry_date);
      const isExpired = now > expiry;
      const isDisabled = c.status === false;

      if (isExpired || isDisabled) {
        lockedCount++;
      } else {
        activeCount++;
        const diffDays = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
        if (diffDays >= 0 && diffDays <= 7) {
          dueSoonCount++;
        }
      }
    });

    return { total, activeCount, lockedCount, dueSoonCount };
  }, [clients]);

  // Filter clients based on search & filter
  const filteredClients = useMemo(() => {
    return clients.filter(client => {
      const matchesSearch = 
        client.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.website_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.site_key.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (client.client_phone && client.client_phone.includes(searchQuery));

      if (!matchesSearch) return false;

      const now = new Date();
      const expiry = new Date(client.expiry_date);
      const isExpired = now > expiry;
      const isDisabled = client.status === false;
      const isLocked = isExpired || isDisabled;

      if (statusFilter === 'active') return !isLocked;
      if (statusFilter === 'locked') return isLocked;
      if (statusFilter === 'due_soon') {
        const diffDays = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
        return !isLocked && diffDays >= 0 && diffDays <= 7;
      }
      return true;
    });
  }, [clients, searchQuery, statusFilter]);

  // Toggle Client Active Status directly from table
  const handleToggleStatus = async (client) => {
    const newStatus = !client.status;
    await updateClientWebsite(client.id, { status: newStatus });
    setClients(prev => prev.map(c => c.id === client.id ? { ...c, status: newStatus } : c));
  };

  // Toggle Cron Job Enable/Disable
  const handleToggleCron = async (client) => {
    const newCronStatus = !client.cron_enabled;
    if (client.cron_job_id) {
      await setCronJobStatus(client.cron_job_id, newCronStatus, client.cron_api_key);
    }
    await updateClientWebsite(client.id, { cron_enabled: newCronStatus });
    setClients(prev => prev.map(c => c.id === client.id ? { ...c, cron_enabled: newCronStatus } : c));
  };

  // Quick Extend (+30 Days)
  const handleQuickExtend = async (client, days) => {
    await extendClientExpiry(client.id, client.expiry_date, days);
    loadData();
  };

  // Confirm and execute client deletion from Supabase & Cron Job
  const handleConfirmDelete = async (client) => {
    if (client.cron_job_id) {
      await deleteCronJob(client.cron_job_id, client.cron_api_key);
    }
    await deleteClientWebsite(client.id);
    setClients(prev => prev.filter(c => c.id !== client.id));
    setDeletingClient(null);
  };

  // Save Add/Edit Client
  const handleSaveClient = async (formData) => {
    if (editingClient) {
      await updateClientWebsite(editingClient.id, formData);
    } else {
      await createClientWebsite(formData);
    }
    setIsClientModalOpen(false);
    setEditingClient(null);
    loadData();
  };

  const copyText = (txt, label) => {
    navigator.clipboard.writeText(txt);
    setCopiedKey(label);
    setTimeout(() => setCopiedKey(''), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans antialiased selection:bg-emerald-500 selection:text-white">
      
      {/* Top Navigation Bar */}
      <header className="border-b border-gray-800/80 bg-gray-900/60 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-lg shadow-emerald-950">
              <div className="w-full h-full bg-gray-950 rounded-[14px] flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold text-white tracking-tight">Website Controller</h1>
                <span className="text-[10px] font-bold tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase">
                  v1.0 Pro
                </span>
              </div>
              <p className="text-xs text-gray-400 flex items-center gap-1.5 mt-0.5">
                <span>Created by</span>
                <span className="font-semibold text-emerald-300">Nader Habib</span>
                <span className="text-gray-600">•</span>
                <span className="text-gray-400">DG ZIYAR First Layer Controller</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* My Master Controller Keys Button */}
            <button
              onClick={() => setIsMasterKeysOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 text-xs font-semibold rounded-xl transition"
            >
              <Key className="w-4 h-4" />
              My Master Controller Keys
            </button>

            {/* Step-by-Step Guide Button */}
            <button
              onClick={() => setIsGuidanceOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 text-xs font-semibold rounded-xl transition"
            >
              <BookOpen className="w-4 h-4" />
              Step-by-Step Guide
            </button>

            {!dbConnected && (
              <button
                onClick={() => setIsDbSetupOpen(true)}
                className="flex items-center gap-2 px-3.5 py-2 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 text-xs font-semibold rounded-xl transition"
              >
                <Database className="w-4 h-4" />
                Setup Database Table
              </button>
            )}

            <button
              onClick={loadData}
              className="p-2.5 bg-gray-900 border border-gray-800 hover:border-gray-700 text-gray-300 rounded-xl transition"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
            </button>

            <button
              onClick={() => {
                setEditingClient(null);
                setIsClientModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-emerald-950 transition"
            >
              <Plus className="w-4 h-4" />
              Add Client Website
            </button>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="p-2.5 bg-gray-900 border border-gray-800 hover:bg-red-950/60 hover:border-red-500/40 text-red-400 rounded-xl transition"
              title="Log Out Admin Session"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          <div className="bg-gray-900/60 border border-gray-800/80 rounded-2xl p-5 relative overflow-hidden backdrop-blur-sm group hover:border-gray-700 transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Managed Sites</span>
              <div className="p-2.5 rounded-xl bg-gray-800/60 text-gray-300">
                <Globe className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-extrabold text-white">{metrics.total}</div>
              <div className="text-xs text-gray-400 mt-1">Integrated client websites</div>
            </div>
          </div>

          <div className="bg-gray-900/60 border border-gray-800/80 rounded-2xl p-5 relative overflow-hidden backdrop-blur-sm group hover:border-emerald-500/30 transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Active Websites</span>
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-extrabold text-emerald-400">{metrics.activeCount}</div>
              <div className="text-xs text-gray-400 mt-1">Live & fully operational</div>
            </div>
          </div>

          <div className="bg-gray-900/60 border border-gray-800/80 rounded-2xl p-5 relative overflow-hidden backdrop-blur-sm group hover:border-red-500/30 transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-red-400 uppercase tracking-wider">Locked / Expired</span>
              <div className="p-2.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
                <Lock className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-extrabold text-red-400">{metrics.lockedCount}</div>
              <div className="text-xs text-gray-400 mt-1">First-layer lock screen active</div>
            </div>
          </div>

          <div className="bg-gray-900/60 border border-gray-800/80 rounded-2xl p-5 relative overflow-hidden backdrop-blur-sm group hover:border-amber-500/30 transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Daily Keep-Alive Cron</span>
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Sparkles className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-extrabold text-amber-400">12:00 AM</div>
              <div className="text-xs text-gray-400 mt-1">Daily Midnight Ping Active</div>
            </div>
          </div>

        </div>

        {/* Filter Controls & Search Toolbar */}
        <div className="bg-gray-900/60 border border-gray-800/80 rounded-2xl p-4 backdrop-blur-sm flex flex-col md:flex-row items-center justify-between gap-4">
          
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Client, Website, Phone, Site Key..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none transition"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                statusFilter === 'all' 
                  ? 'bg-emerald-600 text-white shadow' 
                  : 'bg-gray-800 text-gray-400 hover:text-gray-200'
              }`}
            >
              All ({metrics.total})
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                statusFilter === 'active' 
                  ? 'bg-emerald-600 text-white shadow' 
                  : 'bg-gray-800 text-gray-400 hover:text-gray-200'
              }`}
            >
              Active ({metrics.activeCount})
            </button>
            <button
              onClick={() => setStatusFilter('locked')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                statusFilter === 'locked' 
                  ? 'bg-red-600 text-white shadow' 
                  : 'bg-gray-800 text-gray-400 hover:text-gray-200'
              }`}
            >
              Locked ({metrics.lockedCount})
            </button>
            <button
              onClick={() => setStatusFilter('due_soon')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                statusFilter === 'due_soon' 
                  ? 'bg-amber-600 text-white shadow' 
                  : 'bg-gray-800 text-gray-400 hover:text-gray-200'
              }`}
            >
              Due Soon ({metrics.dueSoonCount})
            </button>
          </div>

        </div>

        {/* Client Data Table */}
        <div className="bg-gray-900/60 border border-gray-800/80 rounded-2xl shadow-xl overflow-hidden backdrop-blur-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              
              <thead className="bg-gray-950/80 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-800">
                <tr>
                  <th className="px-6 py-4">Client & Website</th>
                  <th className="px-6 py-4">Contact Info</th>
                  <th className="px-6 py-4">5 Platform Accounts</th>
                  <th className="px-6 py-4">Billing & Expiry</th>
                  <th className="px-6 py-4 text-center">Status & Cron Schedule</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-800/60">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-400 mb-2" />
                      Loading client controller records...
                    </td>
                  </tr>
                ) : filteredClients.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                      No client websites found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredClients.map((client) => {
                    const now = new Date();
                    const expiry = new Date(client.expiry_date);
                    const diffTime = expiry - now;
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    const isExpired = diffDays <= 0;
                    const isDisabled = client.status === false;
                    const isLocked = isExpired || isDisabled;
                    const isExpanded = expandedKeysClientId === client.id;
                    const cronActive = client.cron_enabled !== false;

                    return (
                      <React.Fragment key={client.id}>
                        <tr 
                          className={`hover:bg-gray-800/40 transition ${isLocked ? 'bg-red-950/10' : ''}`}
                        >
                          {/* Client & Website Name */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                                isLocked 
                                  ? 'bg-red-500/10 border border-red-500/30 text-red-400' 
                                  : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                              }`}>
                                {client.website_name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-bold text-white flex items-center gap-1.5">
                                  {client.website_name}
                                  {client.website_link && (
                                    <a 
                                      href={client.website_link} 
                                      target="_blank" 
                                      rel="noreferrer"
                                      className="text-gray-400 hover:text-emerald-400"
                                    >
                                      <ExternalLink className="w-3.5 h-3.5" />
                                    </a>
                                  )}
                                </div>
                                <div className="text-xs text-gray-400 flex items-center gap-2 mt-0.5">
                                  <span>{client.client_name}</span>
                                  <span className="text-gray-600">•</span>
                                  <code className="text-[11px] text-emerald-400 font-mono bg-gray-950 px-1.5 py-0.5 rounded border border-gray-800">
                                    {client.site_key}
                                  </code>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Contact Info */}
                          <td className="px-6 py-4">
                            <div className="text-xs space-y-1">
                              <div className="flex items-center gap-1.5 font-medium text-gray-200">
                                <Phone className="w-3.5 h-3.5 text-gray-400" />
                                {client.client_phone}
                              </div>
                              <a
                                href={`https://wa.me/92${client.client_phone.replace(/^0/, '')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1"
                              >
                                <MessageCircle className="w-3 h-3" /> WhatsApp Chat
                              </a>
                            </div>
                          </td>

                          {/* Associated 5 Accounts & Keys Drawer Toggle */}
                          <td className="px-6 py-4">
                            <div className="text-xs space-y-1">
                              <div className="text-gray-300 flex items-center gap-1">
                                <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded">Vercel</span>
                                {client.vercel_email || 'N/A'}
                              </div>
                              <div className="text-gray-400 flex items-center gap-1">
                                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded">Supa</span>
                                {client.supabase_email || 'N/A'}
                              </div>
                              <button
                                onClick={() => setExpandedKeysClientId(isExpanded ? null : client.id)}
                                className="text-[11px] text-emerald-400 hover:underline font-bold flex items-center gap-1 mt-1 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30 w-fit"
                              >
                                {isExpanded ? 'Hide All 5 Accounts & Keys' : 'View 5 Accounts & Keys'}
                                {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </td>

                          {/* Billing & Expiry Date */}
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold capitalize text-gray-200">
                                  {client.billing_cycle || 'monthly'}
                                </span>
                                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                                  isLocked 
                                    ? 'bg-red-500/10 border-red-500/30 text-red-400' 
                                    : diffDays <= 7 
                                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' 
                                      : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                }`}>
                                  {isLocked 
                                    ? 'EXPIRED / LOCKED' 
                                    : `${diffDays} Days Left`}
                                </span>
                              </div>
                              <div className="text-xs text-gray-400 flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5 text-gray-500" />
                                {new Date(client.expiry_date).toLocaleDateString('en-GB', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </div>
                            </div>
                          </td>

                          {/* Status & Cron Control Toggle */}
                          <td className="px-6 py-4 text-center">
                            <div className="space-y-2">
                              <button
                                onClick={() => handleToggleStatus(client)}
                                className={`px-3 py-1 rounded-xl font-bold text-xs flex items-center gap-1.5 mx-auto transition border ${
                                  client.status 
                                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/20' 
                                    : 'bg-red-500/10 border-red-500/40 text-red-400 hover:bg-red-500/20'
                                }`}
                              >
                                <Power className="w-3.5 h-3.5" />
                                {client.status ? 'ON (ACTIVE)' : 'OFF (LOCKED)'}
                              </button>

                              <div 
                                onClick={() => handleToggleCron(client)}
                                className={`cursor-pointer px-2.5 py-1 rounded-lg text-[10px] font-bold border transition flex items-center justify-center gap-1 mx-auto max-w-[170px] ${
                                  cronActive 
                                    ? 'bg-blue-500/10 border-blue-500/30 text-blue-300 hover:bg-blue-500/20' 
                                    : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'
                                }`}
                                title="Click to Enable/Disable Cron Job"
                              >
                                <Sparkles className="w-3 h-3 text-blue-400" />
                                <span>{cronActive ? 'Cron Job Activated (12:00 AM)' : 'Cron Disabled'}</span>
                              </div>
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              
                              <button
                                onClick={() => handleQuickExtend(client, 30)}
                                className="px-2.5 py-1.5 bg-gray-800 hover:bg-gray-700 text-emerald-400 text-xs font-semibold rounded-lg transition"
                                title="+30 Days Extension"
                              >
                                +30 Days
                              </button>

                              <button
                                onClick={() => setSelectedClientForScript(client)}
                                className="p-2 bg-gray-800 hover:bg-gray-700 text-emerald-400 rounded-lg transition"
                                title="Get Script / Prompt"
                              >
                                <Code className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => {
                                  setEditingClient(client);
                                  setIsClientModalOpen(true);
                                }}
                                className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition"
                                title="Edit Client"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => setDeletingClient(client)}
                                className="p-2 bg-gray-800 hover:bg-red-900/50 text-red-400 rounded-lg transition"
                                title="Delete Client"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>

                            </div>
                          </td>
                        </tr>

                        {/* Expanded Keys & Credentials Accordion Drawer */}
                        {isExpanded && (
                          <tr className="bg-gray-950/90 border-y border-gray-800">
                            <td colSpan={6} className="p-6">
                              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-4 font-mono text-xs text-gray-300">
                                
                                {/* Section A: 5 Platform Accounts */}
                                <div className="space-y-2">
                                  <div className="font-sans font-bold text-xs text-blue-400 uppercase tracking-wider flex items-center justify-between">
                                    <span>Client 5 Associated Platform Accounts & Notes</span>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-sans">
                                    <div className="bg-gray-950 p-2.5 rounded-lg border border-gray-800 flex justify-between items-center">
                                      <div><span className="text-gray-500">Vercel Account / Note:</span> <span className="text-white font-semibold">{client.vercel_email || 'Not Specified'}</span></div>
                                      {client.vercel_email && <button onClick={() => copyText(client.vercel_email, 'Vercel Email')} className="text-emerald-400 hover:text-emerald-300 ml-2"><Copy className="w-3.5 h-3.5" /></button>}
                                    </div>

                                    <div className="bg-gray-950 p-2.5 rounded-lg border border-gray-800 flex justify-between items-center">
                                      <div><span className="text-gray-500">Supabase Account / Note:</span> <span className="text-emerald-300 font-semibold">{client.supabase_email || 'Not Specified'}</span></div>
                                      {client.supabase_email && <button onClick={() => copyText(client.supabase_email, 'Supabase Email')} className="text-emerald-400 hover:text-emerald-300 ml-2"><Copy className="w-3.5 h-3.5" /></button>}
                                    </div>

                                    <div className="bg-gray-950 p-2.5 rounded-lg border border-gray-800 flex justify-between items-center">
                                      <div><span className="text-gray-500">GitHub Account / Note:</span> <span className="text-purple-300 font-semibold">{client.github_email || 'Not Specified'}</span></div>
                                      {client.github_email && <button onClick={() => copyText(client.github_email, 'GitHub Email')} className="text-emerald-400 hover:text-emerald-300 ml-2"><Copy className="w-3.5 h-3.5" /></button>}
                                    </div>

                                    <div className="bg-gray-950 p-2.5 rounded-lg border border-gray-800 flex justify-between items-center">
                                      <div><span className="text-gray-500">Cloudflare Account / Note:</span> <span className="text-amber-300 font-semibold">{client.cloudflare_email || 'Not Specified'}</span></div>
                                      {client.cloudflare_email && <button onClick={() => copyText(client.cloudflare_email, 'Cloudflare Email')} className="text-emerald-400 hover:text-emerald-300 ml-2"><Copy className="w-3.5 h-3.5" /></button>}
                                    </div>

                                    <div className="bg-gray-950 p-2.5 rounded-lg border border-gray-800 flex justify-between items-center col-span-1 md:col-span-2">
                                      <div><span className="text-gray-500">Cron-Job.org Account / Note:</span> <span className="text-blue-300 font-semibold">{client.cronjob_email || 'Not Specified'}</span></div>
                                      {client.cronjob_email && <button onClick={() => copyText(client.cronjob_email, 'Cronjob Email')} className="text-emerald-400 hover:text-emerald-300 ml-2"><Copy className="w-3.5 h-3.5" /></button>}
                                    </div>
                                  </div>
                                </div>

                                {/* Section B: Supabase Keys */}
                                <div className="space-y-2 pt-2 border-t border-gray-800">
                                  <div className="font-sans font-bold text-xs text-emerald-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                                    <span>Client Supabase Project Credentials</span>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="bg-gray-950 p-2.5 rounded-lg border border-gray-800 flex justify-between items-center">
                                      <div className="truncate"><span className="text-gray-500">Supabase URL:</span> <span className="text-white">{client.supabase_url || 'Not Specified'}</span></div>
                                      {client.supabase_url && <button onClick={() => copyText(client.supabase_url, 'url')} className="text-emerald-400 hover:text-emerald-300 ml-2"><Copy className="w-3.5 h-3.5" /></button>}
                                    </div>

                                    <div className="bg-gray-950 p-2.5 rounded-lg border border-gray-800 flex justify-between items-center">
                                      <div className="truncate"><span className="text-gray-500">Publishable Key:</span> <span className="text-blue-300">{client.publishable_key || 'Not Specified'}</span></div>
                                      {client.publishable_key && <button onClick={() => copyText(client.publishable_key, 'pub')} className="text-emerald-400 hover:text-emerald-300 ml-2"><Copy className="w-3.5 h-3.5" /></button>}
                                    </div>

                                    <div className="bg-gray-950 p-2.5 rounded-lg border border-gray-800 flex justify-between items-center">
                                      <div className="truncate"><span className="text-gray-500">DB Password:</span> <span className="text-amber-400">{client.supabase_password || 'Not Specified'}</span></div>
                                      {client.supabase_password && <button onClick={() => copyText(client.supabase_password, 'pwd')} className="text-emerald-400 hover:text-emerald-300 ml-2"><Copy className="w-3.5 h-3.5" /></button>}
                                    </div>

                                    <div className="bg-gray-950 p-2.5 rounded-lg border border-gray-800 flex justify-between items-center">
                                      <div className="truncate"><span className="text-gray-500">CLI Setup:</span> <span className="text-emerald-300">{client.cli_setup || 'Not Specified'}</span></div>
                                      {client.cli_setup && <button onClick={() => copyText(client.cli_setup, 'cli')} className="text-emerald-400 hover:text-emerald-300 ml-2"><Copy className="w-3.5 h-3.5" /></button>}
                                    </div>

                                    <div className="bg-gray-950 p-2.5 rounded-lg border border-gray-800 flex justify-between items-center col-span-1 md:col-span-2">
                                      <div className="truncate"><span className="text-gray-500">Connection String:</span> <span className="text-purple-300">{client.connection_string || 'Not Specified'}</span></div>
                                      {client.connection_string && <button onClick={() => copyText(client.connection_string, 'conn')} className="text-emerald-400 hover:text-emerald-300 ml-2"><Copy className="w-3.5 h-3.5" /></button>}
                                    </div>

                                    <div className="bg-gray-950 p-2.5 rounded-lg border border-gray-800 flex justify-between items-center col-span-1 md:col-span-2">
                                      <div className="truncate"><span className="text-gray-500">anon_key:</span> <span className="text-gray-300">{client.anon_key || 'Not Specified'}</span></div>
                                      {client.anon_key && <button onClick={() => copyText(client.anon_key, 'anon')} className="text-emerald-400 hover:text-emerald-300 ml-2"><Copy className="w-3.5 h-3.5" /></button>}
                                    </div>

                                    <div className="bg-gray-950 p-2.5 rounded-lg border border-gray-800 flex justify-between items-center col-span-1 md:col-span-2">
                                      <div className="truncate"><span className="text-gray-500">service_role_key:</span> <span className="text-red-300">{client.service_role_key || 'Not Specified'}</span></div>
                                      {client.service_role_key && <button onClick={() => copyText(client.service_role_key, 'service')} className="text-emerald-400 hover:text-emerald-300 ml-2"><Copy className="w-3.5 h-3.5" /></button>}
                                    </div>

                                    <div className="bg-blue-950/40 p-3 rounded-lg border border-blue-500/30 flex justify-between items-center col-span-1 md:col-span-2">
                                      <div className="space-y-1 font-sans">
                                        <div className="flex items-center gap-2">
                                          <Sparkles className="w-4 h-4 text-blue-400" />
                                          <span className="text-blue-300 font-bold">Cron Notification Title Structure:</span>
                                        </div>
                                        <div className="text-xs font-mono text-emerald-300 bg-gray-950 p-2 rounded border border-gray-800">
                                          [Keep-Alive] Client: {client.client_name} | Site: {client.website_name} ({client.site_key}) | Active Until: {new Date(client.expiry_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </div>
                                      </div>
                                      <button onClick={() => handleToggleCron(client)} className="text-xs bg-blue-600 hover:bg-blue-500 text-white font-sans px-3 py-1.5 rounded font-bold transition ml-4">
                                        {cronActive ? 'Disable Cron' : 'Enable Cron'}
                                      </button>
                                    </div>
                                  </div>
                                </div>

                                {copiedKey && (
                                  <div className="text-[11px] text-emerald-400 font-sans font-semibold pt-1">
                                    ✓ Copied {copiedKey} to clipboard!
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>

            </table>
          </div>
        </div>

        {/* Global Antigravity Instruction Card */}
        <div className="bg-gradient-to-r from-emerald-950/40 via-gray-900 to-gray-950 border border-emerald-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-bold text-white">How to Inject Protection into Client Websites?</h3>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed max-w-2xl">
                Click on the <code className="text-emerald-400 font-mono bg-gray-950 px-1 py-0.5 rounded">&lt;/&gt;</code> button next to any client to copy the exact Antigravity prompt (including all mandatory Supabase keys & password). Paste it into your client's web project, and Antigravity will handle the first-layer protection setup automatically.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMasterKeysOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-semibold rounded-xl transition"
              >
                <Key className="w-4 h-4 text-amber-400" />
                My Master Controller Keys
              </button>
              <button
                onClick={() => setIsGuidanceOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-semibold rounded-xl transition"
              >
                <BookOpen className="w-4 h-4 text-blue-400" />
                Read Guidance
              </button>
              <a
                href="https://wa.me/923222685868"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow transition"
              >
                <MessageCircle className="w-4 h-4" />
                Nader Habib ({ADMIN_CONTACT.phone})
              </a>
            </div>
          </div>
        </div>

      </main>

      {/* Modals */}
      {isClientModalOpen && (
        <ClientModal
          isOpen={isClientModalOpen}
          client={editingClient}
          onClose={() => {
            setIsClientModalOpen(false);
            setEditingClient(null);
          }}
          onSave={handleSaveClient}
        />
      )}

      {selectedClientForScript && (
        <ScriptGeneratorModal
          client={selectedClientForScript}
          onClose={() => setSelectedClientForScript(null)}
        />
      )}

      {isDbSetupOpen && (
        <DatabaseSetupModal
          isOpen={isDbSetupOpen}
          onClose={() => setIsDbSetupOpen(false)}
        />
      )}

      {isGuidanceOpen && (
        <GuidanceModal
          isOpen={isGuidanceOpen}
          onClose={() => setIsGuidanceOpen(false)}
        />
      )}

      {deletingClient && (
        <DeleteConfirmModal
          isOpen={!!deletingClient}
          client={deletingClient}
          onClose={() => setDeletingClient(null)}
          onConfirm={handleConfirmDelete}
        />
      )}

      {isMasterKeysOpen && (
        <MasterCredentialsModal
          isOpen={isMasterKeysOpen}
          onClose={() => setIsMasterKeysOpen(false)}
        />
      )}

    </div>
  );
}
