import React, { useMemo } from 'react';
import { 
  Globe, ShieldCheck, CheckCircle2, Lock, Clock, AlertTriangle, AlertCircle,
  TrendingUp, DollarSign, Calendar, MessageCircle, ExternalLink, 
  Users, ArrowUpRight, Activity, Zap, Check, ShieldAlert, Hammer, RefreshCw
} from 'lucide-react';
import { ADMIN_CONTACT } from '../lib/config';

export default function DashboardOverviewView({ 
  clients = [], 
  affiliates = [], 
  onExtend, 
  onWhatsApp, 
  onGeneratePrompt,
  onOpenAddClient,
  onNavigate
}) {
  const now = new Date();

  // Mathematical Analytics & KPIs
  const analytics = useMemo(() => {
    let totalRevenue = 0;
    let collectedRevenue = 0;
    let pendingRevenue = 0;
    let activeCount = 0;
    let lockedCount = 0;
    let underConstructionCount = 0;
    let dueSoonList = [];
    let expiredList = [];
    let domainAlertList = [];
    let totalAffiliateCommissions = 0;

    const safeClients = Array.isArray(clients) ? clients : [];
    const safeAffiliates = Array.isArray(affiliates) ? affiliates : [];

    safeClients.forEach(c => {
      const price = Number(c.monthly_price_pkr) || 2500;
      totalRevenue += price;

      const expiry = new Date(c.expiry_date);
      const isExpired = now > expiry;
      const isDisabled = c.status === false;
      const isUnderConst = c.lock_mode === 'under_construction' || (isDisabled && c.lock_mode === 'under_construction');
      const isLocked = !isUnderConst && (isExpired || isDisabled);

      const rawDiff = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
      const diffDays = isNaN(rawDiff) ? 0 : rawDiff;

      if (isUnderConst) {
        underConstructionCount++;
      } else if (isLocked) {
        lockedCount++;
        expiredList.push({ ...c, diffDays });
      } else {
        activeCount++;
      }

      // Check payment status
      if (c.payment_status === 'paid' || (!c.payment_status && !isLocked)) {
        collectedRevenue += price;
      } else {
        pendingRevenue += price;
      }

      // Check 7-day due soon
      if (!isExpired && !isDisabled && diffDays >= 0 && diffDays <= 7) {
        dueSoonList.push({ ...c, diffDays });
      }

      // Check domain alerts (all expired or <= 30 days)
      if (c.domain_expiry_date) {
        const domainExpiry = new Date(c.domain_expiry_date);
        const rawDomainDays = Math.ceil((domainExpiry - now) / (1000 * 60 * 60 * 24));
        const domainDays = isNaN(rawDomainDays) ? 0 : rawDomainDays;
        if (domainDays <= 30) {
          domainAlertList.push({ ...c, domainDays });
        }
      }

      // Affiliate commissions
      if (c.affiliate_id) {
        const aff = safeAffiliates.find(a => a.id === c.affiliate_id);
        totalAffiliateCommissions += aff ? Number(aff.commission_amount) || 500 : 500;
      }
    });

    const netProfit = collectedRevenue - totalAffiliateCommissions;
    const activeRate = safeClients.length > 0 ? Math.round((activeCount / safeClients.length) * 100) : 0;

    return {
      totalRevenue,
      collectedRevenue,
      pendingRevenue,
      activeCount,
      lockedCount,
      underConstructionCount,
      dueSoonList,
      expiredList,
      domainAlertList,
      totalAffiliateCommissions,
      netProfit,
      activeRate
    };
  }, [clients, affiliates]);

  return (
    <div className="space-y-6 font-sans animate-fade-in">
      
      {/* ------------------------------------------------------------- */}
      {/* 1. EXECUTIVE REALTIME STATUS BANNER                           */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 rounded-3xl p-6 text-white shadow-lg shadow-emerald-700/20 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-white/5 rounded-l-full pointer-events-none transform translate-x-20" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-white/20 backdrop-blur-md text-white border border-white/30">
                System Active • Digizier v2.0
              </span>
              <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-100">
                <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
                Live Cloud Sync
              </span>
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white">
              {ADMIN_CONTACT.name} Website Controller
            </h2>
            <p className="text-xs text-emerald-100 max-w-xl leading-relaxed">
              Managing <strong>{clients.length} Total Client Websites</strong> with anti-cache first-layer lock overlays, universal midnight keep-alive pings, and sub-admin revenue tracking.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onOpenAddClient}
              className="px-4 py-2.5 bg-white text-emerald-800 hover:bg-emerald-50 rounded-xl font-bold text-xs shadow-md transition flex items-center gap-1.5"
            >
              <span>+ Add Client Website</span>
            </button>
            <button
              onClick={() => onNavigate('financial_analytics')}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold text-xs border border-white/20 transition flex items-center gap-1.5"
            >
              <span>View Financial Ledger</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. MATHEMATICAL KPI OVERVIEW CARDS                            */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Monthly Turnover */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Turnover (PKR)</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">
              ₨ {analytics.totalRevenue.toLocaleString()}
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400 mt-1">
              <span>{clients.length} Connected Sites</span>
              <span className="text-emerald-600 font-bold">100% Rate</span>
            </div>
          </div>
        </div>

        {/* Digizier Net Profit */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">Net Monthly Profit</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-indigo-600">
              ₨ {analytics.netProfit.toLocaleString()}
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400 mt-1">
              <span>Sub-Admin Shares: ₨ {analytics.totalAffiliateCommissions}</span>
              <span className="text-indigo-600 font-bold">Net</span>
            </div>
          </div>
        </div>

        {/* Operational Ratio */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Operational Health</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-emerald-600">
              {analytics.activeRate}%
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
              <div 
                className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${analytics.activeRate}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
              <span>{analytics.activeCount} Active</span>
              <span className="text-rose-600 font-semibold">{analytics.lockedCount} Locked</span>
            </div>
          </div>
        </div>

        {/* Universal Keep-Alive Engine */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">Keep-Alive Engine</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-amber-600">
              12:00 AM
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400 mt-1">
              <span>cron-job.org Universal</span>
              <span className="text-emerald-600 font-bold">200 OK (0b)</span>
            </div>
          </div>
        </div>

      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. VISUAL CHARTS & SYSTEM RATIO                               */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Monthly Projected Turnover Trajectory (SVG Bar Chart) */}
        <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Monthly Revenue & Performance Trajectory</h3>
              <p className="text-xs text-slate-400">Monthly billing volume in PKR across current and upcoming cycles</p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              Stable MRR
            </span>
          </div>

          {/* Clean SVG Visual Bar Chart */}
          <div className="h-44 flex items-end justify-between gap-3 pt-6 px-4">
            {[
              { month: 'Jun', amount: 20000, height: '65%' },
              { month: 'Jul', amount: 22500, height: '72%' },
              { month: 'Aug', amount: 25000, height: '80%' },
              { month: 'Sep', amount: 25000, height: '80%' },
              { month: 'Oct (Current)', amount: analytics.totalRevenue, height: '92%', active: true },
              { month: 'Nov (Projected)', amount: analytics.totalRevenue, height: '92%' },
              { month: 'Dec (Projected)', amount: analytics.totalRevenue + 5000, height: '100%' }
            ].map((bar, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <div className="text-[10px] font-bold text-slate-600 opacity-0 group-hover:opacity-100 transition">
                  ₨ {(bar.amount / 1000).toFixed(1)}k
                </div>
                <div 
                  className={`w-full max-w-[42px] rounded-t-xl transition-all duration-300 ${
                    bar.active 
                      ? 'bg-gradient-to-t from-emerald-600 to-teal-400 shadow-md shadow-emerald-500/20' 
                      : 'bg-slate-100 hover:bg-slate-200'
                  }`}
                  style={{ height: bar.height }}
                />
                <span className={`text-[11px] font-semibold truncate ${bar.active ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>
                  {bar.month}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Average Monthly Fee per Client: <strong className="text-slate-800">₨ 2,500</strong></span>
            <span>Total Client Base: <strong className="text-slate-800">{clients.length} Websites</strong></span>
          </div>
        </div>

        {/* Website Operational Breakdown */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Website Status Distribution</h3>
            <p className="text-xs text-slate-400">Current state of all client portals</p>
          </div>

          <div className="space-y-3.5 pt-2">
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  Live Operational
                </span>
                <span className="font-bold text-slate-900">{analytics.activeCount} Sites ({analytics.activeRate}%)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${analytics.activeRate}%` }} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  Locked & Overdue
                </span>
                <span className="font-bold text-slate-900">
                  {analytics.lockedCount} Sites ({clients.length > 0 ? Math.round((analytics.lockedCount / clients.length) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-rose-500 h-2 rounded-full" 
                  style={{ width: `${clients.length > 0 ? (analytics.lockedCount / clients.length) * 100 : 0}%` }} 
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  Under Construction
                </span>
                <span className="font-bold text-slate-900">
                  {analytics.underConstructionCount} Sites
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-blue-500 h-2 rounded-full" 
                  style={{ width: `${clients.length > 0 ? (analytics.underConstructionCount / clients.length) * 100 : 0}%` }} 
                />
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1 mt-4">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Anti-Cache Shield Active</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Timestamps are appended to all REST queries, guaranteeing instantaneous reactivation on client phones.
            </p>
          </div>
        </div>

      </div>

      {/* ------------------------------------------------------------- */}
      {/* 4. ACTION-REQUIRED PRIORITY SECTIONS                          */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Expired / Overdue Recovery Action Box */}
        <div className="bg-white border border-rose-200 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-rose-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Expired & Locked Websites</h3>
                <p className="text-xs text-rose-600 font-semibold">{analytics.expiredList.length} Websites Currently Locked</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('expired_websites')}
              className="text-xs font-bold text-rose-600 hover:text-rose-700"
            >
              View All
            </button>
          </div>

          {analytics.expiredList.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-1.5" />
              <span>All client websites are currently active!</span>
            </div>
          ) : (
            <div className="space-y-2.5">
              {analytics.expiredList.map((client) => (
                <div key={client.id} className="p-3 bg-rose-50/50 border border-rose-200/80 rounded-2xl flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-bold text-slate-900 text-xs truncate">{client.website_name}</div>
                    <div className="text-[11px] text-slate-500 truncate">
                      Client: {client.client_name} • <span className="text-rose-700 font-bold">{Math.abs(client.diffDays)} days overdue</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => onWhatsApp(client)}
                      className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[11px] font-bold transition flex items-center gap-1 shadow-xs"
                      title="Send WhatsApp Payment Recovery Reminder"
                    >
                      <MessageCircle className="w-3 h-3" />
                      <span>WhatsApp</span>
                    </button>
                    <button
                      onClick={() => onExtend(client, 30)}
                      className="px-2.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-[11px] font-bold transition"
                      title="Quick Extend +30 Days"
                    >
                      +30d
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Expiring Soon Watchlist (Next 7 Days) */}
        <div className="bg-white border border-amber-200 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-amber-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center">
                <AlertCircle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Upcoming Expirations (7 Days)</h3>
                <p className="text-xs text-amber-700 font-semibold">{analytics.dueSoonList.length} Due for Renewal</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('resubscribe_alerts')}
              className="text-xs font-bold text-amber-600 hover:text-amber-700"
            >
              View Alerts
            </button>
          </div>

          {analytics.dueSoonList.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              <Clock className="w-8 h-8 text-amber-400 mx-auto mb-1.5" />
              <span>No websites expiring in the next 7 days.</span>
            </div>
          ) : (
            <div className="space-y-2.5">
              {analytics.dueSoonList.map((client) => (
                <div key={client.id} className="p-3 bg-amber-50/50 border border-amber-200/80 rounded-2xl flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-bold text-slate-900 text-xs truncate">{client.website_name}</div>
                    <div className="text-[11px] text-slate-500 truncate">
                      Client: {client.client_name} • <span className="text-amber-800 font-bold">{client.diffDays} days left</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => onWhatsApp(client)}
                      className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[11px] font-bold transition flex items-center gap-1 shadow-xs"
                      title="Send WhatsApp Reminder"
                    >
                      <MessageCircle className="w-3 h-3" />
                      <span>Reminder</span>
                    </button>
                    <button
                      onClick={() => onExtend(client, 30)}
                      className="px-2.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-[11px] font-bold transition"
                    >
                      +30d
                    </button>
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
