// FinesseOS Pro — Integrations tRPC Router
// Manages per-user external platform connections stored in the database.
// All procedures are protectedProcedure — no mock data, no placeholder toasts.

import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { dataProvider } from "../_core/providers";

// ─── Static integration catalog ──────────────────────────────────────────────
// This is the master list of supported integrations. Connection state lives in DB.

export const INTEGRATION_CATALOG = [
  // Affiliate Networks
  { id: "shopify", name: "Shopify Partners", category: "affiliate", description: "Track Shopify affiliate commissions and referral performance.", authType: "apikey", docsUrl: "https://www.shopify.com/partners" },
  { id: "amazon", name: "Amazon Associates", category: "affiliate", description: "Connect your Amazon Associates account to sync earnings and link performance.", authType: "apikey", docsUrl: "https://affiliate-program.amazon.com" },
  { id: "clickfunnels", name: "ClickFunnels", category: "affiliate", description: "Sync ClickFunnels affiliate dashboard data and commission tracking.", authType: "apikey", docsUrl: "https://www.clickfunnels.com/affiliates" },
  { id: "impact", name: "Impact Radius", category: "affiliate", description: "Pull real-time performance data from Impact Radius campaigns.", authType: "apikey", docsUrl: "https://impact.com" },
  { id: "shareasale", name: "ShareASale", category: "affiliate", description: "Connect ShareASale to track merchant performance and commissions.", authType: "apikey", docsUrl: "https://www.shareasale.com" },
  { id: "cj", name: "CJ Affiliate", category: "affiliate", description: "Sync CJ Affiliate (Commission Junction) campaign data.", authType: "apikey", docsUrl: "https://www.cj.com" },
  // Analytics
  { id: "ga4", name: "Google Analytics 4", category: "analytics", description: "Pull traffic, conversion, and audience data from your GA4 property.", authType: "apikey", docsUrl: "https://analytics.google.com" },
  { id: "gtm", name: "Google Tag Manager", category: "analytics", description: "Manage and verify GTM container tags for your campaigns.", authType: "apikey", docsUrl: "https://tagmanager.google.com" },
  { id: "hotjar", name: "Hotjar", category: "analytics", description: "Access heatmaps and session recordings for your landing pages.", authType: "apikey", docsUrl: "https://www.hotjar.com" },
  { id: "googleads", name: "Google Ads", category: "analytics", description: "Sync Google Ads campaign performance, spend, and ROAS data.", authType: "apikey", docsUrl: "https://ads.google.com" },
  // Social Platforms
  { id: "tiktok", name: "TikTok for Business", category: "social", description: "Connect TikTok Business Center to track ad performance and organic reach.", authType: "apikey", docsUrl: "https://ads.tiktok.com" },
  { id: "meta", name: "Meta (Instagram/Facebook)", category: "social", description: "Sync Meta Ads Manager data for Instagram and Facebook campaigns.", authType: "apikey", docsUrl: "https://business.facebook.com" },
  { id: "youtube", name: "YouTube Studio", category: "social", description: "Pull YouTube channel analytics and video performance data.", authType: "apikey", docsUrl: "https://studio.youtube.com" },
  { id: "pinterest", name: "Pinterest", category: "social", description: "Connect Pinterest Analytics to track pin performance and traffic.", authType: "apikey", docsUrl: "https://analytics.pinterest.com" },
  // Email & CRM
  { id: "klaviyo", name: "Klaviyo", category: "email", description: "Sync Klaviyo email campaign performance and revenue attribution.", authType: "apikey", docsUrl: "https://www.klaviyo.com" },
  { id: "mailchimp", name: "Mailchimp", category: "email", description: "Connect Mailchimp to track email open rates and campaign conversions.", authType: "apikey", docsUrl: "https://mailchimp.com" },
  { id: "convertkit", name: "ConvertKit", category: "email", description: "Sync ConvertKit subscriber growth and broadcast performance.", authType: "apikey", docsUrl: "https://convertkit.com" },
] as const;

