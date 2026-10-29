import React, { useState, useEffect, useMemo, Component } from 'react';
import { 
  ShieldCheck, Globe, Users, Clock, Lock, Plus, Search, Filter, 
  RefreshCw, Power, ExternalLink, Calendar, Code, Trash2, Edit3, 
  CheckCircle2, AlertCircle, Database, Phone, Mail, Sparkles, MessageCircle, 
  BookOpen, Key, ChevronDown, ChevronUp, Copy, Check, LogOut, Cloud, Server, 
  GitBranch, Menu, X, ChevronLeft, ChevronRight, DollarSign, Hammer, 
  ShieldAlert, Send, MapPin, AlertTriangle, TrendingUp, Layers, User
} from 'lucide-react';
import { 
  fetchClients, createClientWebsite, updateClientWebsite, 
  deleteClientWebsite, extendClientExpiry, checkSupabaseConnection,
  fetchAffiliates, fetchEmergencyUsers
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
import AffiliatesModal from './components/AffiliatesModal';
import EmergencyAccessModal from './components/EmergencyAccessModal';
import WhatsAppDispatchModal from './components/WhatsAppDispatchModal';
import ConfirmStatusModal from './components/ConfirmStatusModal';
import BulkEmergencyStatusModal from './components/BulkEmergencyStatusModal';
import MasterProfileModal from './components/MasterProfileModal';
import FinancialAnalyticsView from './components/FinancialAnalyticsView';
import DashboardOverviewView from './components/DashboardOverviewView';

// Error Boundary to prevent any black screen freeze
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('Controller Runtime Error caught:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-slate-800 font-sans">
          <div className="bg-white border border-rose-200 rounded-3xl p-8 max-w-md w-full shadow-xl text-center space-y-4">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Controller Recovery Mode</h2>
            <p className="text-xs text-slate-500">
              An unexpected render state occurred. Click below to clear cache and reload cleanly:
            </p>
            {this.state.error?.message && (
              <p className="text-[11px] text-rose-600 font-mono bg-rose-50 p-2 rounded-xl border border-rose-200">
                {this.state.error.message}
              </p>
            )}
            <button
              onClick={() => {
                sessionStorage.clear();
                window.location.reload();
              }}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-md cursor-pointer"
            >
              Reset Session & Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function ControllerDashboard({ authUser, onLogout }) {
  const [clients, setClients] = useState(() => {
    try {
      const local = localStorage.getItem('website_controller_clients_v2');
      const parsed = local ? JSON.parse(local) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const [affiliates, setAffiliates] = useState(() => {
    try {
      const local = localStorage.getItem('website_controller_affiliates_v1');
      const parsed = local ? JSON.parse(local) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const [emergencyUsers, setEmergencyUsers] = useState(() => {
    try {
      const local = localStorage.getItem('website_controller_emergency_users_v1');
      const parsed = local ? JSON.parse(local) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(false);

  // Navigation: 'dashboard', 'clients', 'expired_websites', 'resubscribe_alerts', 'domain_tracker', 'financial_analytics'
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'locked', 'under_construction', 'due_soon'

  // Modals State
  const [selectedClientForScript, setSelectedClientForScript] = useState(null);
  const [selectedClientForWhatsApp, setSelectedClientForWhatsApp] = useState(null);
  const [editingClient, setEditingClient] = useState(null);
  const [deletingClient, setDeletingClient] = useState(null);
  const [statusConfirmTarget, setStatusConfirmTarget] = useState(null);

  const [expandedKeysClientId, setExpandedKeysClientId] = useState(null);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isDbSetupOpen, setIsDbSetupOpen] = useState(false);
  const [isGuidanceOpen, setIsGuidanceOpen] = useState(false);
  const [isMasterKeysOpen, setIsMasterKeysOpen] = useState(false);
  const [isAffiliatesModalOpen, setIsAffiliatesModalOpen] = useState(false);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [isBulkMaintenanceOpen, setIsBulkMaintenanceOpen] = useState(false);
  const [isMasterProfileOpen, setIsMasterProfileOpen] = useState(false);

  const [dbConnected, setDbConnected] = useState(true);
  const [copiedKey, setCopiedKey] = useState('');

  // Load clients & system data safely
  const loadData = async () => {
    setLoading(true);
    try {
      const dbStatus = await checkSupabaseConnection();
      setDbConnected(dbStatus.connected);

      const [clientData, affiliateData, emergencyData] = await Promise.all([
        fetchClients(),
        fetchAffiliates(),
        fetchEmergencyUsers()
      ]);

      setClients(clientData || []);
      setAffiliates(affiliateData || []);
      setEmergencyUsers(emergencyData || []);
    } catch (err) {
      console.error('[Load Error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter clients based on logged-in role
  const visibleClients = useMemo(() => {
    const list = Array.isArray(clients) ? clients : [];
    if (!authUser) return list;
    if (authUser.role === 'affiliate' && authUser.permissions && !authUser.permissions.view_all) {
      return list.filter(c => c && c.affiliate_id === authUser.id);
    }
    return list;
  }, [clients, authUser]);

  // Compute key stats metrics
  const metrics = useMemo(() => {
    const list = Array.isArray(visibleClients) ? visibleClients : [];
    const total = list.length;
    const now = new Date();

    let activeCount = 0;
    let lockedCount = 0;
    let underConstructionCount = 0;
    let dueSoonCount = 0;
    let domainAlertCount = 0;
    let totalMonthlyRevenue = 0;

    list.forEach(c => {
      if (!c) return;
      const price = Number(c.monthly_price_pkr) || 2500;
      totalMonthlyRevenue += price;

      const expiry = new Date(c.expiry_date);
      const isExpired = now > expiry;
      const isDisabled = c.status === false;
      const isUnderConst = c.lock_mode === 'under_construction' || (isDisabled && c.lock_mode === 'under_construction');
      const isLocked = !isUnderConst && (isExpired || isDisabled);

      if (isUnderConst) {
        underConstructionCount++;
      } else if (isLocked) {
        lockedCount++;
      } else {
        activeCount++;
      }

      // STRICT RESUBSCRIBE: Only Due Soon within 1 to 7 days (NOT expired)
      const rawDiff = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
      const diffDays = isNaN(rawDiff) ? 0 : rawDiff;
      if (!isExpired && !isDisabled && diffDays >= 0 && diffDays <= 7) {
        dueSoonCount++;
      }

      // DOMAIN ALERT: All domains expiring in <= 30 days (including expired domains with negative days)
      if (c.domain_expiry_date) {
        const domainExpiry = new Date(c.domain_expiry_date);
        const rawDomainDays = Math.ceil((domainExpiry - now) / (1000 * 60 * 60 * 24));
        const domainDays = isNaN(rawDomainDays) ? 0 : rawDomainDays;
        if (domainDays <= 30) {
          domainAlertCount++;
        }
      }
    });

    return { 
      total, 
      activeCount, 
      lockedCount, 
      underConstructionCount, 
      dueSoonCount, 
      domainAlertCount,
      totalMonthlyRevenue
    };
  }, [visibleClients]);

  // Filtered clients list
  const filteredClients = useMemo(() => {
    const now = new Date();
    return visibleClients.filter(client => {
      const q = (searchQuery || '').toLowerCase();
      const matchesSearch = 
        (client.client_name || '').toLowerCase().includes(q) ||
        (client.website_name || '').toLowerCase().includes(q) ||
        (client.site_key || '').toLowerCase().includes(q) ||
        (client.client_location || '').toLowerCase().includes(q) ||
        (client.domain_name || '').toLowerCase().includes(q) ||
        (client.client_phone || '').includes(q);

      if (!matchesSearch) return false;

      const expiry = new Date(client.expiry_date);
      const isExpired = now > expiry;
      const isDisabled = client.status === false;
      const isUnderConst = client.lock_mode === 'under_construction' || (isDisabled && client.lock_mode === 'under_construction');
      const isLocked = !isUnderConst && (isExpired || isDisabled);

      // EXPIRED WEBSITES VIEW: Shows ONLY expired/locked websites
      if (activeMenu === 'expired_websites') {
        return isLocked;
      }

      // RESUBSCRIBE ALERTS VIEW: Shows ONLY due soon (1 to 7 days left, NOT expired)
      if (activeMenu === 'resubscribe_alerts') {
        const diffDays = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
        return !isLocked && !isUnderConst && diffDays >= 0 && diffDays <= 7;
      }

      // DOMAIN TRACKER VIEW: Shows domains expiring within 45 days (or expired)
      if (activeMenu === 'domain_tracker') {
        if (!client.domain_expiry_date) return false;
        const domainExpiry = new Date(client.domain_expiry_date);
        const domainDays = Math.ceil((domainExpiry - now) / (1000 * 60 * 60 * 24));
        return domainDays <= 45;
      }

      // Tabs filter inside Client Directory
      if (statusFilter === 'active') return !isLocked && !isUnderConst;
      if (statusFilter === 'locked') return isLocked;
      if (statusFilter === 'under_construction') return isUnderConst;
      if (statusFilter === 'due_soon') {
        const diffDays = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
        return !isLocked && !isUnderConst && diffDays >= 0 && diffDays <= 7;
      }

      return true;
    });
  }, [visibleClients, searchQuery, statusFilter, activeMenu]);

  // Execute confirmed status change (supports 3 modes + custom notice)
  const handleExecuteStatusChange = async (targetAction, customNotice) => {
    if (!statusConfirmTarget) return;
    const { client } = statusConfirmTarget;
    const actionToRun = targetAction || statusConfirmTarget.targetAction;

    let updates = {};
    if (actionToRun === 'activate') {
      updates = { status: true, lock_mode: 'payment' };
    } else if (actionToRun === 'under_construction') {
      updates = { 
        status: false, 
        lock_mode: 'under_construction',
        custom_notice: customNotice || client.custom_notice || 'This website is currently undergoing scheduled maintenance or system upgrades.'
      };
    } else if (actionToRun === 'lock_payment') {
      updates = { 
        status: false, 
        lock_mode: 'payment',
        custom_notice: customNotice || client.custom_notice
      };
    }

    await updateClientWebsite(client.id, updates);
    setClients(prev => prev.map(c => c.id === client.id ? { ...c, ...updates } : c));
    setStatusConfirmTarget(null);
  };

  // Quick Extend (+30 Days)
  const handleQuickExtend = async (client, days) => {
    await extendClientExpiry(client.id, client.expiry_date, days);
    loadData();
  };

  // Confirm and execute client deletion
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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased flex selection:bg-emerald-500 selection:text-white">
      
      {/* ------------------------------------------------------------- */}
      {/* PINNED FIXED LEFT SIDEBAR (NEVER SCROLLS WITH RIGHT PAGE)      */}
      {/* ------------------------------------------------------------- */}
      
      {/* Mobile Backdrop */}
      {isMobileSidebarOpen && (
        <div 
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      <aside className={`
        sticky top-0 h-screen z-40 bg-white border-r border-slate-200/90 flex flex-col justify-between 
        transition-all duration-300 shadow-xs flex-shrink-0
        ${isSidebarCollapsed ? 'w-20' : 'w-72'}
        ${isMobileSidebarOpen ? 'fixed left-0 top-0 bottom-0 z-50 translate-x-0' : 'hidden lg:flex'}
      `}>
        
        {/* Top Header & Logo Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          
          <div className="h-20 px-4 flex items-center justify-between border-b border-slate-100">
            
            {/* Center Logo Icon in Collapsed Mode */}
            {isSidebarCollapsed ? (
              <div className="w-full flex items-center justify-center">
                <button
                  onClick={() => setIsSidebarCollapsed(false)}
                  className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 p-0.5 shadow-md shadow-emerald-600/20 flex items-center justify-center group"
                  title="Expand Sidebar"
                >
                  <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center group-hover:bg-emerald-50 transition">
                    <ShieldCheck className="w-6 h-6 text-emerald-600" />
                  </div>
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 p-0.5 shadow-md shadow-emerald-600/20 flex-shrink-0">
                    <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
                      <ShieldCheck className="w-6 h-6 text-emerald-600" />
                    </div>
                  </div>
                  <div className="overflow-hidden">
                    <div className="flex items-center gap-1.5">
                      <span className="font-black text-slate-900 text-sm tracking-tight">Website Controller</span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1 py-0.2 rounded">v2.0</span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate">
                      Digizier • {ADMIN_CONTACT.name}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsSidebarCollapsed(true)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition"
                  title="Collapse Sidebar"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            )}

          </div>

          {/* User Profile Pill */}
          {!isSidebarCollapsed && (
            <div className="p-3 border-b border-slate-100 bg-slate-50/50">
              <div 
                onClick={() => { if (authUser?.role === 'master') setIsMasterProfileOpen(true); }}
                className={`flex items-center justify-between p-2 rounded-2xl bg-white border border-slate-200/80 shadow-xs ${authUser?.role === 'master' ? 'cursor-pointer hover:border-emerald-300 hover:shadow-sm transition' : ''}`}
                title={authUser?.role === 'master' ? "Click to edit Master Profile & Default Notices" : undefined}
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  {authUser?.profile_image ? (
                    <img src={authUser.profile_image} alt="" className="w-8 h-8 rounded-full object-cover border border-amber-300 flex-shrink-0" />
                  ) : (
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-xs flex items-center justify-center flex-shrink-0">
                      {authUser?.name ? authUser.name.charAt(0).toUpperCase() : 'N'}
                    </div>
                  )}
                  <div className="overflow-hidden leading-tight">
                    <div className="text-xs font-bold text-slate-900 truncate">{authUser?.name || 'Nadir Habib'}</div>
                    <div className="text-[10px] text-emerald-600 font-semibold uppercase tracking-wider capitalize">
                      {authUser?.role === 'master' ? 'Master Admin' : (authUser?.role === 'emergency' ? 'Emergency Admin' : 'Sub-Admin')}
                    </div>
                  </div>
                </div>
                {authUser?.role === 'master' && (
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded-md border border-emerald-200 hover:bg-emerald-100 transition">
                    Edit
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Sidebar Navigation Items */}
          <nav className="p-2.5 space-y-1">
            
            {/* 1. Dashboard Overview */}
            <button
              onClick={() => { setActiveMenu('dashboard'); setIsMobileSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-xs transition ${
                activeMenu === 'dashboard' 
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-xs' 
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              } ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
              title="Dashboard Overview"
            >
              <TrendingUp className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              {!isSidebarCollapsed && <span>Dashboard Overview</span>}
            </button>

            {/* 2. Client Websites */}
            <button
              onClick={() => { setActiveMenu('clients'); setIsMobileSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold text-xs transition ${
                activeMenu === 'clients' 
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-xs' 
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              } ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
              title="Client Websites Directory"
            >
              <div className="flex items-center gap-3">
                <Globe className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                {!isSidebarCollapsed && <span>Client Websites</span>}
              </div>
              {!isSidebarCollapsed && (
                <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                  {visibleClients.length}
                </span>
              )}
            </button>

            {/* 3. Expired Websites (New Dedicated Menu!) */}
            <button
              onClick={() => { setActiveMenu('expired_websites'); setIsMobileSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold text-xs transition ${
                activeMenu === 'expired_websites' 
                  ? 'bg-rose-50 text-rose-900 border border-rose-300 shadow-xs' 
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              } ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
              title="Expired & Locked Websites"
            >
              <div className="flex items-center gap-3">
                <Lock className="w-4 h-4 text-rose-600 flex-shrink-0" />
                {!isSidebarCollapsed && <span>Expired Websites</span>}
              </div>
              {!isSidebarCollapsed && metrics.lockedCount > 0 && (
                <span className="text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200 px-2 py-0.5 rounded-full">
                  {metrics.lockedCount} Expired
                </span>
              )}
            </button>

            {/* 4. Resubscribe Alerts (Only 1-7 Days Due Soon) */}
            <button
              onClick={() => { setActiveMenu('resubscribe_alerts'); setIsMobileSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold text-xs transition ${
                activeMenu === 'resubscribe_alerts' 
                  ? 'bg-amber-50 text-amber-900 border border-amber-300 shadow-xs' 
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              } ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
              title="Resubscribe Alerts (1 to 7 Days Left)"
            >
              <div className="flex items-center gap-3">
                <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                {!isSidebarCollapsed && <span>Resubscribe Alerts</span>}
              </div>
              {!isSidebarCollapsed && metrics.dueSoonCount > 0 && (
                <span className="text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded-full animate-pulse">
                  {metrics.dueSoonCount} Due
                </span>
              )}
            </button>

            {/* 5. Domain Expiry Tracker (With Alert Count!) */}
            <button
              onClick={() => { setActiveMenu('domain_tracker'); setIsMobileSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold text-xs transition ${
                activeMenu === 'domain_tracker' 
                  ? 'bg-blue-50 text-blue-900 border border-blue-200 shadow-xs' 
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              } ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
              title="Domain Expiry Tracker"
            >
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-blue-600 flex-shrink-0" />
                {!isSidebarCollapsed && <span>Domain Tracker</span>}
              </div>
              {!isSidebarCollapsed && metrics.domainAlertCount > 0 && (
                <span className="text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full">
                  {metrics.domainAlertCount} Alert
                </span>
              )}
            </button>

            {/* 6. Affiliate Sub-Admins */}
            {(authUser?.role === 'master' || authUser?.can_view_affiliates) && (
              <button
                onClick={() => { setIsAffiliatesModalOpen(true); setIsMobileSidebarOpen(false); }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold text-xs text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
                title="Affiliate Clients & Sub-Admins"
              >
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                  {!isSidebarCollapsed && <span>Affiliate Sub-Admins</span>}
                </div>
                {!isSidebarCollapsed && (
                  <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">
                    {affiliates.length}
                  </span>
                )}
              </button>
            )}

            {/* 7. Emergency Controller Access */}
            {authUser?.role === 'master' && (
              <button
                onClick={() => { setIsEmergencyModalOpen(true); setIsMobileSidebarOpen(false); }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold text-xs text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
                title="Emergency Access Users"
              >
                <div className="flex items-center gap-3">
                  <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  {!isSidebarCollapsed && <span>Emergency Access</span>}
                </div>
                {!isSidebarCollapsed && (
                  <span className="text-[10px] font-bold bg-amber-50 text-amber-800 px-2 py-0.5 rounded-full">
                    {emergencyUsers.length}
                  </span>
                )}
              </button>
            )}

            {/* 8. Monthly Revenue (With Profit / Turnover Pill!) */}
            {authUser?.role === 'master' && (
              <button
                onClick={() => { setActiveMenu('financial_analytics'); setIsMobileSidebarOpen(false); }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold text-xs transition ${
                  activeMenu === 'financial_analytics' 
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-xs' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                } ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
                title="Monthly Revenue & Financial Ledger"
              >
                <div className="flex items-center gap-3">
                  <DollarSign className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  {!isSidebarCollapsed && <span>Monthly Revenue</span>}
                </div>
                {!isSidebarCollapsed && (
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full">
                    ₨ {(metrics.totalMonthlyRevenue / 1000).toFixed(1)}k
                  </span>
                )}
              </button>
            )}

          </nav>
        </div>

        {/* Sidebar Footer Buttons */}
        <div className="p-2.5 border-t border-slate-100 space-y-1">
          {authUser?.role === 'master' && (
            <button
              onClick={() => setIsMasterProfileOpen(true)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-xl border border-emerald-200 transition ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
              title="Master Profile & Lock Notices"
            >
              <User className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              {!isSidebarCollapsed && <span>Master Profile & Notices</span>}
            </button>
          )}

          {authUser?.role === 'master' && (
            <button
              onClick={() => setIsMasterKeysOpen(true)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
              title="Central Database Keys"
            >
              <Key className="w-4 h-4 text-amber-600 flex-shrink-0" />
              {!isSidebarCollapsed && <span>Database Keys</span>}
            </button>
          )}

          <button
            onClick={() => setIsGuidanceOpen(true)}
            className={`w-full flex items-center gap-2.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
            title="Step-by-Step Guide"
          >
            <BookOpen className="w-4 h-4 text-blue-600 flex-shrink-0" />
            {!isSidebarCollapsed && <span>Step-by-Step Guide</span>}
          </button>

          <button
            onClick={onLogout}
            className={`w-full flex items-center gap-2.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl border border-rose-200 transition ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
            title="Log Out Session"
          >
            <LogOut className="w-4 h-4 text-rose-600 flex-shrink-0" />
            {!isSidebarCollapsed && <span>Log Out</span>}
          </button>
        </div>

      </aside>

      {/* ------------------------------------------------------------- */}
      {/* MAIN INDEPENDENT SCROLLABLE CONTENT AREA                      */}
      {/* ------------------------------------------------------------- */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        
        {/* Top Navbar */}
        <header className="h-20 bg-white/90 backdrop-blur-md border-b border-slate-200/90 sticky top-0 z-30 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <h1 className="text-lg font-black text-slate-900 tracking-tight">
                {activeMenu === 'dashboard' && 'Executive Senior Dashboard Overview'}
                {activeMenu === 'clients' && 'Client Websites Directory'}
                {activeMenu === 'expired_websites' && 'Expired & Locked Websites'}
                {activeMenu === 'resubscribe_alerts' && 'Resubscribe Alerts (Expiring in 7 Days)'}
                {activeMenu === 'domain_tracker' && 'Domain Expiration Tracker'}
                {activeMenu === 'financial_analytics' && 'Financial Revenue & Billing Ledger'}
              </h1>
              <p className="text-xs text-slate-400">
                {visibleClients.length} Sites Protected • Realtime Central Cloud Database Sync
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={loadData}
              className="p-2.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl transition cursor-pointer"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
            </button>

            {authUser?.role === 'master' && (
              <button
                onClick={() => setIsBulkMaintenanceOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
                title="Emergency Bulk Maintenance Switch for All Websites"
              >
                <Hammer className="w-4 h-4 text-amber-600" />
                <span className="hidden sm:inline">All Under Construction</span>
                <span className="sm:hidden">All Maint.</span>
              </button>
            )}

            {(!authUser?.permissions || authUser?.permissions.can_add !== false) && (
              <button
                onClick={() => {
                  setEditingClient(null);
                  setIsClientModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Client Website</span>
              </button>
            )}
          </div>
        </header>

        {/* Main Viewport */}
        <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto flex-1">
          
          {/* VIEW 1: EXECUTIVE SENIOR DASHBOARD OVERVIEW */}
          {activeMenu === 'dashboard' && (
            <DashboardOverviewView 
              clients={visibleClients}
              affiliates={affiliates}
              onExtend={handleQuickExtend}
              onWhatsApp={(client) => setSelectedClientForWhatsApp(client)}
              onGeneratePrompt={(client) => setSelectedClientForScript(client)}
              onOpenAddClient={() => {
                setEditingClient(null);
                setIsClientModalOpen(true);
              }}
              onNavigate={(menu) => setActiveMenu(menu)}
            />
          )}

          {/* VIEW 2: FINANCIAL ANALYTICS */}
          {activeMenu === 'financial_analytics' && (
            <FinancialAnalyticsView 
              clients={visibleClients} 
              affiliates={affiliates}
              onRefresh={loadData}
              onWhatsApp={(client) => setSelectedClientForWhatsApp(client)}
            />
          )}

          {/* VIEW 3: CLIENT WEBSITES DIRECTORY / EXPIRED WEBSITES / RESUBSCRIBE / DOMAIN TRACKER */}
          {activeMenu !== 'dashboard' && activeMenu !== 'financial_analytics' && (
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-6">
              
              {/* Filter and Search Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative w-full sm:w-96">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by client, website, domain, location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 font-medium"
                  />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto text-xs font-semibold">
                  <button
                    onClick={() => setStatusFilter('all')}
                    className={`px-3 py-1.5 rounded-xl transition ${
                      statusFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    All ({visibleClients.length})
                  </button>
                  <button
                    onClick={() => setStatusFilter('active')}
                    className={`px-3 py-1.5 rounded-xl transition ${
                      statusFilter === 'active' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Active ({metrics.activeCount})
                  </button>
                  <button
                    onClick={() => setStatusFilter('locked')}
                    className={`px-3 py-1.5 rounded-xl transition ${
                      statusFilter === 'locked' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Locked ({metrics.lockedCount})
                  </button>
                  <button
                    onClick={() => setStatusFilter('under_construction')}
                    className={`px-3 py-1.5 rounded-xl transition ${
                      statusFilter === 'under_construction' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Construction ({metrics.underConstructionCount})
                  </button>
                  <button
                    onClick={() => setStatusFilter('due_soon')}
                    className={`px-3 py-1.5 rounded-xl transition ${
                      statusFilter === 'due_soon' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Due Soon ({metrics.dueSoonCount})
                  </button>
                </div>
              </div>

              {/* Clients Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="pb-3 pl-2">Client & Website</th>
                      <th className="pb-3">Contact & WhatsApp</th>
                      <th className="pb-3">Domain & Location</th>
                      <th className="pb-3">Subscription Expiry</th>
                      <th className="pb-3">Status & Mode</th>
                      <th className="pb-3 pr-2 text-right">Quick Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredClients.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                          No websites matching this view or filter criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredClients.map((client) => {
                        const now = new Date();
                        const expiry = new Date(client.expiry_date);
                        const isExpired = now > expiry;
                        const isDisabled = client.status === false;
                        const isUnderConst = client.lock_mode === 'under_construction' || (isDisabled && client.lock_mode === 'under_construction');
                        const isLocked = !isUnderConst && (isExpired || isDisabled);

                        const diffDays = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
                        const isExpanded = expandedKeysClientId === client.id;

                        // Domain days left
                        let domainDaysLeft = null;
                        if (client.domain_expiry_date) {
                          const dExp = new Date(client.domain_expiry_date);
                          domainDaysLeft = Math.ceil((dExp - now) / (1000 * 60 * 60 * 24));
                        }

                        return (
                          <React.Fragment key={client.id}>
                            <tr className="hover:bg-slate-50/80 transition group">
                              
                              {/* Client & Website Name */}
                              <td className="py-4 pl-2">
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 font-bold flex items-center justify-center flex-shrink-0">
                                    {client.website_name ? client.website_name.charAt(0).toUpperCase() : 'W'}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-bold text-slate-900 text-sm">{client.website_name || 'Website'}</span>
                                      {client.website_link && (
                                        <a
                                          href={client.website_link}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="text-slate-400 hover:text-emerald-600 transition"
                                        >
                                          <ExternalLink className="w-3.5 h-3.5" />
                                        </a>
                                      )}
                                    </div>
                                    <div className="text-slate-400 text-[11px] flex items-center gap-2 mt-0.5">
                                      <span>Client: <strong className="text-slate-600">{client.client_name || 'Client'}</strong></span>
                                      <span>•</span>
                                      <span className="font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                                        {client.site_key}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </td>

                              {/* Contact & WhatsApp */}
                              <td className="py-4">
                                <div className="text-slate-700 font-medium">{client.client_phone || 'No phone'}</div>
                                <button
                                  onClick={() => setSelectedClientForWhatsApp(client)}
                                  className="text-[11px] text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1 mt-0.5"
                                >
                                  <MessageCircle className="w-3 h-3" />
                                  <span>1-Click WhatsApp</span>
                                </button>
                              </td>

                              {/* Domain & Location */}
                              <td className="py-4">
                                <div className="font-mono text-slate-800 font-semibold">
                                  {client.domain_name || 'No domain'}
                                </div>
                                <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                                  <MapPin className="w-3 h-3 text-slate-400" />
                                  <span>{client.client_location || 'Pakistan'}</span>
                                  {domainDaysLeft !== null && (
                                    <span className={`px-1.5 py-0.2 rounded font-bold text-[10px] ${
                                      domainDaysLeft <= 0 
                                        ? 'bg-rose-100 text-rose-800 border border-rose-300' 
                                        : domainDaysLeft <= 30 
                                          ? 'bg-amber-100 text-amber-800 border border-amber-300' 
                                          : 'bg-slate-100 text-slate-600'
                                    }`}>
                                      {domainDaysLeft <= 0 ? `${Math.abs(domainDaysLeft)}d expired` : `${domainDaysLeft}d left`}
                                    </span>
                                  )}
                                </div>
                              </td>

                              {/* Subscription Expiry */}
                              <td className="py-4">
                                <div className="text-slate-800 font-medium">
                                  {client.expiry_date ? new Date(client.expiry_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                                </div>
                                <div className="mt-0.5">
                                  {isLocked ? (
                                    <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                                      EXPIRED / LOCKED
                                    </span>
                                  ) : isUnderConst ? (
                                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                                      UNDER CONSTRUCTION
                                    </span>
                                  ) : (
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                      diffDays <= 7 ? 'text-amber-800 bg-amber-50 border border-amber-300' : 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                                    }`}>
                                      {diffDays} Days Left
                                    </span>
                                  )}
                                </div>
                              </td>

                              {/* Status & Mode Switch */}
                              <td className="py-4">
                                <div className="flex items-center gap-2">
                                  {client.status !== false && !isExpired ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold">
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                      <span>LIVE</span>
                                    </span>
                                  ) : isUnderConst ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-800 border border-blue-200 rounded-xl text-xs font-bold">
                                      <Hammer className="w-3.5 h-3.5 text-blue-600" />
                                      <span>CONSTRUCTION</span>
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-50 text-rose-800 border border-rose-200 rounded-xl text-xs font-bold">
                                      <Lock className="w-3.5 h-3.5 text-rose-600" />
                                      <span>LOCKED</span>
                                    </span>
                                  )}

                                  <button
                                    onClick={() => setStatusConfirmTarget({
                                      client,
                                      targetAction: client.status ? 'under_construction' : 'activate'
                                    })}
                                    className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition"
                                    title="Change Mode (Active / Under Construction / Lock)"
                                  >
                                    <Power className="w-3.5 h-3.5" />
                                  </button>
                                </div>

                                <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                                  <span>Cron:</span>
                                  <span className={client.cron_enabled ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
                                    {client.cron_enabled ? 'Active (12 AM)' : 'Disabled'}
                                  </span>
                                </div>
                              </td>

                              {/* Quick Actions */}
                              <td className="py-4 pr-2 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  
                                  {/* Quick +30 Days Extend */}
                                  <button
                                    onClick={() => handleQuickExtend(client, 30)}
                                    className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-[11px] font-bold transition"
                                    title="Extend 30 Days & Reactivate"
                                  >
                                    +30 Days
                                  </button>

                                  {/* Antigravity Code Prompt */}
                                  <button
                                    onClick={() => setSelectedClientForScript(client)}
                                    className="p-1.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 rounded-xl transition border border-slate-200"
                                    title="Generate Anti-Cache Antigravity Prompt"
                                  >
                                    <Code className="w-3.5 h-3.5" />
                                  </button>

                                  {/* Edit Client */}
                                  {(!authUser?.permissions || authUser?.permissions.can_edit !== false) && (
                                    <button
                                      onClick={() => {
                                        setEditingClient(client);
                                        setIsClientModalOpen(true);
                                      }}
                                      className="p-1.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 rounded-xl transition border border-slate-200"
                                      title="Edit Client Information"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                    </button>
                                  )}

                                  {/* Delete Client */}
                                  {(!authUser?.permissions || authUser?.permissions.can_delete !== false) && (
                                    <button
                                      onClick={() => setDeletingClient(client)}
                                      className="p-1.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 rounded-xl transition border border-slate-200"
                                      title="Delete Client Website"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}

                                  {/* Expand Keys Accordion */}
                                  <button
                                    onClick={() => setExpandedKeysClientId(isExpanded ? null : client.id)}
                                    className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition border border-slate-200"
                                    title={isExpanded ? 'Hide Details' : 'Show Accounts & Keys'}
                                  >
                                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                  </button>

                                </div>
                              </td>

                            </tr>

                            {/* Expandable Keys & Accounts Accordion */}
                            {isExpanded && (
                              <tr>
                                <td colSpan={6} className="bg-slate-50/70 p-4 border-b border-slate-200 animate-fade-in">
                                  <div className="space-y-3">
                                    <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                                      <span>Detailed Platform Accounts, Credentials & Central DB Keys</span>
                                      <span className="font-mono text-emerald-700">{client.site_key}</span>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs font-mono">
                                      
                                      <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                                        <div className="text-[10px] text-slate-400 font-sans font-bold">Vercel Account</div>
                                        <div className="text-slate-800 truncate font-semibold">{client.vercel_email || 'Not specified'}</div>
                                      </div>

                                      <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                                        <div className="text-[10px] text-slate-400 font-sans font-bold">Database Account</div>
                                        <div className="text-slate-800 truncate font-semibold">{client.supabase_email || 'Not specified'}</div>
                                      </div>

                                      <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                                        <div className="text-[10px] text-slate-400 font-sans font-bold">GitHub Account</div>
                                        <div className="text-slate-800 truncate font-semibold">{client.github_email || 'Not specified'}</div>
                                      </div>

                                      <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                                        <div className="text-[10px] text-slate-400 font-sans font-bold">Cloudflare Account</div>
                                        <div className="text-slate-800 truncate font-semibold">{client.cloudflare_email || 'Not specified'}</div>
                                      </div>

                                      <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                                        <div className="text-[10px] text-slate-400 font-sans font-bold">Hosting Webmail</div>
                                        <div className="text-slate-800 truncate font-semibold">{client.hosting_email || 'Not specified'}</div>
                                      </div>

                                      <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                                        <div className="text-[10px] text-slate-400 font-sans font-bold">Hosting Password</div>
                                        <div className="text-slate-800 truncate font-semibold">{client.hosting_password || '••••••••'}</div>
                                      </div>

                                      <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                                        <div className="text-[10px] text-slate-400 font-sans font-bold">Cron-Job ID</div>
                                        <div className="text-slate-800 truncate font-semibold">{client.cron_job_id || 'Not created'}</div>
                                      </div>

                                      <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                                        <div className="text-[10px] text-slate-400 font-sans font-bold">Resend API Key</div>
                                        <div className="text-slate-800 truncate font-semibold">{client.resend_api_key ? 're_••••••••' : 'None'}</div>
                                      </div>

                                    </div>
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
          )}

        </main>

      </div>

      {/* ------------------------------------------------------------- */}
      {/* ALL MODALS                                                    */}
      {/* ------------------------------------------------------------- */}

      {/* Add / Edit Client Modal */}
      <ClientModal
        client={editingClient}
        affiliates={affiliates}
        isOpen={isClientModalOpen}
        onClose={() => {
          setIsClientModalOpen(false);
          setEditingClient(null);
        }}
        onSave={handleSaveClient}
      />

      {/* Antigravity Protection Prompt Modal */}
      {selectedClientForScript && (
        <ScriptGeneratorModal
          client={selectedClientForScript}
          onClose={() => setSelectedClientForScript(null)}
        />
      )}

      {/* WhatsApp Dispatcher Modal */}
      {selectedClientForWhatsApp && (
        <WhatsAppDispatchModal
          client={selectedClientForWhatsApp}
          isOpen={true}
          onClose={() => setSelectedClientForWhatsApp(null)}
        />
      )}

      {/* Confirm Status Change Modal */}
      {statusConfirmTarget && (
        <ConfirmStatusModal
          client={statusConfirmTarget.client}
          targetAction={statusConfirmTarget.targetAction}
          isOpen={true}
          onClose={() => setStatusConfirmTarget(null)}
          onConfirm={handleExecuteStatusChange}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        client={deletingClient}
        isOpen={!!deletingClient}
        onClose={() => setDeletingClient(null)}
        onConfirm={handleConfirmDelete}
      />

      {/* Master Credentials Modal */}
      <MasterCredentialsModal
        isOpen={isMasterKeysOpen}
        onClose={() => setIsMasterKeysOpen(false)}
      />

      {/* Step-by-Step Guide Modal */}
      <GuidanceModal
        isOpen={isGuidanceOpen}
        onClose={() => setIsGuidanceOpen(false)}
      />

      {/* Database Setup Modal */}
      <DatabaseSetupModal
        isOpen={isDbSetupOpen}
        onClose={() => setIsDbSetupOpen(false)}
      />

      {/* Affiliates & Sub-Admins Modal */}
      <AffiliatesModal
        affiliates={affiliates}
        clients={clients}
        isOpen={isAffiliatesModalOpen}
        onClose={() => setIsAffiliatesModalOpen(false)}
        onRefresh={loadData}
      />

      {/* Emergency Controller Access Modal */}
      <EmergencyAccessModal
        emergencyUsers={emergencyUsers}
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
        onRefresh={loadData}
      />

      {/* Emergency Bulk Maintenance Modal */}
      <BulkEmergencyStatusModal
        isOpen={isBulkMaintenanceOpen}
        clients={clients}
        onClose={() => setIsBulkMaintenanceOpen(false)}
        onRefresh={loadData}
      />

      {/* Master Profile & Lock Notices Modal */}
      <MasterProfileModal
        isOpen={isMasterProfileOpen}
        onClose={() => setIsMasterProfileOpen(false)}
        onUpdated={loadData}
      />

    </div>
  );
}

function MainApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('website_controller_auth') === 'true';
  });

  const [authUser, setAuthUser] = useState(() => {
    try {
      const saved = sessionStorage.getItem('website_controller_user');
      return saved ? JSON.parse(saved) : { role: 'master', username: 'digizier', name: 'Nadir Habib' };
    } catch {
      return { role: 'master', username: 'digizier', name: 'Nadir Habib' };
    }
  });

  const handleLoginSuccess = (userObj) => {
    const validUser = userObj || { role: 'master', username: 'digizier', name: 'Nadir Habib' };
    setAuthUser(validUser);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('website_controller_auth');
    sessionStorage.removeItem('website_controller_user');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return <ControllerDashboard authUser={authUser} onLogout={handleLogout} />;
}

export default function App() {
  return (
    <ErrorBoundary>
      <MainApp />
    </ErrorBoundary>
  );
}
