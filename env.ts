/// <reference types="vite/client" />

/**
 * Environment configuration loader and validator for BdSmartLeadX-02
 */

export interface EnvironmentConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseServiceKey?: string;
  appUrl: string;
}

export function getEnvironmentConfig(): EnvironmentConfig {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const supabaseServiceKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY || '';
  const appUrl = import.meta.env.VITE_APP_URL || import.meta.env.APP_URL || 'http://localhost:3000';

  return {
    supabaseUrl,
    supabaseAnonKey,
    supabaseServiceKey,
    appUrl,
  };
}

export function validateEnvironment(): { isValid: boolean; missingVars: string[] } {
  const config = getEnvironmentConfig();
  const missingVars: string[] = [];

  if (!config.supabaseUrl) {
    missingVars.push('NEXT_PUBLIC_SUPABASE_URL / VITE_SUPABASE_URL');
  }

  if (!config.supabaseAnonKey) {
    missingVars.push('NEXT_PUBLIC_SUPABASE_ANON_KEY / VITE_SUPABASE_ANON_KEY');
  }

  return {
    isValid: missingVars.length === 0,
    missingVars,
  };
}
