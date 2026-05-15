// FinesseOS Pro — Nodes tRPC Router
// Handles affiliate node CRUD and asset management (S3 uploads)

import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { dataProvider } from "../_core/providers";
import { storagePut } from "../storage";
import { nanoid } from "nanoid";

// ─── Node Router ──────────────────────────────────────────────────────────────

export const nodesRouter = router({
  // List all nodes for the current user
  list: protectedProcedure.query(async ({ ctx }) => {
    return dataProvider.getNodesByUserId(ctx.user.id);
  }),

  // Get a single node by ID
  get: protectedProcedure
    .input(z.object({ nodeId: z.string() }))
    .query(async ({ ctx, input }) => {
      const node = await dataProvider.getNodeById(input.nodeId, ctx.user.id);
      if (!node) throw new TRPCError({ code: "NOT_FOUND", message: "Node not found" });
      return node;
    }),

  // Create a new node (called after AI intelligence generation)
  create: protectedProcedure
    .input(
      z.object({
        brandName: z.string().min(1),
        slug: z.string().min(1),
        destination: z.string().url(),
        platform: z.string().min(1),
        category: z.string().min(1),
        status: z.enum(["active", "paused", "alert"]).default("active"),
        clicks: z.string().default("0"),
        earnings: z.string().default("$0"),
        commission: z.string().default("TBD"),
        complianceDisclosure: z.string().default(""),
        complianceRules: z.array(z.string()).default([]),
        complianceStatus: z.enum(["passed", "warning", "failed"]).default("passed"),
        complianceFtcNotes: z.string().default(""),
        keywordResearch: z.array(z.string()).default([]),
        marketingAngle: z.string().default(""),
        personas: z
          .array(
            z.object({
              name: z.string(),
              pain: z.string(),
              hook: z.string(),
              platform: z.string(),
            })
          )
          .default([]),
        contentSuggestions: z.array(z.string()).default([]),
        targetPlatforms: z.array(z.string()).default([]),
        strategyNotes: z.string().default(""),
        // Brand assets
        brandLogoUrl: z.string().nullable().default(null),
        brandIconUrl: z.string().nullable().default(null),
        brandPrimaryColor: z.string().nullable().default(null),
        brandColors: z.array(z.string()).default([]),
        brandDescription: z.string().nullable().default(null),
        brandIndustry: z.string().nullable().default(null),
        brandDomain: z.string().nullable().default(null),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const nodeId = await dataProvider.createNode(ctx.user.id, input);
      const node = await dataProvider.getNodeById(nodeId, ctx.user.id);
      
      // Log action for realtime feed
      if (node) {
        await dataProvider.createAction(ctx.user.id, {
          type: 'node_created',
          title: 'Node Created',
          message: `${node.brandName} affiliate node is now live in your vault.`,
          metadata: { nodeId: node.id, platform: node.platform }
        });
      }

      return node;
    }),

  // Get the tracked link URL for a node (for sharing/promotion)
  getTrackedUrl: protectedProcedure
    .input(z.object({ nodeId: z.string() }))
    .query(async ({ ctx, input }) => {
      const node = await dataProvider.getNodeById(input.nodeId, ctx.user.id);
      if (!node) throw new TRPCError({ code: "NOT_FOUND", message: "Node not found" });
      if (!node.trackingId) return { trackedUrl: null };
      return { trackedUrl: `/go/${node.trackingId}` };
    }),

  // Delete a node (also deletes all its assets)
  delete: protectedProcedure
    .input(z.object({ nodeId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await dataProvider.deleteNode(input.nodeId, ctx.user.id);
      return { success: true };
    }),

  // Update node status
  updateStatus: protectedProcedure
    .input(
      z.object({
        nodeId: z.string(),
        status: z.enum(["active", "paused", "alert"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await dataProvider.updateNodeStatus(input.nodeId, ctx.user.id, input.status);
      return { success: true };
    }),

  // ─── Asset sub-procedures ─────────────────────────────────────────────────

  // Get a presigned upload URL for an asset
  getUploadUrl: protectedProcedure
    .input(
      z.object({
        nodeId: z.string(),
        filename: z.string().min(1),
        mimeType: z.string().min(1),
        fileSize: z.number().positive(),
        assetType: z
          .enum(["image", "banner", "copy", "video", "document", "other"])
          .default("other"),
        label: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify node belongs to user
      const node = await dataProvider.getNodeById(input.nodeId, ctx.user.id);
      if (!node) throw new TRPCError({ code: "NOT_FOUND", message: "Node not found" });

      // Enforce 16MB limit
      if (input.fileSize > 16 * 1024 * 1024) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "File size exceeds 16MB limit" });
      }

      // Generate a unique S3 key
      const ext = input.filename.split(".").pop() ?? "bin";
      const s3Key = `nodes/${ctx.user.id}/${input.nodeId}/assets/${nanoid()}.${ext}`;

      return { s3Key, uploadReady: true };
    }),

  // Confirm asset upload and save metadata to DB
  confirmAsset: protectedProcedure
    .input(
      z.object({
        nodeId: z.string(),
        s3Key: z.string().min(1),
        url: z.string().url(),
        filename: z.string().min(1),
        originalName: z.string().min(1),
        mimeType: z.string().min(1),
        fileSize: z.number().positive(),
        assetType: z
          .enum(["image", "banner", "copy", "video", "document", "other"])
          .default("other"),
        label: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const node = await dataProvider.getNodeById(input.nodeId, ctx.user.id);
      if (!node) throw new TRPCError({ code: "NOT_FOUND", message: "Node not found" });

      const assetId = await dataProvider.createAsset({
        nodeId: input.nodeId,
        userId: ctx.user.id,
        filename: input.filename,
        originalName: input.originalName,
        mimeType: input.mimeType,
        fileSize: input.fileSize,
        s3Key: input.s3Key,
        url: input.url,
        assetType: input.assetType,
        label: input.label ?? null,
      });

      return { assetId, url: input.url };
    }),

  // Upload asset directly from server (base64 encoded)
  uploadAsset: protectedProcedure
    .input(
      z.object({
        nodeId: z.string(),
        filename: z.string().min(1),
        mimeType: z.string().min(1),
        fileSize: z.number().positive(),
        assetType: z
          .enum(["image", "banner", "copy", "video", "document", "other"])
          .default("other"),
        label: z.string().optional(),
        base64Data: z.string().min(1), // base64 encoded file content
      })
    )
    .mutation(async ({ ctx, input }) => {
      const node = await dataProvider.getNodeById(input.nodeId, ctx.user.id);
      if (!node) throw new TRPCError({ code: "NOT_FOUND", message: "Node not found" });

      if (input.fileSize > 16 * 1024 * 1024) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "File size exceeds 16MB limit" });
      }

      // Decode base64 and upload to S3
      const buffer = Buffer.from(input.base64Data, "base64");
      const ext = input.filename.split(".").pop() ?? "bin";
      const s3Key = `nodes/${ctx.user.id}/${input.nodeId}/assets/${nanoid()}.${ext}`;

      const { url } = await storagePut(s3Key, buffer, input.mimeType);

      const assetId = await dataProvider.createAsset({
        nodeId: input.nodeId,
        userId: ctx.user.id,
        filename: s3Key.split("/").pop() ?? input.filename,
        originalName: input.filename,
        mimeType: input.mimeType,
        fileSize: input.fileSize,
        s3Key,
        url,
        assetType: input.assetType,
        label: input.label ?? null,
      });

      return { assetId, url };
    }),

  // List assets for a node
  listAssets: protectedProcedure
    .input(z.object({ nodeId: z.string() }))
    .query(async ({ ctx, input }) => {
      const node = await dataProvider.getNodeById(input.nodeId, ctx.user.id);
      if (!node) throw new TRPCError({ code: "NOT_FOUND", message: "Node not found" });
      const assets = await dataProvider.getAssetsByNodeId(input.nodeId, ctx.user.id);
      return assets.map(a => ({
        id: a.id,
        name: a.originalName,
        type: a.assetType,
        size: formatFileSize(a.fileSize),
        url: a.url,
        mimeType: a.mimeType,
        uploadedAt: a.createdAt.toISOString().split("T")[0],
      }));
    }),

  // Delete an asset
  deleteAsset: protectedProcedure
    .input(z.object({ assetId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await dataProvider.deleteAsset(input.assetId, ctx.user.id);
      return { success: true };
    }),
});

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}
