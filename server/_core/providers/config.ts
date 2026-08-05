import "dotenv/config";

/**
 * Centralized provider configuration.
 * This module catalogs all infrastructure dependencies and environment variables,
 * providing a single point of truth for provider-specific handling.
 */

export const PROVIDER_CONFIG = {
  // Storage configuration (S3-compatible)
  storage: {
    bucket: process.env.STORAGE_BUCKET || "",
    endpoint: process.env.STORAGE_ENDPOINT || "", 
    accessKeyId: process.env.STORAGE_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY || "",
    region: process.env.STORAGE_REGION || "us-east-1",
  },
  
  // Core infrastructure
  auth: {
    jwtSecret: process.env.JWT_SECRET || "dev-only-secret-do-not-use-in-prod",
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
  
  // WorkOS AuthKit configuration
  workos: {
    clientId: process.env.WORKOS_CLIENT_ID || "",
    apiKey: process.env.WORKOS_API_KEY || "",
    redirectUri: process.env.WORKOS_REDIRECT_URI || "http://localhost:5000/api/auth/callback",
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
  console.log("[Config] Validating configuration...");
  
  const missing: string[] = [];
  
  // Database and Auth keys are required
  if (!PROVIDER_CONFIG.database.url) missing.push("DATABASE_URL");
  if (!PROVIDER_CONFIG.auth.jwtSecret) missing.push("JWT_SECRET");

  if (missing.length > 0) {
    console.warn(`[Config] Missing environment variables: ${missing.join(", ")}`);
    if (PROVIDER_CONFIG.runtime.isProduction) {
      console.error("[Config] Warning: Critical environment variables missing.");
    }
  } else {
    console.log("[Config] Configuration valid.");
  }
}
