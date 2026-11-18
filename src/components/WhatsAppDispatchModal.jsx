import React, { useState, useEffect } from 'react';
import { X, MessageCircle, Copy, Check, ExternalLink, Send, Sparkles, CreditCard, Building2, Smartphone, ShieldCheck } from 'lucide-react';
import { ADMIN_CONTACT } from '../lib/config';
import { getStoredPaymentAccounts, unpackProfileData } from '../lib/paymentAccounts';
import { fetchMasterProfile } from '../lib/supabase';

export default function WhatsAppDispatchModal({ client, isOpen, onClose }) {
  if (!isOpen || !client) return null;

  const [templateType, setTemplateType] = useState('hosting_reminder');
  const [customMsg, setCustomMsg] = useState('');
  const [copied, setCopied] = useState(false);
  const [paymentAccounts, setPaymentAccounts] = useState(getStoredPaymentAccounts());
  const [activePaymentMethod, setActivePaymentMethod] = useState(paymentAccounts.active_method || 'jazzcash');

  // Load real-time master profile accounts on mount
  useEffect(() => {
    let isMounted = true;
    fetchMasterProfile().then(profileData => {
      if (isMounted && profileData) {
        const { accounts } = unpackProfileData(profileData);
        if (accounts) {
          setPaymentAccounts(accounts);
          if (accounts.active_method) {
            setActivePaymentMethod(accounts.active_method);
          }
        }
      }
    });
    return () => { isMounted = false; };
  }, []);

  const clientName = client.client_name || 'Valued Client';
  const clientLocation = client.client_location || '';
  const monthlyPrice = Number(client.monthly_price_pkr || 1500).toLocaleString('en-US');

  // Clean raw domain and uppercase header
  let rawDomain = client.domain_name || client.website_link || client.website_name || 'WEBSITE';
  rawDomain = rawDomain.replace(/^https?:\/\//i, '').replace(/\/.*$/, '').trim();
  const domainUpper = rawDomain.toUpperCase();

  // Clean website URL for footer (e.g. www.newtajpalace.com)
  let cleanUrl = client.website_link || client.domain_name || client.website_name || '';
  cleanUrl = cleanUrl.replace(/^https?:\/\//i, '').replace(/\/.*$/, '').trim();
  if (cleanUrl && !cleanUrl.startsWith('www.')) {
    cleanUrl = 'www.' + cleanUrl;
  }
  if (!cleanUrl) cleanUrl = 'www.' + rawDomain.toLowerCase();

  // Date formatting (e.g. 21 Nov 2026)
  const formatUkDate = (d) => {
    if (!d) return null;
    const dt = new Date(d);
    return isNaN(dt.getTime()) ? null : dt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getDaysLeftText = (d) => {
    if (!d) return 'Renewal Upcoming';
    const target = new Date(d);
    if (isNaN(target.getTime())) return 'Renewal Upcoming';
    const now = new Date();
    const d1 = new Date(target.getFullYear(), target.getMonth(), target.getDate());
    const d2 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diffDays = Math.round((d1 - d2) / (1000 * 60 * 60 * 24));
    
    if (diffDays > 1) return `${diffDays} Days Left`;
    if (diffDays === 1) return '1 Day Left';
    if (diffDays === 0) return 'Due Today';
    return `Payment Overdue (${Math.abs(diffDays)}d)`;
  };

  const expiryFormatted = formatUkDate(client.expiry_date) || '21 Nov 2026';
  const daysLeftText = getDaysLeftText(client.expiry_date);

  const domainExpiryFormatted = formatUkDate(client.domain_expiry_date) || expiryFormatted;
  const domainDaysLeftText = getDaysLeftText(client.domain_expiry_date || client.expiry_date);

  // Format payment block based on active payment toggle
  let paymentBlock = '';
  if (activePaymentMethod === 'jazzcash' && paymentAccounts.jazzcash) {
    paymentBlock = `*🏦 JazzCash:* ${paymentAccounts.jazzcash.number}\n> ${paymentAccounts.jazzcash.title}`;
  } else if (activePaymentMethod === 'easypaisa' && paymentAccounts.easypaisa) {
    paymentBlock = `*📱 EasyPaisa:* ${paymentAccounts.easypaisa.number}\n> ${paymentAccounts.easypaisa.title}`;
  } else if (activePaymentMethod === 'bank' && paymentAccounts.bank) {
    const bName = paymentAccounts.bank.name || 'Bank Account';
    paymentBlock = `*🏛️ ${bName}:* ${paymentAccounts.bank.number}\n> ${paymentAccounts.bank.title}`;
  }

  // Client and location line (e.g. 🌐 *Shafqat Ali | Islamabad*)
  const clientLine = clientLocation 
    ? `🌐 *${clientName} | ${clientLocation}*` 
    : `🌐 *${clientName}*`;

  // Generate WhatsApp Templates exactly matching user's requested short format
  let finalMessage = '';

  if (templateType === 'hosting_reminder') {
    finalMessage = `🚨 *${domainUpper}*\n\n📅 *Maintenance:* ${expiryFormatted}\n> ⏳ _${daysLeftText}_\n\n💳 *Amount Due:* PKR ${monthlyPrice}` +
      (paymentBlock ? `\n\n${paymentBlock}` : '') +
      `\n\n${clientLine}\n> Business Owner: ${cleanUrl}`;
  } else if (templateType === 'domain_warning') {
    const cleanDomainOnly = (client.domain_name || rawDomain).toLowerCase();
    finalMessage = `⚠️ *${domainUpper}*\n\n📅 *Domain Expiry:* ${domainExpiryFormatted}\n> ⏳ _${domainDaysLeftText}_\n\n💳 *Renewal Fee:* PKR ${monthlyPrice}` +
      (paymentBlock ? `\n\n${paymentBlock}` : '') +
      `\n\n${clientLine}\n> Domain Protection: ${cleanDomainOnly}`;
  } else if (templateType === 'reactivated') {
    finalMessage = `✅ *${domainUpper}*\n\n🎉 *Payment Status:* Received & Confirmed\n> 🚀 _Website Successfully Reactivated_\n\n📅 *Next Maintenance:* ${expiryFormatted}\n> 🛡️ _Live & Protected by Digizier_\n\n${clientLine}\n> Live Website: ${cleanUrl}`;
  } else {
    // Custom Note
    const noteText = customMsg.trim() || 'Service status update regarding your website hosting & maintenance.';
    finalMessage = `📌 *${domainUpper}*\n\n📝 *Official Notice:*\n> _${noteText}_` +
      (paymentBlock ? `\n\n${paymentBlock}` : '') +
      `\n\n${clientLine}\n> Business Owner: ${cleanUrl}`;
  }

  // Format clean phone number for WhatsApp URL
  let phone = (client.client_phone || '').replace(/[^0-9]/g, '');
  if (phone.startsWith('0')) {
    phone = '92' + phone.substring(1);
  } else if (!phone.startsWith('92') && phone.length === 10) {
    phone = '92' + phone;
  }

  const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(finalMessage)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(finalMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in font-sans">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 shadow-2xl overflow-y-auto max-h-[92vh] text-slate-800 relative">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">1-Click WhatsApp Dispatcher</h2>
              <p className="text-xs text-slate-500">Send pre-crafted renewal, domain, or payment notice to {clientName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          
          {/* Template Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
              Select Message Template
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setTemplateType('hosting_reminder')}
                className={`p-3 rounded-2xl border text-xs font-semibold text-left transition flex flex-col justify-between gap-1.5 cursor-pointer ${
                  templateType === 'hosting_reminder'
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-900 shadow-sm ring-1 ring-emerald-400/30'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span>🚨</span>
                  <span className="font-bold">Monthly Hosting</span>
                </div>
                <span className="text-[10px] text-slate-400">Payment Reminder</span>
              </button>

              <button
                type="button"
                onClick={() => setTemplateType('domain_warning')}
                className={`p-3 rounded-2xl border text-xs font-semibold text-left transition flex flex-col justify-between gap-1.5 cursor-pointer ${
                  templateType === 'domain_warning'
                    ? 'bg-amber-50 border-amber-400 text-amber-900 shadow-sm ring-1 ring-amber-400/30'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span>⚠️</span>
                  <span className="font-bold">Domain Expiry</span>
                </div>
                <span className="text-[10px] text-slate-400">Renewal Warning</span>
              </button>

              <button
                type="button"
                onClick={() => setTemplateType('reactivated')}
                className={`p-3 rounded-2xl border text-xs font-semibold text-left transition flex flex-col justify-between gap-1.5 cursor-pointer ${
                  templateType === 'reactivated'
                    ? 'bg-blue-50 border-blue-400 text-blue-900 shadow-sm ring-1 ring-blue-400/30'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span>✅</span>
                  <span className="font-bold">Reactivated</span>
                </div>
                <span className="text-[10px] text-slate-400">Payment Received</span>
              </button>

              <button
                type="button"
                onClick={() => setTemplateType('custom')}
                className={`p-3 rounded-2xl border text-xs font-semibold text-left transition flex flex-col justify-between gap-1.5 cursor-pointer ${
                  templateType === 'custom'
                    ? 'bg-purple-50 border-purple-400 text-purple-900 shadow-sm ring-1 ring-purple-400/30'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span>📌</span>
                  <span className="font-bold">Custom Note</span>
                </div>
                <span className="text-[10px] text-slate-400">Write Your Own</span>
              </button>
            </div>
          </div>

          {/* Payment Account Toggle Bar (Real-time Link with Master Profile) */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                Payment Receiving Account
              </span>
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold border border-emerald-200">
                Live Linked with Master Profile
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setActivePaymentMethod('jazzcash')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border cursor-pointer ${
                  activePaymentMethod === 'jazzcash'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>🏦</span>
                <span>JazzCash</span>
              </button>

              <button
                type="button"
                onClick={() => setActivePaymentMethod('easypaisa')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border cursor-pointer ${
                  activePaymentMethod === 'easypaisa'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>📱</span>
                <span>EasyPaisa</span>
              </button>

              <button
                type="button"
                onClick={() => setActivePaymentMethod('bank')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border cursor-pointer ${
                  activePaymentMethod === 'bank'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>🏛️</span>
                <span>Bank Account</span>
              </button>

              <button
                type="button"
                onClick={() => setActivePaymentMethod('none')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border cursor-pointer ${
                  activePaymentMethod === 'none'
                    ? 'bg-slate-700 text-white border-slate-700 shadow-sm'
                    : 'bg-white text-slate-400 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>🚫</span>
                <span>Hide Account</span>
              </button>
            </div>

            {/* Active Account Info Preview */}
            {activePaymentMethod !== 'none' && (
              <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  <span className="font-semibold text-slate-700">Account:</span>
                  <span className="font-mono text-emerald-700 font-bold">
                    {paymentAccounts[activePaymentMethod]?.number}
                  </span>
                </span>
                <span className="truncate max-w-[260px] text-slate-600 font-medium">
                  {paymentAccounts[activePaymentMethod]?.title}
                </span>
              </div>
            )}
          </div>

          {templateType === 'custom' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Custom Notice Content (In Blockquote)</label>
              <textarea
                rows={3}
                placeholder="Type your official custom notice here..."
                value={customMsg}
                onChange={(e) => setCustomMsg(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 font-sans"
              />
            </div>
          )}

          {/* Live WhatsApp Message Preview Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                Live WhatsApp Message Preview
              </span>
              <span className="text-[11px] text-slate-500 font-mono font-medium">
                Target: {phone ? `+${phone}` : 'No phone specified'}
              </span>
            </div>
            <pre className="text-xs text-slate-800 font-mono whitespace-pre-wrap bg-white p-4 rounded-xl border border-slate-200 leading-relaxed max-h-56 overflow-y-auto shadow-inner">
              {finalMessage}
            </pre>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied Message!' : 'Copy Text'}</span>
            </button>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Open in WhatsApp</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </a>
          </div>

        </div>

      </div>
    </div>
  );
}
