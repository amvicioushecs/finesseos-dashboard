import { createServerSupabaseClient } from "../../lib/supabase";
import { PROVIDER_CONFIG } from "./config";
import type { IAuthProvider } from "./types";
import type { Request } from "express";
import type { User } from "../../../drizzle/schema";
import { ForbiddenError } from "@shared/_core/errors";
import { dataProvider } from "./index";

export class SupabaseAuthProvider implements IAuthProvider {
  async authenticate(req: Request): Promise<User> {
    const supabase = createServerSupabaseClient(req);

    // Try to verify with Supabase
    const { data: { user: sbUser }, error } = await supabase.auth.getUser();

    if (error || !sbUser) {
      throw ForbiddenError("Invalid Supabase session");
    }

    // Map Supabase user to our local user
    let user = await dataProvider.getUserByOpenId(sbUser.id);

    if (!user && sbUser.email) {
      // Check if we have a user with this email but different openId (legacy migration)
      user = await dataProvider.getUserByOpenId(sbUser.email);
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
    } else if (user.openId !== sbUser.id) {
      // Update legacy user to use Supabase ID as openId
      await dataProvider.upsertUser({
        openId: sbUser.id,
        email: sbUser.email || user.email,
        lastSignedIn: new Date(),
      });
      user = await dataProvider.getUserByOpenId(sbUser.id);
    }

    if (!user) throw ForbiddenError("User not found after Supabase sync");

    return user;
  }

  async createSession(userId: string, name?: string): Promise<string> {
    throw new Error("createSession not implemented for SupabaseAuthProvider (handled by Supabase SDK)");
  }

  async verifySession(token: string): Promise<{ userId: string; name: string } | null> {
    // This is less common in Supabase flow where cookies are used, but implemented for compatibility
    const { data: { user }, error } = await createServerSupabaseClient().auth.getUser(token);
    if (error || !user) return null;
    return {
      userId: user.id,
      name: user.user_metadata?.full_name || user.email || "",
    };
  }

  async handleCallback(code: string, state: string): Promise<{ openId: string; name: string; email?: string | null; platform?: string }> {
    throw new Error("handleCallback not implemented for SupabaseAuthProvider");
  }
}
