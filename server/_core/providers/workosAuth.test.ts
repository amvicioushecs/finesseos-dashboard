import { describe, it, expect, vi } from "vitest";
import { WorkOSAuthProvider } from "./workosAuth";

describe("WorkOSAuthProvider", () => {
  it("should create and verify session tokens correctly", async () => {
    const provider = new WorkOSAuthProvider();
    const token = await provider.createSession("user_123", "Test User");

    expect(token).toBeDefined();
    expect(typeof token).toBe("string");

    const payload = await provider.verifySession(token);
    expect(payload).not.toBeNull();
    expect(payload?.userId).toBe("user_123");
    expect(payload?.name).toBe("Test User");
  });

  it("should return null for invalid session tokens", async () => {
    const provider = new WorkOSAuthProvider();
    const payload = await provider.verifySession("invalid-token-string");
    expect(payload).toBeNull();
  });
});
