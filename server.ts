import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getEnvironmentConfig } from '../env';

export function createServerSupabaseClient(accessToken?: string): SupabaseClient {
  const { supabaseUrl, supabaseAnonKey, supabaseServiceKey } = getEnvironmentConfig();
  const url = supabaseUrl || 'https://placeholder.supabase.co';
  const keyToUse = supabaseServiceKey || supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.placeholder';

  const client = createClient(url, keyToUse, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: accessToken
      ? {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      : undefined,
  });

  return client;
}
