/**
 * Standalone Client Protection & Lock Controller Script (v2.0 Pro)
 * Created by Nadir Habib / DG ZIYAR
 * Features:
 * - Anti-Cache Realtime Status Busting (&_ts=${Date.now()})
 * - Immediate Reactivation without Mobile/Browser Cache Lag
 * - Dual Mode Support: Payment Overdue Lock vs Under Construction Screen
 * - Dynamic Notice Replacement: {client_name}, {website_name}, {phone}, {admin_phone}, {expiry_date}
 */

(function() {
  const SCRIPT_EL = document.currentScript || document.querySelector('script[data-site-key]');
  const SITE_KEY = SCRIPT_EL ? SCRIPT_EL.getAttribute('data-site-key') : (window.NADER_SITE_KEY || 'site_estate_pro');
  const FORCE_LOCK = SCRIPT_EL ? SCRIPT_EL.getAttribute('data-force-lock') === 'true' : false;
  
  const SUPABASE_URL = 'https://pggolsqtamtkafrpigfo.supabase.co';
  const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnZ29sc3F0YW10a2FmcnBpZ2ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUyNDE3ODgsImV4cCI6MjEwMDgxNzc4OH0.98_YWbdZ6hlpMiujbiWLYPRYlrvnx2_I31FyGILixHs';
  const WHATSAPP_NUM = '03222685868';
  const WHATSAPP_LINK = 'https://wa.me/923222685868?text=Hello%20Nadir%20Habib,%20I%20want%20to%20clear%20my%20website%20payment.';

  if (FORCE_LOCK) {
    renderLockOverlay({ billing_cycle: 'monthly', lock_mode: 'payment' });
    return;
  }

  // Format custom notices with dynamic placeholders: {client_name}, {website_name}, {phone}, {admin_phone}, {expiry_date}
  function formatNotice(notice, record, fallback) {
    let text = (notice && notice.trim()) ? notice : fallback;
    if (!text) return '';
    return text
      .replace(/\{client_name\}|\{name\}/gi, (record && record.client_name) || 'Valued Client')
      .replace(/\{website_name\}|\{website\}/gi, (record && record.website_name) || '')
      .replace(/\{client_phone\}|\{phone\}/gi, (record && record.client_phone) || '')
      .replace(/\{admin_phone\}/gi, WHATSAPP_NUM)
      .replace(/\{expiry_date\}|\{expiry\}/gi, (record && record.expiry_date) ? new Date(record.expiry_date).toLocaleDateString('en-GB') : '');
  }

  async function checkWebsiteStatus() {
    try {
      // ANTI-CACHE URL with timestamp parameter so browser NEVER serves stale locked data
      const timestamp = Date.now();
      const endpoint = `${SUPABASE_URL}/rest/v1/client_websites?site_key=eq.${encodeURIComponent(SITE_KEY)}&select=*&_ts=${timestamp}`;
      
      const res = await fetch(endpoint, {
        method: 'GET',
        cache: 'no-store',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });

      if (!res.ok) {
        if (window.NADER_LOCK_TEST === true) {
          renderLockOverlay({ billing_cycle: 'monthly', lock_mode: 'payment' });
        }
        return;
      }

      const data = await res.json();
      if (!data || data.length === 0) {
        if (window.NADER_LOCK_TEST === true) {
          renderLockOverlay({ billing_cycle: 'monthly', lock_mode: 'payment' });
        }
        return;
      }

      const record = data[0];
      const now = new Date();
      const expiry = new Date(record.expiry_date);
      const isExpired = now > expiry;
      const isDisabled = record.status === false;

      // If Disabled or Expired, trigger the appropriate lock overlay
      if (isDisabled || isExpired) {
        if (record.lock_mode === 'under_construction') {
          renderLockOverlay(record, 'under_construction');
        } else {
          renderLockOverlay(record, 'payment');
        }
      }
    } catch (err) {
      console.error('[Website-Controller] Status check failed', err);
      if (window.NADER_LOCK_TEST === true) {
        renderLockOverlay({ billing_cycle: 'monthly', lock_mode: 'payment' });
      }
    }
  }

  function renderLockOverlay(record, mode = 'payment') {
    function inject() {
      if (document.getElementById('nader-habib-lock-overlay')) return;
      document.documentElement.style.overflow = 'hidden';
      if (document.body) document.body.style.overflow = 'hidden';

      const overlay = document.createElement('div');
      overlay.id = 'nader-habib-lock-overlay';
      overlay.style.cssText = `
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        background: #090d16 !important;
        color: #ffffff !important;
        z-index: 999999999 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
        text-align: center !important;
        padding: 24px !important;
        box-sizing: border-box !important;
      `;

      const cycleText = record && record.billing_cycle === 'yearly' ? 'Yearly' : 'Monthly';

      if (mode === 'under_construction') {
        const defaultUnderConstMsg = 'This website is currently undergoing scheduled maintenance or system upgrades. Access will be restored shortly.';
        const formattedNotice = formatNotice(record && record.custom_notice, record, defaultUnderConstMsg);

        overlay.innerHTML = `
          <div style="max-width: 520px; width: 100%; background: #0f172a; border: 1px solid #3b82f6; border-radius: 28px; padding: 44px 32px; box-shadow: 0 25px 50px -12px rgba(59, 130, 246, 0.25); backdrop-filter: blur(16px);">
            <div style="width: 76px; height: 76px; margin: 0 auto 24px; background: rgba(59, 130, 246, 0.15); border: 2px solid #3b82f6; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
              <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
              </svg>
            </div>
            <span style="background: rgba(59, 130, 246, 0.18); color: #93c5fd; border: 1px solid rgba(59, 130, 246, 0.4); font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; padding: 6px 16px; border-radius: 9999px; display: inline-block; margin-bottom: 16px;">
              Maintenance & Development Mode
            </span>
            <h1 style="font-size: 26px; font-weight: 800; color: #ffffff; margin: 0 0 12px 0; line-height: 1.3;">
              Website Under Construction
            </h1>
            <p style="font-size: 15px; color: #94a3b8; line-height: 1.6; margin: 0 0 24px 0;">
              ${formattedNotice}
            </p>
            <div style="background: #1e293b; border: 1px solid #334155; border-radius: 16px; padding: 16px; margin-bottom: 24px;">
              <div style="font-size: 13px; color: #94a3b8; margin-bottom: 4px;">Direct Administration Contact</div>
              <div style="font-size: 20px; font-weight: 700; color: #38bdf8; letter-spacing: 0.5px;">${WHATSAPP_NUM}</div>
            </div>
            <div style="margin-top: 16px; font-size: 12px; color: #64748b;">
              DIGIZIER • Quality Assurance System
            </div>
          </div>
        `;
      } else {
        const defaultPaymentMsg = `Your ${cycleText.toLowerCase()} website hosting subscription is currently locked. To unlock and restore access immediately, please contact Nadir Habib.`;
        const formattedNotice = formatNotice(record && record.custom_notice, record, defaultPaymentMsg);

        overlay.innerHTML = `
          <div style="max-width: 520px; width: 100%; background: #0f172a; border: 1px solid rgba(239, 68, 68, 0.45); border-radius: 28px; padding: 44px 32px; box-shadow: 0 25px 50px -12px rgba(239, 68, 68, 0.25); backdrop-filter: blur(16px);">
            <div style="width: 76px; height: 76px; margin: 0 auto 24px; background: rgba(239, 68, 68, 0.15); border: 2px solid rgba(239, 68, 68, 0.5); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
              <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
            <span style="background: rgba(239, 68, 68, 0.2); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.35); font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; padding: 6px 16px; border-radius: 9999px; display: inline-block; margin-bottom: 16px;">
              Website Access Locked • ${cycleText} Payment Overdue
            </span>
            <h1 style="font-size: 26px; font-weight: 800; color: #ffffff; margin: 0 0 12px 0; line-height: 1.3;">
              Nadir Habib Payment Remaining
            </h1>
            <p style="font-size: 15px; color: #94a3b8; line-height: 1.6; margin: 0 0 24px 0;">
              ${formattedNotice}
            </p>
            <div style="background: #1e293b; border: 1px solid #334155; border-radius: 16px; padding: 16px; margin-bottom: 24px;">
              <div style="font-size: 13px; color: #94a3b8; margin-bottom: 4px;">Direct WhatsApp Support</div>
              <div style="font-size: 20px; font-weight: 700; color: #10b981; letter-spacing: 0.5px;">${WHATSAPP_NUM}</div>
            </div>
            <a href="${WHATSAPP_LINK}" target="_blank" rel="noopener noreferrer" style="display: flex; align-items: center; justify-content: center; gap: 10px; background: #10b981; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 16px; padding: 14px 24px; border-radius: 14px; box-shadow: 0 10px 20px -5px rgba(16, 185, 129, 0.4); transition: transform 0.2s ease;">
              Contact Nadir Habib on WhatsApp
            </a>
            <div style="margin-top: 20px; font-size: 12px; color: #64748b;">
              DIGIZIER • Premium Controller System
            </div>
          </div>
        `;
      }

      document.documentElement.appendChild(overlay);
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', inject);
    } else {
      inject();
    }
  }

  checkWebsiteStatus();
})();
