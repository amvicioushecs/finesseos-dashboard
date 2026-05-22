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

export class LocalAuthProvider implements IAuthProvider {
  async authenticate(req: Request): Promise<User> {
    const token = req.cookies[COOKIE_NAME];
    if (!token) {
      console.warn("[Auth] Authentication failed: No session cookie found.");
      // Fallback: If OWNER_OPEN_ID is set and we are in dev, auto-login
      if (PROVIDER_CONFIG.runtime.nodeEnv === "development" && PROVIDER_CONFIG.auth.ownerOpenId) {
        let user = await dataProvider.getUserByOpenId(PROVIDER_CONFIG.auth.ownerOpenId);
        if (!user) {
          await dataProvider.upsertUser({
            openId: PROVIDER_CONFIG.auth.ownerOpenId,
            name: "Owner (Dev Mode)",
            email: "owner@example.com",
            loginMethod: "local",
            lastSignedIn: new Date(),
          });
          user = await dataProvider.getUserByOpenId(PROVIDER_CONFIG.auth.ownerOpenId);
        }
        if (user) return user;
      }
      throw UnauthorizedError("No session cookie found");
    }

    const payload = await this.verifySession(token);
    if (!payload) {
      console.warn("[Auth] Authentication failed: Invalid or expired session token.");
      throw UnauthorizedError("Invalid session token");
    }

    const user = await dataProvider.getUserByOpenId(payload.userId);
    if (!user) {
      console.warn(`[Auth] Authentication failed: User ${payload.userId} not found in database.`);
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

  async handleCallback(code: string, state: string): Promise<{ openId: string; name: string; email?: string | null; platform?: string }> {
    // Basic implementation for local auth (can be extended for OAuth)
    throw new Error("OAuth callback not implemented for LocalAuthProvider");
  }
}
