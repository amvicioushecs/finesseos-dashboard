import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { authProvider } from "./providers";
import { createServerSupabaseClient } from "../lib/supabase";
import type { SupabaseClient, Session } from "@supabase/supabase-js";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
  supabase: SupabaseClient;
  session: Session | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  const supabase = createServerSupabaseClient(opts.req, opts.res);
  let user: User | null = null;
  let session: Session | null = null;

  try {
    const { data: { session: currentSession } } = await supabase.auth.getSession();
    session = currentSession;
    
    if (session) {
      user = await authProvider.authenticate(opts.req);
    }
  } catch (error) {
    // Authentication is optional for public procedures.
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
    supabase,
    session,
  };
}
