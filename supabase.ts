
import { createClient } from '@supabase/supabase-js';

// No ambiente local, crie um arquivo .env com essas chaves.
// Na Vercel, adicione essas chaves em 'Environment Variables'.
// Fix: Added type assertion to import.meta to resolve "Property 'env' does not exist on type 'ImportMeta'" errors
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://docodhhudvyszvfbpict.supabase.co';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'sb_publishable_vHYGIfDNN3is-zzGtQ4dVw_u52aGzWI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
