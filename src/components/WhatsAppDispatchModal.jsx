import React, { useState } from 'react';
import { X, MessageCircle, Copy, Check, ExternalLink, Send, Sparkles, Calendar, Globe } from 'lucide-react';
import { ADMIN_CONTACT } from '../lib/config';

export default function WhatsAppDispatchModal({ client, isOpen, onClose }) {
  if (!isOpen || !client) return null;

  const [templateType, setTemplateType] = useState('hosting_reminder');
  const [customMsg, setCustomMsg] = useState('');
  const [copied, setCopied] = useState(false);

  const clientName = client.client_name || 'Valued Client';
  const websiteName = client.website_name || 'Website';
  const domainName = client.domain_name || client.website_link || 'Domain';
  const monthlyPrice = client.monthly_price_pkr || 2500;
  
  const expiryFormatted = client.expiry_date 
    ? new Date(client.expiry_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'Upcoming Due Date';

  const domainExpiryFormatted = client.domain_expiry_date 
    ? new Date(client.domain_expiry_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'Soon';

  // Generate WhatsApp Templates
  let finalMessage = '';

  if (templateType === 'hosting_reminder') {
    finalMessage = `Assalam-o-Alaikum ${clientName} sahab! 🌟\n\nUmeed hai aap khairiyat se honge. Aapki website (${websiteName}) ki monthly hosting subscription renewal date kareeb hai:\n\n📅 Expiry Date: ${expiryFormatted}\n💳 Amount Due: PKR ${monthlyPrice}\n\nKindly service ki uninterrupted running ke liye subscription clear karwa lein. Shukriya!\n\nRegards,\nNadir Habib | ${ADMIN_CONTACT.brand}\nWhatsApp: ${ADMIN_CONTACT.phone}`;
  } else if (templateType === 'domain_warning') {
    finalMessage = `Assalam-o-Alaikum ${clientName} sahab! ⚠️\n\nAapki website ka Domain Name (${domainName}) renew hone wala hai:\n\n🌐 Domain: ${domainName}\n📅 Domain Expiry: ${domainExpiryFormatted}\n\nDomain expire hone se pehle iski renewal confirmation kar lein taaki aapka brand name kisi aur ke haath na jaye.\n\nRegards,\nNadir Habib | ${ADMIN_CONTACT.brand}\nWhatsApp: ${ADMIN_CONTACT.phone}`;
  } else if (templateType === 'reactivated') {
    finalMessage = `Assalam-o-Alaikum ${clientName} sahab! ✅\n\nAapki payment receive ho gayi hai aur website (${websiteName}) ko successfully reactivate & extend kar diya gaya hai:\n\n🌐 Website: ${client.website_link || websiteName}\n📅 Next Renewal Date: ${expiryFormatted}\n\nDigizier ke sath kaam karne ka shukriya!\n\nRegards,\nNadir Habib\n${ADMIN_CONTACT.phone}`;
  } else {
    finalMessage = customMsg || `Assalam-o-Alaikum ${clientName} sahab, Nadir Habib here regarding your website ${websiteName}.`;
  }

  // Format clean phone number for WhatsApp
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
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Template Selector */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
              Select Message Template
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setTemplateType('hosting_reminder')}
                className={`p-3 rounded-xl border text-xs font-semibold text-left transition flex flex-col justify-between gap-1.5 ${
                  templateType === 'hosting_reminder'
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-900 shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span className="font-bold">Monthly Hosting</span>
                <span className="text-[10px] text-slate-400">Payment Reminder</span>
              </button>

              <button
                type="button"
                onClick={() => setTemplateType('domain_warning')}
                className={`p-3 rounded-xl border text-xs font-semibold text-left transition flex flex-col justify-between gap-1.5 ${
                  templateType === 'domain_warning'
                    ? 'bg-amber-50 border-amber-400 text-amber-900 shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span className="font-bold">Domain Expiry</span>
                <span className="text-[10px] text-slate-400">Renewal Warning</span>
              </button>

              <button
                type="button"
                onClick={() => setTemplateType('reactivated')}
                className={`p-3 rounded-xl border text-xs font-semibold text-left transition flex flex-col justify-between gap-1.5 ${
                  templateType === 'reactivated'
                    ? 'bg-blue-50 border-blue-400 text-blue-900 shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span className="font-bold">Reactivated</span>
                <span className="text-[10px] text-slate-400">Payment Received</span>
              </button>

              <button
                type="button"
                onClick={() => setTemplateType('custom')}
                className={`p-3 rounded-xl border text-xs font-semibold text-left transition flex flex-col justify-between gap-1.5 ${
                  templateType === 'custom'
                    ? 'bg-purple-50 border-purple-400 text-purple-900 shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span className="font-bold">Custom Note</span>
                <span className="text-[10px] text-slate-400">Write Your Own</span>
              </button>
            </div>
          </div>

          {templateType === 'custom' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Write Custom WhatsApp Message</label>
              <textarea
                rows={3}
                placeholder="Type your message here..."
                value={customMsg}
                onChange={(e) => setCustomMsg(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 font-sans"
              />
            </div>
          )}

          {/* Message Preview Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                Live WhatsApp Message Preview
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                Target: {phone ? `+${phone}` : 'No phone specified'}
              </span>
            </div>
            <pre className="text-xs text-slate-700 font-sans whitespace-pre-wrap bg-white p-3.5 rounded-xl border border-slate-200 leading-relaxed max-h-48 overflow-y-auto">
              {finalMessage}
            </pre>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied Message!' : 'Copy Text'}</span>
            </button>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition"
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
