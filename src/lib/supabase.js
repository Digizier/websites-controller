import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_KEY } from './config';

export const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY || SUPABASE_ANON_KEY);

export const LOCAL_STORAGE_KEY = 'website_controller_clients_v2';

// Valid columns in public.client_websites table
const ALLOWED_COLUMNS = [
  'id', 'site_key', 'client_name', 'client_phone', 'website_name', 'website_link',
  'vercel_email', 'supabase_email', 'github_email', 'cloudflare_email', 'cronjob_email',
  'billing_cycle', 'expiry_date', 'status', 'custom_notice', 'created_at',
  'supabase_url', 'publishable_key', 'supabase_password', 'connection_string',
  'cli_setup', 'anon_key', 'service_role_key', 'cron_job_id', 'cron_enabled',
  'cron_api_key'
];

/**
 * Filter object payload so it only contains valid table columns
 */
function sanitizePayload(raw) {
  const clean = {};
  ALLOWED_COLUMNS.forEach(col => {
    if (raw[col] !== undefined) {
      clean[col] = raw[col] === '' ? null : raw[col];
    }
  });
  return clean;
}

// Helper to check if Supabase table exists and is accessible
export async function checkSupabaseConnection() {
  try {
    const { data, error } = await supabase
      .from('client_websites')
      .select('id')
      .limit(1);

    if (error) {
      return { connected: false, error: error.message };
    }
    return { connected: true, data };
  } catch (err) {
    return { connected: false, error: err.message };
  }
}

// Fetch all client websites directly from Supabase Cloud Database
export async function fetchClients() {
  try {
    const { data, error } = await supabase
      .from('client_websites')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && Array.isArray(data)) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
      return data;
    }

    const local = localStorage.getItem(LOCAL_STORAGE_KEY);
    return local ? JSON.parse(local) : [];
  } catch (err) {
    console.error('[Supabase Fetch Error]', err);
    const local = localStorage.getItem(LOCAL_STORAGE_KEY);
    return local ? JSON.parse(local) : [];
  }
}

// Add a new client website to Supabase Central Cloud Database
export async function createClientWebsite(clientData) {
  const payload = sanitizePayload(clientData);
  let created = null;

  try {
    const { data, error } = await supabase
      .from('client_websites')
      .insert([payload])
      .select();

    if (error) {
      console.error('[Supabase Insert Error]', error);
    } else if (data && data[0]) {
      created = data[0];
    }
  } catch (err) {
    console.error('[Supabase Insert Exception]', err);
  }

  if (!created) {
    created = { ...payload, id: payload.id || 'client-' + Date.now() };
  }

  const currentClients = await fetchClients();
  const updatedList = [created, ...currentClients.filter(c => c.id !== created.id && c.site_key !== created.site_key)];
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedList));
  return created;
}

// Update client website in Supabase Central Cloud Database
export async function updateClientWebsite(id, updates) {
  const payload = sanitizePayload(updates);

  try {
    const { error } = await supabase
      .from('client_websites')
      .update(payload)
      .eq('id', id);

    if (error) {
      console.error('[Supabase Update Error]', error);
    }
  } catch (err) {
    console.error('[Supabase Update Exception]', err);
  }

  const currentClients = await fetchClients();
  const updatedList = currentClients.map(c => c.id === id ? { ...c, ...payload } : c);
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedList));
  return updatedList.find(c => c.id === id);
}

// Delete client website from Supabase Central Cloud Database
export async function deleteClientWebsite(id) {
  try {
    const { error } = await supabase
      .from('client_websites')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[Supabase Delete Error]', error);
    }
  } catch (err) {
    console.error('[Supabase Delete Exception]', err);
  }

  const currentClients = await fetchClients();
  const updatedList = currentClients.filter(c => c.id !== id);
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedList));
  return true;
}

// Quick extend client expiry date
export async function extendClientExpiry(id, currentExpiry, daysToAdd) {
  let baseDate = new Date();
  const existingDate = new Date(currentExpiry);
  if (existingDate > baseDate) {
    baseDate = existingDate;
  }
  
  const newDate = new Date(baseDate.getTime() + daysToAdd * 86400000);
  const isoString = newDate.toISOString();
  
  return await updateClientWebsite(id, {
    expiry_date: isoString,
    status: true
  });
}
