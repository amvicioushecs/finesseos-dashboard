import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Affiliate Nodes ────────────────────────────────────────────────────────
// Each node represents one affiliate program link with all its intelligence data
// JSON arrays stored as text columns (TiDB compatible)

export const affiliateNodes = mysqlTable("affiliateNodes", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  // Core identity
  brandName: varchar("brandName", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull(),
  destination: text("destination").notNull(),
  platform: varchar("platform", { length: 64 }).notNull(),
  category: varchar("category", { length: 128 }).notNull(),
  status: mysqlEnum("status", ["active", "paused", "alert"]).default("active").notNull(),
  // Performance
  clicks: varchar("clicks", { length: 32 }).default("0").notNull(),
  clickCount: int("clickCount").default(0).notNull(),
  trackingId: varchar("trackingId", { length: 16 }).unique(),
  earnings: varchar("earnings", { length: 32 }).default("$0").notNull(),
  commission: varchar("commission", { length: 128 }).default("TBD").notNull(),
  // Compliance (JSON arrays stored as text)
  complianceDisclosure: text("complianceDisclosure"),
  complianceRulesJson: text("complianceRulesJson"), // JSON array of strings
  complianceStatus: mysqlEnum("complianceStatus", ["passed", "warning", "failed"]).default("passed").notNull(),
  complianceFtcNotes: text("complianceFtcNotes"),
  // Intelligence (JSON stored as text)
  keywordResearchJson: text("keywordResearchJson"), // JSON array of strings
  marketingAngle: text("marketingAngle"),
  personasJson: text("personasJson"), // JSON array of persona objects
  contentSuggestionsJson: text("contentSuggestionsJson"), // JSON array of strings
  targetPlatformsJson: text("targetPlatformsJson"), // JSON array of strings
  strategyNotes: text("strategyNotes"),
  // Brand assets from Brandfetch
  brandLogoUrl: text("brandLogoUrl"),
  brandIconUrl: text("brandIconUrl"),
  brandPrimaryColor: varchar("brandPrimaryColor", { length: 16 }),
  brandColorsJson: text("brandColorsJson"), // JSON array of hex color strings
  brandDescription: text("brandDescription"),
  brandIndustry: varchar("brandIndustry", { length: 128 }),
  brandDomain: varchar("brandDomain", { length: 255 }),
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AffiliateNode = typeof affiliateNodes.$inferSelect;
export type InsertAffiliateNode = typeof affiliateNodes.$inferInsert;

// ─── Node Assets ─────────────────────────────────────────────────────────────
// Files uploaded to S3 and associated with a specific affiliate node

export const nodeAssets = mysqlTable("nodeAssets", {
  id: int("id").autoincrement().primaryKey(),
  nodeId: int("nodeId").notNull(),
  userId: int("userId").notNull(),
  // File metadata
  filename: varchar("filename", { length: 512 }).notNull(),
  originalName: varchar("originalName", { length: 512 }).notNull(),
  mimeType: varchar("mimeType", { length: 128 }).notNull(),
  fileSize: int("fileSize").notNull(),
  // S3 reference
  s3Key: varchar("s3Key", { length: 1024 }).notNull(),
  url: text("url").notNull(),
  // Asset type
  assetType: mysqlEnum("assetType", ["image", "banner", "copy", "video", "document", "other"]).default("other").notNull(),
  label: varchar("label", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type NodeAsset = typeof nodeAssets.$inferSelect;
export type InsertNodeAsset = typeof nodeAssets.$inferInsert;

// ─── User Integrations ────────────────────────────────────────────────────────
// Stores per-user connection state for each external platform integration.
// API keys are stored encrypted. OAuth tokens stored in metadataJson.

export const userIntegrations = mysqlTable("userIntegrations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  // Which integration (matches integrationId in the static catalog, e.g. 'shopify', 'ga4')
  integrationId: varchar("integrationId", { length: 64 }).notNull(),
  // Connection state
  status: mysqlEnum("status", ["connected", "disconnected", "pending", "error"]).default("disconnected").notNull(),
  // Credentials — API key stored as plain text (encrypt at application layer if needed)
  apiKey: text("apiKey"),
  // OAuth tokens and any extra metadata (JSON)
  metadataJson: text("metadataJson"),
  // Last successful sync timestamp
  lastSyncAt: timestamp("lastSyncAt"),
  // Live metrics pulled from the platform (JSON: { label: string, value: string }[])
  metricsJson: text("metricsJson"),
  // Error message if status === 'error'
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserIntegration = typeof userIntegrations.$inferSelect;
export type InsertUserIntegration = typeof userIntegrations.$inferInsert;
