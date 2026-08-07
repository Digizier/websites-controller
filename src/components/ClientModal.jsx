import React, { useState, useEffect } from 'react';
import { X, Calendar, Globe, User, Phone, ShieldCheck, Mail, Save, Key, Database, Terminal, Link, Sparkles, Power, CheckCircle2, Clock, AlertTriangle, Cloud, Server, GitBranch } from 'lucide-react';
import { createOrUpdateCronJob } from '../lib/cronjob';
import { CRON_JOB_API_KEY } from '../lib/config';

export default function ClientModal({ client, isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
    client_name: '',
    client_phone: '',
    website_name: '',
    website_link: '',
    site_key: '',
    vercel_email: '',
    supabase_email: '',
    github_email: '',
    cloudflare_email: '',
    cronjob_email: '',
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

  useEffect(() => {
    if (client) {
      setFormData({
        client_name: client.client_name || '',
        client_phone: client.client_phone || '',
        website_name: client.website_name || '',
        website_link: client.website_link || '',
        site_key: client.site_key || '',
        vercel_email: client.vercel_email || '',
        supabase_email: client.supabase_email || '',
        github_email: client.github_email || '',
        cloudflare_email: client.cloudflare_email || '',
        cronjob_email: client.cronjob_email || '',
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
        website_name: '',
        website_link: '',
        site_key: randomKey,
        vercel_email: '',
        supabase_email: '',
        github_email: '',
        cloudflare_email: '',
        cronjob_email: '',
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
        site_key: client ? prev.site_key : (slugified || prev.site_key)
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const finalData = {
      ...formData,
      expiry_date: new Date(formData.expiry_date).toISOString()
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

  const formattedExpiry = formData.expiry_date 
    ? new Date(formData.expiry_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'N/A';

  const cronTitlePreview = `[Keep-Alive] Client: ${formData.client_name || 'Client'} | Site: ${formData.website_name || 'Website'} (${formData.site_key || 'site_key'}) | Active Until: ${formattedExpiry}`;

  const hasClientUrl = formData.supabase_url && formData.supabase_url.trim().length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-3xl w-full p-6 shadow-2xl overflow-y-auto max-h-[92vh] text-gray-100 relative">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-800 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {client ? 'Edit Client & Accounts' : 'Add Client Website & 5 Platform Accounts'}
              </h2>
              <p className="text-xs text-gray-400">Manage Vercel, Supabase, GitHub, Cloudflare & Cronjob accounts with notes</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Section 1: Client General & Billing Info */}
          <div className="space-y-4 bg-gray-950/60 p-4 border border-gray-800 rounded-xl">
            <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-4 h-4" /> 1. Client & Website Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Client Full Name *</label>
                <input
                  type="text"
                  name="client_name"
                  required
                  placeholder="e.g. Imran Shah"
                  value={formData.client_name}
                  onChange={handleChange}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Client Phone / WhatsApp *</label>
                <input
                  type="text"
                  name="client_phone"
                  required
                  placeholder="e.g. 03001234567"
                  value={formData.client_phone}
                  onChange={handleChange}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Website Name *</label>
                <input
                  type="text"
                  name="website_name"
                  required
                  placeholder="e.g. Luxury Estate Pro"
                  value={formData.website_name}
                  onChange={handleWebsiteNameChange}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Website URL *</label>
                <input
                  type="url"
                  name="website_link"
                  required
                  placeholder="https://client-site.com"
                  value={formData.website_link}
                  onChange={handleChange}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Site Key (Controller ID) *</label>
                <input
                  type="text"
                  name="site_key"
                  required
                  value={formData.site_key}
                  onChange={handleChange}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2.5 font-mono text-sm text-emerald-400 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Expiry / Lock Cutoff Date *</label>
                <input
                  type="datetime-local"
                  name="expiry_date"
                  required
                  value={formData.expiry_date}
                  onChange={handleChange}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Associated 5 Platform Accounts & Notes */}
          <div className="space-y-4 bg-gray-950/60 p-4 border border-gray-800 rounded-xl">
            <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
              <Mail className="w-4 h-4" /> 2. Client 5 Associated Platform Accounts & Notes
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1 flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5 text-blue-400" /> Vercel Account Email / Text
                </label>
                <input
                  type="text"
                  name="vercel_email"
                  placeholder="client-vercel@gmail.com (or account notes)"
                  value={formData.vercel_email}
                  onChange={handleChange}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1 flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-emerald-400" /> Supabase Account Email / Text
                </label>
                <input
                  type="text"
                  name="supabase_email"
                  placeholder="client-supabase@gmail.com (or account notes)"
                  value={formData.supabase_email}
                  onChange={handleChange}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1 flex items-center gap-1.5">
                  <GitBranch className="w-3.5 h-3.5 text-purple-400" /> GitHub Account Email / Text
                </label>
                <input
                  type="text"
                  name="github_email"
                  placeholder="client-github@gmail.com (or account notes)"
                  value={formData.github_email}
                  onChange={handleChange}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1 flex items-center gap-1.5">
                  <Cloud className="w-3.5 h-3.5 text-amber-400" /> Cloudflare Account Email / Text
                </label>
                <input
                  type="text"
                  name="cloudflare_email"
                  placeholder="client-cloudflare@gmail.com (or account notes)"
                  value={formData.cloudflare_email}
                  onChange={handleChange}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="block text-xs font-semibold text-gray-300 mb-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-300" /> Cron-Job.org Account Email / Text
                </label>
                <input
                  type="text"
                  name="cronjob_email"
                  placeholder="client-cronjob@gmail.com (or account notes)"
                  value={formData.cronjob_email}
                  onChange={handleChange}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 3: CLIENT Specific Supabase Credentials */}
          <div className="space-y-4 bg-gray-950/60 p-4 border border-gray-800 rounded-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Key className="w-4 h-4" /> 3. Client Specific Supabase Keys & Direct Connection
              </h3>
              <span className="text-[10px] text-gray-400">Optional for Client Cron Keep-Alive</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Client Supabase URL (Target for Cron Job)</label>
              <input
                type="url"
                name="supabase_url"
                placeholder="https://xyz-client.supabase.co"
                value={formData.supabase_url}
                onChange={handleChange}
                className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2.5 font-mono text-xs text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Client Publishable Key</label>
                <input
                  type="text"
                  name="publishable_key"
                  placeholder="sb_publishable_client_..."
                  value={formData.publishable_key}
                  onChange={handleChange}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2.5 font-mono text-xs text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Client Database Password</label>
                <input
                  type="text"
                  name="supabase_password"
                  placeholder="Client Database Password"
                  value={formData.supabase_password}
                  onChange={handleChange}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2.5 font-mono text-xs text-amber-300 focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Client Direct Connection String (PostgreSQL)</label>
              <input
                type="text"
                name="connection_string"
                placeholder="postgresql://postgres:[PASSWORD]@db.xyz-client.supabase.co:5432/postgres"
                value={formData.connection_string}
                onChange={handleChange}
                className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2.5 font-mono text-xs text-purple-300 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Client CLI Setup Commands</label>
              <input
                type="text"
                name="cli_setup"
                placeholder="supabase link --project-ref xyz-client"
                value={formData.cli_setup}
                onChange={handleChange}
                className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2.5 font-mono text-xs text-emerald-300 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Client anon_key</label>
              <textarea
                rows={2}
                name="anon_key"
                placeholder="eyJhbGciOiJI... (Client anon key)"
                value={formData.anon_key}
                onChange={handleChange}
                className="w-full bg-gray-900 border border-gray-800 rounded-xl p-3 font-mono text-xs text-gray-300 focus:border-emerald-500 focus:outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Client service_role_key</label>
              <textarea
                rows={2}
                name="service_role_key"
                placeholder="eyJhbGciOiJI... (Client service role key)"
                value={formData.service_role_key}
                onChange={handleChange}
                className="w-full bg-gray-900 border border-gray-800 rounded-xl p-3 font-mono text-xs text-red-300 focus:border-emerald-500 focus:outline-none resize-none"
              />
            </div>
          </div>

          {/* Section 4: Cron Job Scheduling & Validation Frame */}
          <div className="bg-gradient-to-r from-blue-950/40 via-gray-900 to-gray-950 border border-blue-500/30 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">4. Cron Job Keep-Alive Scheduling Target</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="cron_enabled"
                  checked={formData.cron_enabled}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
              </label>
            </div>

            {hasClientUrl ? (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs space-y-1">
                <div className="flex items-center gap-2 font-bold text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Cron Job Target URL Ready:</span>
                </div>
                <div className="font-mono text-[11px] text-gray-200 break-all pl-6">
                  {formData.supabase_url.replace(/\/$/, '')}/rest/v1/
                </div>
              </div>
            ) : (
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs space-y-1">
                <div className="flex items-center gap-2 font-bold text-amber-400">
                  <AlertTriangle className="w-4 h-4" />
                  <span>No Client Supabase URL Entered:</span>
                </div>
                <div className="text-[11px] text-gray-300 pl-6">
                  Cron Job will NOT be created until you enter your client's specific Supabase URL above.
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1 flex items-center justify-between">
                <span>cron-job.org API Key (Master Account Key)</span>
              </label>
              <input
                type="text"
                name="cron_api_key"
                value={formData.cron_api_key}
                onChange={handleChange}
                placeholder="rN7d6WZ/OoPrjWC/RTeOy20WZLLHhEPwKdg6PSer1O8="
                className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2.5 font-mono text-xs text-blue-300 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="p-3 bg-gray-950 rounded-xl border border-blue-500/30 space-y-1.5">
              <div className="text-[11px] font-bold text-blue-400 uppercase tracking-wider">Generated Cron Job Email Notification Title:</div>
              <div className="p-2.5 bg-gray-900 rounded-lg border border-gray-800 font-mono text-xs text-emerald-300 break-all">
                {cronTitlePreview}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="mt-6 pt-4 border-t border-gray-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl font-medium text-sm transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold text-sm shadow-lg shadow-emerald-950/30 transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving Client & Accounts...' : (client ? 'Update Client & Accounts' : 'Create Client Website')}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
