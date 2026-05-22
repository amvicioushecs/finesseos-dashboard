import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { authProvider } from "./providers";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    user = await authProvider.authenticate(opts.req);
  } catch (error) {
    // In dev mode, log if authentication failed explicitly to help debugging
    if (process.env.NODE_ENV === 'development') {
      console.debug("[Context] Auth bypassed or failed (public access):", error);
    }
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
