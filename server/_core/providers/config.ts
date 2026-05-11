import "dotenv/config";

/**
 * Centralized provider configuration.
 * This module catalogs all Manus/Forge dependencies and environment variables,
 * providing a single point of truth for provider-specific handling.
 */

export const PROVIDER_CONFIG = {
  // Supabase configuration
  supabase: {
    url: process.env.SUPABASE_URL || "",
    anonKey: process.env.SUPABASE_ANON_KEY || "",
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  },

  // Storage configuration (S3-compatible)
  storage: {
    bucket: process.env.STORAGE_BUCKET || "",
    endpoint: process.env.STORAGE_ENDPOINT || "", // e.g. s3.amazonaws.com or supabase.co
    accessKeyId: process.env.STORAGE_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY || "",
    region: process.env.STORAGE_REGION || "us-east-1",
  },
  
  // Core infrastructure
  auth: {
    jwtSecret: process.env.JWT_SECRET || "",
    cookieName: "manus_session", // Standardized cookie name
    ownerOpenId: process.env.OWNER_OPEN_ID || "",
  },
  database: {
    url: process.env.DATABASE_URL || "",
  },
  
  // LLM configuration
  llm: {
    apiUrl: process.env.LLM_API_URL || "https://api.openai.com/v1",
    apiKey: process.env.LLM_API_KEY || "",
    model: process.env.LLM_MODEL || "gpt-4o",
  },
  
  // Third-party integrations
  integrations: {
    brandfetch: {
      apiKey: process.env.BRANDFETCH_API_KEY || "",
    },
  },
  
  // Runtime environment
  runtime: {
    nodeEnv: process.env.NODE_ENV || "development",
    isProduction: process.env.NODE_ENV === "production",
    port: parseInt(process.env.PORT || "3000", 10),
  },
};

/**
 * Validation helper to ensure required environment variables are present.
 * This can be called during server startup.
 */
export function validateConfig() {
  const missing: string[] = [];
  
  // Database is always required
  if (!PROVIDER_CONFIG.database.url) missing.push("DATABASE_URL");
  
  // Supabase is now required
  const hasSupabase = PROVIDER_CONFIG.supabase.url && PROVIDER_CONFIG.supabase.anonKey;

  if (!hasSupabase) {
    missing.push("SUPABASE_URL and SUPABASE_ANON_KEY");
  }

  if (missing.length > 0) {
    console.warn(`[Config] Missing environment variables: ${missing.join(", ")}`);
    if (PROVIDER_CONFIG.runtime.isProduction) {
      console.error("[Config] Critical failure: Supabase configuration missing for production.");
      process.exit(1);
    }
  }
}
