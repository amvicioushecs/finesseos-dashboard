import { describe, expect, it } from "vitest";

/**
 * Validates the Brandfetch API key is set and the API is reachable.
 * Uses apple.com as a known stable test domain.
 */
describe("Brandfetch API", () => {
  it("should have BRANDFETCH_API_KEY set in environment", () => {
    const key = process.env.BRANDFETCH_API_KEY;
    expect(key).toBeDefined();
    expect(key!.length).toBeGreaterThan(10);
  });

  it("should successfully fetch brand data for apple.com", async () => {
    const key = process.env.BRANDFETCH_API_KEY;
    const response = await fetch("https://api.brandfetch.io/v2/brands/apple.com", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${key}`,
      },
    });

    expect(response.status).toBe(200);

    const data = await response.json() as Record<string, unknown>;
    expect(data).toHaveProperty("name");
    expect(data).toHaveProperty("domain");
    expect((data.domain as string).toLowerCase()).toContain("apple");
  }, 15000); // 15s timeout for network call
});
