import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { PROVIDER_CONFIG } from "./config";
import type { IAuthProvider } from "./types";
import type { Request } from "express";
import type { User } from "../../../drizzle/schema";
import { ForbiddenError } from "@shared/_core/errors";
import { dataProvider } from "./index";
import { COOKIE_NAME } from "@shared/const";
import { parse as parseCookieHeader } from "cookie";

export class SupabaseAuthProvider implements IAuthProvider {
  private client: SupabaseClient;

  constructor() {
    this.client = createClient(
      PROVIDER_CONFIG.supabase.url,
      PROVIDER_CONFIG.supabase.serviceRoleKey || PROVIDER_CONFIG.supabase.anonKey
    );
  }

  async authenticate(req: Request): Promise<User> {
    const cookieHeader = req.headers.cookie;
    if (!cookieHeader) throw ForbiddenError("Missing cookie header");

    const parsed = parseCookieHeader(cookieHeader);
    const sessionToken = parsed[COOKIE_NAME];
    if (!sessionToken) throw ForbiddenError("Missing session cookie");

    // Try to verify with Supabase
    const { data: { user: sbUser }, error } = await this.client.auth.getUser(sessionToken);

    if (error || !sbUser) {
      // If Supabase fails, this provider cannot authenticate
      throw ForbiddenError("Invalid Supabase session");
    }

    // Map Supabase user to our local user
    // We search by email or a new provider-neutral ID mapping
    let user = await dataProvider.getUserByOpenId(sbUser.id); // Assuming we store SB ID in openId or externalId

    if (!user && sbUser.email) {
      user = await dataProvider.getUserByOpenId(sbUser.email); // Fallback to email search
    }

    if (!user) {
      // Auto-provision user from Supabase info
      await dataProvider.upsertUser({
        openId: sbUser.id,
        name: sbUser.user_metadata?.full_name || sbUser.email || "Supabase User",
        email: sbUser.email || null,
        loginMethod: sbUser.app_metadata?.provider || "supabase",
        lastSignedIn: new Date(),
      });
      user = await dataProvider.getUserByOpenId(sbUser.id);
    }

    if (!user) throw ForbiddenError("User not found after Supabase sync");

    return user;
  }

  async createSession(userId: string, name?: string): Promise<string> {
    // Usually Supabase handles session creation on the frontend
    throw new Error("createSession not implemented for SupabaseAuthProvider (handled by Supabase UI/SDK)");
  }

  async verifySession(token: string): Promise<{ userId: string; name: string } | null> {
    const { data: { user }, error } = await this.client.auth.getUser(token);
    if (error || !user) return null;
    return {
      userId: user.id,
      name: user.user_metadata?.full_name || user.email || "",
    };
  }

  async handleCallback(code: string, state: string): Promise<{ openId: string; name: string; email?: string; platform?: string }> {
    // Supabase handles OAuth callbacks directly or via its own flow
    throw new Error("handleCallback not implemented for SupabaseAuthProvider");
  }
}
