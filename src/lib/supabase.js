import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_KEY } from './config';

export const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY || SUPABASE_ANON_KEY);

export const LOCAL_STORAGE_KEY = 'website_controller_clients_v2';
export const AFFILIATES_STORAGE_KEY = 'website_controller_affiliates_v1';
export const EMERGENCY_USERS_STORAGE_KEY = 'website_controller_emergency_users_v1';

// Valid columns in public.client_websites table
const ALLOWED_COLUMNS = [
  'id', 'site_key', 'client_name', 'client_phone', 'website_name', 'website_link',
  'vercel_email', 'supabase_email', 'github_email', 'cloudflare_email', 'cronjob_email',
  'billing_cycle', 'expiry_date', 'status', 'custom_notice', 'created_at',
  'supabase_url', 'publishable_key', 'supabase_password', 'connection_string',
  'cli_setup', 'anon_key', 'service_role_key', 'cron_job_id', 'cron_enabled',
  'cron_api_key',
  // Extended fields
  'client_location', 'domain_name', 'domain_purchase_date', 'domain_expiry_date',
  'domain_registrar', 'hosting_email', 'hosting_password', 'github_repo_url',
  'github_token', 'cloudflare_api_key', 'resend_api_key', 'resend_from_email',
  'lock_mode', 'affiliate_id', 'monthly_price_pkr', 'payment_status',
  // Dynamic White-label & Lock Customization
  'admin_whatsapp', 'admin_name', 'admin_brand',
  'lock_heading', 'lock_btn_text', 'under_construction_heading',
  'under_construction_badge'
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

// Helper to check if database table exists and is accessible
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

// Fetch all client websites directly from Cloud Database (always returns valid Array)
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
    const parsed = local ? JSON.parse(local) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('[Fetch Clients Error]', err);
    try {
      const local = localStorage.getItem(LOCAL_STORAGE_KEY);
      const parsed = local ? JSON.parse(local) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
}

// Add a new client website to Central Cloud Database
export async function createClientWebsite(clientData) {
  const payload = sanitizePayload(clientData);
  let created = null;

  try {
    const { data, error } = await supabase
      .from('client_websites')
      .insert([payload])
      .select();

    if (error) {
      console.error('[Insert Client Error]', error);
    } else if (data && data[0]) {
      created = data[0];
    }
  } catch (err) {
    console.error('[Insert Client Exception]', err);
  }

  if (!created) {
    created = { ...payload, id: payload.id || 'client-' + Date.now() };
  }

  const currentClients = await fetchClients();
  const updatedList = [created, ...currentClients.filter(c => c.id !== created.id && c.site_key !== created.site_key)];
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedList));
  return created;
}

// Update client website in Central Cloud Database
export async function updateClientWebsite(id, updates) {
  const payload = sanitizePayload(updates);

  try {
    const { error } = await supabase
      .from('client_websites')
      .update(payload)
      .eq('id', id);

    if (error) {
      console.error('[Update Client Error]', error);
    }
  } catch (err) {
    console.error('[Update Client Exception]', err);
  }

  const currentClients = await fetchClients();
  const updatedList = currentClients.map(c => c.id === id ? { ...c, ...payload } : c);
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedList));
  return updatedList.find(c => c.id === id);
}

// Delete client website from Central Cloud Database
export async function deleteClientWebsite(id) {
  try {
    const { error } = await supabase
      .from('client_websites')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[Delete Client Error]', error);
    }
  } catch (err) {
    console.error('[Delete Client Exception]', err);
  }

  const currentClients = await fetchClients();
  const updatedList = currentClients.filter(c => c.id !== id);
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedList));
  return true;
}

// Quick extend client expiry date (safe ISO calculation)
export async function extendClientExpiry(id, currentExpiry, daysToAdd) {
  let baseDate = new Date();
  const existingDate = new Date(currentExpiry);
  if (!isNaN(existingDate.getTime()) && existingDate > baseDate) {
    baseDate = existingDate;
  }

  baseDate.setDate(baseDate.getDate() + daysToAdd);
  const newExpiry = baseDate.toISOString();

  return await updateClientWebsite(id, { 
    expiry_date: newExpiry,
    status: true
  });
}

// -------------------------------------------------------------
// AFFILIATES / SUB-ADMINS (GUARANTEED ARRAY RETURN)
// -------------------------------------------------------------

