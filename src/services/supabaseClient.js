import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wzcadnxazjjynakpyvve.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_XJlIzPauhfCf8hq8ec8OxQ_mEwOCMku';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

/**
 * Cloud Key-Value Store over Supabase
 * Table: app_storage (key text primary key, value jsonb, updated_at timestamptz)
 */
export async function supabaseGet(key) {
  try {
    const { data, error } = await supabase
      .from('app_storage')
      .select('value')
      .eq('key', key)
      .maybeSingle();

    if (error) {
      console.warn(`[Supabase] Read error for key "${key}":`, error.message);
      return null;
    }
    return data ? data.value : null;
  } catch (err) {
    console.warn(`[Supabase] Exception reading key "${key}":`, err);
    return null;
  }
}

export async function supabaseSet(key, value) {
  try {
    const { error } = await supabase
      .from('app_storage')
      .upsert({
        key,
        value,
        updated_at: new Date().toISOString()
      }, { onConflict: 'key' });

    if (error) {
      console.warn(`[Supabase] Write error for key "${key}":`, error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn(`[Supabase] Exception writing key "${key}":`, err);
    return false;
  }
}

export async function supabaseGetAll() {
 try {
 const { data, error } = await supabase
 .from('app_storage')
 .select('key, value');

 if (error) {
 console.warn('[Supabase] Fetch all error:', error.message);
 return {};
 }

 const map = {};
 (data || []).forEach(row => {
 map[row.key] = row.value;
 });
 return map;
 } catch (err) {
 console.warn('[Supabase] Exception fetching all:', err);
 return {};
 }
}
