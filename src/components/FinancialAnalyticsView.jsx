import React, { useState, useMemo } from 'react';
import { 
  DollarSign, TrendingUp, CheckCircle2, Clock, AlertCircle, Calendar, 
  ArrowUpRight, ShieldCheck, Users, MessageCircle, RefreshCw, Filter, 
  Search, Check, ChevronRight
} from 'lucide-react';
import { updateClientWebsite } from '../lib/supabase';

export default function FinancialAnalyticsView({ clients = [], affiliates = [], onRefresh, onWhatsApp }) {
  const [selectedMonth, setSelectedMonth] = useState('Oct 2026');
  const [filterPayment, setFilterPayment] = useState('all'); // 'all', 'paid', 'pending'
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const monthsList = ['Aug 2026', 'Sep 2026', 'Oct 2026', 'Nov 2026 (Projected)', 'Dec 2026 (Projected)'];

  // Financial computations
  const metrics = useMemo(() => {
    let totalMonthlyRevenue = 0;
    let totalReceived = 0;
    let totalPending = 0;
    let totalAffiliateCommissions = 0;

    clients.forEach(c => {
      const price = Number(c.monthly_price_pkr) || 2500;
      totalMonthlyRevenue += price;

      const isPaid = c.payment_status === 'paid' || (!c.payment_status && c.status !== false);
      if (isPaid) {
        totalReceived += price;
      } else {
        totalPending += price;
      }

      if (c.affiliate_id) {
        const aff = affiliates.find(a => a.id === c.affiliate_id);
        const comm = aff ? Number(aff.commission_amount) || 500 : 500;
        totalAffiliateCommissions += comm;
      }
    });

    const netProfit = totalReceived - totalAffiliateCommissions;

    return {
      totalMonthlyRevenue,
      totalReceived,
      totalPending,
      totalAffiliateCommissions,
      netProfit
    };
  }, [clients, affiliates]);

  // Toggle payment status directly from table & save to cloud database
  const handleTogglePaymentStatus = async (client) => {
    setUpdatingId(client.id);
    const currentStatus = client.payment_status || (client.status !== false ? 'paid' : 'pending');
    const newStatus = currentStatus === 'paid' ? 'pending' : 'paid';

    await updateClientWebsite(client.id, { payment_status: newStatus });
    if (onRefresh) onRefresh();
    setUpdatingId(null);
  };

  // Filtered clients list
  const filteredClients = useMemo(() => {
    return clients.filter(c => {
      const isPaid = c.payment_status === 'paid' || (!c.payment_status && c.status !== false);
      if (filterPayment === 'paid' && !isPaid) return false;
      if (filterPayment === 'pending' && isPaid) return false;

      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        (c.client_name || '').toLowerCase().includes(q) ||
        (c.website_name || '').toLowerCase().includes(q) ||
        (c.site_key || '').toLowerCase().includes(q)
      );
    });
  }, [clients, filterPayment, searchQuery]);

  return (
    <div className="space-y-6 font-sans animate-fade-in">
      
      {/* ------------------------------------------------------------- */}
      {/* 1. TOP FINANCIAL STAT CARDS                                   */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Monthly Volume</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">₨ {metrics.totalMonthlyRevenue.toLocaleString()}</div>
            <div className="text-xs text-slate-400 mt-1">Calculated across {clients.length} active sites</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Received & Cleared</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-emerald-600">₨ {metrics.totalReceived.toLocaleString()}</div>
            <div className="text-xs text-slate-400 mt-1">Cleared client payments</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">Pending / Overdue</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-amber-600">₨ {metrics.totalPending.toLocaleString()}</div>
            <div className="text-xs text-slate-400 mt-1">Awaiting client payment</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">Digizier Net Profit</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-indigo-600">₨ {metrics.netProfit.toLocaleString()}</div>
            <div className="text-xs text-slate-400 mt-1">After ₨ {metrics.totalAffiliateCommissions} commissions</div>
          </div>
        </div>

      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. MONTH SELECTOR & REVENUE FILTER BAR                        */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
          <span className="text-xs font-bold text-slate-500 mr-2 uppercase tracking-wider">Billing Period:</span>
          {monthsList.map((m) => (
            <button
              key={m}
              onClick={() => setSelectedMonth(m)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                selectedMonth === m
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <button
            onClick={() => setFilterPayment('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              filterPayment === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Sites ({clients.length})
          </button>
          <button
            onClick={() => setFilterPayment('paid')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              filterPayment === 'paid' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Paid ({clients.filter(c => c.payment_status === 'paid' || (!c.payment_status && c.status !== false)).length})
          </button>
          <button
            onClick={() => setFilterPayment('pending')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              filterPayment === 'pending' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Pending ({clients.filter(c => c.payment_status === 'pending' || (!c.payment_status && c.status === false)).length})
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. CLIENT REVENUE TRACKER TABLE                               */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Interactive Financial & Subscription Ledger ({selectedMonth})
            </h3>
            <p className="text-xs text-slate-400">
              Click status badge to toggle Paid / Pending • Automatic cloud sync
            </p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by client or website..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                <th className="pb-3 pl-2">Client & Portal</th>
                <th className="pb-3">Monthly Plan</th>
                <th className="pb-3">Sub-Admin Commission</th>
                <th className="pb-3">Digizier Net Share</th>
                <th className="pb-3">Due / Expiry Date</th>
                <th className="pb-3">Payment Status</th>
                <th className="pb-3 pr-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredClients.map((client) => {
                const aff = affiliates.find(a => a.id === client.affiliate_id);
                const price = Number(client.monthly_price_pkr) || 2500;
                const commission = aff ? Number(aff.commission_amount) || 500 : 0;
                const netShare = price - commission;
                const isPaid = client.payment_status === 'paid' || (!client.payment_status && client.status !== false);
                const expiry = client.expiry_date 
                  ? new Date(client.expiry_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                  : 'N/A';

                return (
                  <tr key={client.id} className="hover:bg-slate-50/80 transition">
                    
                    {/* Client & Portal */}
                    <td className="py-3.5 pl-2">
                      <div className="font-bold text-slate-900">{client.client_name || 'Client'}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                        <span>{client.website_name || 'Website'}</span>
                        <span>•</span>
                        <span className="font-mono text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200">
                          {client.site_key}
                        </span>
                      </div>
                    </td>

                    {/* Monthly Plan */}
                    <td className="py-3.5 font-bold text-slate-800">
                      ₨ {price.toLocaleString()}
                    </td>

                    {/* Sub-Admin Share */}
                    <td className="py-3.5">
                      {aff ? (
                        <div>
                          <span className="font-bold text-indigo-700">₨ {commission.toLocaleString()}</span>
                          <div className="text-[10px] text-slate-400">{aff.full_name}</div>
                        </div>
                      ) : (
                        <span className="text-slate-400">Direct (₨ 0)</span>
                      )}
                    </td>

                    {/* Digizier Net Share */}
                    <td className="py-3.5 font-black text-emerald-700">
                      ₨ {netShare.toLocaleString()}
                    </td>

                    {/* Due Date */}
                    <td className="py-3.5 text-slate-600 font-medium">
                      {expiry}
                    </td>

                    {/* Payment Status (Click to Toggle) */}
                    <td className="py-3.5">
                      <button
                        onClick={() => handleTogglePaymentStatus(client)}
                        disabled={updatingId === client.id}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold transition shadow-xs cursor-pointer ${
                          isPaid 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100' 
                            : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                        }`}
                        title="Click to toggle Paid / Pending status"
                      >
                        {isPaid ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Clock className="w-3.5 h-3.5 text-amber-600" />}
                        <span>{isPaid ? 'PAID' : 'PENDING'}</span>
                        {updatingId === client.id && <RefreshCw className="w-3 h-3 animate-spin" />}
                      </button>
                    </td>

                    {/* Quick WhatsApp Reminder */}
                    <td className="py-3.5 pr-2 text-right">
                      <button
                        onClick={() => onWhatsApp && onWhatsApp(client)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 rounded-xl text-xs font-semibold transition inline-flex items-center gap-1 border border-slate-200"
                        title="Send WhatsApp Invoice / Reminder"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </button>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 4. SUB-ADMIN COMMISSION PAYOUT SUMMARY                        */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Sub-Admin Commission Payout Ledger</h3>
              <p className="text-xs text-slate-400">Total commission calculations based on client referrals</p>
            </div>
          </div>
          <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full">
            {affiliates.length} Registered Sub-Admins
          </span>
        </div>

        {affiliates.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-400">
            No sub-admins or affiliates registered yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {affiliates.map((aff) => {
              const referredClients = clients.filter(c => c.affiliate_id === aff.id);
              const totalPayout = referredClients.length * (Number(aff.commission_amount) || 500);

              return (
                <div key={aff.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{aff.full_name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">@{aff.username}</div>
                    </div>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      ₨ {aff.commission_amount || 500} / site
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Referred Sites:</span>
                    <strong className="text-slate-900">{referredClients.length} Sites</strong>
                  </div>

                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-700">Total Due Commission:</span>
                    <span className="text-indigo-600 text-sm">₨ {totalPayout.toLocaleString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
