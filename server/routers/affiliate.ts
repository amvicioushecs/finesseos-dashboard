// FinesseOS Pro — Affiliate Intelligence Router
// Generates keywords, personas, marketing angles, compliance, and platform targeting
// using the built-in LLM helper (no external API key required)

import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { invokeLLM } from "../_core/llm";
import { fetchBrandData, extractDomain } from "../brandfetch";

// ─── Response Schema ────────────────────────────────────────────────────────

const PersonaSchema = z.object({
  name: z.string(),
  pain: z.string(),
  hook: z.string(),
  platform: z.string(),
});

const IntelligenceSchema = z.object({
  brandName: z.string().describe("The affiliate program/brand name (e.g. ClickFunnels, Shopify)"),
  category: z.string().describe("Short category label (e.g. SaaS / Marketing, E-Commerce, Health & Wellness)"),
  platform: z.string().describe("Best primary traffic platform (e.g. TikTok, YouTube, Email, Instagram)"),
  slug: z.string().describe("URL-safe campaign slug in UPPER-KEBAB-CASE, e.g. FUNNEL-HACKER-PRO"),
  commission: z.string().describe("Estimated commission rate as a string, e.g. 40% or $50/sale"),
  keywordResearch: z.array(z.string()).min(5).max(10).describe("5-10 high-intent search keywords for this affiliate offer"),
  marketingAngle: z.string().describe("One powerful marketing angle sentence for this offer"),
  personas: z.array(PersonaSchema).min(3).max(4).describe("3-4 distinct buyer personas for this offer"),
  contentSuggestions: z.array(z.string()).min(5).max(6).describe("5-6 specific content ideas (video titles, post hooks, email subjects)"),
  targetPlatforms: z.array(z.string()).min(3).max(5).describe("3-5 best traffic platforms in order of priority"),
  strategyNotes: z.string().describe("2-3 sentence tactical strategy note for this specific offer"),
  disclosure: z.string().describe("Short FTC-compliant affiliate disclosure text, e.g. AD: I earn from qualifying purchases."),
  complianceRules: z.array(z.string()).min(3).max(5).describe("3-5 specific compliance rules for this affiliate program and platform"),
  complianceStatus: z.enum(["passed", "warning", "failed"]).describe("Overall compliance status based on the URL and program"),
});

export type GeneratedIntelligence = z.infer<typeof IntelligenceSchema>;

// ─── Router ─────────────────────────────────────────────────────────────────

export const affiliateRouter = router({
  generateIntelligence: publicProcedure
    .input(
      z.object({
        url: z.string().url("Please enter a valid URL"),
        programName: z.string().optional().describe("Optional: user-provided program name hint"),
      })
    )
    .mutation(async ({ input }) => {
      const { url, programName } = input;

      // Extract domain for context
      const domain = extractDomain(url);

      // Run Brandfetch lookup and AI generation in parallel for speed
      const [brandData, llmResponse] = await Promise.allSettled([
        fetchBrandData(domain),
        (async () => {

      const systemPrompt = `You are FinesseOS Intelligence Engine — an elite AI research system for affiliate marketers.
Your job is to analyze an affiliate program URL and generate a comprehensive intelligence package that tells the marketer exactly how to make money with that offer.
Be specific, tactical, and actionable. Think like a 7-figure affiliate marketer who knows every angle.
Always respond with valid JSON matching the exact schema provided. No markdown, no explanation — pure JSON only.`;

      const userPrompt = `Analyze this affiliate program and generate a complete intelligence package:

URL: ${url}
Domain: ${domain}
${programName ? `Program Name Hint: ${programName}` : ""}

Generate the intelligence package with:
- Brand name and category
- Best primary traffic platform
- Campaign slug (UPPER-KEBAB-CASE)
- Estimated commission rate
- 5-10 high-intent keywords people search when looking for this type of offer
- One powerful, specific marketing angle (not generic — make it compelling)
- 3-4 detailed buyer personas with their specific pain points and the hook that converts them
- 5-6 specific content ideas (actual titles/hooks, not generic descriptions)
- 3-5 best traffic platforms ranked by conversion potential for this offer
- Tactical strategy notes (specific to this offer, not generic advice)
- FTC-compliant disclosure text
- 3-5 compliance rules specific to this program and platform
- Compliance status (passed/warning/failed) based on the URL

Be specific to the actual program. If it's Shopify, talk about e-commerce. If it's ClickFunnels, talk about funnels. If it's Amazon, talk about product reviews.`;

      return await invokeLLM({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "affiliate_intelligence",
            strict: true,
            schema: {
              type: "object",
              properties: {
                brandName: { type: "string" },
                category: { type: "string" },
                platform: { type: "string" },
                slug: { type: "string" },
                commission: { type: "string" },
                keywordResearch: {
                  type: "array",
                  items: { type: "string" },
                },
                marketingAngle: { type: "string" },
                personas: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      pain: { type: "string" },
                      hook: { type: "string" },
                      platform: { type: "string" },
                    },
                    required: ["name", "pain", "hook", "platform"],
                    additionalProperties: false,
                  },
                },
                contentSuggestions: {
                  type: "array",
                  items: { type: "string" },
                },
                targetPlatforms: {
                  type: "array",
                  items: { type: "string" },
                },
                strategyNotes: { type: "string" },
                disclosure: { type: "string" },
                complianceRules: {
                  type: "array",
                  items: { type: "string" },
                },
                complianceStatus: {
                  type: "string",
                  enum: ["passed", "warning", "failed"],
                },
              },
              required: [
                "brandName", "category", "platform", "slug", "commission",
                "keywordResearch", "marketingAngle", "personas", "contentSuggestions",
                "targetPlatforms", "strategyNotes", "disclosure", "complianceRules", "complianceStatus"
              ],
              additionalProperties: false,
            },
          },
        },
      });

        })(),
      ]);

      const brand = brandData.status === "fulfilled" ? brandData.value : null;
      const llmResult = llmResponse.status === "fulfilled" ? llmResponse.value : null;

      if (!llmResult) {
        const err = llmResponse.status === "rejected" ? llmResponse.reason : new Error("AI generation failed");
        throw err;
      }

      const content = llmResult.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error("AI returned empty response. Please try again.");
      }

      let parsed: unknown;
      try {
        parsed = typeof content === "string" ? JSON.parse(content) : content;
      } catch {
        throw new Error("AI response could not be parsed. Please try again.");
      }

      // Validate with zod
      const validated = IntelligenceSchema.parse(parsed);

      // Merge Brandfetch brand data into the result
      return {
        ...validated,
        // Override brandName with official name if Brandfetch found it
        brandName: brand?.name ?? validated.brandName,
        // Brand assets from Brandfetch
        brandLogoUrl: brand?.logoUrl ?? null,
        brandIconUrl: brand?.iconUrl ?? null,
        brandPrimaryColor: brand?.primaryColor ?? null,
        brandColors: brand?.colors ?? [],
        brandDescription: brand?.description ?? null,
        brandIndustry: brand?.industry ?? validated.category,
        brandDomain: domain,
      };
    }),
});
