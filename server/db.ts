import { eq, and, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, affiliateNodes, nodeAssets, InsertAffiliateNode, InsertNodeAsset, userIntegrations } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── User helpers ────────────────────────────────────────────────────────────

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot upsert user: database not available"); return; }

  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
    if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
    else if (user.openId === ENV.ownerOpenId) { values.role = 'admin'; updateSet.role = 'admin'; }
    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot get user: database not available"); return undefined; }
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ─── JSON helpers ─────────────────────────────────────────────────────────────

function parseJson<T>(text: string | null | undefined, fallback: T): T {
  if (!text) return fallback;
  try { return JSON.parse(text) as T; } catch { return fallback; }
}

function toJson(value: unknown): string {
  return JSON.stringify(value ?? []);
}

// ─── Node shape for the frontend ─────────────────────────────────────────────

export type FrontendNode = {
  id: string;
  brandName: string;
  slug: string;
  destination: string;
  platform: string;
  category: string;
  status: 'active' | 'paused' | 'alert';
  clicks: string;
  clickCount: number;
  trackingId: string | null;
  earnings: string;
  commission: string;
  createdAt: string;
  // Brand assets from Brandfetch
  brandLogoUrl: string | null;
  brandIconUrl: string | null;
  brandPrimaryColor: string | null;
  brandColors: string[];
  brandDescription: string | null;
  brandIndustry: string | null;
  brandDomain: string | null;
  compliance: {
    disclosure: string;
    rules: string[];
    status: 'passed' | 'warning' | 'failed';
    lastChecked: string;
    ftcNotes: string;
  };
  intelligence: {
    keywordResearch: string[];
    marketingAngle: string;
    personas: Array<{ name: string; pain: string; hook: string; platform: string }>;
    contentSuggestions: string[];
    targetPlatforms: string[];
    strategyNotes: string;
  };
  assets: Array<{ id: string; name: string; type: string; size: string; url: string; uploadedAt: string }>;
};