export async function fetchAffiliates() {
  try {
    const { data, error } = await supabase
      .from('controller_affiliates')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && Array.isArray(data)) {
      localStorage.setItem(AFFILIATES_STORAGE_KEY, JSON.stringify(data));
      return data;
    }
    const local = localStorage.getItem(AFFILIATES_STORAGE_KEY);
    const parsed = local ? JSON.parse(local) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('[Fetch Affiliates Error]', err);
    try {
      const local = localStorage.getItem(AFFILIATES_STORAGE_KEY);
      const parsed = local ? JSON.parse(local) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
}

export async function createAffiliate(affiliateData) {
  try {
    const { data, error } = await supabase
      .from('controller_affiliates')
      .insert([affiliateData])
      .select();

    if (error) {
      console.error('[Create Affiliate Error]', error);
      return null;
    }
    return data && data[0] ? data[0] : null;
  } catch (err) {
    console.error('[Create Affiliate Exception]', err);
    return null;
  }
}

export async function updateAffiliate(id, updates) {
  try {
    const { data, error } = await supabase
      .from('controller_affiliates')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) {
      console.error('[Update Affiliate Error]', error);
      return null;
    }
    return data && data[0] ? data[0] : null;
  } catch (err) {
    console.error('[Update Affiliate Exception]', err);
    return null;
  }
}

export async function deleteAffiliate(id) {
  try {
    const { error } = await supabase
      .from('controller_affiliates')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[Delete Affiliate Error]', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[Delete Affiliate Exception]', err);
    return false;
  }
}

// -------------------------------------------------------------
// EMERGENCY CONTROLLER ACCESS USERS (GUARANTEED ARRAY RETURN)
// -------------------------------------------------------------

export async function fetchEmergencyUsers() {
  try {
    const { data, error } = await supabase
      .from('controller_emergency_users')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && Array.isArray(data)) {
      localStorage.setItem(EMERGENCY_USERS_STORAGE_KEY, JSON.stringify(data));
      return data;
    }
    const local = localStorage.getItem(EMERGENCY_USERS_STORAGE_KEY);
    const parsed = local ? JSON.parse(local) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('[Fetch Emergency Users Error]', err);
    try {
      const local = localStorage.getItem(EMERGENCY_USERS_STORAGE_KEY);
      const parsed = local ? JSON.parse(local) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
}

export async function createEmergencyUser(userData) {
  try {
    const { data, error } = await supabase
      .from('controller_emergency_users')
      .insert([userData])
      .select();

    if (error) {
      console.error('[Create Emergency User Error]', error);
      return null;
    }
    return data && data[0] ? data[0] : null;
  } catch (err) {
    console.error('[Create Emergency User Exception]', err);
    return null;
  }
}

export async function updateEmergencyUser(id, updates) {
  try {
    const { data, error } = await supabase
      .from('controller_emergency_users')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) {
      console.error('[Update Emergency User Error]', error);
      return null;
    }
    return data && data[0] ? data[0] : null;
  } catch (err) {
    console.error('[Update Emergency User Exception]', err);
    return null;
  }
}

export async function deleteEmergencyUser(id) {
  try {
    const { error } = await supabase
      .from('controller_emergency_users')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[Delete Emergency User Error]', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[Delete Emergency User Exception]', err);
    return false;
  }
}

// -------------------------------------------------------------
// MASTER CONTROLLER PROFILE (NADIR HABIB / DIGIZIER)
// -------------------------------------------------------------

export async function fetchMasterProfile() {
  try {
    const { data, error } = await supabase
      .from('controller_master_profile')
      .select('*')
      .eq('id', 'master')
      .single();

    if (!error && data) return data;
  } catch (err) {
    console.error('[Fetch Master Profile Error]', err);
  }

  return {
    id: 'master',
    name: 'Nadir Habib',
    phone: '03222685868',
    whatsapp: '923222685868',
    brand: 'Digizier • Nadir Habib Protection System',
    owner_role: 'Digizier Owner'
  };
}

export async function updateMasterProfile(updates) {
  try {
    const { data, error } = await supabase
      .from('controller_master_profile')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', 'master')
      .select()
      .single();

    if (!error && data) return data;
  } catch (err) {
    console.error('[Update Master Profile Error]', err);
  }
  return null;
}
