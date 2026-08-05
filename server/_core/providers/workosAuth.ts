import { WorkOS } from "@workos-inc/node";
import { SignJWT, jwtVerify } from "jose";
import { PROVIDER_CONFIG } from "./config";
import type { IAuthProvider } from "./types";
import type { Request } from "express";
import type { User } from "../../../drizzle/schema";
import { ForbiddenError, UnauthorizedError } from "@shared/_core/errors";
import { dataProvider } from "./index";
import { COOKIE_NAME } from "@shared/const";

const JWT_SECRET = new TextEncoder().encode(
  PROVIDER_CONFIG.auth.jwtSecret || "default-secret-change-me"
);

export class WorkOSAuthProvider implements IAuthProvider {
  private workos: WorkOS;

  constructor() {
    this.workos = new WorkOS(PROVIDER_CONFIG.workos.apiKey);
  }

  /**
   * Generates the WorkOS AuthKit authorization URL for browser redirect.
   */
  getAuthorizationUrl(): string {
    return this.workos.userManagement.getAuthorizationUrl({
      provider: "authkit",
      clientId: PROVIDER_CONFIG.workos.clientId,
      redirectUri: PROVIDER_CONFIG.workos.redirectUri,
    });
  }

  async authenticate(req: Request): Promise<User> {
    const token = req.cookies[COOKIE_NAME];
    if (!token) {
      console.warn("[WorkOSAuth] Authentication failed: No session cookie found.");
      throw UnauthorizedError("No session cookie found");
    }

    const payload = await this.verifySession(token);
    if (!payload) {
      console.warn("[WorkOSAuth] Authentication failed: Invalid or expired session token.");
      throw UnauthorizedError("Invalid session token");
    }

    const user = await dataProvider.getUserByOpenId(payload.userId);
    if (!user) {
      console.warn(`[WorkOSAuth] Authentication failed: User ${payload.userId} not found in database.`);
      throw ForbiddenError("User in token no longer exists");
    }

    return user;
  }

  async createSession(userId: string, name?: string): Promise<string> {
    return await new SignJWT({ userId, name: name || "" })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("30d")
      .sign(JWT_SECRET);
  }

  async verifySession(token: string): Promise<{ userId: string; name: string } | null> {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      return {
        userId: payload.userId as string,
        name: (payload.name as string) || "",
      };
    } catch (err) {
      return null;
    }
  }

  /**
   * Exchanges authorization code with WorkOS, provisions user in DB, and returns user metadata.
   */
  async handleCallback(code: string, state?: string): Promise<{ openId: string; name: string; email?: string | null; platform?: string }> {
    const authResponse = await this.workos.userManagement.authenticateWithCode({
      code,
      clientId: PROVIDER_CONFIG.workos.clientId,
    });

    const workosUser = authResponse.user;
    const name = [workosUser.firstName, workosUser.lastName].filter(Boolean).join(" ") || workosUser.email.split("@")[0];

    // Auto-provision or update user in PostgreSQL database
    await dataProvider.upsertUser({
      openId: workosUser.id,
      name,
      email: workosUser.email,
      loginMethod: "workos",
      lastSignedIn: new Date(),
    });

    return {
      openId: workosUser.id,
      name,
      email: workosUser.email,
      platform: "workos",
    };
  }
}
