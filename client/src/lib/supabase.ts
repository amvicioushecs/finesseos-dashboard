import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const createClient = () => {
  return createBrowserClient(supabaseUrl!, supabaseAnonKey!);
};

// Singleton for easy use in client components
export const supabase = createClient();
