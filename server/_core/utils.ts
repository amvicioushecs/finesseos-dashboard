/**
 * Extract the domain from a URL string.
 * e.g. "https://www.shopify.com/affiliates?ref=abc" → "shopify.com"
 */
export function extractDomain(url: string): string {
  try {
    const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
    // Remove www. prefix for cleaner domain lookup
    return parsed.hostname.replace(/^www\./, "");
  } catch {
    // If URL parsing fails, try to extract domain manually
    const match = url.match(/(?:https?:\/\/)?(?:www\.)?([^/?\s]+)/);
    return match ? match[1] : url;
  }
}
