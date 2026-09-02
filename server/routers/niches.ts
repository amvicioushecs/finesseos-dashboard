// FinesseOS Pro — Niche Finder Router
// Researches golden micro-niches: low competition, healthy monthly traffic, buyers with money to spend.

import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { invokeLLM } from "../_core/llm";
import { dataProvider } from "../_core/providers";

// ─── Response Schema ────────────────────────────────────────────────────────

const NicheSchema = z.object({
  nicheName: z.string().describe("Specific micro-niche name, e.g. 'Standing desk converters for remote developers'"),
  description: z.string().describe("1-2 sentences on why this niche is golden right now"),
  monthlySearchVolume: z.string().describe("Estimated total monthly search volume, e.g. '12.4K' or '8,100'"),
  competitionLevel: z.enum(["low", "medium", "high"]).describe("How saturated the niche is"),
  competitionScore: z.number().min(0).max(100).describe("0-100, lower = easier to rank/compete"),
  monetizationPotential: z.enum(["high", "medium", "low"]).describe("How readily money changes hands"),
  buyerIntent: z.enum(["high", "medium", "low"]).describe("How urgently buyers want to fix the problem"),
  avgSpend: z.string().describe("Estimated average spend per buyer, e.g. '$50-$200'"),
  goldenScore: z.number().min(0).max(100).describe("Composite: high traffic + low competition + high spend"),
  painPoints: z.array(z.string()).min(2).max(8).describe("3-6 sharp pain points buyers pay to solve"),
  targetAudience: z.string().describe("Who the buyers are, specific and concrete"),
  recommendedPrograms: z.array(z.string()).min(1).max(8).describe("2-5 real, plausible affiliate programs/networks"),
  contentOpportunities: z.array(z.string()).min(2).max(8).describe("3-5 specific content angles/titles to capture the niche"),
});

export type GoldenNiche = z.infer<typeof NicheSchema>;

const NicheArraySchema = z.object({
  niches: z.array(NicheSchema).min(1).max(8),
});

// ─── Router ─────────────────────────────────────────────────────────────────

export const nichesRouter = router({
  // Research golden micro-niches from a seed market via the LLM
  research: protectedProcedure
    .input(z.object({
      seed: z.string().min(2).max(200),
      competitionPreference: z.enum(["low", "any"]).default("low"),
    }))
    .mutation(async ({ input }) => {
      const { seed, competitionPreference } = input;

      const systemPrompt = `You are the FinesseOS Niche Scout — a world-class affiliate market researcher.
Your specialty is uncovering "golden micro-niches": narrowly-defined audiences with real, painful problems they spend money to fix, healthy monthly search volume, and low competition where a smart affiliate can actually rank and convert.
You think like a 7-figure affiliate who spots underserved markets before they saturate. You are realistic, specific, and never generic. You avoid saturated mega-niches and vanity markets with no buyers.
Always respond with valid JSON matching the exact schema provided. No markdown, no explanation — pure JSON only.`;

      const userPrompt = `Find 5 golden micro-niches inside or adjacent to this market:
"${seed}"

${competitionPreference === "low"
  ? "Prioritize niches with LOW competition (competitionScore under 45) where a new affiliate can realistically rank."
  : "Balance opportunity across competition levels, but still favor niches where buyers spend money."}

For each niche, deliver:
- A specific, narrow micro-niche name (not a broad category — get granular, e.g. "keto snacks for shift nurses" not "keto diet")
- A 1-2 sentence reason it's golden right now
- Estimated monthly search volume (be realistic, use 'K' for thousands)
- Competition level + a 0-100 score (lower = easier to win)
- Monetization potential and buyer intent (favor niches where buyers spend to fix the problem)
- Estimated average spend per buyer
- A composite golden score 0-100 (high traffic + low competition + high willingness to spend = high score)
- 3-6 sharp pain points these buyers pay to solve
- A concrete description of who the buyers are
- 2-5 real, plausible affiliate programs or networks that serve this niche
- 3-5 specific content angles a creator could publish to capture this niche

Rank the most golden niches first (highest goldenScore). Be specific and honest — no fluff, no generic filler.`;

      const llmResult = await invokeLLM({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "golden_niches",
            strict: true,
            schema: {
              type: "object",
              properties: {
                niches: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      nicheName: { type: "string" },
                      description: { type: "string" },
                      monthlySearchVolume: { type: "string" },
                      competitionLevel: { type: "string", enum: ["low", "medium", "high"] },
                      competitionScore: { type: "number" },
                      monetizationPotential: { type: "string", enum: ["high", "medium", "low"] },
                      buyerIntent: { type: "string", enum: ["high", "medium", "low"] },
                      avgSpend: { type: "string" },
                      goldenScore: { type: "number" },
                      painPoints: { type: "array", items: { type: "string" } },
                      targetAudience: { type: "string" },
                      recommendedPrograms: { type: "array", items: { type: "string" } },
                      contentOpportunities: { type: "array", items: { type: "string" } },
                    },
                    required: [
                      "nicheName", "description", "monthlySearchVolume", "competitionLevel",
                      "competitionScore", "monetizationPotential", "buyerIntent", "avgSpend",
                      "goldenScore", "painPoints", "targetAudience", "recommendedPrograms",
                      "contentOpportunities"
                    ],
                    additionalProperties: false,
                  },
                },
              },
              required: ["niches"],
              additionalProperties: false,
            },
          },
        },
      });

      const content = llmResult.choices?.[0]?.message?.content;
      if (!content) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "AI returned an empty response. Please try again." });
      }

      let parsed: unknown;
      try {
        parsed = typeof content === "string" ? JSON.parse(content) : content;
      } catch {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "AI response could not be parsed. Please try again." });
      }

      const validated = NicheArraySchema.parse(parsed);
      const niches = validated.niches.sort((a, b) => b.goldenScore - a.goldenScore);
      return { niches, seed };
    }),

  // List saved niches for the current user
  list: protectedProcedure.query(async ({ ctx }) => {
    return dataProvider.getSavedNiches(ctx.user.id);
  }),

  // Save a discovered niche to the vault
  save: protectedProcedure
    .input(NicheSchema.extend({ seed: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { seed, ...niche } = input;
      const id = await dataProvider.saveNiche(ctx.user.id, { ...niche, seed });
      await dataProvider.createAction(ctx.user.id, {
        type: "niche_saved",
        title: "Niche Saved",
        message: `${niche.nicheName} added to your golden niches (score ${niche.goldenScore}).`,
        metadata: { nicheName: niche.nicheName, goldenScore: niche.goldenScore },
      });
      return { id };
    }),

  // Remove a saved niche
  delete: protectedProcedure
    .input(z.object({ nicheId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await dataProvider.deleteNiche(input.nicheId, ctx.user.id);
      return { success: true };
    }),
});