export function nodeRowToFrontend(row: typeof affiliateNodes.$inferSelect, assets: typeof nodeAssets.$inferSelect[] = []): FrontendNode {
  return {
    id: String(row.id),
    brandName: row.brandName,
    slug: row.slug,
    destination: row.destination,
    platform: row.platform,
    category: row.category,
    status: row.status,
    clicks: row.clicks,
    clickCount: row.clickCount ?? 0,
    trackingId: row.trackingId ?? null,
    earnings: row.earnings,
    commission: row.commission,
    createdAt: row.createdAt.toISOString().split('T')[0],
    compliance: {
      disclosure: row.complianceDisclosure ?? '',
      rules: parseJson<string[]>(row.complianceRulesJson, []),
      status: row.complianceStatus,
      lastChecked: row.updatedAt.toISOString().split('T')[0],
      ftcNotes: row.complianceFtcNotes ?? 'AI compliance scan complete.',
    },
    intelligence: {
      keywordResearch: parseJson<string[]>(row.keywordResearchJson, []),
      marketingAngle: row.marketingAngle ?? '',
      personas: parseJson<Array<{ name: string; pain: string; hook: string; platform: string }>>(row.personasJson, []),
      contentSuggestions: parseJson<string[]>(row.contentSuggestionsJson, []),
      targetPlatforms: parseJson<string[]>(row.targetPlatformsJson, []),
      strategyNotes: row.strategyNotes ?? '',
    },
    brandLogoUrl: row.brandLogoUrl ?? null,
    brandIconUrl: row.brandIconUrl ?? null,
    brandPrimaryColor: row.brandPrimaryColor ?? null,
    brandColors: parseJson<string[]>(row.brandColorsJson, []),
    brandDescription: row.brandDescription ?? null,
    brandIndustry: row.brandIndustry ?? null,
    brandDomain: row.brandDomain ?? null,
    assets: assets.map(a => ({
      id: String(a.id),
      name: a.originalName,
      type: a.assetType,
      size: formatFileSize(a.fileSize),
      url: a.url,
      uploadedAt: a.createdAt.toISOString().split('T')[0],
    })),
  };
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

// ─── Affiliate Node queries ───────────────────────────────────────────────────

export async function getNodesByUserId(userId: number): Promise<FrontendNode[]> {
  const db = await getDb();
  if (!db) return [];
  const rows = await db.select().from(affiliateNodes).where(eq(affiliateNodes.userId, userId)).orderBy(desc(affiliateNodes.createdAt));
  // Fetch assets for all nodes
  const nodeIds = rows.map(r => r.id);
  let allAssets: typeof nodeAssets.$inferSelect[] = [];
  if (nodeIds.length > 0) {
    allAssets = await db.select().from(nodeAssets).where(eq(nodeAssets.userId, userId));
  }
  return rows.map(row => {
    const rowAssets = allAssets.filter(a => a.nodeId === row.id);
    return nodeRowToFrontend(row, rowAssets);
  });
}

export async function getNodeById(nodeId: number, userId: number): Promise<FrontendNode | null> {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(affiliateNodes).where(and(eq(affiliateNodes.id, nodeId), eq(affiliateNodes.userId, userId))).limit(1);
  if (rows.length === 0) return null;
  const assets = await db.select().from(nodeAssets).where(and(eq(nodeAssets.nodeId, nodeId), eq(nodeAssets.userId, userId)));
  return nodeRowToFrontend(rows[0], assets);
}

export async function createNode(userId: number, data: {
  brandName: string; slug: string; destination: string; platform: string; category: string;
  status: 'active' | 'paused' | 'alert'; clicks: string; earnings: string; commission: string;
  complianceDisclosure: string; complianceRules: string[]; complianceStatus: 'passed' | 'warning' | 'failed';
  complianceFtcNotes: string; keywordResearch: string[]; marketingAngle: string;
  personas: Array<{ name: string; pain: string; hook: string; platform: string }>;
  contentSuggestions: string[]; targetPlatforms: string[]; strategyNotes: string;
  // Brand assets
  brandLogoUrl?: string | null; brandIconUrl?: string | null; brandPrimaryColor?: string | null;
  brandColors?: string[]; brandDescription?: string | null; brandIndustry?: string | null; brandDomain?: string | null;
}): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const insert: InsertAffiliateNode = {
    userId,
    brandName: data.brandName,
    slug: data.slug,
    destination: data.destination,
    platform: data.platform,
    category: data.category,
    status: data.status,
    clicks: data.clicks,
    earnings: data.earnings,
    commission: data.commission,
    complianceDisclosure: data.complianceDisclosure,
    complianceRulesJson: toJson(data.complianceRules),
    complianceStatus: data.complianceStatus,
    complianceFtcNotes: data.complianceFtcNotes,
    keywordResearchJson: toJson(data.keywordResearch),
    marketingAngle: data.marketingAngle,
    personasJson: toJson(data.personas),
    contentSuggestionsJson: toJson(data.contentSuggestions),
    targetPlatformsJson: toJson(data.targetPlatforms),
    strategyNotes: data.strategyNotes,
    brandLogoUrl: data.brandLogoUrl ?? null,
    brandIconUrl: data.brandIconUrl ?? null,
    brandPrimaryColor: data.brandPrimaryColor ?? null,
    brandColorsJson: toJson(data.brandColors ?? []),
    brandDescription: data.brandDescription ?? null,
    brandIndustry: data.brandIndustry ?? null,
    brandDomain: data.brandDomain ?? null,
  };

  // Generate a unique 8-char tracking ID
  const trackingId = Math.random().toString(36).slice(2, 10);
  insert.trackingId = trackingId;

  const [result] = await db.insert(affiliateNodes).values(insert);
  return (result as { insertId: number }).insertId;
}

export async function getNodeByTrackingId(trackingId: string) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(affiliateNodes).where(eq(affiliateNodes.trackingId, trackingId)).limit(1);
  return rows.length > 0 ? rows[0] : null;
}

export async function incrementNodeClickCount(nodeId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  // Increment clickCount and update the display clicks string
  const rows = await db.select({ clickCount: affiliateNodes.clickCount }).from(affiliateNodes).where(eq(affiliateNodes.id, nodeId)).limit(1);
  if (rows.length === 0) return;
  const newCount = (rows[0].clickCount ?? 0) + 1;
  const displayClicks = newCount >= 1000 ? `${(newCount / 1000).toFixed(1)}k` : String(newCount);
  await db.update(affiliateNodes).set({ clickCount: newCount, clicks: displayClicks }).where(eq(affiliateNodes.id, nodeId));
}

