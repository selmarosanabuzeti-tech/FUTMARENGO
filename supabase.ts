
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://docodhhudvyszvfbpict.supabase.co';
const supabaseAnonKey = 'sb_publishable_vHYGIfDNN3is-zzGtQ4dVw_u52aGzWI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
