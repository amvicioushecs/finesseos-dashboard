import { pgTable, uuid, text, timestamp, varchar, integer, jsonb, unique } from 'drizzle-orm/pg-core';

/**
 * Core user table backing auth flow.
 */
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  openId: varchar("open_id", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("login_method", { length: 64 }),
  role: text("role").default("user").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  lastSignedIn: timestamp("last_signed_in").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Affiliate Nodes ────────────────────────────────────────────────────────

export const affiliateNodes = pgTable('affiliate_nodes', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  
  brandName: varchar('brand_name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull(),
  destination: text('destination').notNull(),
  platform: varchar('platform', { length: 64 }).notNull(),
  category: varchar('category', { length: 128 }).notNull(),
  status: text('status').default('active').notNull(),
  
  clicks: varchar('clicks', { length: 32 }).default('0').notNull(),
  clickCount: integer('click_count').default(0).notNull(),
  trackingId: varchar('tracking_id', { length: 16 }).unique(),
  earnings: varchar('earnings', { length: 32 }).default('$0').notNull(),
  commission: varchar('commission', { length: 128 }).default('TBD').notNull(),
  
  complianceDisclosure: text('compliance_disclosure'),
  complianceRules: jsonb('compliance_rules').default([]),
  complianceStatus: text('compliance_status').default('passed').notNull(),
  complianceFtcNotes: text('compliance_ftc_notes'),
  
  keywordResearch: jsonb('keyword_research').default([]),
  marketingAngle: text('marketing_angle'),
  personas: jsonb('personas').default([]),
  contentSuggestions: jsonb('content_suggestions').default([]),
  targetPlatforms: jsonb('target_platforms').default([]),
  strategyNotes: text('strategy_notes'),
  
  brandLogoUrl: text('brand_logo_url'),
  brandIconUrl: text('brand_icon_url'),
  brandPrimaryColor: varchar('brand_primary_color', { length: 16 }),
  brandColors: jsonb('brand_colors').default([]),
  brandDescription: text('brand_description'),
  brandIndustry: varchar('brand_industry', { length: 128 }),
  brandDomain: varchar('brand_domain', { length: 255 }),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type AffiliateNode = typeof affiliateNodes.$inferSelect;
export type InsertAffiliateNode = typeof affiliateNodes.$inferInsert;

// ─── Node Assets ─────────────────────────────────────────────────────────────

export const nodeAssets = pgTable('node_assets', {
  id: uuid('id').primaryKey().defaultRandom(),
  nodeId: uuid('node_id').notNull().references(() => affiliateNodes.id),
  userId: uuid('user_id').notNull().references(() => users.id),
  
  filename: varchar('filename', { length: 512 }).notNull(),
  originalName: varchar('original_name', { length: 512 }).notNull(),
  mimeType: varchar('mime_type', { length: 128 }).notNull(),
  fileSize: integer('file_size').notNull(),
  
  s3Key: varchar('s3_key', { length: 1024 }).notNull(),
  url: text('url').notNull(),
  
  assetType: text('asset_type').default('other').notNull(),
  label: varchar('label', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type NodeAsset = typeof nodeAssets.$inferSelect;
export type InsertNodeAsset = typeof nodeAssets.$inferInsert;

// ─── User Integrations ────────────────────────────────────────────────────────

export const userIntegrations = pgTable('user_integrations', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  
  integrationId: varchar('integration_id', { length: 64 }).notNull(),
  status: text('status').default('disconnected').notNull(),
  apiKey: text('api_key'),
  metadata: jsonb('metadata').default({}),
  lastSyncAt: timestamp('last_sync_at'),
  metrics: jsonb('metrics').default([]),
  errorMessage: text('error_message'),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type UserIntegration = typeof userIntegrations.$inferSelect;
export type InsertUserIntegration = typeof userIntegrations.$inferInsert;

// ─── Action Feed ─────────────────────────────────────────────────────────────

export const actionFeed = pgTable('action_feed', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  type: varchar('type', { length: 64 }).notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type ActionFeed = typeof actionFeed.$inferSelect;
export type InsertActionFeed = typeof actionFeed.$inferInsert;

// ─── System Metrics ─────────────────────────────────────────────────────────

export const systemMetrics = pgTable('system_metrics', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  name: varchar('name', { length: 64 }).notNull(),
  value: text('value').notNull(),
  unit: varchar('unit', { length: 16 }),
  category: varchar('category', { length: 32 }).default('general'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => ({
  unq: unique().on(t.userId, t.name),
}));

export type SystemMetric = typeof systemMetrics.$inferSelect;
export type InsertSystemMetric = typeof systemMetrics.$inferInsert;

