import { CRON_JOB_API_KEY } from './config';

const CRON_JOB_API_URL = 'https://api.cron-job.org/jobs';

/**
 * Creates or updates a genuine daily Keep-Alive Cron Job ONLY targeting the Client's own Supabase URL.
 * Will NEVER fallback to Nader's central URL.
 */
export async function createOrUpdateCronJob(clientData, customApiKey) {
  const apiKey = customApiKey || clientData.cron_api_key || CRON_JOB_API_KEY;

  if (!apiKey) {
    console.warn('[Cron-Job] Missing API Key');
    return null;
  }

  // STRICT REQUIREMENT: Client Supabase URL must be provided!
  if (!clientData.supabase_url || !clientData.supabase_url.trim()) {
    console.warn('[Cron-Job] Skipping cron creation: Client Supabase URL is empty.');
    return null;
  }

  const cleanSupabaseUrl = clientData.supabase_url.trim().replace(/\/$/, '');
  const targetUrl = `${cleanSupabaseUrl}/rest/v1/`;

  const anonKey = clientData.anon_key ? clientData.anon_key.trim() : '';

  // Format detailed descriptive title identifying client name, website name, site key & expiry date
  const expiryFormatted = clientData.expiry_date 
    ? new Date(clientData.expiry_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'N/A';

  const title = `[Keep-Alive] Client: ${clientData.client_name || 'Client'} | Site: ${clientData.website_name || 'Website'} (${clientData.site_key || 'site_key'}) | Active Until: ${expiryFormatted}`;

  const isEnabled = clientData.cron_enabled !== undefined ? clientData.cron_enabled : true;

  const payload = {
    job: {
      url: targetUrl,
      enabled: isEnabled,
      saveResponses: true,
      schedule: {
        timezone: 'Asia/Karachi',
        expiresAt: 0,
        hours: [0], // Daily at 12:00 AM Midnight
        mdays: [-1],
        minutes: [0],
        months: [-1],
        wdays: [-1]
      },
      requestMethod: 0, // GET
      extendedData: {
        headers: {
          'apikey': anonKey,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'en-US,en;q=0.9',
          'Cache-Control': 'no-cache'
        }
      },
      title
    }
  };

  try {
    // If cron_job_id exists, PATCH update it
    if (clientData.cron_job_id) {
      const updateRes = await fetch(`${CRON_JOB_API_URL}/${clientData.cron_job_id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      if (updateRes.ok) {
        return clientData.cron_job_id;
      }
    }

    // Otherwise PUT create new job
    const createRes = await fetch(CRON_JOB_API_URL, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!createRes.ok) return null;
    const data = await createRes.json();
    return data.jobId || null;
  } catch (err) {
    console.error('[Cron-Job API Error]', err);
    return null;
  }
}

/**
 * Toggle Cron Job Enabled/Disabled status
 */
export async function setCronJobStatus(jobId, enabled, customApiKey) {
  const apiKey = customApiKey || CRON_JOB_API_KEY;
  if (!apiKey || !jobId) return false;

  try {
    const res = await fetch(`${CRON_JOB_API_URL}/${jobId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        job: { enabled }
      })
    });
    return res.ok;
  } catch (err) {
    console.error('[Cron-Job API Toggle Error]', err);
    return false;
  }
}

/**
 * Delete Cron Job
 */
export async function deleteCronJob(jobId, customApiKey) {
  const apiKey = customApiKey || CRON_JOB_API_KEY;
  if (!apiKey || !jobId) return false;

  try {
    const res = await fetch(`${CRON_JOB_API_URL}/${jobId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });
    return res.ok;
  } catch (err) {
    console.error('[Cron-Job API Delete Error]', err);
    return false;
  }
}
