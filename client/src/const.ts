export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

/**
 * Generate login URL at runtime.
 * Now points to WorkOS AuthKit login endpoint (/api/auth/login).
 */
export const getLoginUrl = () => {
  return "/api/auth/login";
};
