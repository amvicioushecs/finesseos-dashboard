import { SupabaseAuthProvider } from "./supabaseAuth";
import { SupabaseDataProvider } from "./supabaseData";
import type { IAuthProvider, IDataProvider } from "./types";

export const authProvider: IAuthProvider = new SupabaseAuthProvider();
export const dataProvider: IDataProvider = new SupabaseDataProvider();
