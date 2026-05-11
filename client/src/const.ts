export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

/**
 * Generate login URL at runtime.
 * Now exclusively supports the internal /login route (Supabase).
 */
export const getLoginUrl = () => {
  return "/login";
};