export async function deleteNode(nodeId: number, userId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(nodeAssets).where(and(eq(nodeAssets.nodeId, nodeId), eq(nodeAssets.userId, userId)));
  await db.delete(affiliateNodes).where(and(eq(affiliateNodes.id, nodeId), eq(affiliateNodes.userId, userId)));
}

export async function updateNodeStatus(nodeId: number, userId: number, status: 'active' | 'paused' | 'alert'): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(affiliateNodes).set({ status }).where(and(eq(affiliateNodes.id, nodeId), eq(affiliateNodes.userId, userId)));
}

// ─── Asset queries ────────────────────────────────────────────────────────────

export async function getAssetsByNodeId(nodeId: number, userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(nodeAssets).where(and(eq(nodeAssets.nodeId, nodeId), eq(nodeAssets.userId, userId))).orderBy(desc(nodeAssets.createdAt));
}

export async function createAsset(data: InsertNodeAsset): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(nodeAssets).values(data);
  return (result as { insertId: number }).insertId;
}

export async function deleteAsset(assetId: number, userId: number): Promise<string> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const rows = await db.select().from(nodeAssets).where(and(eq(nodeAssets.id, assetId), eq(nodeAssets.userId, userId))).limit(1);
  if (rows.length === 0) throw new Error("Asset not found");
  await db.delete(nodeAssets).where(eq(nodeAssets.id, assetId));
  return rows[0].s3Key;
}

// ─── User Integration queries ─────────────────────────────────────────────────

export type FrontendIntegration = {
  id: number;
  integrationId: string;
  status: 'connected' | 'disconnected' | 'pending' | 'error';
  lastSyncAt: string | null;
  metrics: Array<{ label: string; value: string }>;
  errorMessage: string | null;
  hasApiKey: boolean;
};

export async function getUserIntegrations(userId: number): Promise<FrontendIntegration[]> {
  const db = await getDb();
  if (!db) return [];
  const rows = await db.select().from(userIntegrations).where(eq(userIntegrations.userId, userId));
  return rows.map(rowToFrontendIntegration);
}

export async function getUserIntegration(userId: number, integrationId: string): Promise<FrontendIntegration | null> {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(userIntegrations)
    .where(and(eq(userIntegrations.userId, userId), eq(userIntegrations.integrationId, integrationId)))
    .limit(1);
  return rows.length > 0 ? rowToFrontendIntegration(rows[0]) : null;
}

export async function upsertUserIntegration(userId: number, integrationId: string, data: {
  status: 'connected' | 'disconnected' | 'pending' | 'error';
  apiKey?: string | null;
  metadataJson?: string | null;
  lastSyncAt?: Date | null;
  metricsJson?: string | null;
  errorMessage?: string | null;
}): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(userIntegrations).values({
    userId,
    integrationId,
    status: data.status,
    apiKey: data.apiKey ?? null,
    metadataJson: data.metadataJson ?? null,
    lastSyncAt: data.lastSyncAt ?? null,
    metricsJson: data.metricsJson ?? null,
    errorMessage: data.errorMessage ?? null,
  }).onDuplicateKeyUpdate({
    set: {
      status: data.status,
      ...(data.apiKey !== undefined ? { apiKey: data.apiKey } : {}),
      ...(data.metadataJson !== undefined ? { metadataJson: data.metadataJson } : {}),
      ...(data.lastSyncAt !== undefined ? { lastSyncAt: data.lastSyncAt } : {}),
      ...(data.metricsJson !== undefined ? { metricsJson: data.metricsJson } : {}),
      ...(data.errorMessage !== undefined ? { errorMessage: data.errorMessage } : {}),
    },
  });
}

export async function disconnectUserIntegration(userId: number, integrationId: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(userIntegrations)
    .set({ status: 'disconnected', apiKey: null, metadataJson: null, lastSyncAt: null, metricsJson: null, errorMessage: null })
    .where(and(eq(userIntegrations.userId, userId), eq(userIntegrations.integrationId, integrationId)));
}

function rowToFrontendIntegration(row: typeof userIntegrations.$inferSelect): FrontendIntegration {
  return {
    id: row.id,
    integrationId: row.integrationId,
    status: row.status,
    lastSyncAt: row.lastSyncAt ? row.lastSyncAt.toISOString() : null,
    metrics: parseJson<Array<{ label: string; value: string }>>(row.metricsJson, []),
    errorMessage: row.errorMessage ?? null,
    hasApiKey: !!row.apiKey,
  };
}
