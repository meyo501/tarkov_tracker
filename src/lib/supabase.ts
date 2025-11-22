import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Item {
  id: string;
  name: string;
  quantity_needed: number;
  created_at: string;
  user_id: string | null;
}

export interface FoundItem {
  id: string;
  item_name: string;
  quantity: number;
  found_at: string;
  user_id: string | null;
}
