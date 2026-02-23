// FinesseOS Pro — Affiliate Intelligence Router Tests
// Tests the generateIntelligence tRPC procedure schema validation

import { describe, expect, it } from "vitest";
import { z } from "zod";

// ─── Schema mirror for testing ───────────────────────────────────────────────
// We test the schema validation logic without calling the LLM in unit tests

const PersonaSchema = z.object({
  name: z.string(),
  pain: z.string(),
  hook: z.string(),
  platform: z.string(),
});

const IntelligenceSchema = z.object({
  brandName: z.string(),
  category: z.string(),
  platform: z.string(),
  slug: z.string(),
  commission: z.string(),
  keywordResearch: z.array(z.string()).min(5).max(10),
  marketingAngle: z.string(),
  personas: z.array(PersonaSchema).min(3).max(4),
  contentSuggestions: z.array(z.string()).min(5).max(6),
  targetPlatforms: z.array(z.string()).min(3).max(5),
  strategyNotes: z.string(),
  disclosure: z.string(),
  complianceRules: z.array(z.string()).min(3).max(5),
  complianceStatus: z.enum(["passed", "warning", "failed"]),
});

const validIntelligencePayload = {
  brandName: "ClickFunnels",
  category: "SaaS / Marketing",
  platform: "YouTube",
  slug: "CLICKFUNNELS-FUNNEL-BUILDER",
  commission: "20-40% recurring",
  keywordResearch: [
    "clickfunnels review",
    "best sales funnel builder",
    "clickfunnels tutorial",
    "clickfunnels pricing",
    "clickfunnels vs leadpages",
    "how to build a sales funnel",
    "clickfunnels affiliate program",
    "sales funnel software",
  ],
  marketingAngle: "Unlock the 'Automated Sales Machine' — Stop trading time for money and let your funnel work 24/7.",
  personas: [
    { name: "The Struggling Coach", pain: "Can't convert leads into paying clients", hook: "How to fill your calendar with high-ticket clients on autopilot", platform: "YouTube" },
    { name: "The Side Hustle Seeker", pain: "Wants passive income but doesn't know where to start", hook: "Build a $5K/month funnel in 30 days with zero tech skills", platform: "TikTok" },
    { name: "The Agency Owner", pain: "Spending too much time on manual sales processes", hook: "Automate your entire sales pipeline and close deals while you sleep", platform: "LinkedIn" },
  ],
  contentSuggestions: [
    "I made $10,000 in 30 days with ClickFunnels — here's the exact funnel",
    "ClickFunnels vs Kajabi vs Kartra — which is actually worth it?",
    "The 3-step funnel that converted 40% of cold traffic",
    "Why I switched from WordPress to ClickFunnels (and never looked back)",
    "ClickFunnels tutorial for beginners — build your first funnel in 20 minutes",
  ],
  targetPlatforms: ["YouTube", "Email Marketing", "Facebook Groups", "LinkedIn", "Blog/SEO"],
  strategyNotes: "Focus on tutorial and comparison content for YouTube — ClickFunnels buyers are research-heavy. Build an email list with a free funnel template lead magnet, then promote the ClickFunnels trial via email sequence.",
  disclosure: "As an affiliate, I earn a commission from qualifying purchases made through links on this page. This comes at no extra cost to you.",
  complianceRules: [
    "Include FTC disclosure at the top of all content containing affiliate links",
    "Do not make income claims without substantiation (e.g., 'guaranteed to make $X')",
    "Label all sponsored content and paid partnerships clearly",
    "Do not use misleading headlines that imply free access to paid tools",
  ],
  complianceStatus: "passed" as const,
};

describe("affiliate intelligence schema", () => {
  it("validates a complete intelligence payload successfully", () => {
    const result = IntelligenceSchema.safeParse(validIntelligencePayload);
    expect(result.success).toBe(true);
  });

  it("rejects payload with too few keywords", () => {
    const payload = { ...validIntelligencePayload, keywordResearch: ["only one keyword", "two keywords"] };
    const result = IntelligenceSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });

  it("rejects payload with too few personas", () => {
    const payload = { ...validIntelligencePayload, personas: [validIntelligencePayload.personas[0]] };
    const result = IntelligenceSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });

  it("rejects invalid compliance status", () => {
    const payload = { ...validIntelligencePayload, complianceStatus: "unknown" };
    const result = IntelligenceSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });

  it("rejects payload missing required fields", () => {
    const { brandName: _removed, ...incomplete } = validIntelligencePayload;
    const result = IntelligenceSchema.safeParse(incomplete);
    expect(result.success).toBe(false);
  });

  it("accepts warning compliance status", () => {
    const payload = { ...validIntelligencePayload, complianceStatus: "warning" as const };
    const result = IntelligenceSchema.safeParse(payload);
    expect(result.success).toBe(true);
  });

  it("accepts failed compliance status", () => {
    const payload = { ...validIntelligencePayload, complianceStatus: "failed" as const };
    const result = IntelligenceSchema.safeParse(payload);
    expect(result.success).toBe(true);
  });

  it("validates persona structure correctly", () => {
    const validPersona = { name: "Test User", pain: "Has a problem", hook: "Here is the solution", platform: "TikTok" };
    const result = PersonaSchema.safeParse(validPersona);
    expect(result.success).toBe(true);
  });

  it("rejects persona missing required fields", () => {
    const invalidPersona = { name: "Test User", pain: "Has a problem" }; // missing hook and platform
    const result = PersonaSchema.safeParse(invalidPersona);
    expect(result.success).toBe(false);
  });
});
