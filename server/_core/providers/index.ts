import { SupabaseAuthProvider } from "./supabaseAuth";
import { SupabaseDataProvider } from "./supabaseData";
import { MySqlDataProvider } from "./mysqlData";
import type { IAuthProvider, IDataProvider } from "./types";
import { PROVIDER_CONFIG } from "./config";

export const authProvider: IAuthProvider = new SupabaseAuthProvider();

// Use Supabase for data if configured, otherwise fallback to MySQL
const isSupabaseDb = PROVIDER_CONFIG.database.url.includes("supabase.co") || PROVIDER_CONFIG.database.url.includes(":5432");

export const dataProvider: IDataProvider = isSupabaseDb 
  ? new SupabaseDataProvider()
  : new MySqlDataProvider();
