import { PROVIDER_CONFIG } from "./providers/config";

export const ENV = {
  cookieSecret: PROVIDER_CONFIG.auth.jwtSecret,
  databaseUrl: PROVIDER_CONFIG.database.url,
  supabaseUrl: PROVIDER_CONFIG.supabase.url,
  supabaseAnonKey: PROVIDER_CONFIG.supabase.anonKey,
  isProduction: PROVIDER_CONFIG.runtime.isProduction,
  llmApiUrl: PROVIDER_CONFIG.llm.apiUrl,
  llmApiKey: PROVIDER_CONFIG.llm.apiKey,
  llmModel: PROVIDER_CONFIG.llm.model,
  ownerOpenId: PROVIDER_CONFIG.auth.ownerOpenId,
  storageBucket: PROVIDER_CONFIG.storage.bucket,
  storageEndpoint: PROVIDER_CONFIG.storage.endpoint,
  storageAccessKeyId: PROVIDER_CONFIG.storage.accessKeyId,
  storageSecretAccessKey: PROVIDER_CONFIG.storage.secretAccessKey,
  storageRegion: PROVIDER_CONFIG.storage.region,
};
