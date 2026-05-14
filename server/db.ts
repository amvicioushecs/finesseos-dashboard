import { eq, and, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { 
  InsertUser, users, affiliateNodes, nodeAssets, 
  InsertAffiliateNode, InsertNodeAsset, userIntegrations,
  ActionFeed, InsertActionFeed, actionFeed,
  SystemMetric, InsertSystemMetric, systemMetrics
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && ENV.databaseUrl) {
    try {
      const client = postgres(ENV.databaseUrl, {
        prepare: false, // Recommended for Supabase
        ssl: true,
      });
      _db = drizzle(client);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── User helpers ────────────────────────────────────────────────────────────

export async function upsertUser(user: Partial<InsertUser> & { openId: string }): Promise<void> {
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot upsert user: database not available"); return; }

  try {
    const values: any = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    
    if (user.name !== undefined) { values.name = user.name; updateSet.name = user.name; }
    if (user.email !== undefined) { values.email = user.email; updateSet.email = user.email; }
    if (user.loginMethod !== undefined) { values.loginMethod = user.loginMethod; updateSet.loginMethod = user.loginMethod; }
    if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
    
    if (user.role !== undefined) { 
      values.role = user.role; 
      updateSet.role = user.role; 
    } else if (user.openId === ENV.ownerOpenId) { 
      values.role = 'admin'; 
      updateSet.role = 'admin'; 
    }

    await db.insert(users).values(values).onConflictDoUpdate({ 
      target: users.openId,
      set: updateSet 
    });
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
    id: row.id,
    brandName: row.brandName,
    slug: row.slug,
    destination: row.destination,
    platform: row.platform,
    category: row.category,
    status: row.status as 'active' | 'paused' | 'alert',
    clicks: row.clicks,
    clickCount: row.clickCount ?? 0,
    trackingId: row.trackingId ?? null,
    earnings: row.earnings,
    commission: row.commission,
    createdAt: row.createdAt.toISOString().split('T')[0],
    compliance: {
      disclosure: row.complianceDisclosure ?? '',
      rules: (row.complianceRules as string[]) ?? [],
      status: row.complianceStatus as 'passed' | 'warning' | 'failed',
      lastChecked: row.updatedAt.toISOString().split('T')[0],
      ftcNotes: row.complianceFtcNotes ?? 'AI compliance scan complete.',
    },
    intelligence: {
      keywordResearch: (row.keywordResearch as string[]) ?? [],
      marketingAngle: row.marketingAngle ?? '',
      personas: (row.personas as Array<{ name: string; pain: string; hook: string; platform: string }>) ?? [],
      contentSuggestions: (row.contentSuggestions as string[]) ?? [],
      targetPlatforms: (row.targetPlatforms as string[]) ?? [],
      strategyNotes: row.strategyNotes ?? '',
    },
    brandLogoUrl: row.brandLogoUrl ?? null,
    brandIconUrl: row.brandIconUrl ?? null,
    brandPrimaryColor: row.brandPrimaryColor ?? null,
    brandColors: (row.brandColors as string[]) ?? [],
    brandDescription: row.brandDescription ?? null,
    brandIndustry: row.brandIndustry ?? null,
    brandDomain: row.brandDomain ?? null,
    assets: assets.map(a => ({
      id: a.id,
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

export async function getNodesByUserId(userId: string): Promise<FrontendNode[]> {
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

export async function getNodeById(nodeId: string, userId: string): Promise<FrontendNode | null> {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(affiliateNodes).where(and(eq(affiliateNodes.id, nodeId), eq(affiliateNodes.userId, userId))).limit(1);
  if (rows.length === 0) return null;
  const assets = await db.select().from(nodeAssets).where(and(eq(nodeAssets.nodeId, nodeId), eq(nodeAssets.userId, userId)));
  return nodeRowToFrontend(rows[0], assets);
}

export async function createNode(userId: string, data: {
  brandName: string; slug: string; destination: string; platform: string; category: string;
  status: 'active' | 'paused' | 'alert'; clicks: string; earnings: string; commission: string;
  complianceDisclosure: string; complianceRules: string[]; complianceStatus: 'passed' | 'warning' | 'failed';
  complianceFtcNotes: string; keywordResearch: string[]; marketingAngle: string;
  personas: Array<{ name: string; pain: string; hook: string; platform: string }>;
  contentSuggestions: string[]; targetPlatforms: string[]; strategyNotes: string;
  // Brand assets
  brandLogoUrl?: string | null; brandIconUrl?: string | null; brandPrimaryColor?: string | null;
  brandColors?: string[]; brandDescription?: string | null; brandIndustry?: string | null; brandDomain?: string | null;
}): Promise<string> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const trackingId = Math.random().toString(36).slice(2, 10);

  const [row] = await db.insert(affiliateNodes).values({
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
    complianceRules: data.complianceRules,
    complianceStatus: data.complianceStatus,
    complianceFtcNotes: data.complianceFtcNotes,
    keywordResearch: data.keywordResearch,
    marketingAngle: data.marketingAngle,
    personas: data.personas,
    contentSuggestions: data.contentSuggestions,
    targetPlatforms: data.targetPlatforms,
    strategyNotes: data.strategyNotes,
    brandLogoUrl: data.brandLogoUrl ?? null,
    brandIconUrl: data.brandIconUrl ?? null,
    brandPrimaryColor: data.brandPrimaryColor ?? null,
    brandColors: data.brandColors ?? [],
    brandDescription: data.brandDescription ?? null,
    brandIndustry: data.brandIndustry ?? null,
    brandDomain: data.brandDomain ?? null,
    trackingId,
  }).returning();

  return row.id;
}

export async function getNodeByTrackingId(trackingId: string) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(affiliateNodes).where(eq(affiliateNodes.trackingId, trackingId)).limit(1);
  return rows.length > 0 ? rows[0] : null;
}

export async function incrementNodeClickCount(nodeId: string): Promise<void> {
  const db = await getDb();
  if (!db) return;
  // Increment clickCount and update the display clicks string
  const rows = await db.select({ clickCount: affiliateNodes.clickCount }).from(affiliateNodes).where(eq(affiliateNodes.id, nodeId)).limit(1);
  if (rows.length === 0) return;
  const newCount = (rows[0].clickCount ?? 0) + 1;
  const displayClicks = newCount >= 1000 ? `${(newCount / 1000).toFixed(1)}k` : String(newCount);
  await db.update(affiliateNodes).set({ clickCount: newCount, clicks: displayClicks }).where(eq(affiliateNodes.id, nodeId));
}

export async function deleteNode(nodeId: string, userId: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(nodeAssets).where(and(eq(nodeAssets.nodeId, nodeId), eq(nodeAssets.userId, userId)));
  await db.delete(affiliateNodes).where(and(eq(affiliateNodes.id, nodeId), eq(affiliateNodes.userId, userId)));
}

export async function updateNodeStatus(nodeId: string, userId: string, status: 'active' | 'paused' | 'alert'): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(affiliateNodes).set({ status }).where(and(eq(affiliateNodes.id, nodeId), eq(affiliateNodes.userId, userId)));
}

// ─── Asset queries ────────────────────────────────────────────────────────────

export async function getAssetsByNodeId(nodeId: string, userId: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(nodeAssets).where(and(eq(nodeAssets.nodeId, nodeId), eq(nodeAssets.userId, userId))).orderBy(desc(nodeAssets.createdAt));
}

export async function createAsset(data: InsertNodeAsset): Promise<string> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [row] = await db.insert(nodeAssets).values(data).returning();
  return row.id;
}

export async function deleteAsset(assetId: string, userId: string): Promise<string> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const rows = await db.select().from(nodeAssets).where(and(eq(nodeAssets.id, assetId), eq(nodeAssets.userId, userId))).limit(1);
  if (rows.length === 0) throw new Error("Asset not found");
  await db.delete(nodeAssets).where(eq(nodeAssets.id, assetId));
  return rows[0].s3Key;
}

// ─── User Integration queries ─────────────────────────────────────────────────

export type FrontendIntegration = {
  id: string;
  integrationId: string;
  status: 'connected' | 'disconnected' | 'pending' | 'error';
  lastSyncAt: string | null;
  metrics: Array<{ label: string; value: string }>;
  errorMessage: string | null;
  hasApiKey: boolean;
};

export async function getUserIntegrations(userId: string): Promise<FrontendIntegration[]> {
  const db = await getDb();
  if (!db) return [];
  const rows = await db.select().from(userIntegrations).where(eq(userIntegrations.userId, userId));
  return rows.map(rowToFrontendIntegration);
}

export async function getUserIntegration(userId: string, integrationId: string): Promise<FrontendIntegration | null> {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(userIntegrations)
    .where(and(eq(userIntegrations.userId, userId), eq(userIntegrations.integrationId, integrationId)))
    .limit(1);
  return rows.length > 0 ? rowToFrontendIntegration(rows[0]) : null;
}

export async function upsertUserIntegration(userId: string, integrationId: string, data: {
  status: 'connected' | 'disconnected' | 'pending' | 'error';
  apiKey?: string | null;
  metadata?: any;
  lastSyncAt?: Date | null;
  metrics?: any;
  errorMessage?: string | null;
}): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const values: any = {
    userId,
    integrationId,
    status: data.status,
    apiKey: data.apiKey ?? null,
    metadata: data.metadata ?? {},
    lastSyncAt: data.lastSyncAt ?? null,
    metrics: data.metrics ?? [],
    errorMessage: data.errorMessage ?? null,
  };

  const updateSet: any = {
    status: data.status,
    ...(data.apiKey !== undefined ? { apiKey: data.apiKey } : {}),
    ...(data.metadata !== undefined ? { metadata: data.metadata } : {}),
    ...(data.lastSyncAt !== undefined ? { lastSyncAt: data.lastSyncAt } : {}),
    ...(data.metrics !== undefined ? { metrics: data.metrics } : {}),
    ...(data.errorMessage !== undefined ? { errorMessage: data.errorMessage } : {}),
    updatedAt: new Date(),
  };

  await db.insert(userIntegrations).values(values).onConflictDoUpdate({
    target: [userIntegrations.userId, userIntegrations.integrationId],
    set: updateSet,
  });
}

export async function disconnectUserIntegration(userId: string, integrationId: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(userIntegrations)
    .set({ status: 'disconnected', apiKey: null, metadata: {}, lastSyncAt: null, metrics: [], errorMessage: null, updatedAt: new Date() })
    .where(and(eq(userIntegrations.userId, userId), eq(userIntegrations.integrationId, integrationId)));
}

// ─── Action Feed operations ──────────────────────────────────────────────────

export async function createAction(userId: string, data: InsertActionFeed): Promise<string> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [row] = await db.insert(actionFeed).values(data).returning();
  return row.id;
}

export async function getActions(userId: string, limit: number = 20) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(actionFeed).where(eq(actionFeed.userId, userId)).orderBy(desc(actionFeed.createdAt)).limit(limit);
}

// ─── System Metrics operations ───────────────────────────────────────────────

export async function updateSystemMetric(userId: string, data: InsertSystemMetric): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(systemMetrics).values(data).onConflictDoUpdate({
    target: [systemMetrics.userId, systemMetrics.name],
    set: {
      value: data.value,
      unit: data.unit,
      category: data.category,
      updatedAt: new Date(),
    }
  });
}

export async function getSystemMetrics(userId: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(systemMetrics).where(eq(systemMetrics.userId, userId));
}

function rowToFrontendIntegration(row: typeof userIntegrations.$inferSelect): FrontendIntegration {
  return {
    id: row.id,
    integrationId: row.integrationId,
    status: row.status as any,
    lastSyncAt: row.lastSyncAt ? row.lastSyncAt.toISOString() : null,
    metrics: (row.metrics as Array<{ label: string; value: string }>) ?? [],
    errorMessage: row.errorMessage ?? null,
    hasApiKey: !!row.apiKey,
  };
}
