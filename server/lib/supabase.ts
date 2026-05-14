import { createServerClient } from '@supabase/ssr';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;

export function createServerSupabaseClient(req?: any, res?: any) {
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        if (!req?.cookies) return [];
        return Object.keys(req.cookies).map((name) => ({
          name,
          value: req.cookies[name],
        }));
      },
      setAll(cookiesToSet) {
        if (!res) return;
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            res.cookie(name, value, options);
          });
        } catch (error) {
          console.warn('Cookie set failed in Supabase client', error);
        }
      },
    },
  });
}
