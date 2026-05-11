import { PROVIDER_CONFIG } from "./_core/providers/config";

/**
 * Brandfetch API helper — fetches brand logo, colors, and metadata from a domain.
 * Used to enrich affiliate campaign nodes with real brand assets.
 */

export interface BrandData {
  name: string;
  domain: string;
  description: string | null;
  logoUrl: string | null;
  iconUrl: string | null;
  primaryColor: string | null;
  colors: string[];
  industry: string | null;
}

interface BrandfetchLogo {
  type: string;
  theme: string;
  formats: Array<{ src: string; format: string; width?: number; height?: number }>;
}

interface BrandfetchColor {
  hex: string;
  type: string;
  brightness: number;
}

interface BrandfetchResponse {
  name?: string;
  domain?: string;
  description?: string;
  logos?: BrandfetchLogo[];
  colors?: BrandfetchColor[];
  industries?: Array<{ id: string; name: string; score: number }>;
}

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

/**
 * Pick the best logo URL from Brandfetch logos array.
 * Prefers: logo (not icon) → light theme → PNG/SVG format
 */
function pickBestLogo(logos: BrandfetchLogo[]): string | null {
  if (!logos || logos.length === 0) return null;

  // Prefer full logos over icons
  const fullLogos = logos.filter((l) => l.type === "logo");
  const candidates = fullLogos.length > 0 ? fullLogos : logos;

  // Prefer light theme (shows better on dark backgrounds)
  const lightLogos = candidates.filter((l) => l.theme === "light" || l.theme === "dark");
  const pool = lightLogos.length > 0 ? lightLogos : candidates;

  // Pick first available with a valid format
  for (const logo of pool) {
    if (logo.formats && logo.formats.length > 0) {
      // Prefer SVG, then PNG
      const svg = logo.formats.find((f) => f.format === "svg");
      const png = logo.formats.find((f) => f.format === "png");
      const best = svg || png || logo.formats[0];
      if (best?.src) return best.src;
    }
  }

  return null;
}

/**
 * Pick the best icon URL (small square logo) from Brandfetch logos.
 */
function pickBestIcon(logos: BrandfetchLogo[]): string | null {
  if (!logos || logos.length === 0) return null;

  const icons = logos.filter((l) => l.type === "icon" || l.type === "symbol");
  const pool = icons.length > 0 ? icons : logos;

  for (const logo of pool) {
    if (logo.formats && logo.formats.length > 0) {
      const png = logo.formats.find((f) => f.format === "png");
      const svg = logo.formats.find((f) => f.format === "svg");
      const best = png || svg || logo.formats[0];
      if (best?.src) return best.src;
    }
  }

  return null;
}

/**
 * Fetch brand data from Brandfetch for a given domain.
 * Returns null if the brand is not found or the API call fails.
 */
export async function fetchBrandData(domain: string): Promise<BrandData | null> {
  const apiKey = PROVIDER_CONFIG.integrations.brandfetch.apiKey;
  if (!apiKey) {
    console.warn("[Brandfetch] BRANDFETCH_API_KEY not set — skipping brand lookup");
    return null;
  }

  try {
    const url = `https://api.brandfetch.io/v2/brands/${encodeURIComponent(domain)}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(8000), // 8s timeout
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.info(`[Brandfetch] Brand not found for domain: ${domain}`);
      } else {
        console.warn(`[Brandfetch] API error ${response.status} for domain: ${domain}`);
      }
      return null;
    }

    const data = (await response.json()) as BrandfetchResponse;

    const logoUrl = pickBestLogo(data.logos ?? []);
    const iconUrl = pickBestIcon(data.logos ?? []);

    const colors = (data.colors ?? [])
      .sort((a, b) => b.brightness - a.brightness)
      .map((c) => c.hex)
      .filter(Boolean)
      .slice(0, 5);

    const primaryColor = colors[0] ?? null;

    const industry =
      data.industries && data.industries.length > 0
        ? data.industries.sort((a, b) => b.score - a.score)[0]?.name ?? null
        : null;

    return {
      name: data.name ?? domain,
      domain: data.domain ?? domain,
      description: data.description ?? null,
      logoUrl,
      iconUrl,
      primaryColor,
      colors,
      industry,
    };
  } catch (err) {
    console.error(`[Brandfetch] Failed to fetch brand for ${domain}:`, err);
    return null;
  }
}
