import { describe, expect, it } from "vitest";
import { extractDomain } from "./utils";

describe("extractDomain", () => {
  it("should extract domain from https URL", () => {
    expect(extractDomain("https://www.shopify.com/affiliates")).toBe("shopify.com");
  });

  it("should extract domain from http URL", () => {
    expect(extractDomain("http://shopify.com")).toBe("shopify.com");
  });

  it("should extract domain from URL without protocol", () => {
    expect(extractDomain("www.shopify.com/abc")).toBe("shopify.com");
  });

  it("should handle subdomains", () => {
    expect(extractDomain("https://app.clickfunnels.com")).toBe("app.clickfunnels.com");
  });

  it("should handle raw domain strings", () => {
    expect(extractDomain("shopify.com")).toBe("shopify.com");
  });
});
