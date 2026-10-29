import React, { useState, useEffect } from 'react';
import { 
  X, Calendar, Globe, User, Phone, ShieldCheck, Mail, Save, Key, 
  Database, Terminal, Link, Sparkles, Power, CheckCircle2, Clock, 
  AlertTriangle, Cloud, Server, GitBranch, MapPin, Hammer, DollarSign 
} from 'lucide-react';
import { createOrUpdateCronJob } from '../lib/cronjob';
import { CRON_JOB_API_KEY } from '../lib/config';

export default function ClientModal({ client, affiliates = [], isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
    client_name: '',
    client_phone: '',
    client_location: '',
    website_name: '',
    website_link: '',
    site_key: '',
    domain_name: '',
    domain_purchase_date: '',
    domain_expiry_date: '',
    domain_registrar: '',
    monthly_price_pkr: 2500,
    payment_status: 'paid',
    lock_mode: 'payment',
    affiliate_id: '',
    vercel_email: '',
    supabase_email: '',
    github_email: '',
    cloudflare_email: '',
    cronjob_email: '',
    hosting_email: '',
    hosting_password: '',
    github_repo_url: '',
    github_token: '',
    cloudflare_api_key: '',
    resend_api_key: '',
    resend_from_email: '',
    supabase_url: '',
    publishable_key: '',
    supabase_password: '',
    connection_string: '',
    cli_setup: '',
    anon_key: '',
    service_role_key: '',
    cron_api_key: CRON_JOB_API_KEY,
    billing_cycle: 'monthly',
    expiry_date: '',
    status: true,
    custom_notice: '',
    cron_job_id: null,
    cron_enabled: true
  });

  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('basic'); // 'basic', 'domain', 'accounts', 'supabase', 'advanced'

  useEffect(() => {
    if (client) {
      setFormData({
        client_name: client.client_name || '',
        client_phone: client.client_phone || '',
        client_location: client.client_location || '',
        website_name: client.website_name || '',
        website_link: client.website_link || '',
        site_key: client.site_key || '',
        domain_name: client.domain_name || '',
        domain_purchase_date: client.domain_purchase_date ? new Date(client.domain_purchase_date).toISOString().slice(0, 10) : '',
        domain_expiry_date: client.domain_expiry_date ? new Date(client.domain_expiry_date).toISOString().slice(0, 10) : '',
        domain_registrar: client.domain_registrar || '',
        monthly_price_pkr: client.monthly_price_pkr !== undefined ? client.monthly_price_pkr : 2500,
        payment_status: client.payment_status || 'paid',
        lock_mode: client.lock_mode || 'payment',
        affiliate_id: client.affiliate_id || '',
        vercel_email: client.vercel_email || '',
        supabase_email: client.supabase_email || '',
        github_email: client.github_email || '',
        cloudflare_email: client.cloudflare_email || '',
        cronjob_email: client.cronjob_email || '',
        hosting_email: client.hosting_email || '',
        hosting_password: client.hosting_password || '',
        github_repo_url: client.github_repo_url || '',
        github_token: client.github_token || '',
        cloudflare_api_key: client.cloudflare_api_key || '',
        resend_api_key: client.resend_api_key || '',
        resend_from_email: client.resend_from_email || '',
        supabase_url: client.supabase_url || '',
        publishable_key: client.publishable_key || '',
        supabase_password: client.supabase_password || '',
        connection_string: client.connection_string || '',
        cli_setup: client.cli_setup || '',
        anon_key: client.anon_key || '',
        service_role_key: client.service_role_key || '',
        cron_api_key: client.cron_api_key || CRON_JOB_API_KEY,
        billing_cycle: client.billing_cycle || 'monthly',
        expiry_date: client.expiry_date ? new Date(client.expiry_date).toISOString().slice(0, 16) : '',
        status: client.status !== undefined ? client.status : true,
        custom_notice: client.custom_notice || '',
        cron_job_id: client.cron_job_id || null,
        cron_enabled: client.cron_enabled !== undefined ? client.cron_enabled : true
      });
    } else {
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 30);
      defaultDate.setHours(23, 59, 0, 0);

      const randomKey = 'site_' + Math.random().toString(36).substring(2, 8);

      setFormData({
        client_name: '',
        client_phone: '',
        client_location: '',
        website_name: '',
        website_link: '',
        site_key: randomKey,
        domain_name: '',
        domain_purchase_date: '',
        domain_expiry_date: '',
        domain_registrar: '',
        monthly_price_pkr: 2500,
        payment_status: 'paid',
        lock_mode: 'payment',
        affiliate_id: '',
        vercel_email: '',
        supabase_email: '',
        github_email: '',
        cloudflare_email: '',
        cronjob_email: '',
        hosting_email: '',
        hosting_password: '',
        github_repo_url: '',
        github_token: '',
        cloudflare_api_key: '',
        resend_api_key: '',
        resend_from_email: '',
        supabase_url: '',
        publishable_key: '',
        supabase_password: '',
        connection_string: '',
        cli_setup: '',
        anon_key: '',
        service_role_key: '',
        cron_api_key: CRON_JOB_API_KEY,
        billing_cycle: 'monthly',
        expiry_date: defaultDate.toISOString().slice(0, 16),
        status: true,
        custom_notice: '',
        cron_job_id: null,
        cron_enabled: true
      });
    }
  }, [client, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleWebsiteNameChange = (e) => {
    const val = e.target.value;
    setFormData(prev => {
      const slugified = 'site_' + val.toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 15);
      return {
        ...prev,
        website_name: val,
        site_key: client ? prev.site_key : (slugified || prev.site_key),
        domain_name: prev.domain_name || (val ? `${val.toLowerCase().replace(/[^a-z0-9]/g, '')}.pk` : '')
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const finalData = {
      ...formData,
      monthly_price_pkr: Number(formData.monthly_price_pkr) || 2500,
      expiry_date: new Date(formData.expiry_date).toISOString(),
      domain_purchase_date: formData.domain_purchase_date ? new Date(formData.domain_purchase_date).toISOString() : null,
      domain_expiry_date: formData.domain_expiry_date ? new Date(formData.domain_expiry_date).toISOString() : null
    };

    let cronId = formData.cron_job_id;

    // ONLY create or update Cron Job if Client Supabase URL is entered
    if (formData.supabase_url && formData.supabase_url.trim()) {
      cronId = await createOrUpdateCronJob(finalData, formData.cron_api_key);
    }

    onSave({
      ...finalData,
      cron_job_id: cronId
    });

    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in font-sans">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-4xl w-full p-6 shadow-2xl overflow-y-auto max-h-[92vh] text-slate-800 relative">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {client ? `Edit ${client.website_name || 'Client Website'}` : 'Add New Client Website'}
              </h2>
              <p className="text-xs text-slate-500">
                Configure client details, domain tracking, accounts, credentials & first-layer lock
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-slate-200 pb-3 mb-6 overflow-x-auto text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('basic')}
            className={`px-3.5 py-1.5 rounded-xl transition whitespace-nowrap ${
              activeTab === 'basic' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            1. Basic & Billing
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('domain')}
            className={`px-3.5 py-1.5 rounded-xl transition whitespace-nowrap ${
              activeTab === 'domain' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            2. Domain Tracker
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('accounts')}
            className={`px-3.5 py-1.5 rounded-xl transition whitespace-nowrap ${
              activeTab === 'accounts' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            3. Accounts & Credentials
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('supabase')}
            className={`px-3.5 py-1.5 rounded-xl transition whitespace-nowrap ${
              activeTab === 'supabase' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            4. Cloud DB & Keep-Alive
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('advanced')}
            className={`px-3.5 py-1.5 rounded-xl transition whitespace-nowrap ${
              activeTab === 'advanced' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            5. Lock Modes & Notice
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* TAB 1: BASIC & BILLING */}
          {activeTab === 'basic' && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-emerald-600" /> Client Name *
                  </label>
                  <input
                    type="text"
                    name="client_name"
                    required
                    placeholder="e.g. Asif Sadiq"
                    value={formData.client_name}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-600" /> WhatsApp / Phone *
                  </label>
                  <input
                    type="text"
                    name="client_phone"
                    required
                    placeholder="03212223333"
                    value={formData.client_phone}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" /> Client Location / City
                  </label>
                  <input
                    type="text"
                    name="client_location"
                    placeholder="e.g. Karachi, Lahore, Dubai"
                    value={formData.client_location}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-emerald-600" /> Website Name *
                  </label>
                  <input
                    type="text"
                    name="website_name"
                    required
                    placeholder="e.g. Imanis"
                    value={formData.website_name}
                    onChange={handleWebsiteNameChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Link className="w-3.5 h-3.5 text-emerald-600" /> Website URL *
                  </label>
                  <input
                    type="url"
                    name="website_link"
                    required
                    placeholder="https://imanis.pk"
                    value={formData.website_link}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 font-medium font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-emerald-600" /> Site Key *
                  </label>
                  <input
                    type="text"
                    name="site_key"
                    required
                    value={formData.site_key}
                    onChange={handleChange}
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> Monthly Price (PKR)
                  </label>
                  <input
                    type="number"
                    name="monthly_price_pkr"
                    placeholder="2500"
                    value={formData.monthly_price_pkr}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Payment Status
                  </label>
                  <select
                    name="payment_status"
                    value={formData.payment_status}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-emerald-500"
                  >
                    <option value="paid">✓ Paid / Cleared</option>
                    <option value="pending">⏳ Pending Payment</option>
                    <option value="overdue">✖ Overdue</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600" /> Subscription Expiry Date *
                  </label>
                  <input
                    type="datetime-local"
                    name="expiry_date"
                    required
                    value={formData.expiry_date}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-indigo-600" /> Referred by Sub-Admin / Affiliate
                  </label>
                  <select
                    name="affiliate_id"
                    value={formData.affiliate_id}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">Direct Client (No Sub-Admin)</option>
                    {affiliates.map(a => (
                      <option key={a.id} value={a.id}>
                        {a.full_name} ({a.username}) — ₨ {a.commission_amount || 500}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DOMAIN TRACKER */}
          {activeTab === 'domain' && (
            <div className="space-y-4 animate-fade-in p-4 bg-slate-50 border border-slate-200 rounded-2xl">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <Globe className="w-4 h-4 text-emerald-600" />
                <span>Domain Registration & Expiry Management</span>
              </div>
              <p className="text-xs text-slate-500">
                Track client domain expiration so you can send early renewal reminders before the domain drops.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Domain Name</label>
                  <input
                    type="text"
                    name="domain_name"
                    placeholder="e.g. imanis.pk"
                    value={formData.domain_name}
                    onChange={handleChange}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Domain Registrar</label>
                  <input
                    type="text"
                    name="domain_registrar"
                    placeholder="e.g. PKNIC, Namecheap, GoDaddy"
                    value={formData.domain_registrar}
                    onChange={handleChange}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Domain Purchase Date</label>
                  <input
                    type="date"
                    name="domain_purchase_date"
                    value={formData.domain_purchase_date}
                    onChange={handleChange}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Domain Expiry Date</label>
                  <input
                    type="date"
                    name="domain_expiry_date"
                    value={formData.domain_expiry_date}
                    onChange={handleChange}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ACCOUNTS & CREDENTIALS */}
          {activeTab === 'accounts' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Associated Platform Accounts (Emails & Notes)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Vercel Account Email</label>
                    <input
                      type="text"
                      name="vercel_email"
                      placeholder="e.g. client@vercel.com"
                      value={formData.vercel_email}
                      onChange={handleChange}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Central DB Account Email</label>
                    <input
                      type="text"
                      name="supabase_email"
                      placeholder="e.g. client@account.com"
                      value={formData.supabase_email}
                      onChange={handleChange}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">GitHub Account Email</label>
                    <input
                      type="text"
                      name="github_email"
                      placeholder="e.g. dev@github.com"
                      value={formData.github_email}
                      onChange={handleChange}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Cloudflare Account Email</label>
                    <input
                      type="text"
                      name="cloudflare_email"
                      placeholder="e.g. admin@cloudflare.com"
                      value={formData.cloudflare_email}
                      onChange={handleChange}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Cron-Job.org Account Email</label>
                    <input
                      type="text"
                      name="cronjob_email"
                      placeholder="e.g. digizier@gmail.com"
                      value={formData.cronjob_email}
                      onChange={handleChange}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Hosting, Cloudflare, GitHub & Resend Credentials
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Hosting / Webmail Email</label>
                    <input
                      type="text"
                      name="hosting_email"
                      placeholder="info@client.com"
                      value={formData.hosting_email}
                      onChange={handleChange}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Hosting / Webmail Password</label>
                    <input
                      type="text"
                      name="hosting_password"
                      placeholder="Email password"
                      value={formData.hosting_password}
                      onChange={handleChange}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">GitHub Repo URL</label>
                    <input
                      type="text"
                      name="github_repo_url"
                      placeholder="https://github.com/..."
                      value={formData.github_repo_url}
                      onChange={handleChange}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Cloudflare API Key / Token</label>
                    <input
                      type="text"
                      name="cloudflare_api_key"
                      placeholder="CF Global API Key"
                      value={formData.cloudflare_api_key}
                      onChange={handleChange}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Resend API Key</label>
                    <input
                      type="text"
                      name="resend_api_key"
                      placeholder="re_xxxxxxxx"
                      value={formData.resend_api_key}
                      onChange={handleChange}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Resend Sender Email</label>
                    <input
                      type="text"
                      name="resend_from_email"
                      placeholder="onboarding@resend.dev"
                      value={formData.resend_from_email}
                      onChange={handleChange}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CLOUD DB & CRON KEEP-ALIVE */}
          {activeTab === 'supabase' && (
            <div className="space-y-4 animate-fade-in p-4 bg-slate-50 border border-slate-200 rounded-2xl">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-emerald-600" />
                  <span>Client Cloud Database Project & Keep-Alive Target</span>
                </span>
                <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  Universal /storage/v1/status
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Client Cloud Database URL</label>
                  <input
                    type="url"
                    name="supabase_url"
                    placeholder="https://xyzclient.database.co"
                    value={formData.supabase_url}
                    onChange={handleChange}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Anon / Public Key</label>
                  <input
                    type="text"
                    name="anon_key"
                    placeholder="eyJhbGciOi..."
                    value={formData.anon_key}
                    onChange={handleChange}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Service Role Key</label>
                  <input
                    type="text"
                    name="service_role_key"
                    placeholder="eyJhbGciOi..."
                    value={formData.service_role_key}
                    onChange={handleChange}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Database Master Password</label>
                  <input
                    type="text"
                    name="supabase_password"
                    placeholder="Database Password"
                    value={formData.supabase_password}
                    onChange={handleChange}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Publishable Key</label>
                  <input
                    type="text"
                    name="publishable_key"
                    placeholder="sb_publishable_..."
                    value={formData.publishable_key}
                    onChange={handleChange}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="cron_enabled"
                    checked={formData.cron_enabled}
                    onChange={handleChange}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-xs font-bold text-slate-800">
                    Enable Daily 12:00 AM Midnight Keep-Alive Cron Job on cron-job.org
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* TAB 5: LOCK MODES & NOTICE */}
          {activeTab === 'advanced' && (
            <div className="space-y-4 animate-fade-in p-4 bg-slate-50 border border-slate-200 rounded-2xl">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Power className="w-4 h-4 text-emerald-600" />
                  <span>Lock Mode Customization & Active Status</span>
                </div>
                <span className="text-[10px] text-slate-400 font-normal">Layer 1 Security Shield</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Select First-Layer Lock Mode</label>
                  <select
                    name="lock_mode"
                    value={formData.lock_mode || 'payment'}
                    onChange={handleChange}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-emerald-500"
                  >
                    <option value="payment">🔴 Payment Overdue Lock Screen (Nadir Habib Payment Remaining)</option>
                    <option value="under_construction">🔵 Under Construction / Maintenance Screen</option>
                  </select>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {formData.lock_mode === 'under_construction' ? 'Displays blue maintenance screen with tools icon.' : 'Displays red payment recovery screen with WhatsApp link.'}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Master Website Live Status</label>
                  <select
                    name="status"
                    value={formData.status ? 'true' : 'false'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value === 'true' })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold focus:outline-none focus:border-emerald-500"
                  >
                    <option value="true">🟢 Permanent Active (Live Public Browsing)</option>
                    <option value="false">🔴 Inactive / Locked / Under Construction</option>
                  </select>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {formData.status ? 'Website is currently active and browsable.' : 'Website is locked and overlay screen is active.'}
                  </p>
                </div>

                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700">Custom Lock Notice / Message</label>
                    <span className="text-[10px] text-slate-400">Supports dynamic placeholders</span>
                  </div>
                  <textarea
                    name="custom_notice"
                    rows={2}
                    placeholder="e.g. Dear {client_name}, {website_name} is currently undergoing scheduled maintenance..."
                    value={formData.custom_notice || ''}
                    onChange={handleChange}
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 font-medium"
                  />
                  <div className="flex flex-wrap items-center gap-1.5 mt-1.5 text-[10px]">
                    <span className="text-slate-400">Click to insert:</span>
                    {['{client_name}', '{website_name}', '{phone}', '{admin_phone}'].map(tag => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, custom_notice: (prev.custom_notice ? prev.custom_notice + ' ' : '') + tag }))}
                        className="bg-white hover:bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-200 font-mono transition"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Form Actions Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <span className="text-xs text-slate-400 font-mono">
              Key: {formData.site_key}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-1.5 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/20 transition disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving Client...' : (client ? 'Save Updates' : 'Add Client Website')}</span>
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
}
