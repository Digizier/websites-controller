/**
 * Standalone Client Protection & Lock Controller Script
 * Created by Nader Habib / DG ZIYAR
 */

(function() {
  const SCRIPT_EL = document.currentScript || document.querySelector('script[data-site-key]');
  const SITE_KEY = SCRIPT_EL ? SCRIPT_EL.getAttribute('data-site-key') : (window.NADER_SITE_KEY || 'site_estate_pro');
  const FORCE_LOCK = SCRIPT_EL ? SCRIPT_EL.getAttribute('data-force-lock') === 'true' : false;
  
  const SUPABASE_URL = 'https://pggolsqtamtkafrpigfo.supabase.co';
  const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnZ29sc3F0YW10a2FmcnBpZ2ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUyNDE3ODgsImV4cCI6MjEwMDgxNzc4OH0.98_YWbdZ6hlpMiujbiWLYPRYlrvnx2_I31FyGILixHs';
  const WHATSAPP_NUM = '03222685868';
  const WHATSAPP_LINK = 'https://wa.me/923222685868?text=Hello%20Nader%20Habib,%20I%20want%20to%20clear%20my%20website%20payment.';

  if (FORCE_LOCK) {
    renderLockOverlay({ billing_cycle: 'monthly' });
    return;
  }

  async function checkWebsiteStatus() {
    try {
      const endpoint = `${SUPABASE_URL}/rest/v1/client_websites?site_key=eq.${encodeURIComponent(SITE_KEY)}&select=*`;
      const res = await fetch(endpoint, {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      });

      if (!res.ok) {
        // If table does not exist in Supabase yet, check local override flag
        if (window.NADER_LOCK_TEST === true) {
          renderLockOverlay({ billing_cycle: 'monthly' });
        }
        return;
      }

      const data = await res.json();
      if (!data || data.length === 0) {
        if (window.NADER_LOCK_TEST === true) {
          renderLockOverlay({ billing_cycle: 'monthly' });
        }
        return;
      }

      const record = data[0];
      const now = new Date();
      const expiry = new Date(record.expiry_date);
      const isExpired = now > expiry;
      const isDisabled = record.status === false;

      if (isExpired || isDisabled) {
        renderLockOverlay(record);
      }
    } catch (err) {
      console.error('[Website-Controller] Status check failed', err);
      if (window.NADER_LOCK_TEST === true) {
        renderLockOverlay({ billing_cycle: 'monthly' });
      }
    }
  }

  function renderLockOverlay(record) {
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
        background: #030712 !important;
        color: #ffffff !important;
        z-index: 999999999 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        font-family: system-ui, -apple-system, sans-serif !important;
        text-align: center !important;
        padding: 20px !important;
        box-sizing: border-box !important;
      `;

      const cycleText = record && record.billing_cycle === 'yearly' ? 'Yearly' : 'Monthly';

      overlay.innerHTML = `
        <div style="max-width: 520px; width: 100%; background: rgba(17, 24, 39, 0.95); border: 1px solid rgba(239, 68, 68, 0.4); border-radius: 24px; padding: 40px 32px; box-shadow: 0 25px 50px -12px rgba(239, 68, 68, 0.25); backdrop-filter: blur(16px);">
          
          <div style="width: 72px; height: 72px; margin: 0 auto 24px; background: rgba(239, 68, 68, 0.15); border: 2px solid rgba(239, 68, 68, 0.5); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </div>

          <span style="background: rgba(239, 68, 68, 0.2); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3); font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; padding: 6px 14px; border-radius: 9999px; display: inline-block; margin-bottom: 16px;">
            Website Access Locked • ${cycleText} Payment Overdue
          </span>

          <h1 style="font-size: 26px; font-weight: 800; color: #ffffff; margin: 0 0 12px 0; line-height: 1.3;">
            Nader Habib Payment Remaining
          </h1>

          <p style="font-size: 15px; color: #9ca3af; line-height: 1.6; margin: 0 0 24px 0;">
            Your ${cycleText.toLowerCase()} website hosting subscription is currently locked. To unlock and restore access immediately, please contact Nader Habib.
          </p>

          <div style="background: #1f2937; border: 1px solid #374151; border-radius: 16px; padding: 16px; margin-bottom: 24px;">
            <div style="font-size: 13px; color: #9ca3af; margin-bottom: 4px;">Direct WhatsApp Support</div>
            <div style="font-size: 20px; font-weight: 700; color: #10b981; letter-spacing: 0.5px;">
              ${WHATSAPP_NUM}
            </div>
          </div>

          <a href="${WHATSAPP_LINK}" target="_blank" rel="noopener noreferrer" style="display: flex; align-items: center; justify-content: center; gap: 10px; background: #10b981; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 16px; padding: 14px 24px; border-radius: 14px; box-shadow: 0 10px 20px -5px rgba(16, 185, 129, 0.4); transition: transform 0.2s ease;">
            Contact Nader Habib on WhatsApp
          </a>

          <div style="margin-top: 20px; font-size: 12px; color: #6b7280;">
            DG ZIYAR • Premium Controller System
          </div>
        </div>
      `;

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