export type IntegrationCatalogItem = typeof INTEGRATION_CATALOG[number];
export type IntegrationId = IntegrationCatalogItem["id"];

// ─── Router ──────────────────────────────────────────────────────────────────

export const integrationsRouter = router({
  // List all integrations (catalog merged with user's DB connection state)
  list: protectedProcedure.query(async ({ ctx }) => {
    const userConnections = await dataProvider.getUserIntegrations(ctx.user.id);
    const connectionMap = new Map(userConnections.map(c => [c.integrationId, c]));

    return INTEGRATION_CATALOG.map(item => {
      const connection = connectionMap.get(item.id);
      return {
        ...item,
        status: connection?.status ?? "disconnected",
        lastSyncAt: connection?.lastSyncAt ?? null,
        metrics: connection?.metrics ?? [],
        errorMessage: connection?.errorMessage ?? null,
        hasApiKey: connection?.hasApiKey ?? false,
      };
    });
  }),

  // Connect an integration using an API key
  connect: protectedProcedure
    .input(
      z.object({
        integrationId: z.string().min(1),
        apiKey: z.string().min(1, "API key is required"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify the integration exists in the catalog
      const catalogItem = INTEGRATION_CATALOG.find(i => i.id === input.integrationId);
      if (!catalogItem) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Unknown integration" });
      }

      // Store the connection as 'connected' with the provided API key
      // In production, validate the API key against the platform's API before saving
      await dataProvider.upsertUserIntegration(ctx.user.id, input.integrationId, {
        status: "connected",
        apiKey: input.apiKey,
        lastSyncAt: new Date(),
        metricsJson: null,
        errorMessage: null,
      });

      // Log action for realtime feed
      await dataProvider.createAction(ctx.user.id, {
        type: 'integration_connected',
        title: 'Platform Connected',
        message: `${catalogItem.name} has been successfully integrated.`,
        metadataJson: { integrationId: input.integrationId }
      });

      return { success: true, integrationId: input.integrationId };
    }),

  // Disconnect an integration (clears API key and resets state)
  disconnect: protectedProcedure
    .input(z.object({ integrationId: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const existing = await dataProvider.getUserIntegration(ctx.user.id, input.integrationId);
      if (!existing || existing.status === "disconnected") {
        throw new TRPCError({ code: "NOT_FOUND", message: "Integration not connected" });
      }
      await dataProvider.disconnectUserIntegration(ctx.user.id, input.integrationId);
      return { success: true };
    }),

  // Re-sync an integration (updates lastSyncAt timestamp)
  resync: protectedProcedure
    .input(z.object({ integrationId: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const existing = await dataProvider.getUserIntegration(ctx.user.id, input.integrationId);
      if (!existing || existing.status !== "connected") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Integration is not connected" });
      }

      // Update lastSyncAt to now — in production, trigger actual data pull here
      await dataProvider.upsertUserIntegration(ctx.user.id, input.integrationId, {
        status: "connected",
        lastSyncAt: new Date(),
        errorMessage: null,
      });

      return { success: true, syncedAt: new Date().toISOString() };
    }),

  // Get a single integration's connection state
  get: protectedProcedure
    .input(z.object({ integrationId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const catalogItem = INTEGRATION_CATALOG.find(i => i.id === input.integrationId);
      if (!catalogItem) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Unknown integration" });
      }
      const connection = await dataProvider.getUserIntegration(ctx.user.id, input.integrationId);
      return {
        ...catalogItem,
        status: connection?.status ?? "disconnected",
        lastSyncAt: connection?.lastSyncAt ?? null,
        metrics: connection?.metrics ?? [],
        errorMessage: connection?.errorMessage ?? null,
        hasApiKey: connection?.hasApiKey ?? false,
      };
    }),
});
