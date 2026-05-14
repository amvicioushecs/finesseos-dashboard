import { eq, and, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { 
  users, affiliateNodes, nodeAssets, userIntegrations, actionFeed, systemMetrics,
  User, InsertUser, InsertNodeAsset, AffiliateNode, UserIntegration, ActionFeed, SystemMetric
} from "../../../drizzle/schema";
import { PROVIDER_CONFIG } from "./config";
import type { IDataProvider } from "./types";
import type { FrontendNode, FrontendIntegration } from "../../db";
import { nodeRowToFrontend } from "../../db";

export class SupabaseDataProvider implements IDataProvider {
  private _db: any;

  constructor() {
    if (PROVIDER_CONFIG.database.url) {
      try {
        const client = postgres(PROVIDER_CONFIG.database.url, {
          prepare: false,
          ssl: true,
        });
        this._db = drizzle(client);
      } catch (error) {
        console.warn("[Database] Failed to initialize postgres client:", error instanceof Error ? error.message : error);
      }
    }
  }

  private async getDb() {
    if (!this._db) {
      throw new Error("Supabase Database not configured");
    }
    return this._db;
  }

  // ─── User operations ────────────────────────────────────────────────────────

  async getUserByOpenId(openId: string): Promise<User | undefined> {
    const db = await this.getDb();
    const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  }

  async upsertUser(user: Partial<InsertUser> & { openId: string }): Promise<void> {
    const db = await this.getDb();
    const values: any = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    
    if (user.name !== undefined) { values.name = user.name; updateSet.name = user.name; }
    if (user.email !== undefined) { values.email = user.email; updateSet.email = user.email; }
    if (user.loginMethod !== undefined) { values.loginMethod = user.loginMethod; updateSet.loginMethod = user.loginMethod; }
    if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
    if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }

    await db.insert(users).values(values).onConflictDoUpdate({
      target: users.openId,
      set: updateSet,
    });
  }

  // ─── Affiliate Node operations ───────────────────────────────────────────────────

  async getNodesByUserId(userId: string): Promise<FrontendNode[]> {
    const db = await this.getDb();
    const rows = await db.select().from(affiliateNodes).where(eq(affiliateNodes.userId, userId)).orderBy(desc(affiliateNodes.createdAt));
    const allAssets = await db.select().from(nodeAssets).where(eq(nodeAssets.userId, userId));
    
    return rows.map((row: any) => {
      const rowAssets = allAssets.filter((a: any) => a.nodeId === row.id);
      return nodeRowToFrontend(row, rowAssets);
    });
  }

  async getNodeById(nodeId: string, userId: string): Promise<FrontendNode | null> {
    const db = await this.getDb();
    const rows = await db.select().from(affiliateNodes).where(and(eq(affiliateNodes.id, nodeId), eq(affiliateNodes.userId, userId))).limit(1);
    if (rows.length === 0) return null;
    const assets = await db.select().from(nodeAssets).where(and(eq(nodeAssets.nodeId, nodeId), eq(nodeAssets.userId, userId)));
    return nodeRowToFrontend(rows[0], assets);
  }

  async createNode(userId: string, data: any): Promise<string> {
    const db = await this.getDb();
    const trackingId = Math.random().toString(36).slice(2, 10);
    const [row] = await db.insert(affiliateNodes).values({
      ...data,
      userId,
      trackingId,
    }).returning();
    return row.id;
  }

  async deleteNode(nodeId: string, userId: string): Promise<void> {
    const db = await this.getDb();
    await db.delete(nodeAssets).where(and(eq(nodeAssets.nodeId, nodeId), eq(nodeAssets.userId, userId)));
    await db.delete(affiliateNodes).where(and(eq(affiliateNodes.id, nodeId), eq(affiliateNodes.userId, userId)));
  }

  async updateNodeStatus(nodeId: string, userId: string, status: 'active' | 'paused' | 'alert'): Promise<void> {
    const db = await this.getDb();
    await db.update(affiliateNodes).set({ status, updatedAt: new Date() }).where(and(eq(affiliateNodes.id, nodeId), eq(affiliateNodes.userId, userId)));
  }

  async getNodeByTrackingId(trackingId: string): Promise<any | null> {
    const db = await this.getDb();
    const rows = await db.select().from(affiliateNodes).where(eq(affiliateNodes.trackingId, trackingId)).limit(1);
    return rows.length > 0 ? rows[0] : null;
  }

  async incrementNodeClickCount(nodeId: string): Promise<void> {
    const db = await this.getDb();
    const rows = await db.select({ clickCount: affiliateNodes.clickCount }).from(affiliateNodes).where(eq(affiliateNodes.id, nodeId)).limit(1);
    if (rows.length === 0) return;
    const newCount = (rows[0].clickCount ?? 0) + 1;
    const displayClicks = newCount >= 1000 ? `${(newCount / 1000).toFixed(1)}k` : String(newCount);
    await db.update(affiliateNodes).set({ clickCount: newCount, clicks: displayClicks, updatedAt: new Date() }).where(eq(affiliateNodes.id, nodeId));
  }

  // ─── Asset operations ────────────────────────────────────────────────────────────

  async getAssetsByNodeId(nodeId: string, userId: string): Promise<any[]> {
    const db = await this.getDb();
    return db.select().from(nodeAssets).where(and(eq(nodeAssets.nodeId, nodeId), eq(nodeAssets.userId, userId))).orderBy(desc(nodeAssets.createdAt));
  }

  async createAsset(data: any): Promise<string> {
    const db = await this.getDb();
    const [row] = await db.insert(nodeAssets).values(data).returning();
    return row.id;
  }

  async deleteAsset(assetId: string, userId: string): Promise<string> {
    const db = await this.getDb();
    const rows = await db.select().from(nodeAssets).where(and(eq(nodeAssets.id, assetId), eq(nodeAssets.userId, userId))).limit(1);
    if (rows.length === 0) throw new Error("Asset not found");
    await db.delete(nodeAssets).where(eq(nodeAssets.id, assetId));
    return rows[0].s3Key;
  }

  // ─── User Integration operations ─────────────────────────────────────────────────

  async getUserIntegrations(userId: string): Promise<FrontendIntegration[]> {
    const db = await this.getDb();
    const rows = await db.select().from(userIntegrations).where(eq(userIntegrations.userId, userId));
    return rows.map(this.rowToFrontendIntegration);
  }

  async getUserIntegration(userId: string, integrationId: string): Promise<FrontendIntegration | null> {
    const db = await this.getDb();
    const rows = await db.select().from(userIntegrations)
      .where(and(eq(userIntegrations.userId, userId), eq(userIntegrations.integrationId, integrationId)))
      .limit(1);
    return rows.length > 0 ? this.rowToFrontendIntegration(rows[0]) : null;
  }

  async upsertUserIntegration(userId: string, integrationId: string, data: any): Promise<void> {
    const db = await this.getDb();
    const values = {
      userId,
      integrationId,
      status: data.status,
      apiKey: data.apiKey ?? null,
      metadata: data.metadata ?? {},
      lastSyncAt: data.lastSyncAt ?? null,
      metrics: data.metrics ?? [],
      errorMessage: data.errorMessage ?? null,
    };

    await db.insert(userIntegrations).values(values).onConflictDoUpdate({
      target: [userIntegrations.userId, userIntegrations.integrationId],
      set: {
        ...values,
        updatedAt: new Date(),
      },
    });
  }

  async disconnectUserIntegration(userId: string, integrationId: string): Promise<void> {
    const db = await this.getDb();
    await db.update(userIntegrations)
      .set({ status: 'disconnected', apiKey: null, metadata: {}, lastSyncAt: null, metrics: [], errorMessage: null, updatedAt: new Date() })
      .where(and(eq(userIntegrations.userId, userId), eq(userIntegrations.integrationId, integrationId)));
  }

  // ─── Action Feed operations ──────────────────────────────────────────────────

  async createAction(userId: string, data: any): Promise<string> {
    const db = await this.getDb();
    const [row] = await db.insert(actionFeed).values({ ...data, userId }).returning();
    return row.id;
  }

  async getActions(userId: string, limit: number = 20): Promise<any[]> {
    const db = await this.getDb();
    return db.select().from(actionFeed).where(eq(actionFeed.userId, userId)).orderBy(desc(actionFeed.createdAt)).limit(limit);
  }

  // ─── System Metrics operations ───────────────────────────────────────────────

  async updateSystemMetric(userId: string, data: any): Promise<void> {
    const db = await this.getDb();
    await db.insert(systemMetrics).values({ ...data, userId, updatedAt: new Date() }).onConflictDoUpdate({
      target: [systemMetrics.userId, systemMetrics.name],
      set: { ...data, updatedAt: new Date() },
    });
  }

  async getSystemMetrics(userId: string): Promise<any[]> {
    const db = await this.getDb();
    return db.select().from(systemMetrics).where(eq(systemMetrics.userId, userId)).orderBy(desc(systemMetrics.updatedAt));
  }

  private rowToFrontendIntegration(row: any): FrontendIntegration {
    return {
      id: row.id,
      integrationId: row.integrationId,
      status: row.status as any,
      lastSyncAt: row.lastSyncAt ? row.lastSyncAt.toISOString() : null,
      metrics: (row.metrics as any[]) ?? [],
      errorMessage: row.errorMessage ?? null,
      hasApiKey: !!row.apiKey,
    };
  }
}
