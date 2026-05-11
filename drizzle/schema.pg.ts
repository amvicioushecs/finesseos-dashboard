import { pgTable, serial, text, timestamp, varchar, pgEnum, integer, jsonb, unique } from "drizzle-orm/pg-core";

/**
 * Core user table backing auth flow.
 */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: text("role").default("user").notNull(), // Postgres doesn't need explicit enum for simple roles, but we can use pgEnum
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const complianceStatusEnum = pgEnum("compliance_status", ["passed", "warning", "failed"]);
export const nodeStatusEnum = pgEnum("node_status", ["active", "paused", "alert"]);
export const assetTypeEnum = pgEnum("asset_type", ["image", "banner", "copy", "video", "document", "other"]);
export const integrationStatusEnum = pgEnum("integration_status", ["connected", "disconnected", "pending", "error"]);

// ─── Affiliate Nodes ────────────────────────────────────────────────────────
// Each node represents one affiliate program link with all its intelligence data

export const affiliateNodes = pgTable("affiliateNodes", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  // Core identity
  brandName: varchar("brandName", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull(),
  destination: text("destination").notNull(),
  platform: varchar("platform", { length: 64 }).notNull(),
  category: varchar("category", { length: 128 }).notNull(),
  status: text("status").default("active").notNull(), // Simplification for now, or use nodeStatusEnum
  // Performance
  clicks: varchar("clicks", { length: 32 }).default("0").notNull(),
  clickCount: integer("clickCount").default(0).notNull(),
  trackingId: varchar("trackingId", { length: 16 }).unique(),
  earnings: varchar("earnings", { length: 32 }).default("$0").notNull(),
  commission: varchar("commission", { length: 128 }).default("TBD").notNull(),
  // Compliance (Using jsonb for rules)
  complianceDisclosure: text("complianceDisclosure"),
  complianceRules: jsonb("complianceRules"), // Native JSONB
  complianceStatus: text("complianceStatus").default("passed").notNull(),
  complianceFtcNotes: text("complianceFtcNotes"),
  // Intelligence (Using jsonb for research, personas, etc.)
  keywordResearch: jsonb("keywordResearch"),
  marketingAngle: text("marketingAngle"),
  personas: jsonb("personas"),
  contentSuggestions: jsonb("contentSuggestions"),
  targetPlatforms: jsonb("targetPlatforms"),
  strategyNotes: text("strategyNotes"),
  // Brand assets
  brandLogoUrl: text("brandLogoUrl"),
  brandIconUrl: text("brandIconUrl"),
  brandPrimaryColor: varchar("brandPrimaryColor", { length: 16 }),
  brandColors: jsonb("brandColors"),
  brandDescription: text("brandDescription"),
  brandIndustry: varchar("brandIndustry", { length: 128 }),
  brandDomain: varchar("brandDomain", { length: 255 }),
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

// ─── Node Assets ─────────────────────────────────────────────────────────────

export const nodeAssets = pgTable("nodeAssets", {
  id: serial("id").primaryKey(),
  nodeId: integer("nodeId").notNull(),
  userId: integer("userId").notNull(),
  // File metadata
  filename: varchar("filename", { length: 512 }).notNull(),
  originalName: varchar("originalName", { length: 512 }).notNull(),
  mimeType: varchar("mimeType", { length: 128 }).notNull(),
  fileSize: integer("fileSize").notNull(),
  // S3 reference
  s3Key: varchar("s3Key", { length: 1024 }).notNull(),
  url: text("url").notNull(),
  // Asset type
  assetType: text("assetType").default("other").notNull(),
  label: varchar("label", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── User Integrations ────────────────────────────────────────────────────────

export const userIntegrations = pgTable("userIntegrations", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  integrationId: varchar("integrationId", { length: 64 }).notNull(),
  status: text("status").default("disconnected").notNull(),
  apiKey: text("apiKey"),
  metadataJson: jsonb("metadataJson"),
  lastSyncAt: timestamp("lastSyncAt"),
  metricsJson: jsonb("metricsJson"),
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

// ─── Action Feed ─────────────────────────────────────────────────────────────

export const actionFeed = pgTable("actionFeed", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  type: varchar("type", { length: 64 }).notNull(), // e.g. 'node_created', 'node_alert', 'integration_synced', 'click_detected'
  title: text("title").notNull(),
  message: text("message").notNull(),
  metadataJson: jsonb("metadataJson"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── System Metrics ─────────────────────────────────────────────────────────

export const systemMetrics = pgTable("systemMetrics", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(), // Metrics can be per-user or global (userId=0)
  name: varchar("name", { length: 64 }).notNull(),
  value: text("value").notNull(),
  unit: varchar("unit", { length: 16 }),
  category: varchar("category", { length: 32 }).default("general"),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (t) => ({
  unq: unique().on(t.userId, t.name),
}));
